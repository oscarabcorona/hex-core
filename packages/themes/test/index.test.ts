/**
 * Smoke tests for @hex-core/themes.
 *
 * Locks down what the catalog surface looks like so consumers (theme
 * studios, switcher UIs) can rely on listPremiumThemes() / getPremiumTheme()
 * shapes as the catalog grows.
 */
import { strictThemeSchema } from "@hex-core/registry";
import { contrastRatio } from "@hex-core/tokens";
import { describe, expect, it } from "vitest";
import {
	emberTheme,
	extendTheme,
	getPremiumTheme,
	listPremiumThemes,
	loadThemeBrief,
	midnightTheme,
	premiumThemes,
	presetSlugs,
	presetsByCategory,
	searchThemes,
	teslaTheme,
	stripeTheme,
	linearTheme,
	voltagentPresets,
} from "../src/index.js";

describe("@hex-core/themes catalog", () => {
	it("exports midnight + ember plus 71 voltagent presets", () => {
		expect(midnightTheme.name).toBe("midnight");
		expect(emberTheme.name).toBe("ember");
		// 2 first-party + 71 voltagent = 73 total
		expect(Object.keys(premiumThemes).length).toBe(73);
		expect(Object.keys(voltagentPresets).length).toBe(71);
	});

	it("listPremiumThemes returns metadata for every catalog entry", () => {
		const list = listPremiumThemes();
		expect(list).toHaveLength(Object.keys(premiumThemes).length);
		for (const t of list) {
			expect(t.name).toBeTruthy();
			expect(t.displayName).toBeTruthy();
			expect(t.description).toBeTruthy();
		}
	});

	it("getPremiumTheme resolves first-party + voltagent slugs and returns undefined for misses", () => {
		expect(getPremiumTheme("midnight")).toBe(midnightTheme);
		expect(getPremiumTheme("ember")).toBe(emberTheme);
		expect(getPremiumTheme("tesla")).toBe(teslaTheme);
		expect(getPremiumTheme("stripe")).toBe(stripeTheme);
		expect(getPremiumTheme("linear")).toBe(linearTheme);
		expect(getPremiumTheme("nonexistent")).toBeUndefined();
	});
});

describe("voltagent preset metadata", () => {
	it("every voltagent preset carries displayName + description + category + tags + attribution", () => {
		for (const theme of Object.values(voltagentPresets)) {
			expect(theme.displayName).toBeTruthy();
			expect(theme.description).toBeTruthy();
			expect(theme.category).toBeTruthy();
			expect(theme.tags?.length ?? 0).toBeGreaterThan(0);
			expect(theme.attribution?.source).toBe("voltagent/awesome-design-md");
			expect(theme.attribution?.license).toBe("MIT");
			expect(theme.attribution?.brand).toBeTruthy();
			// designBrief is intentionally NOT inlined on the eager preset
			// (lazy-loaded via loadThemeBrief). Ensure we kept the bundle
			// lightweight by confirming the field stays undefined.
			expect(theme.designBrief).toBeUndefined();
		}
	});

	it("first-party themes (midnight, ember) DO NOT carry voltagent attribution", () => {
		expect(midnightTheme.attribution).toBeUndefined();
		expect(emberTheme.attribution).toBeUndefined();
	});

	it("loadThemeBrief lazily resolves a brief by slug and undefined for unknown slugs", async () => {
		const brief = await loadThemeBrief("tesla");
		expect(typeof brief).toBe("string");
		expect((brief ?? "").length).toBeGreaterThan(500);
		const stripeBrief = await loadThemeBrief("stripe");
		expect(typeof stripeBrief).toBe("string");
		expect(await loadThemeBrief("definitely-not-a-slug")).toBeUndefined();
	});

	it("presetsByCategory groups all 71 presets across the 9 categories", () => {
		const total = Object.values(presetsByCategory).reduce(
			(sum, list) => sum + list.length,
			0,
		);
		expect(total).toBe(71);
		expect(presetsByCategory.fintech.length).toBeGreaterThanOrEqual(5);
		expect(presetsByCategory.automotive.length).toBeGreaterThanOrEqual(5);
		expect(presetsByCategory.ai.length).toBeGreaterThanOrEqual(8);
	});

	it("presetSlugs lists every voltagent preset alphabetically", () => {
		expect(presetSlugs.length).toBe(71);
		expect([...presetSlugs]).toEqual([...presetSlugs].sort());
		expect(presetSlugs.includes("tesla")).toBe(true);
		expect(presetSlugs.includes("stripe")).toBe(true);
	});

	it("getPremiumTheme does NOT resolve OSS-only slugs ('default') — those live in @hex-core/tokens", () => {
		// The premium catalog ONLY contains midnight + ember + voltagent presets.
		// Consumers wanting the canonical OSS `default` theme go through
		// @hex-core/tokens.getTheme("default") or through the merged
		// catalog in @hex-core/payload.
		expect(getPremiumTheme("default")).toBeUndefined();
	});
});

describe("strictThemeSchema validation across the catalog", () => {
	for (const theme of Object.values(premiumThemes)) {
		it(`${theme.name} satisfies strictThemeSchema (every required token present)`, () => {
			expect(() => strictThemeSchema.parse(theme)).not.toThrow();
		});
	}
});

describe("WCAG AA contrast for every required fg/bg pair (voltagent presets)", () => {
	const PAIRS: Array<[bg: string, fg: string]> = [
		["background", "foreground"],
		["card", "card-foreground"],
		["popover", "popover-foreground"],
		["primary", "primary-foreground"],
		["secondary", "secondary-foreground"],
		["muted", "muted-foreground"],
		["accent", "accent-foreground"],
		["destructive", "destructive-foreground"],
	];

	const MIN_RATIO = 4.5;

	// AA gate is enforced on voltagent presets only — they're the new
	// surface this PR adds and the import script's `aaPatch` step
	// guarantees every required pair clears the threshold. The first-
	// party `midnight` / `ember` themes pre-date this gate; auditing
	// them is tracked in a separate finding.
	for (const theme of Object.values(voltagentPresets)) {
		for (const mode of ["light", "dark"] as const) {
			for (const [bgKey, fgKey] of PAIRS) {
				it(`${theme.name} ${mode}: ${fgKey} on ${bgKey} ≥ ${MIN_RATIO}:1`, () => {
					const set = theme.tokens[mode];
					const bg = set[bgKey];
					const fg = set[fgKey];
					if (!bg || !fg) throw new Error(`Missing ${bgKey}/${fgKey} in ${theme.name}.${mode}`);
					const ratio = contrastRatio(fg.value, bg.value);
					expect(ratio).toBeGreaterThanOrEqual(MIN_RATIO);
				});
			}
		}
	}
});

describe("searchThemes filtering", () => {
	it("returns the full catalog when called with no filters", () => {
		expect(searchThemes()).toHaveLength(Object.keys(premiumThemes).length);
	});

	it("filters by category", () => {
		const fintech = searchThemes({ category: "fintech" });
		expect(fintech.length).toBeGreaterThan(0);
		for (const t of fintech) expect(t.category).toBe("fintech");
		expect(fintech.find((t) => t.name === "stripe")).toBeDefined();
		expect(fintech.find((t) => t.name === "tesla")).toBeUndefined();
	});

	it("filters by tags (intersection match)", () => {
		const minimalist = searchThemes({ tags: ["minimalist"] });
		expect(minimalist.length).toBeGreaterThan(0);
		for (const t of minimalist) {
			expect((t.tags ?? []).map((x) => x.toLowerCase())).toContain("minimalist");
		}
	});

	it("filters by free-text query against name/displayName/description/attribution.brand", () => {
		const tesla = searchThemes({ query: "tesla" });
		expect(tesla.length).toBeGreaterThanOrEqual(1);
		expect(tesla[0]?.name).toBe("tesla");
	});

	it("AND-combines all filters", () => {
		const both = searchThemes({ category: "automotive", query: "tesla" });
		expect(both).toHaveLength(1);
		expect(both[0]?.name).toBe("tesla");
		expect(searchThemes({ category: "fintech", query: "tesla" })).toHaveLength(0);
	});

	it("returns empty array when filters select nothing matching", () => {
		const none = searchThemes({ category: "fintech", tags: ["minimalist"] });
		// stripe IS tagged minimalist? — the tags-override map sets stripe to
		// ["fintech","saturated","purple"], so this combo should be empty.
		expect(none).toEqual([]);
	});

	it("treats empty-string query as no-filter (matches all themes the other filters allow)", () => {
		const allWithEmpty = searchThemes({ query: "" });
		expect(allWithEmpty.length).toBe(Object.keys(premiumThemes).length);
		const fintechWithEmpty = searchThemes({ query: "", category: "fintech" });
		expect(fintechWithEmpty.length).toBe(searchThemes({ category: "fintech" }).length);
	});
});

describe("extendTheme override pattern", () => {
	it("overrides scalar fields and merges token sets", () => {
		const myTesla = extendTheme(teslaTheme, {
			name: "my-tesla",
			displayName: "My Tesla",
			tokens: {
				light: { primary: { value: "0 100% 50%", type: "color" } },
			},
		});
		expect(myTesla.name).toBe("my-tesla");
		expect(myTesla.displayName).toBe("My Tesla");
		expect(myTesla.tokens.light.primary?.value).toBe("0 100% 50%");
		// Other tokens fall through from base
		expect(myTesla.tokens.light.background?.value).toBe(teslaTheme.tokens.light.background?.value);
		expect(myTesla.tokens.dark.background?.value).toBe(teslaTheme.tokens.dark.background?.value);
	});

	it("re-validates the merged theme via strictThemeSchema", () => {
		expect(() =>
			extendTheme(teslaTheme, { name: "my-tesla" }),
		).not.toThrow();
	});

	it("does NOT mutate the base preset (repeated extends from the same base are safe)", () => {
		const baseTagsBefore = JSON.stringify(teslaTheme.tags);
		const baseAttribBefore = JSON.stringify(teslaTheme.attribution);
		const basePrimaryBefore = teslaTheme.tokens.light.primary?.value;

		extendTheme(teslaTheme, {
			name: "leak-test-1",
			tags: ["override"],
			attribution: { source: "test", license: "MIT", url: "https://test" },
			tokens: { light: { primary: { value: "100 50% 50%", type: "color" } } },
		});

		expect(JSON.stringify(teslaTheme.tags)).toBe(baseTagsBefore);
		expect(JSON.stringify(teslaTheme.attribution)).toBe(baseAttribBefore);
		expect(teslaTheme.tokens.light.primary?.value).toBe(basePrimaryBefore);
	});

	it("FULL-replaces attribution (no merge with base) when override.attribution is set", () => {
		const myTesla = extendTheme(teslaTheme, {
			name: "my-tesla",
			attribution: {
				source: "my-org/internal-design",
				license: "Apache-2.0",
				url: "https://my-org.com/design",
				// Intentionally NO `brand` — the upstream Tesla brand should NOT leak through.
			},
		});
		expect(myTesla.attribution?.source).toBe("my-org/internal-design");
		expect(myTesla.attribution?.license).toBe("Apache-2.0");
		expect(myTesla.attribution?.brand).toBeUndefined();
	});

	it("explicit `tags: []` clears inherited tags rather than preserving them", () => {
		expect(teslaTheme.tags?.length ?? 0).toBeGreaterThan(0);
		const stripped = extendTheme(teslaTheme, { name: "no-tag-tesla", tags: [] });
		expect(stripped.tags).toEqual([]);
	});

	it("`attribution: undefined` removes inherited attribution", () => {
		const stripped = extendTheme(teslaTheme, { name: "anon-tesla", attribution: undefined });
		expect(stripped.attribution).toBeUndefined();
	});
});
