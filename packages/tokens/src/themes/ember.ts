import type { Theme, TokenValue } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

/**
 * Tier 1 — the raw ramp. Every literal colour in the Ember theme is
 * declared exactly once here; the semantic tokens below reference an entry
 * by name rather than repeating its value.
 *
 * - `ember-*` is the terracotta brand family.
 * - `sand-*` / `bark-*` are the warm light and dark neutral ramps; note
 *   `sand-100` serves as dark-mode foreground, which is the point of a
 *   shared ramp — one value, two roles.
 * - `red-*` is the destructive family.
 * - `chart-*` is the categorical palette, cycled by index.
 */
const palette = {
	// Ember — terracotta brand.
	"ember-400": "16 65% 52%",
	"ember-500": "16 65% 48%",

	// Sand — warm light neutrals.
	"sand-0": "0 0% 100%",
	"sand-25": "30 33% 99%",
	"sand-50": "30 33% 98%",
	"sand-100": "30 20% 94%",
	"sand-200": "30 20% 92%",
	"sand-300": "30 15% 87%",
	"amber-100": "36 60% 90%",

	// Bark — warm dark neutrals.
	"bark-400": "20 6% 70%",
	"bark-500": "20 6% 38%",
	"bark-800": "20 20% 16%",
	"bark-825": "20 10% 16%",
	"bark-850": "20 12% 14%",
	"bark-900": "20 14% 10%",
	"bark-925": "20 14% 8%",
	"bark-950": "20 14% 6%",

	// Red — destructive.
	"red-300": "0 75% 65%",
	"red-600": "0 72% 45%",
	"red-950": "0 75% 15%",

	// Chart — categorical, cycled by index.
	"chart-light-1": "16 75% 55%",
	"chart-light-2": "180 55% 38%",
	"chart-light-3": "200 60% 50%",
	"chart-light-4": "45 80% 50%",
	"chart-light-5": "280 60% 60%",
	"chart-light-6": "330 70% 55%",
	"chart-dark-1": "16 75% 60%",
	"chart-dark-2": "180 55% 55%",
	"chart-dark-3": "200 60% 60%",
	"chart-dark-4": "45 80% 60%",
	"chart-dark-5": "280 60% 70%",
	"chart-dark-6": "330 70% 65%",
} as const;

/**
 * Draw a semantic token from the ramp.
 *
 * Resolves to the literal value while recording which ramp entry it came
 * from, which is what lets the CSS emitter write `var(--slate-900)`
 * instead of repeating the triplet. A typo in the key is a compile error.
 * @param key - A palette entry name
 * @param type - The token type, defaulting to `color`
 * @returns A token value carrying both the literal and its provenance
 */
function ref(key: keyof typeof palette, type: TokenValue["type"] = "color"): TokenValue {
	return { value: palette[key], ref: key, type };
}

export const emberTheme: Theme = {
	name: "ember",
	displayName: "Ember",
	description:
		"A warm theme with terracotta and amber tones. Inviting and distinctive, ideal for creative and lifestyle applications.",
	palette,
	tokens: {
		light: {
			background: ref("sand-50"),
			foreground: ref("bark-900"),
			card: ref("sand-25"),
			"card-foreground": ref("bark-900"),
			popover: ref("sand-25"),
			"popover-foreground": ref("bark-900"),
			primary: ref("ember-500"),
			"primary-foreground": ref("sand-0"),
			secondary: ref("sand-200"),
			"secondary-foreground": ref("bark-900"),
			muted: ref("sand-100"),
			"muted-foreground": ref("bark-500"),
			accent: ref("amber-100"),
			"accent-foreground": ref("bark-900"),
			destructive: ref("red-600"),
			"destructive-foreground": ref("sand-0"),
			border: ref("sand-300"),
			input: ref("sand-300"),
			ring: ref("ember-500"),
			radius: { value: "0.75rem", type: "radius" },
			// Chart palette — warm-leaning hues that complement the ember
			// terracotta primary while staying perceptually distinct from
			// each other for categorical encoding (sunburst/treemap/sankey/
			// chord/funnel/pyramid/venn/matrix).
			"chart-1": ref("chart-light-1"),
			"chart-2": ref("chart-light-2"),
			"chart-3": ref("chart-light-3"),
			"chart-4": ref("chart-light-4"),
			"chart-5": ref("chart-light-5"),
			"chart-6": ref("chart-light-6"),
			...sharedTokens,
		},
		dark: {
			background: ref("bark-950"),
			foreground: ref("sand-100"),
			card: ref("bark-925"),
			"card-foreground": ref("sand-100"),
			popover: ref("bark-925"),
			"popover-foreground": ref("sand-100"),
			primary: ref("ember-400"),
			"primary-foreground": ref("sand-0"),
			secondary: ref("bark-850"),
			"secondary-foreground": ref("sand-100"),
			muted: ref("bark-850"),
			"muted-foreground": ref("bark-400"),
			accent: ref("bark-800"),
			"accent-foreground": ref("sand-100"),
			/*
			 * Destructive in dark mode doubles as text on near-black surfaces
			 * (alerts, error helper text). A lighter coral-red gives ~7:1 on
			 * background and ~5:1 on the same color when paired with the dark
			 * destructive-foreground. Same tuning as default.ts.
			 */
			destructive: ref("red-300"),
			"destructive-foreground": ref("red-950"),
			border: ref("bark-825"),
			input: ref("bark-825"),
			ring: ref("ember-400"),
			radius: { value: "0.75rem", type: "radius" },
			// Lifted lightness so segments stay legible against the warm
			// near-black background.
			"chart-1": ref("chart-dark-1"),
			"chart-2": ref("chart-dark-2"),
			"chart-3": ref("chart-dark-3"),
			"chart-4": ref("chart-dark-4"),
			"chart-5": ref("chart-dark-5"),
			"chart-6": ref("chart-dark-6"),
			...sharedTokens,
		},
	},
};
