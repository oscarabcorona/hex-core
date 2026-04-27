import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "./shared.js";

export const emberTheme: Theme = {
	name: "ember",
	displayName: "Ember",
	description:
		"A warm theme with terracotta and amber tones. Inviting and distinctive, ideal for creative and lifestyle applications.",
	tokens: {
		light: {
			background: { value: "30 33% 98%", type: "color" },
			foreground: { value: "20 14% 10%", type: "color" },
			card: { value: "30 33% 99%", type: "color" },
			"card-foreground": { value: "20 14% 10%", type: "color" },
			popover: { value: "30 33% 99%", type: "color" },
			"popover-foreground": { value: "20 14% 10%", type: "color" },
			primary: { value: "16 65% 48%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "30 20% 92%", type: "color" },
			"secondary-foreground": { value: "20 14% 10%", type: "color" },
			muted: { value: "30 20% 94%", type: "color" },
			"muted-foreground": { value: "20 6% 38%", type: "color" },
			accent: { value: "36 60% 90%", type: "color" },
			"accent-foreground": { value: "20 14% 10%", type: "color" },
			destructive: { value: "0 72% 45%", type: "color" },
			"destructive-foreground": { value: "0 0% 100%", type: "color" },
			border: { value: "30 15% 87%", type: "color" },
			input: { value: "30 15% 87%", type: "color" },
			ring: { value: "16 65% 48%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "20 14% 6%", type: "color" },
			foreground: { value: "30 20% 94%", type: "color" },
			card: { value: "20 14% 8%", type: "color" },
			"card-foreground": { value: "30 20% 94%", type: "color" },
			popover: { value: "20 14% 8%", type: "color" },
			"popover-foreground": { value: "30 20% 94%", type: "color" },
			primary: { value: "16 65% 52%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "20 12% 14%", type: "color" },
			"secondary-foreground": { value: "30 20% 94%", type: "color" },
			muted: { value: "20 12% 14%", type: "color" },
			"muted-foreground": { value: "20 6% 70%", type: "color" },
			accent: { value: "20 20% 16%", type: "color" },
			"accent-foreground": { value: "30 20% 94%", type: "color" },
			/*
			 * Destructive in dark mode doubles as text on near-black surfaces
			 * (alerts, error helper text). A lighter coral-red gives ~7:1 on
			 * background and ~5:1 on the same color when paired with the dark
			 * destructive-foreground. Same tuning as default.ts.
			 */
			destructive: { value: "0 75% 65%", type: "color" },
			"destructive-foreground": { value: "0 75% 15%", type: "color" },
			border: { value: "20 10% 16%", type: "color" },
			input: { value: "20 10% 16%", type: "color" },
			ring: { value: "16 65% 52%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
			...sharedTokens,
		},
	},
};
