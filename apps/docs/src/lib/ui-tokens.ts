/**
 * Shared UI class strings and token constants for the docs surface. Single
 * source of truth — any chrome that reads "the article body max-width" or
 * "the Shiki theme pair" imports from here.
 */

/** Article-body max-width wrapper. Caps measure at ~65ch on ultra-wide. */
export const DOCS_CONTENT_WRAPPER = "mx-auto max-w-3xl xl:max-w-4xl";

/**
 * Shiki dual-theme pair. Light uses `github-light-high-contrast` for WCAG AA
 * bracket-pair colors (#e36209 in github-light fails 4.5:1 on white bg).
 * Dark uses `github-dark-dimmed` — lower-saturation, reads well on our
 * graphite background.
 */
export const SHIKI_THEMES = {
	light: "github-light-high-contrast",
	dark: "github-dark-dimmed",
} as const;
