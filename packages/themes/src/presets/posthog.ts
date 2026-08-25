// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: d2a7eb2d1e4ca5f5272be4bec46a5f35f7f01edd
// Brief updated: 2026-04-09T18:04:01+03:00
//
// Style reference inspired by PostHog's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by PostHog.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const posthogTheme: Theme = {
	name: "posthog",
	displayName: "PostHog",
	description: "Product analytics. Playful hedgehog branding, developer-friendly dark UI.",
	category: "backend",
	tags: ["backend"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "PostHog",
	},
	tokens: {
		light: {
			background: { value: "60 55.6% 98.2%", type: "color" },
			foreground: { value: "73 6% 29.2%", type: "color" },
			card: { value: "60 55.6% 98.2%", type: "color" },
			"card-foreground": { value: "73 6% 29.2%", type: "color" },
			popover: { value: "60 55.6% 98.2%", type: "color" },
			"popover-foreground": { value: "73 6% 29.2%", type: "color" },
			primary: { value: "19 100% 48%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			secondary: { value: "19 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "19 5% 95.9%", type: "color" },
			"muted-foreground": { value: "73 6% 38%", type: "color" },
			accent: { value: "19 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "38 77.9% 39%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			border: { value: "73 6% 90%", type: "color" },
			input: { value: "73 6% 90%", type: "color" },
			ring: { value: "19 100% 48%", type: "color" },
			radius: { value: "0.625rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "60 41.7% 1.8%", type: "color" },
			foreground: { value: "73 4.5% 70.8%", type: "color" },
			card: { value: "60 41.7% 1.8%", type: "color" },
			popover: { value: "60 41.7% 1.8%", type: "color" },
			primary: { value: "19 75% 52%", type: "color" },
			secondary: { value: "19 3.8% 4.1%", type: "color" },
			muted: { value: "19 3.8% 4.1%", type: "color" },
			accent: { value: "19 3.8% 4.1%", type: "color" },
			destructive: { value: "38 58.4% 61%", type: "color" },
			border: { value: "73 4.5% 10%", type: "color" },
			input: { value: "73 4.5% 10%", type: "color" },
			ring: { value: "19 75% 52%", type: "color" },
			radius: { value: "0.625rem", type: "radius" },
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
