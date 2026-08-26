import type { Theme, TokenValue } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

/**
 * Tier 1 — the raw ramp. Every literal colour in the Midnight theme is
 * declared exactly once here; the semantic tokens below reference an entry
 * by name rather than repeating its value.
 *
 * - `indigo-*` is the brand family, and is deliberately the same value in
 *   both modes — Midnight's identity does not shift with the mode.
 * - `slate-*` is a single cool neutral ramp spanning both modes.
 * - `red-*` is the destructive family.
 * - `chart-*` is the categorical palette, cycled by index.
 */
const palette = {
	// Indigo — brand.
	"indigo-400": "226 70% 65%",
	"indigo-500": "226 70% 55%",

	// Slate — cool neutral ramp, both modes.
	"slate-0": "0 0% 100%",
	"slate-25": "220 23% 99%",
	"slate-50": "220 23% 97%",
	"slate-100": "220 23% 95%",
	"slate-150": "220 14% 94%",
	"slate-200": "220 14% 92%",
	"slate-300": "220 13% 88%",
	"slate-400": "220 9% 70%",
	"slate-500": "220 9% 38%",
	"slate-800": "224 30% 15%",
	"slate-825": "224 20% 14%",
	"slate-850": "224 30% 13%",
	"slate-900": "224 50% 7%",
	"slate-950": "224 71% 4%",

	// Red — destructive.
	"red-300": "0 75% 65%",
	"red-600": "0 72% 45%",
	"red-950": "0 75% 15%",

	// Chart — categorical, cycled by index.
	"chart-light-1": "226 70% 55%",
	"chart-light-2": "165 60% 40%",
	"chart-light-3": "20 80% 55%",
	"chart-light-4": "280 65% 60%",
	"chart-light-5": "45 80% 55%",
	"chart-light-6": "330 70% 55%",
	"chart-dark-1": "226 70% 65%",
	"chart-dark-2": "165 60% 55%",
	"chart-dark-3": "20 80% 65%",
	"chart-dark-4": "280 65% 70%",
	"chart-dark-5": "45 80% 65%",
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

export const midnightTheme: Theme = {
	name: "midnight",
	displayName: "Midnight",
	description:
		"A dark-first theme with deep blues and electric accents. Built for focus-heavy interfaces and developer tools.",
	palette,
	tokens: {
		light: {
			background: ref("slate-50"),
			foreground: ref("slate-950"),
			card: ref("slate-25"),
			"card-foreground": ref("slate-950"),
			popover: ref("slate-25"),
			"popover-foreground": ref("slate-950"),
			primary: ref("indigo-500"),
			"primary-foreground": ref("slate-0"),
			secondary: ref("slate-200"),
			"secondary-foreground": ref("slate-950"),
			muted: ref("slate-150"),
			"muted-foreground": ref("slate-500"),
			accent: ref("slate-200"),
			"accent-foreground": ref("slate-950"),
			destructive: ref("red-600"),
			"destructive-foreground": ref("slate-0"),
			border: ref("slate-300"),
			input: ref("slate-300"),
			ring: ref("indigo-500"),
			radius: { value: "0.5rem", type: "radius" },
			// Chart palette — cool-leaning hues that complement the
			// midnight blue primary while staying perceptually distinct
			// for categorical encoding.
			"chart-1": ref("chart-light-1"),
			"chart-2": ref("chart-light-2"),
			"chart-3": ref("chart-light-3"),
			"chart-4": ref("chart-light-4"),
			"chart-5": ref("chart-light-5"),
			"chart-6": ref("chart-light-6"),
			...sharedTokens,
		},
		dark: {
			background: ref("slate-950"),
			foreground: ref("slate-100"),
			card: ref("slate-900"),
			"card-foreground": ref("slate-100"),
			popover: ref("slate-900"),
			"popover-foreground": ref("slate-100"),
			primary: ref("indigo-500"),
			"primary-foreground": ref("slate-0"),
			secondary: ref("slate-850"),
			"secondary-foreground": ref("slate-100"),
			muted: ref("slate-850"),
			"muted-foreground": ref("slate-400"),
			accent: ref("slate-800"),
			"accent-foreground": ref("slate-100"),
			/*
			 * Destructive in dark mode doubles as text on near-black surfaces
			 * (alerts, error helper text). A lighter coral-red gives ~7:1 on
			 * background and ~5:1 on the same color when paired with the dark
			 * destructive-foreground for button bg + label combos. Same tuning
			 * as default.ts; intentional shadcn-divergence in service of WCAG AA.
			 */
			destructive: ref("red-300"),
			"destructive-foreground": ref("red-950"),
			border: ref("slate-825"),
			input: ref("slate-825"),
			ring: ref("indigo-500"),
			radius: { value: "0.5rem", type: "radius" },
			// Lifted lightness so segments stay legible against deep navy bg.
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
