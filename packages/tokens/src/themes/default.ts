import type { Theme, TokenValue } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

/**
 * Tier 1 — the raw ramp. Every literal colour in the default theme is
 * declared exactly once here; the semantic tokens below reference an entry
 * by name rather than repeating its value.
 *
 * The families are deliberate:
 * - `slate-*` carries brand identity across both modes (~222 hue, low
 *   saturation, so the brand recedes and content leads).
 * - `surface-*` is the cool-tinted page/card ground.
 * - `red-*` is the single destructive family, tuned so `text-destructive`
 *   clears WCAG AA against its own surface in each mode.
 * - `chart-*` is a categorical palette. The monochrome slate family is
 *   unfit for categorical encoding, so diagram primitives cycle these by
 *   index instead of reaching for `--primary`.
 */
const palette = {
	// Slate — brand family.
	"slate-50": "0 0% 98%",
	"slate-100": "222 22.5% 89%",
	"slate-200": "222 8% 90%",
	"slate-300": "222 8% 65%",
	"slate-400": "222 30% 60%",
	"slate-500": "222 8% 38%",
	"slate-600": "222 12% 24%",
	"slate-700": "222 8% 12%",
	"slate-800": "222 12% 14%",
	"slate-900": "222 25% 18%",
	"slate-950": "222 30% 11%",
	"slate-muted": "222 5% 95.9%",
	"slate-contrast": "240 10% 3.9%",

	// Surface — page and card grounds.
	"surface-light": "210 20% 98%",
	"surface-dark": "210 15% 2%",
	"surface-dark-raised": "210 15% 8%",

	// Red — destructive family.
	"red-600": "0 65% 43%",
	"red-300": "0 48.8% 68%",
	"red-contrast": "0 0% 8%",

	// Chart — categorical, cycled by index.
	"chart-light-1": "12 76% 61%",
	"chart-light-2": "173 58% 39%",
	"chart-light-3": "197 37% 50%",
	"chart-light-4": "43 74% 49%",
	"chart-light-5": "280 65% 60%",
	"chart-light-6": "340 75% 55%",
	"chart-dark-1": "12 76% 65%",
	"chart-dark-2": "173 58% 55%",
	"chart-dark-3": "197 37% 60%",
	"chart-dark-4": "43 74% 60%",
	"chart-dark-5": "280 65% 70%",
	"chart-dark-6": "340 75% 65%",
} as const;

/**
 * Draw a semantic token from the ramp.
 *
 * Resolves to the literal value — so contrast math, dark-mode derivation
 * and every other value consumer keep working — while recording which
 * ramp entry it came from, which is what lets the CSS emitter write
 * `var(--slate-900)` instead of repeating the triplet.
 *
 * Type-safe by construction: a typo in the key is a compile error, which
 * a string-reference convention could not give.
 * @param key - A palette entry name
 * @param type - The token type, defaulting to `color`
 * @returns A token value carrying both the literal and its provenance
 */
function ref(key: keyof typeof palette, type: TokenValue["type"] = "color"): TokenValue {
	return { value: palette[key], ref: key, type };
}

export const defaultTheme: Theme = {
	name: "default",
	displayName: "Default",
	description:
		"A modern, elegant minimalism — restrained cool-hue grayscale (~222 family) with a graphite primary and tight 0.375rem radius. Designed to recede so content leads; the cool slate carries identity across light + dark.",
	palette,
	tokens: {
		light: {
			background: ref("surface-light"),
			foreground: ref("slate-950"),
			card: ref("surface-light"),
			"card-foreground": ref("slate-950"),
			popover: ref("surface-light"),
			"popover-foreground": ref("slate-950"),
			primary: ref("slate-900"),
			"primary-foreground": ref("slate-50"),
			secondary: ref("slate-muted"),
			"secondary-foreground": ref("slate-contrast"),
			muted: ref("slate-muted"),
			"muted-foreground": ref("slate-500"),
			accent: ref("slate-muted"),
			"accent-foreground": ref("slate-contrast"),
			// L=43% achieves ≥4.5:1 on the destructive/5 alert background.
			// Gated by `pnpm a11y-audit`.
			destructive: ref("red-600"),
			"destructive-foreground": ref("slate-50"),
			border: ref("slate-200"),
			input: ref("slate-200"),
			ring: ref("slate-900"),
			radius: { value: "0.375rem", type: "radius" },
			"chart-1": ref("chart-light-1"),
			"chart-2": ref("chart-light-2"),
			"chart-3": ref("chart-light-3"),
			"chart-4": ref("chart-light-4"),
			"chart-5": ref("chart-light-5"),
			"chart-6": ref("chart-light-6"),
			...sharedTokens,
		},
		dark: {
			background: ref("surface-dark"),
			foreground: ref("slate-100"),
			// Card/popover sit one surface step above background (L=14% vs 2%)
			// so SVG-rendered surfaces — org-chart cards, flowchart boxes —
			// read as elevated without box-shadow chrome.
			card: ref("slate-800"),
			popover: ref("slate-800"),
			primary: ref("slate-400"),
			secondary: ref("slate-700"),
			muted: ref("slate-700"),
			accent: ref("slate-700"),
			// L=68%, not 58%, so `text-destructive` on the dark card clears
			// WCAG AA 4.5:1 (was 4.02:1).
			destructive: ref("red-300"),
			// L=24%, not 14%, so SVG outlines — chord arcs, sankey segments,
			// gantt grid — have actual definition against the card.
			border: ref("slate-600"),
			input: ref("slate-600"),
			ring: ref("slate-400"),
			radius: { value: "0.375rem", type: "radius" },
			"card-foreground": ref("slate-100"),
			"popover-foreground": ref("slate-100"),
			"primary-foreground": ref("surface-dark-raised"),
			"secondary-foreground": ref("slate-100"),
			"muted-foreground": ref("slate-300"),
			"accent-foreground": ref("slate-100"),
			"destructive-foreground": ref("red-contrast"),
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
