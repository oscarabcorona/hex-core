import * as fs from "node:fs";
import * as path from "node:path";

interface InitOptions {
	name: string;
	out: string;
	format: "css" | "json";
	overwrite: boolean;
}

interface EditOptions {
	file: string;
	tokens: string[];
	mode: "light" | "dark" | "both";
}

const VALID_PRESETS = ["default", "midnight", "ember"] as const;
type PresetName = (typeof VALID_PRESETS)[number];

/**
 * Initialize a theme file from one of the `@hex-core/tokens` presets.
 * Writes either a globals.css (with the `:root` and `.dark` token blocks) or
 * a flat JSON map of CSS variables.
 *
 * @param options - Configuration object.
 * @param options.name - Preset to scaffold from: default, midnight, or ember.
 * @param options.out - Output file path relative to the current working directory.
 * @param options.format - `"css"` for globals.css, `"json"` for a flat token map.
 * @param options.overwrite - If false and the file exists, abort with non-zero exit.
 */
export async function themeInit(options: InitOptions) {
	const tokens = await import("@hex-core/tokens");
	const presetName = options.name as PresetName;

	if (!VALID_PRESETS.includes(presetName)) {
		console.error(
			`Unknown preset "${options.name}". Available: ${VALID_PRESETS.join(", ")}.`,
		);
		process.exit(1);
	}

	const theme = tokens.getTheme(presetName);
	if (!theme) {
		console.error(`Preset "${presetName}" is registered but failed to load. This is a bug.`);
		process.exit(1);
	}
	const outPath = path.resolve(process.cwd(), options.out);

	if (fs.existsSync(outPath) && !options.overwrite) {
		console.error(`${options.out} already exists. Pass --overwrite to replace.`);
		process.exit(1);
	}

	let content: string;
	if (options.format === "json") {
		const lightFlat = tokens.themeToFlatJson(theme, "light");
		const darkFlat = tokens.themeToFlatJson(theme, "dark");
		content = JSON.stringify({ name: theme.name, light: lightFlat, dark: darkFlat }, null, 2);
	} else {
		content = tokens.generateGlobalsCss(theme);
	}

	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, content, "utf8");

	console.log(`Created ${options.out} from "${theme.displayName}" preset.`);
	console.log(`Tokens: ${Object.keys(theme.tokens.light).length} light, ${Object.keys(theme.tokens.dark).length} dark.`);
	console.log(`Edit any token by changing its CSS variable value — every Hex Core component will reflow.`);
	console.log(`Or run: hex theme edit --token <key>=<value>`);
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
function applyTokenOverride(
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
