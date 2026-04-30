import * as fs from "node:fs";
import * as path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import pc from "picocolors";
import { REQUIRED_COLOR_TOKENS, REQUIRED_RADIUS_TOKENS } from "@hex-core/registry";
import { contrastRatio } from "@hex-core/tokens";
import { parseGlobalsCss } from "../lib/parse-globals.js";
import { swatch } from "../lib/swatch.js";
import { applyTokenOverride } from "./theme.js";
import { promptColor } from "./theme-interactive.js";

/**
 * Interactive token editor (`hex theme edit -i`). Mirrors the UX of
 * `hex theme init -i` but operates on an existing globals.css: pick a
 * category, pick a token, see its current value + AA contrast, enter
 * a new value, repeat. Writes once at the end so an aborted session
 * leaves the file untouched.
 *
 * Pairs with the flag-driven `themeEdit` for symmetry: the
 * non-interactive path is for LLMs and scripts; this one is for
 * humans tweaking a single token without memorizing the HSL-triplet
 * syntax or the contrast implications.
 */

interface InteractiveEditOptions {
	file: string;
}

type Mode = "light" | "dark" | "both";

interface PendingOverride {
	key: string;
	value: string;
	mode: Mode;
}

/**
 * Walk an interactive theme-edit session against the file at
 * `options.file`. Buffers overrides in memory and writes once on exit.
 *
 * @param options - Configuration object.
 * @param options.file - Path to the globals.css to edit.
 */
export async function themeEditInteractive(options: InteractiveEditOptions) {
	const filePath = path.resolve(process.cwd(), options.file);
	if (!fs.existsSync(filePath)) {
		console.error(`${options.file} not found. Run 'hex theme init' first.`);
		process.exit(1);
	}

	const initialCss = fs.readFileSync(filePath, "utf8");
	const parsed = parseGlobalsCss(initialCss);

	if (Object.keys(parsed.light).length === 0) {
		console.error(`No tokens found in ${options.file}. The file is missing a :root { ... } block.`);
		console.error(`Run 'hex theme init --overwrite' to regenerate from scratch.`);
		process.exit(1);
	}

	const colorTokenSet = new Set<string>(REQUIRED_COLOR_TOKENS);
	const radiusTokenSet = new Set<string>(REQUIRED_RADIUS_TOKENS);

	const pending: PendingOverride[] = [];

	console.log(pc.dim(`Editing ${options.file} (${Object.keys(parsed.light).length} light tokens, ${Object.keys(parsed.dark).length} dark tokens)`));
	console.log(pc.dim(`Press Ctrl-C to abandon — nothing is written until you choose to save.`));
	console.log("");

	while (true) {
		const category = await select<"color" | "radius" | "other">({
			message: "Pick a token category",
			choices: buildCategoryChoices(parsed.light, colorTokenSet, radiusTokenSet),
		});

		// `buildCategoryChoices` already filters out empty categories, so
		// `pickToken` is guaranteed to return a real entry from `parsed.light`.
		const [tokenKey, lightValue] = await pickToken(category, parsed.light, colorTokenSet, radiusTokenSet);
		const darkValue = parsed.dark[tokenKey];
		printTokenContext(tokenKey, lightValue, darkValue, parsed, colorTokenSet);

		const mode: Mode = parsed.hasDarkBlock
			? await select<Mode>({
					message: "Which mode to update?",
					choices: [
						{ name: "both (recommended)", value: "both" },
						{ name: "light only", value: "light" },
						{ name: "dark only", value: "dark" },
					],
					default: "both",
				})
			: "light";

		const isColor = colorTokenSet.has(tokenKey);
		const newValue = await promptValueWithContrastGate({
			tokenKey,
			isColor,
			mode,
			parsed,
			defaultValue: mode === "dark" ? darkValue : lightValue,
		});

		pending.push({ key: tokenKey, value: newValue, mode });
		console.log(pc.green(`  ✓ Queued ${tokenKey} = ${newValue} (${mode})`));
		console.log("");

		const more = await confirm({ message: "Edit another token?", default: false });
		if (!more) break;
	}

	// `pending` always has ≥1 entry here: every loop iteration pushes before
	// reaching the "edit another?" prompt, and we don't break out earlier.
	let css = initialCss;
	const applied: string[] = [];
	const skipped: string[] = [];
	for (const { key, value, mode } of pending) {
		const result = applyTokenOverride(css, key, value, mode);
		if (result.updated) {
			css = result.css;
			applied.push(`${key}=${value} (${mode})`);
		} else {
			skipped.push(`${key}=${value} (${mode})`);
		}
	}

	fs.writeFileSync(filePath, css, "utf8");

	console.log("");
	console.log(`Wrote ${applied.length} update${applied.length === 1 ? "" : "s"} to ${options.file}:`);
	for (const a of applied) console.log(`  ${pc.green("✓")} ${a}`);
	if (skipped.length > 0) {
		console.log(pc.yellow(`Skipped ${skipped.length} (token not found in file):`));
		for (const s of skipped) console.log(`  ${pc.yellow("-")} ${s}`);
	}
}

/**
 * Build category choices, hiding categories that have no tokens in the
 * current file (e.g. "radius" disappears when the file has no `--radius`).
 */
function buildCategoryChoices(
	tokens: Record<string, string>,
	colors: ReadonlySet<string>,
	radii: ReadonlySet<string>,
): Array<{ name: string; value: "color" | "radius" | "other" }> {
	const colorCount = Object.keys(tokens).filter((k) => colors.has(k)).length;
	const radiusCount = Object.keys(tokens).filter((k) => radii.has(k)).length;
	const otherCount = Object.keys(tokens).filter((k) => !colors.has(k) && !radii.has(k)).length;

	const choices: Array<{ name: string; value: "color" | "radius" | "other" }> = [];
	if (colorCount > 0) choices.push({ name: `Color (${colorCount})`, value: "color" });
	if (radiusCount > 0) choices.push({ name: `Radius (${radiusCount})`, value: "radius" });
	if (otherCount > 0) choices.push({ name: `Other (${otherCount})`, value: "other" });
	return choices;
}

/**
 * Prompt the user to pick a token from `tokens` filtered to the chosen
 * category. Returns the [key, value] tuple so callers don't have to
 * re-look up the value (and don't have to handle a `string | undefined`
 * lookup branch). Caller is responsible for ensuring the category is
 * non-empty — `buildCategoryChoices` enforces that contract.
 */
async function pickToken(
	category: "color" | "radius" | "other",
	tokens: Record<string, string>,
	colors: ReadonlySet<string>,
	radii: ReadonlySet<string>,
): Promise<[string, string]> {
	// Object.entries preserves [key, value] tuple typing — no `as` cast needed
	// to avoid the lookup-via-index undefined branch.
	const entries = Object.entries(tokens).filter(([k]) => {
		if (category === "color") return colors.has(k);
		if (category === "radius") return radii.has(k);
		return !colors.has(k) && !radii.has(k);
	});

	const choices = entries.map(([k, value]) => {
		const preview = colors.has(k) ? swatch(value, k) : `${pc.dim(k.padEnd(20))} ${pc.dim(value)}`;
		return { name: preview, value: k };
	});

	const picked = await select<string>({
		message: "Pick a token",
		choices,
	});
	const entry = entries.find(([k]) => k === picked);
	// `picked` came from `entries`'s own `value` keys — find always succeeds.
	if (!entry) throw new Error(`unreachable: picked token "${picked}" not in entries`);
	return entry;
}

/**
 * Print the current value(s) of the picked token. Two lines when a
 * dark block exists and the values differ; one line otherwise. Uses
 * swatches for color tokens, plain dim text for everything else.
 */
function printTokenContext(
	key: string,
	lightValue: string,
	darkValue: string | undefined,
	parsed: { hasDarkBlock: boolean },
	colors: ReadonlySet<string>,
): void {
	const isColor = colors.has(key);
	const showDark =
		parsed.hasDarkBlock && darkValue !== undefined && darkValue !== lightValue;
	if (isColor) {
		console.log(`  light: ${swatch(lightValue, key)}`);
		if (showDark) console.log(`  dark:  ${swatch(darkValue, key)}`);
	} else {
		console.log(`  light: ${pc.dim(lightValue)}`);
		if (showDark) console.log(`  dark:  ${pc.dim(darkValue)}`);
	}
}

interface ValuePromptArgs {
	tokenKey: string;
	isColor: boolean;
	mode: Mode;
	parsed: { light: Record<string, string>; dark: Record<string, string> };
	defaultValue: string | undefined;
}

/**
 * Prompt for a token value, then for color tokens with a paired
 * background, gate on AA contrast. On `retry` we loop here (re-prompt
 * the value) instead of jumping back to the outer category picker —
 * matches the UX of `init -i`'s `promptSurfaceWithContrastGate`.
 *
 * For `mode === "both"` we evaluate the new value against BOTH the
 * light and dark backgrounds — a sub-AA pair in either mode triggers
 * the warning, and the user sees both ratios so they can decide
 * whether the cross-mode trade-off is acceptable.
 */
async function promptValueWithContrastGate(args: ValuePromptArgs): Promise<string> {
	while (true) {
		const value = args.isColor
			? await promptColor(args.tokenKey, args.defaultValue ?? "0 0% 50%")
			: await promptRawValue(args.tokenKey, args.defaultValue);

		if (!args.isColor || !tokenIsForegroundLike(args.tokenKey)) return value;

		const failures = collectContrastFailures(args.tokenKey, value, args.parsed, args.mode);
		if (failures.length === 0) return value;

		for (const f of failures) {
			console.log(
				pc.yellow(`  ⚠ ${args.tokenKey} vs ${f.bgLabel} (${f.modeLabel}) contrast is ${f.ratio.toFixed(2)}:1 (sub-AA, fails WCAG 1.4.3 for body text).`),
			);
		}
		const ratiosLabel = failures.map((f) => `${f.modeLabel} ${f.ratio.toFixed(2)}:1`).join(", ");
		const choice = await select<"retry" | "accept">({
			message: "What now?",
			choices: [
				{ name: "Re-enter (recommended)", value: "retry" },
				{ name: `Accept the sub-AA pair anyway (${ratiosLabel})`, value: "accept" },
			],
			default: "retry",
		});
		if (choice === "accept") return value;
		console.log("");
	}
}

interface ContrastFailure {
	modeLabel: "light" | "dark";
	bgLabel: string;
	ratio: number;
}

/**
 * For each mode the new value is being written to, look up the paired
 * background and return the entries whose contrast falls below WCAG
 * AA (4.5:1). Returns an empty array when every mode passes — that's
 * the "no warning" path.
 */
function collectContrastFailures(
	tokenKey: string,
	value: string,
	parsed: { light: Record<string, string>; dark: Record<string, string> },
	mode: Mode,
): ContrastFailure[] {
	const modesToCheck: Array<"light" | "dark"> =
		mode === "both" ? ["light", "dark"] : [mode];
	const failures: ContrastFailure[] = [];
	for (const modeLabel of modesToCheck) {
		const bg = pickBackgroundForContrast(tokenKey, parsed, modeLabel);
		if (!bg) continue;
		const ratio = contrastRatio(value, bg.value);
		if (ratio >= 4.5) continue;
		failures.push({ modeLabel, bgLabel: bg.label, ratio });
	}
	return failures;
}

async function promptRawValue(label: string, defaultValue: string | undefined): Promise<string> {
	const def = defaultValue ?? "";
	const raw = await input({
		message: `${label} ${pc.dim(`(default: ${def})`)}`,
		default: def,
	});
	return raw.trim();
}

/**
 * Pick the right background to contrast a foreground-like token against
 * for one specific mode. Returns null for tokens that aren't paired
 * (e.g. `border`, `ring`, `radius`) so callers skip the AA gate for
 * those, and null when the paired background isn't declared in the
 * file (e.g. asking for the dark `primary` when there's no `.dark`
 * block — the caller already filters those at the mode prompt).
 */
function pickBackgroundForContrast(
	key: string,
	parsed: { light: Record<string, string>; dark: Record<string, string> },
	mode: "light" | "dark",
): { value: string; label: string } | null {
	const pair = FOREGROUND_PAIRS[key];
	if (!pair) return null;
	const source = mode === "dark" ? parsed.dark : parsed.light;
	const value = source[pair];
	if (!value) return null;
	return { value, label: pair };
}

/**
 * Map of foreground-like tokens to the token they should contrast
 * against. Drives the AA gate during interactive editing.
 *
 * Anything not listed here doesn't trigger a contrast warning even if
 * the user changes it — `border`, `ring`, `input` aren't text surfaces
 * and aren't subject to WCAG 1.4.3.
 */
const FOREGROUND_PAIRS: Record<string, string> = {
	foreground: "background",
	"card-foreground": "card",
	"popover-foreground": "popover",
	"primary-foreground": "primary",
	"secondary-foreground": "secondary",
	"muted-foreground": "muted",
	"accent-foreground": "accent",
	"destructive-foreground": "destructive",
};

function tokenIsForegroundLike(key: string): boolean {
	return key in FOREGROUND_PAIRS;
}
