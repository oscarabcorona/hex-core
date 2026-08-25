// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: a2da08625f57e4bae475887678df1065efceee7b
// Brief updated: 2026-04-27T13:04:10+03:00
//
// Style reference inspired by Claude's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Claude.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const claudeTheme: Theme = {
	name: "claude",
	displayName: "Claude",
	description: "Anthropic's AI assistant. Warm terracotta accent, clean editorial layout.",
	category: "ai",
	tags: ["ai","warm","terracotta"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Claude",
	},
	tokens: {
		light: {
			background: { value: "48 33.3% 97.1%", type: "color" },
			foreground: { value: "60 2.6% 7.6%", type: "color" },
			card: { value: "48 33.3% 97.1%", type: "color" },
			"card-foreground": { value: "60 2.6% 7.6%", type: "color" },
			popover: { value: "48 33.3% 97.1%", type: "color" },
			"popover-foreground": { value: "60 2.6% 7.6%", type: "color" },
			primary: { value: "15 52.3% 58%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			secondary: { value: "15 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "15 5% 95.9%", type: "color" },
			"muted-foreground": { value: "60 2.6% 38%", type: "color" },
			accent: { value: "15 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 53.1% 52.4%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "60 2.6% 90%", type: "color" },
			input: { value: "60 2.6% 90%", type: "color" },
			ring: { value: "15 52.3% 58%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "48 25% 2.9%", type: "color" },
			foreground: { value: "60 2% 92.4%", type: "color" },
			card: { value: "48 25% 2.9%", type: "color" },
			popover: { value: "48 25% 2.9%", type: "color" },
			primary: { value: "15 39.2% 42%", type: "color" },
			secondary: { value: "15 3.8% 4.1%", type: "color" },
			muted: { value: "15 3.8% 4.1%", type: "color" },
			accent: { value: "15 3.8% 4.1%", type: "color" },
			destructive: { value: "0 39.8% 47.6%", type: "color" },
			border: { value: "60 2% 10%", type: "color" },
			input: { value: "60 2% 10%", type: "color" },
			ring: { value: "15 39.2% 42%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
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
