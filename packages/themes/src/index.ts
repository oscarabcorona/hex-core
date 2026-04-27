/**
 * @hex-core/themes — premium theme catalog and convenience re-exports.
 *
 * This package establishes a separate publish/version surface for theme
 * presets so the bundled `@hex-core/tokens` package can stay focused on the
 * single canonical default theme + the transformer functions.
 *
 * Today: re-exports `midnightTheme` and `emberTheme` from `@hex-core/tokens`
 * so consumers have a single import location for "the catalog of themes",
 * and adds a `listPremiumThemes()` helper. Future premium themes
 * (`fintech-dark`, `editorial-warm`, `data-dense`, `pastel-soft`,
 * `monochrome-strict`) will land here directly without bumping `tokens`.
 *
 * The default theme remains in `@hex-core/tokens` since it is the canonical
 * baseline that the transformers (themeToCss, themeToScopedRuntimeCss,
 * themeToFlatJson, themeToTailwindConfig, generateGlobalsCss) operate on.
 *
 * @example
 * ```ts
 * import { midnightTheme, emberTheme, listPremiumThemes } from "@hex-core/themes";
 * import { themeToScopedRuntimeCss } from "@hex-core/tokens";
 *
 * const css = themeToScopedRuntimeCss(midnightTheme, { mode: "dark" });
 * console.log(listPremiumThemes().map(t => t.name));
 * ```
 */
import type { Theme } from "@hex-core/registry";
import { emberTheme, midnightTheme } from "@hex-core/tokens";

export { emberTheme, midnightTheme };

/**
 * The full set of premium themes shipped by this package, keyed by name.
 * Future premium themes added here are picked up automatically by
 * {@link listPremiumThemes} and {@link getPremiumTheme}.
 */
export const premiumThemes: Record<string, Theme> = {
	midnight: midnightTheme,
	ember: emberTheme,
};

/**
 * Retrieve a premium theme by name.
 *
 * @param name - The theme identifier (e.g. `"midnight"`, `"ember"`).
 * @returns The matching Theme object, or `undefined` if the name is unknown.
 */
export function getPremiumTheme(name: string): Theme | undefined {
	return premiumThemes[name];
}

/**
 * List metadata for every premium theme in the catalog.
 *
 * Mirrors the shape of `listThemes()` from `@hex-core/tokens` so studios and
 * theme switchers can drive both catalogs through the same UI without
 * adapter code.
 *
 * @returns Array of `{ name, displayName, description }` summaries.
 */
export function listPremiumThemes(): Array<{
	name: string;
	displayName: string;
	description: string;
}> {
	return Object.values(premiumThemes).map((t) => ({
		name: t.name,
		displayName: t.displayName,
		description: t.description,
	}));
}
