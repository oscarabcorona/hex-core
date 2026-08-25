// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: d2a7eb2d1e4ca5f5272be4bec46a5f35f7f01edd
// Brief updated: 2026-04-09T18:04:01+03:00
//
// Style reference inspired by Raycast's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Raycast.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const raycastTheme: Theme = {
	name: "raycast",
	displayName: "Raycast",
	description: "Productivity launcher. Sleek dark chrome, vibrant gradient accents.",
	category: "dev-tools",
	tags: ["dev-tools"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Raycast",
	},
	tokens: {
		light: {
			background: { value: "220 17.6% 3.3%", type: "color" },
			foreground: { value: "0 0% 100%", type: "color" },
			card: { value: "220 17.6% 3.3%", type: "color" },
			"card-foreground": { value: "0 0% 100%", type: "color" },
			popover: { value: "220 17.6% 3.3%", type: "color" },
			"popover-foreground": { value: "0 0% 100%", type: "color" },
			primary: { value: "220 17.6% 3.3%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "220 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "220 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "220 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 65% 43%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "220 17.6% 3.3%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "220 13.2% 96.7%", type: "color" },
			foreground: { value: "0 0% 0%", type: "color" },
			card: { value: "220 13.2% 96.7%", type: "color" },
			popover: { value: "220 13.2% 96.7%", type: "color" },
			primary: { value: "220 13.2% 96.7%", type: "color" },
			secondary: { value: "220 3.8% 4.1%", type: "color" },
			muted: { value: "220 3.8% 4.1%", type: "color" },
			accent: { value: "220 3.8% 4.1%", type: "color" },
			destructive: { value: "0 48.8% 57%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "220 13.2% 96.7%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			"card-foreground": { value: "240 10% 3.9%", type: "color" },
			"popover-foreground": { value: "240 10% 3.9%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			...sharedTokens,
		},
	},
};
