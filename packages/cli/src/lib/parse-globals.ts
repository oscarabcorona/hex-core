/**
 * Parse a globals.css produced by `hex theme init` into a typed
 * `{ light, dark }` map of token name → raw value string.
 *
 * The interactive `theme edit -i` flow uses this to render a picker
 * with current values + AA contrast annotations, then hands keys back
 * to the existing `applyTokenOverride` for the actual write. Round-trip
 * with `applyTokenOverride` is the contract: every key returned here
 * must be writable by that function.
 *
 * Naive but precise — same regex shape as `applyTokenOverride` so the
 * two stay in lockstep. Whitespace inside values is preserved
 * (HSL-triplet values like `"240 50% 50%"` round-trip exactly).
 */

export interface ParsedTokens {
	/** `:root { --key: value; }` declarations, keyed by name without the `--` prefix. */
	light: Record<string, string>;
	/** `.dark { --key: value; }` declarations. Empty record if the file has no `.dark` block. */
	dark: Record<string, string>;
	/** True when the file has a `.dark { ... }` block, false when only `:root` is present. */
	hasDarkBlock: boolean;
}

/**
 * Extract token declarations from a globals.css string.
 *
 * @param css - The raw CSS content.
 * @returns Token records for the light (`:root`) and dark (`.dark`) blocks.
 */
export function parseGlobalsCss(css: string): ParsedTokens {
	const light = extractBlockTokens(css, ":root");
	const darkRaw = extractBlockTokens(css, "\\.dark");
	return {
		light,
		dark: darkRaw,
		hasDarkBlock: hasBlock(css, "\\.dark"),
	};
}

function hasBlock(css: string, blockSelector: string): boolean {
	const re = new RegExp(`${blockSelector}\\s*\\{`, "m");
	return re.test(css);
}

/**
 * Pull `--key: value;` lines out of a single block. Returns an empty
 * record when the block isn't present — callers distinguish "block
 * missing" from "block empty" via {@link hasBlock} / `hasDarkBlock`.
 */
function extractBlockTokens(css: string, blockSelector: string): Record<string, string> {
	// Capture the body up to the first `}`. `[^}]*` is greedy within non-brace
	// chars, so it absorbs everything until the block's own closing brace —
	// robust whether the closer is column-0 (`\n}`) or indented (`\n  }`),
	// which is the format @hex-core/tokens emits inside @layer base wrappers.
	// Token values don't contain `{` or `}`, so this stays safe.
	const blockRe = new RegExp(`${blockSelector}\\s*\\{([^}]*)\\}`, "m");
	const match = css.match(blockRe);
	if (!match) return {};

	const body = match[1] ?? "";
	const tokens: Record<string, string> = {};
	// Match `--key: value;` per line. Token names allow letters, digits, dashes
	// — Tailwind / CSS custom-property convention. Values run up to the `;`.
	const declRe = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
	let m: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex iteration pattern
	while ((m = declRe.exec(body)) !== null) {
		const key = m[1];
		const value = m[2]?.trim();
		if (key && value !== undefined) {
			tokens[key] = value;
		}
	}
	return tokens;
}
