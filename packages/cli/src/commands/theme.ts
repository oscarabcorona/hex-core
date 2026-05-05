import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { parseStudioUrl } from "../lib/parse-studio-url.js";
import { detectSrcLayout } from "../lib/resolve-alias.js";

interface InitOptions {
	name: string;
	out: string;
	format: "css" | "json" | "ts";
	overwrite: boolean;
}

interface AddOptions {
	slug: string;
	from: string;
	out?: string;
	overwrite: boolean;
}

interface EditOptions {
	file: string;
	tokens: string[];
	mode: "light" | "dark" | "both";
}

/**
 * Initialize a theme file from any preset shipped by @hex-core/* —
 * the OSS trio (`default`, `midnight`, `ember`) plus the 71 voltagent
 * brand-derived presets (`tesla`, `stripe`, `linear`, …).
 *
 * Writes either a globals.css (with `:root` + `.dark` token blocks),
 * a flat JSON map, or a TypeScript Theme module.
 *
 * @param options - Configuration object.
 * @param options.name - Preset slug. Use `hex theme list` to see all options.
 * @param options.out - Output file path relative to the current working directory.
 * @param options.format - `"css"` for globals.css, `"json"` for a flat token map, `"ts"` for a Theme module.
 * @param options.overwrite - If false and the file exists, abort with non-zero exit.
 */
export async function themeInit(options: InitOptions) {
	const tokens = await import("@hex-core/tokens");
	const themesPkg = await import("@hex-core/themes");
	// Lookup order: OSS presets first (so `default`/`midnight`/`ember`
	// resolve to the canonical tokens objects), then the merged
	// premium catalog which also carries the voltagent brand presets.
	const theme = tokens.getTheme(options.name) ?? themesPkg.getPremiumTheme(options.name);
	if (!theme) {
		const all = [...new Set([...Object.keys(tokens.themes), ...Object.keys(themesPkg.premiumThemes)])].sort();
		console.error(
			`Unknown preset "${options.name}". Run \`hex theme list\` to see all ${all.length} available presets.`,
		);
		process.exit(1);
	}
	const outPath = path.resolve(process.cwd(), options.out);

	if (fs.existsSync(outPath) && !options.overwrite) {
		console.error(`${options.out} already exists. Pass --overwrite to replace.`);
		process.exit(1);
	}

	const { renderTheme } = await import("./theme-interactive.js");
	const content = renderTheme(theme, options.format);

	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, content, "utf8");

	console.log(`Created ${options.out} from "${theme.displayName}" preset.`);
	console.log(`Tokens: ${Object.keys(theme.tokens.light).length} light, ${Object.keys(theme.tokens.dark).length} dark.`);
	console.log(`Edit any token by changing its CSS variable value — every Hex Core component will reflow.`);
	console.log(`Or run: hex theme edit --token <key>=<value>`);
}

/**
 * Compose a custom theme from a Hex Core Studio URL and write it to the
 * project as a TypeScript file. Resolves `--from`'s `base` against the
 * preset catalog, applies the URL's per-token overrides via
 * `extendTheme`, and serializes the result through `renderTheme(..., "ts")`.
 *
 * Output path defaults to `themes/<slug>.ts` (or `src/themes/<slug>.ts`
 * when a `src/` layout is detected). No network call — everything Studio
 * encodes in the URL is enough to rebuild the theme locally.
 *
 * @param options.slug - File name + theme `name` field for the new theme.
 * @param options.from - The full Studio URL.
 * @param options.out - Optional override for the output path.
 * @param options.overwrite - Replace an existing file at the target path.
 */
export async function themeAdd(options: AddOptions) {
	let parsed: ReturnType<typeof parseStudioUrl>;
	try {
		parsed = parseStudioUrl(options.from);
	} catch (err) {
		console.error((err as Error).message);
		process.exit(1);
	}

	const tokens = await import("@hex-core/tokens");
	const themesPkg = await import("@hex-core/themes");
	const baseTheme = tokens.getTheme(parsed.base) ?? themesPkg.getPremiumTheme(parsed.base);
	if (!baseTheme) {
		const all = [
			...new Set([...Object.keys(tokens.themes), ...Object.keys(themesPkg.premiumThemes)]),
		].sort();
		console.error(
			`Unknown base preset "${parsed.base}". Run \`hex theme list\` to see all ${all.length} options.`,
		);
		process.exit(1);
	}

	for (const warning of parsed.warnings) {
		console.warn(pc.yellow(`warn:`) + ` ${warning}`);
	}

	const customTheme = themesPkg.extendTheme(baseTheme, {
		name: options.slug,
		displayName: toDisplayName(options.slug),
		tokens: {
			light: parsed.light as never,
			dark: parsed.dark as never,
		},
	});

	const cwd = process.cwd();
	const outPath = options.out
		? path.resolve(cwd, options.out)
		: path.join(cwd, detectSrcLayout(cwd) ? "src/themes" : "themes", `${options.slug}.ts`);

	if (fs.existsSync(outPath) && !options.overwrite) {
		console.error(`${path.relative(cwd, outPath)} already exists. Pass --overwrite to replace.`);
		process.exit(1);
	}

	const { renderTheme } = await import("./theme-interactive.js");
	const content = renderTheme(customTheme, "ts");

	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, content, "utf8");

	const displayed = path.relative(cwd, outPath);
	console.log(`Created ${pc.green(displayed)} from "${baseTheme.displayName}" preset.`);
	console.log(
		`Tokens overridden: ${Object.keys(parsed.light).length} light, ${Object.keys(parsed.dark).length} dark.`,
	);
	console.log(pc.dim(`Import it from your app entry, e.g.:`));
	console.log(pc.dim(`  import { theme } from "./${displayed.replace(/\.ts$/, "")}";`));
}

function toDisplayName(slug: string): string {
	return slug
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

/**
 * Edit a token in a globals.css theme file by passing `key=value` overrides.
 * Updates both light and dark by default; pass `--mode light` or `--mode dark`
 * to scope. Non-interactive — designed to be scripted or driven by an LLM.
 *
 * @param options - Configuration object.
 * @param options.file - Path to the globals.css to edit (default: `./globals.css`).
 * @param options.tokens - One or more `"key=value"` strings to override.
 * @param options.mode - Which color mode to update: `"light"`, `"dark"`, or `"both"`.
 */
export async function themeEdit(options: EditOptions) {
	const filePath = path.resolve(process.cwd(), options.file);

	if (!fs.existsSync(filePath)) {
		console.error(`${options.file} not found. Run 'hex theme init' first.`);
		process.exit(1);
	}
	if (options.tokens.length === 0) {
		console.error(`No --token flags provided. Example: hex theme edit --token primary="240 50% 50%"`);
		process.exit(1);
	}

	const overrides = parseTokenOverrides(options.tokens);
	let css = fs.readFileSync(filePath, "utf8");
	const updated: string[] = [];
	const skipped: string[] = [];

	for (const [key, value] of Object.entries(overrides)) {
		const result = applyTokenOverride(css, key, value, options.mode);
		if (result.updated) {
			css = result.css;
			updated.push(key);
		} else {
			skipped.push(key);
		}
	}

	fs.writeFileSync(filePath, css, "utf8");

	if (updated.length > 0) {
		console.log(`Updated ${updated.length} token${updated.length === 1 ? "" : "s"} in ${options.file}: ${updated.join(", ")}.`);
	}
	if (skipped.length > 0) {
		console.warn(`Skipped (token not found in file): ${skipped.join(", ")}.`);
		console.warn(`Add the token manually or re-run 'hex theme init --overwrite' to start fresh.`);
	}
}

/**
 * Parse `--token key=value` strings into a flat record.
 *
 * @param raw - Array of `key=value` strings (typically passed via `--token` flag).
 * @returns A record mapping token name → desired value, with surrounding quotes stripped.
 */
function parseTokenOverrides(raw: string[]): Record<string, string> {
	const overrides: Record<string, string> = {};
	for (const entry of raw) {
		const eq = entry.indexOf("=");
		if (eq < 0) {
			console.error(`Bad --token "${entry}". Expected key=value (e.g. primary="240 50% 50%").`);
			process.exit(1);
		}
		const key = entry.slice(0, eq).trim();
		const value = entry.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
		overrides[key] = value;
	}
	return overrides;
}

interface ApplyOptions {
	name: string;
	file: string;
}

/**
 * Swap an existing globals.css to a different preset's tokens without
 * touching @import directives, @theme inline blocks, body/border-color
 * rules, or anything else the user might have customized. Replaces only
 * the bodies of the `:root { ... }` and `.dark { ... }` token blocks.
 *
 * Designed to be the opposite of `hex theme init --overwrite`: that one
 * regenerates the entire file from scratch (and clobbers user edits);
 * this one is surgical, runs against an existing file, and is safe to
 * re-run when switching themes.
 *
 * @param options - Configuration object.
 * @param options.name - Preset to apply: default, midnight, or ember.
 * @param options.file - Path to the globals.css to update (default: ./globals.css).
 */
export async function themeApply(options: ApplyOptions) {
	const filePath = path.resolve(process.cwd(), options.file);
	if (!fs.existsSync(filePath)) {
		console.error(`${options.file} not found. Run 'hex init' first.`);
		process.exit(1);
	}

	const tokens = await import("@hex-core/tokens");
	const themesPkg = await import("@hex-core/themes");
	const theme = tokens.getTheme(options.name) ?? themesPkg.getPremiumTheme(options.name);
	if (!theme) {
		const all = [...new Set([...Object.keys(tokens.themes), ...Object.keys(themesPkg.premiumThemes)])].sort();
		console.error(
			`Unknown preset "${options.name}". Run \`hex theme list\` to see all ${all.length} available presets.`,
		);
		process.exit(1);
	}

	let css = fs.readFileSync(filePath, "utf8");
	const replacedLight = replaceBlockBody(css, ":root", buildBlockBody(theme.tokens.light));
	if (!replacedLight.updated) {
		console.error(`Could not find a :root { ... } block in ${options.file}. Run 'hex init --overwrite' to regenerate from scratch.`);
		process.exit(1);
	}
	css = replacedLight.css;
	const replacedDark = replaceBlockBody(css, "\\.dark", buildBlockBody(theme.tokens.dark));
	if (!replacedDark.updated) {
		console.warn(`Could not find a .dark { ... } block — light theme updated, dark left untouched.`);
	} else {
		css = replacedDark.css;
	}

	fs.writeFileSync(filePath, css, "utf8");
	console.log(`Applied "${theme.displayName}" preset to ${options.file}.`);
	console.log(`Tokens: ${Object.keys(theme.tokens.light).length} light, ${Object.keys(theme.tokens.dark).length} dark.`);
}

function buildBlockBody(tokenSet: Record<string, unknown>): string {
	const lines: string[] = [];
	for (const [key, token] of Object.entries(tokenSet)) {
		const value =
			typeof token === "object" && token !== null && "value" in token
				? String((token as { value: unknown }).value)
				: String(token);
		lines.push(`  --${key}: ${value};`);
	}
	return lines.join("\n");
}

interface BlockReplaceResult {
	css: string;
	updated: boolean;
}

/**
 * Replace the body of `<selector> { ... }` with `body`. Preserves the
 * selector + opening/closing braces so the file's overall shape stays
 * intact. Non-greedy match on the body so an unrelated block later in
 * the file isn't accidentally absorbed.
 */
function replaceBlockBody(css: string, blockSelector: string, body: string): BlockReplaceResult {
	const re = new RegExp(`(${blockSelector}\\s*\\{)([\\s\\S]*?)(\\n\\})`, "m");
	const match = css.match(re);
	if (!match) return { css, updated: false };
	return { css: css.replace(re, `$1\n${body}$3`), updated: true };
}

interface OverrideResult {
	css: string;
	updated: boolean;
}

/**
 * Replace a CSS custom property's value inside `:root` and/or `.dark` blocks.
 * Naive but precise — operates on the line declaring `--{key}: …;` so it
 * doesn't accidentally rewrite token references in the rest of the file.
 *
 * @param css - The full CSS content to operate on.
 * @param key - The token name without the leading `--` (e.g. `"primary"`).
 * @param value - The new value to write (e.g. `"240 50% 50%"`).
 * @param mode - Which block to update: `"light"` for `:root`, `"dark"` for `.dark`, or `"both"`.
 * @returns The updated CSS plus a flag indicating whether any replacement happened.
 */
export function applyTokenOverride(
	css: string,
	key: string,
	value: string,
	mode: "light" | "dark" | "both",
): OverrideResult {
	const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	let updatedAny = false;

	const replaceInBlock = (input: string, blockSelector: string): string => {
		const blockRegex = new RegExp(`(${blockSelector}\\s*\\{[^}]*?)(--${escapedKey}\\s*:\\s*)([^;]+)(;)`, "m");
		const match = input.match(blockRegex);
		if (!match) return input;
		updatedAny = true;
		return input.replace(blockRegex, `$1$2${value}$4`);
	};

	let result = css;
	if (mode === "light" || mode === "both") {
		result = replaceInBlock(result, ":root");
	}
	if (mode === "dark" || mode === "both") {
		result = replaceInBlock(result, "\\.dark");
	}

	return { css: result, updated: updatedAny };
}
