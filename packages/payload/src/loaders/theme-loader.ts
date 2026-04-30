/**
 * Theme accessors + transformers for `@hex-core/payload`.
 *
 * Re-exports the canonical surface from `@hex-core/tokens` (transformers +
 * the OSS theme objects) AND the brand-derived preset catalog from
 * `@hex-core/themes` (71 voltagent presets + first-party premium themes).
 *
 * The `themes` / `getTheme` / `listThemes` exports here are an OVERLAY:
 * `@hex-core/tokens` ships `default`/`midnight`/`ember`; `@hex-core/themes`
 * adds `tesla`/`stripe`/`linear`/etc. Payload merges them into a single
 * catalog so Studio's `/studio/copy` LLM payload — and any consumer of
 * `listThemes()` — sees every theme in one place.
 *
 * Single source of truth: theme objects live in their authoring packages.
 * Payload only re-projects the catalog. No data inlined.
 */

import type { Theme } from "@hex-core/registry";
import { premiumThemes } from "@hex-core/themes";
import {
	defaultSemanticTokens,
	defaultTheme,
	emberTheme,
	generateGlobalsCss,
	midnightTheme,
	themes as ossThemes,
	themeToCss,
	themeToFlatJson,
	themeToTailwindConfig,
} from "@hex-core/tokens";

export {
	defaultSemanticTokens,
	defaultTheme,
	emberTheme,
	generateGlobalsCss,
	midnightTheme,
	themeToCss,
	themeToFlatJson,
	themeToTailwindConfig,
};

/**
 * Full theme catalog — every theme that ships with `@hex-core/*`.
 *
 * Merge order: voltagent presets first (so brand-named slugs land
 * predictably in alphabetical iteration), then the OSS themes
 * (`default`/`midnight`/`ember`) which override any same-slug entry
 * — `default`/`midnight`/`ember` are reserved for the first-party
 * curated set.
 */
export const themes: Record<string, Theme> = {
	...premiumThemes,
	...ossThemes,
};

/**
 * Retrieve a theme by slug. Searches the merged catalog
 * (OSS + voltagent presets).
 *
 * @param name - Theme slug
 * @returns Theme object or `undefined` when the slug is unknown
 */
export function getTheme(name: string): Theme | undefined {
	return themes[name];
}

/**
 * List metadata for every theme in the merged catalog. Mirrors the
 * shape consumed by Studio's preset switcher; the optional
 * `category` / `tags` / `brand` fields land for voltagent presets
 * and stay `undefined` for the first-party OSS themes.
 */
export function listThemes(): Array<{
	name: string;
	displayName: string;
	description: string;
	category?: string;
	tags?: string[];
	brand?: string;
}> {
	return Object.values(themes).map((t) => ({
		name: t.name,
		displayName: t.displayName,
		description: t.description,
		category: t.category,
		tags: t.tags,
		brand: t.brand,
	}));
}
