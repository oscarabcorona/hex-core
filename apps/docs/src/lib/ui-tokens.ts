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
 * Dark uses `github-dark-high-contrast` for the same WCAG AA reason — the
 * dimmed sibling's muted token (#768390) only reaches 3.87:1 on the code
 * background, so comment-led samples (e.g. the dnd demo) flag color-contrast.
 */
export const SHIKI_THEMES = {
	light: "github-light-high-contrast",
	dark: "github-dark-high-contrast",
} as const;
