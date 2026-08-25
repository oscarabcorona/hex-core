// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: 61d54ef44a5e118c5c4a6b81fb00861911fa6908
// Brief updated: 2026-04-28T16:10:34+03:00
//
// Style reference inspired by Slack's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Slack.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const slackTheme: Theme = {
	name: "slack",
	displayName: "Slack",
	description: "slack design system template.",
	category: "productivity",
	tags: ["productivity"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Slack",
	},
	tokens: {
		light: {
			background: { value: "276 100% 97.1%", type: "color" },
			foreground: { value: "240 10% 4%", type: "color" },
			card: { value: "276 100% 97.1%", type: "color" },
			"card-foreground": { value: "240 10% 4%", type: "color" },
			popover: { value: "276 100% 97.1%", type: "color" },
			"popover-foreground": { value: "240 10% 4%", type: "color" },
			primary: { value: "288 52.7% 21.6%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "288 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "288 5% 95.9%", type: "color" },
			"muted-foreground": { value: "240 8% 38%", type: "color" },
			accent: { value: "288 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 65% 43%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "240 8% 90%", type: "color" },
			input: { value: "240 8% 90%", type: "color" },
			ring: { value: "288 52.7% 21.6%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "276 75% 2.9%", type: "color" },
			foreground: { value: "240 7.5% 96%", type: "color" },
			card: { value: "276 75% 2.9%", type: "color" },
			popover: { value: "276 75% 2.9%", type: "color" },
			primary: { value: "288 39.5% 78.4%", type: "color" },
			secondary: { value: "288 3.8% 4.1%", type: "color" },
			muted: { value: "288 3.8% 4.1%", type: "color" },
			accent: { value: "288 3.8% 4.1%", type: "color" },
			destructive: { value: "0 48.8% 57%", type: "color" },
			border: { value: "240 6% 10%", type: "color" },
			input: { value: "240 6% 10%", type: "color" },
			ring: { value: "288 39.5% 78.4%", type: "color" },
			radius: { value: "0rem", type: "radius" },
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
