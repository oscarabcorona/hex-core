import { defaultTheme, generateThemeCssV4 } from "@hex-core/tokens";

/**
 * CSS snippets for the theming docs, derived from the theme itself.
 *
 * These were hand-typed constants in the page — a seventh copy of the
 * palette on top of the six that already existed. They had rotted exactly
 * the way an uncoupled copy does: the page advertised
 * `--destructive: 0 65% 50%` against a real value of `0 65% 43%`, and four
 * of the six dark-mode values it listed were wrong. Reading the theme is
 * the only way the docs can't lie.
 */

const TOKEN_CSS = generateThemeCssV4(defaultTheme);

/**
 * Pull one selector's block out of the generated token CSS.
 * @param selector - The CSS selector to extract, e.g. `":root"`
 * @returns The full rule including braces
 * @throws When the generator no longer emits that block
 */
function block(selector: string): string {
	const match = new RegExp(`^${selector.replace(".", "\\.")} \\{[^}]*\\}`, "m").exec(TOKEN_CSS);
	if (!match) {
		throw new Error(
			`theming docs: generateThemeCssV4 emitted no \`${selector}\` block — ` +
				"the snippet source changed shape.",
		);
	}
	return match[0];
}

/**
 * Keep only the declarations whose names satisfy a predicate.
 * @param css - A CSS rule
 * @param keep - Predicate over the custom-property name, without `--`
 * @returns The rule with non-matching declarations dropped
 */
function only(css: string, keep: (name: string) => boolean): string {
	return css
		.split("\n")
		.filter((line) => {
			const name = /^\s*--([a-z0-9-]+):/.exec(line)?.[1];
			return name === undefined ? true : keep(name);
		})
		.join("\n");
}

/** True for the raw ramp entries — tier 1. */
const isRampEntry = (name: string): boolean =>
	name in (defaultTheme.palette ?? {});

/** True for the layout / motion tokens that come from `sharedTokens`. */
const isLayoutToken = (name: string): boolean =>
	/^(space|gap|control-height|text|duration)-/.test(name);

/** The raw colour ramp every semantic token is drawn from. */
export const RAMP_SNIPPET = only(block(":root"), isRampEntry);

/** Semantic colour tokens, each pointing at its ramp entry. */
export const COLOR_TOKENS_SNIPPET = only(
	block(":root"),
	(name) => !isRampEntry(name) && !isLayoutToken(name),
);

/** Spacing, control-height, type-scale and motion tokens. */
export const LAYOUT_TOKENS_SNIPPET = only(block(":root"), isLayoutToken);

/** Dark mode — a remap of the semantic layer, never new token names. */
export const DARK_SNIPPET = only(block(".dark"), (name) => !isLayoutToken(name));
