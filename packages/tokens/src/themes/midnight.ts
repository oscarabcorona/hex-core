import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

export const midnightTheme: Theme = {
	name: "midnight",
	displayName: "Midnight",
	description:
		"A dark-first theme with deep blues and electric accents. Built for focus-heavy interfaces and developer tools.",
	tokens: {
		light: {
			background: { value: "220 23% 97%", type: "color" },
			foreground: { value: "224 71% 4%", type: "color" },
			card: { value: "220 23% 99%", type: "color" },
			"card-foreground": { value: "224 71% 4%", type: "color" },
			popover: { value: "220 23% 99%", type: "color" },
			"popover-foreground": { value: "224 71% 4%", type: "color" },
			primary: { value: "226 70% 55%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "220 14% 92%", type: "color" },
			"secondary-foreground": { value: "224 71% 4%", type: "color" },
			muted: { value: "220 14% 94%", type: "color" },
			"muted-foreground": { value: "220 9% 38%", type: "color" },
			accent: { value: "220 14% 92%", type: "color" },
			"accent-foreground": { value: "224 71% 4%", type: "color" },
			destructive: { value: "0 72% 45%", type: "color" },
			"destructive-foreground": { value: "0 0% 100%", type: "color" },
			border: { value: "220 13% 88%", type: "color" },
			input: { value: "220 13% 88%", type: "color" },
			ring: { value: "226 70% 55%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "224 71% 4%", type: "color" },
			foreground: { value: "220 23% 95%", type: "color" },
			card: { value: "224 50% 7%", type: "color" },
			"card-foreground": { value: "220 23% 95%", type: "color" },
			popover: { value: "224 50% 7%", type: "color" },
			"popover-foreground": { value: "220 23% 95%", type: "color" },
			primary: { value: "226 70% 55%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "224 30% 13%", type: "color" },
			"secondary-foreground": { value: "220 23% 95%", type: "color" },
			muted: { value: "224 30% 13%", type: "color" },
			"muted-foreground": { value: "220 9% 70%", type: "color" },
			accent: { value: "224 30% 15%", type: "color" },
			"accent-foreground": { value: "220 23% 95%", type: "color" },
			/*
			 * Destructive in dark mode doubles as text on near-black surfaces
			 * (alerts, error helper text). A lighter coral-red gives ~7:1 on
			 * background and ~5:1 on the same color when paired with the dark
			 * destructive-foreground for button bg + label combos. Same tuning
			 * as default.ts; intentional shadcn-divergence in service of WCAG AA.
			 */
			destructive: { value: "0 75% 65%", type: "color" },
			"destructive-foreground": { value: "0 75% 15%", type: "color" },
			border: { value: "224 20% 14%", type: "color" },
			input: { value: "224 20% 14%", type: "color" },
			ring: { value: "226 70% 55%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			...sharedTokens,
		},
	},
};
