// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: a2da08625f57e4bae475887678df1065efceee7b
// Brief updated: 2026-04-27T13:04:10+03:00
//
// Style reference inspired by Cal.com's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Cal.com.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const calTheme: Theme = {
	name: "cal",
	displayName: "Cal.com",
	description: "Open-source scheduling. Clean neutral UI, developer-oriented simplicity.",
	category: "productivity",
	tags: ["productivity"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Cal.com",
	},
	tokens: {
		light: {
			background: { value: "220 14.3% 95.9%", type: "color" },
			foreground: { value: "0 0% 6.7%", type: "color" },
			card: { value: "220 14.3% 95.9%", type: "color" },
			"card-foreground": { value: "0 0% 6.7%", type: "color" },
			popover: { value: "220 14.3% 95.9%", type: "color" },
			"popover-foreground": { value: "0 0% 6.7%", type: "color" },
			primary: { value: "0 0% 6.7%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "0 0% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "0 0% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "0 0% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 84.2% 60.2%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "0 0% 6.7%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "220 10.7% 4.1%", type: "color" },
			foreground: { value: "0 0% 93.3%", type: "color" },
			card: { value: "220 10.7% 4.1%", type: "color" },
			popover: { value: "220 10.7% 4.1%", type: "color" },
			primary: { value: "0 0% 93.3%", type: "color" },
			secondary: { value: "0 0% 4.1%", type: "color" },
			muted: { value: "0 0% 4.1%", type: "color" },
			accent: { value: "0 0% 4.1%", type: "color" },
			destructive: { value: "0 63.2% 39.8%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "0 0% 93.3%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			...sharedTokens,
		},
	},
};
