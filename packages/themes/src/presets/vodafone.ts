// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: a5d0fd2b949eabae5af3caaa2640af48b05004ff
// Brief updated: 2026-04-16T11:35:45+03:00
//
// Style reference inspired by Vodafone's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Vodafone.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const vodafoneTheme: Theme = {
	name: "vodafone",
	displayName: "Vodafone",
	description: "Global telecom brand. Monumental uppercase display, Vodafone Red chapter bands.",
	category: "media",
	tags: ["media"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Vodafone",
	},
	tokens: {
		light: {
			background: { value: "0 0% 100%", type: "color" },
			foreground: { value: "0 0% 20%", type: "color" },
			card: { value: "0 0% 100%", type: "color" },
			"card-foreground": { value: "0 0% 20%", type: "color" },
			popover: { value: "0 0% 100%", type: "color" },
			"popover-foreground": { value: "0 0% 20%", type: "color" },
			primary: { value: "0 100% 45.1%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "0 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "0 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "0 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 100% 45.1%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "0 100% 45.1%", type: "color" },
			radius: { value: "2rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "0 0% 0%", type: "color" },
			foreground: { value: "0 0% 80%", type: "color" },
			card: { value: "0 0% 0%", type: "color" },
			popover: { value: "0 0% 0%", type: "color" },
			primary: { value: "0 75% 54.9%", type: "color" },
			secondary: { value: "0 3.8% 4.1%", type: "color" },
			muted: { value: "0 3.8% 4.1%", type: "color" },
			accent: { value: "0 3.8% 4.1%", type: "color" },
			destructive: { value: "0 75% 54.9%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "0 75% 54.9%", type: "color" },
			radius: { value: "2rem", type: "radius" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			...sharedTokens,
		},
	},
};
