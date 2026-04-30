/**
 * @hex-core/themes — premium theme catalog and brand-derived presets.
 *
 * This package establishes a separate publish/version surface for theme
 * presets so the bundled `@hex-core/tokens` package can stay focused on the
 * single canonical default theme + the transformer functions.
 *
 * Catalog:
 *   - `midnight`, `ember` — first-party premium themes (re-exports from `@hex-core/tokens`)
 *   - `voltagent` brand presets — 71 brand-inspired themes (Tesla, Stripe, Linear, …)
 *     auto-generated from the MIT-licensed voltagent/awesome-design-md briefs
 *
 * @example
 * ```ts
 * import { teslaTheme, listPremiumThemes, extendTheme, searchThemes } from "@hex-core/themes";
 * import { themeToScopedRuntimeCss } from "@hex-core/tokens";
 *
 * const css = themeToScopedRuntimeCss(teslaTheme, { mode: "dark" });
 *
 * const myTesla = extendTheme(teslaTheme, {
 *   name: "my-tesla",
 *   tokens: { light: { primary: { value: "0 100% 50%", type: "color" } } },
 * });
 *
 * const fintech = searchThemes({ category: "fintech" });
 * ```
 */
import type { Theme, ThemeCategory } from "@hex-core/registry";
import { strictThemeSchema, themeSchema } from "@hex-core/registry";
import { emberTheme, midnightTheme } from "@hex-core/tokens";
import { presetSlugs, presetsByCategory, voltagentPresets } from "./presets/index.js";

export { emberTheme, midnightTheme };
export * from "./presets/index.js";

/**
 * The full set of themes shipped by this package, keyed by slug. Includes:
 *   - First-party premium themes: `midnight`, `ember`
 *   - 71 voltagent brand-derived presets (e.g. `tesla`, `stripe`, `linear`)
 *
 * Studio's theme picker iterates this map directly, so every entry shows up
 * automatically without barrel-side wiring.
 */
export const premiumThemes: Record<string, Theme> = {
	midnight: midnightTheme,
	ember: emberTheme,
	...voltagentPresets,
};

/**
 * Retrieve a premium theme by slug.
 *
 * @param name - Theme slug (e.g. `"midnight"`, `"tesla"`, `"stripe"`).
 * @returns The matching Theme object, or `undefined` if the slug is unknown.
 */
export function getPremiumTheme(name: string): Theme | undefined {
	return premiumThemes[name];
}

/**
 * List metadata for every theme in the catalog.
 *
 * Mirrors the shape of `listThemes()` from `@hex-core/tokens` so studios and
 * theme switchers can drive both catalogs through the same UI without
 * adapter code.
 *
 * @returns Array of `{ name, displayName, description, category?, tags?, brand? }` summaries.
 */
export function listPremiumThemes(): Array<{
	name: string;
	displayName: string;
	description: string;
	category?: ThemeCategory;
	tags?: string[];
	brand?: string;
}> {
	return Object.values(premiumThemes).map((t) => ({
		name: t.name,
		displayName: t.displayName,
		description: t.description,
		category: t.category,
		tags: t.tags,
		// `brand` falls back to `attribution.brand` (the trademark notice
		// for voltagent-derived presets) — single source of truth on the
		// theme object, no duplicated top-level `brand` field.
		brand: t.brand ?? t.attribution?.brand,
	}));
}

/** Filter input for {@link searchThemes}. */
export interface SearchThemesInput {
	/** Case-insensitive substring match against `name` / `displayName` / `description`. */
	query?: string;
	/** Restrict to a single category. */
	category?: ThemeCategory;
	/** All listed tags must be present (intersection match). */
	tags?: string[];
}

/**
 * Search the full preset catalog by category, tags, or free-text query.
 * The 71 voltagent presets each carry `category` and `tags`; the
 * first-party `midnight` / `ember` themes don't (they pre-date the
 * metadata extension), so they only match via the `query` filter.
 *
 * @param input - Filter criteria; combine for AND semantics.
 * @returns Matching themes, in catalog order.
 */
export function searchThemes(input: SearchThemesInput = {}): Theme[] {
	const { query, category, tags } = input;
	const q = query?.toLowerCase().trim();
	const requiredTags = tags?.map((t) => t.toLowerCase());
	const out: Theme[] = [];
	for (const theme of Object.values(premiumThemes)) {
		if (category && theme.category !== category) continue;
		if (requiredTags && requiredTags.length > 0) {
			const themeTags = (theme.tags ?? []).map((t) => t.toLowerCase());
			if (!requiredTags.every((t) => themeTags.includes(t))) continue;
		}
		if (q) {
			const haystack = [
				theme.name,
				theme.displayName,
				theme.description,
				theme.brand,
				theme.attribution?.brand,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			if (!haystack.includes(q)) continue;
		}
		out.push(theme);
	}
	return out;
}

/**
 * Override input for {@link extendTheme}. Token sets accept partial
 * objects (token slots merge); scalar fields replace the base value
 * when present. `attribution` is full-replacement (not merged) — a
 * consumer rebranding a preset under their own license / URL almost
 * always wants their attribution to fully replace the upstream's.
 * Pass `attribution: undefined` to remove attribution entirely.
 */
export interface ThemeOverrides {
	name?: string;
	displayName?: string;
	description?: string;
	brand?: string;
	category?: Theme["category"];
	tags?: string[];
	designBrief?: string;
	attribution?: Theme["attribution"];
	/**
	 * Per-mode token overrides — token slot keys are an open record
	 * (the schema's `tokenSetSchema` uses a catchall), so any subset
	 * of slots is valid. Slots not listed fall through from the base.
	 */
	tokens?: {
		light?: Theme["tokens"]["light"];
		dark?: Theme["tokens"]["dark"];
	};
}

/**
 * Compose a custom theme by overlaying overrides on a base preset.
 *
 * Token sets are merged at the slot level: missing slots fall through
 * from the base; overridden slots replace the entire `{ value, type }`
 * record. Scalar fields replace the base when present (including
 * `tags: []` which clears the inherited tag list — explicit empty is
 * intentional, not surprising).
 *
 * `attribution` is FULL-REPLACEMENT (not deep-merged) — a consumer
 * republishing a preset under their own license / brand wants their
 * attribution to land cleanly without the upstream's `brand` /
 * `source` / `url` leaking through. Spread base.attribution yourself
 * if you actually want partial merge.
 *
 * The composed theme is re-validated via `strictThemeSchema` before
 * return, so consumers can't accidentally produce an under-spec'd
 * Theme.
 *
 * @example
 * ```ts
 * const myTesla = extendTheme(teslaTheme, {
 *   name: "my-tesla",
 *   displayName: "My Tesla",
 *   tokens: {
 *     light: { primary: { value: "0 100% 50%", type: "color" } },
 *   },
 * });
 * ```
 *
 * @param base - The starting theme (any preset or first-party theme)
 * @param overrides - Partial theme; only specified fields override
 * @returns A new validated Theme that's safe to feed to any transformer
 */
export function extendTheme(base: Theme, overrides: ThemeOverrides = {}): Theme {
	// Build a fresh theme so we never mutate `base` (consumers can call
	// extendTheme repeatedly against the same shared preset).
	const merged: Theme = {
		name: overrides.name ?? base.name,
		displayName: overrides.displayName ?? base.displayName,
		description: overrides.description ?? base.description,
		tokens: {
			light: { ...base.tokens.light, ...(overrides.tokens?.light ?? {}) },
			dark: { ...base.tokens.dark, ...(overrides.tokens?.dark ?? {}) },
		},
	};

	// Optional metadata: caller-supplied value wins (including explicit
	// empty arrays / undefined). `in` checks distinguish "not specified"
	// from "specified as undefined" so consumers can clear inherited
	// fields when they want to.
	if ("brand" in overrides) merged.brand = overrides.brand;
	else if (base.brand !== undefined) merged.brand = base.brand;

	if ("category" in overrides) merged.category = overrides.category;
	else if (base.category !== undefined) merged.category = base.category;

	if ("tags" in overrides) merged.tags = overrides.tags;
	else if (base.tags !== undefined) merged.tags = base.tags;

	if ("designBrief" in overrides) merged.designBrief = overrides.designBrief;
	else if (base.designBrief !== undefined) merged.designBrief = base.designBrief;

	// Full-replacement semantics for attribution (see JSDoc).
	if ("attribution" in overrides) merged.attribution = overrides.attribution;
	else if (base.attribution !== undefined) merged.attribution = base.attribution;

	// Permissive parse first so consumer overrides like `tags: []` pass.
	// Strict parse catches any token-slot regression.
	themeSchema.parse(merged);
	strictThemeSchema.parse(merged);

	return merged;
}

/** All preset slugs known to this package, including first-party themes. */
export const allThemeSlugs: readonly string[] = [...Object.keys(premiumThemes)];

export { presetSlugs, presetsByCategory };
