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

/** Metadata row returned by {@link listThemes}. */
export interface ThemeSummary {
	name: string;
	displayName: string;
	description: string;
	category?: string;
	tags?: string[];
	brand?: string;
}

/**
 * Memoized theme summaries.
 *
 * `themes` is a module-level constant, so this projection produced an
 * identical array of ~74 fresh objects on every call — and both `list_themes`
 * and `search_themes` call it per query. Building it once is the whole fix.
 */
let cachedThemeSummaries: ThemeSummary[] | null = null;

/**
 * List metadata for every theme in the merged catalog. Mirrors the
 * shape consumed by Studio's preset switcher; the optional
 * `category` / `tags` / `brand` fields land for voltagent presets
 * and stay `undefined` for the first-party OSS themes.
 *
 * The returned array is shared across calls — treat it as read-only.
 * @returns One summary row per theme
 */
export function listThemes(): ThemeSummary[] {
	if (cachedThemeSummaries) return cachedThemeSummaries;

	const summaries: ThemeSummary[] = Object.values(themes).map((t) => ({
		name: t.name,
		displayName: t.displayName,
		description: t.description,
		category: t.category,
		tags: t.tags,
		brand: t.brand,
	}));
	cachedThemeSummaries = summaries;
	return summaries;
}
