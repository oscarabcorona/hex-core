import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

export const defaultTheme: Theme = {
	name: "default",
	displayName: "Default",
	description:
		"A modern, elegant minimalism — restrained cool-hue grayscale (~222 family) with a graphite primary and tight 0.375rem radius. Designed to recede so content leads; the cool slate carries identity across light + dark.",
	tokens: {
		light: {
			background: { value: "210 20% 98%", type: "color" },
			foreground: { value: "222 30% 11%", type: "color" },
			card: { value: "210 20% 98%", type: "color" },
			"card-foreground": { value: "222 30% 11%", type: "color" },
			popover: { value: "210 20% 98%", type: "color" },
			"popover-foreground": { value: "222 30% 11%", type: "color" },
			primary: { value: "222 25% 18%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "222 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "222 5% 95.9%", type: "color" },
			"muted-foreground": { value: "222 8% 38%", type: "color" },
			accent: { value: "222 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 65% 43%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "222 8% 90%", type: "color" },
			input: { value: "222 8% 90%", type: "color" },
			ring: { value: "222 25% 18%", type: "color" },
			radius: { value: "0.375rem", type: "radius" },
			// Chart palette — perceptually distinct hues for diagram primitives
			// (sunburst, treemap, sankey, chord, funnel, pyramid, venn). The
			// monochrome `--primary`/`--accent` family is unfit for categorical
			// encoding; cycle through these by index instead.
			"chart-1": { value: "12 76% 61%", type: "color" },
			"chart-2": { value: "173 58% 39%", type: "color" },
			"chart-3": { value: "197 37% 50%", type: "color" },
			"chart-4": { value: "43 74% 49%", type: "color" },
			"chart-5": { value: "280 65% 60%", type: "color" },
			"chart-6": { value: "340 75% 55%", type: "color" },
			...sharedTokens,
		},
		dark: {
			background: { value: "210 15% 2%", type: "color" },
			foreground: { value: "222 22.5% 89%", type: "color" },
			// Card/popover lifted from L=8% → L=14% so SVG-rendered surfaces
			// (org-chart cards, flowchart boxes) read as elevated against bg.
			card: { value: "222 12% 14%", type: "color" },
			popover: { value: "222 12% 14%", type: "color" },
			primary: { value: "222 30% 60%", type: "color" },
			secondary: { value: "222 8% 12%", type: "color" },
			muted: { value: "222 8% 12%", type: "color" },
			accent: { value: "222 8% 12%", type: "color" },
			// Lightness lifted from L=58% to L=68% so `text-destructive` on
			// the dark `--card` (L=14%) clears WCAG AA 4.5:1 contrast (was 4.02:1).
			destructive: { value: "0 48.8% 68%", type: "color" },
			// Border lifted from L=14% → L=24% so SVG outlines (chord arcs,
			// sankey segments, gantt grid) have actual definition.
			border: { value: "222 12% 24%", type: "color" },
			input: { value: "222 12% 24%", type: "color" },
			ring: { value: "222 30% 60%", type: "color" },
			radius: { value: "0.375rem", type: "radius" },
			"card-foreground": { value: "222 22.5% 89%", type: "color" },
			"popover-foreground": { value: "222 22.5% 89%", type: "color" },
			"primary-foreground": { value: "210 15% 8%", type: "color" },
			"secondary-foreground": { value: "222 22.5% 89%", type: "color" },
			"muted-foreground": { value: "222 8% 65%", type: "color" },
			"accent-foreground": { value: "222 22.5% 89%", type: "color" },
			"destructive-foreground": { value: "0 0% 8%", type: "color" },
			// Lifted lightness for legibility on near-black background.
			"chart-1": { value: "12 76% 65%", type: "color" },
			"chart-2": { value: "173 58% 55%", type: "color" },
			"chart-3": { value: "197 37% 60%", type: "color" },
			"chart-4": { value: "43 74% 60%", type: "color" },
			"chart-5": { value: "280 65% 70%", type: "color" },
			"chart-6": { value: "340 75% 65%", type: "color" },
			...sharedTokens,
		},
	},
};
