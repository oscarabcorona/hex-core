// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: d2a7eb2d1e4ca5f5272be4bec46a5f35f7f01edd
// Brief updated: 2026-04-09T18:04:01+03:00
//
// Style reference inspired by Wise's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Wise.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const wiseTheme: Theme = {
	name: "wise",
	displayName: "Wise",
	description: "Money transfer. Bright green accent, friendly and clear.",
	category: "fintech",
	tags: ["fintech"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Wise",
	},
	tokens: {
		light: {
			background: { value: "96 64.7% 90%", type: "color" },
			foreground: { value: "80 11.1% 5.3%", type: "color" },
			card: { value: "96 64.7% 90%", type: "color" },
			"card-foreground": { value: "80 11.1% 5.3%", type: "color" },
			popover: { value: "96 64.7% 90%", type: "color" },
			"popover-foreground": { value: "80 11.1% 5.3%", type: "color" },
			primary: { value: "97 72.3% 67.5%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			secondary: { value: "97 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "97 5% 95.9%", type: "color" },
			"muted-foreground": { value: "80 8% 38%", type: "color" },
			accent: { value: "97 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "358 62.7% 50.6%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "80 8% 90%", type: "color" },
			input: { value: "80 8% 90%", type: "color" },
			ring: { value: "97 72.3% 67.5%", type: "color" },
			radius: { value: "2rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "96 48.5% 10%", type: "color" },
			foreground: { value: "80 8.3% 94.7%", type: "color" },
			card: { value: "96 48.5% 10%", type: "color" },
			popover: { value: "96 48.5% 10%", type: "color" },
			primary: { value: "97 54.2% 32.5%", type: "color" },
			secondary: { value: "97 3.8% 4.1%", type: "color" },
			muted: { value: "97 3.8% 4.1%", type: "color" },
			accent: { value: "97 3.8% 4.1%", type: "color" },
			destructive: { value: "358 47% 49.4%", type: "color" },
			border: { value: "80 6% 10%", type: "color" },
			input: { value: "80 6% 10%", type: "color" },
			ring: { value: "97 54.2% 32.5%", type: "color" },
			radius: { value: "2rem", type: "radius" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			...sharedTokens,
		},
	},
};
