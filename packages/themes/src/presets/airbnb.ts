// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: 7588173646a9fc954c196e50da22fe4e9145a754
// Brief updated: 2026-04-27T18:59:06+03:00
//
// Style reference inspired by Airbnb's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Airbnb.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const airbnbTheme: Theme = {
	name: "airbnb",
	displayName: "Airbnb",
	description: "Travel marketplace. Warm coral accent, photography-driven, rounded UI.",
	category: "ecommerce",
	tags: ["ecommerce"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Airbnb",
	},
	tokens: {
		light: {
			background: { value: "0 0% 96.9%", type: "color" },
			foreground: { value: "0 0% 24.7%", type: "color" },
			card: { value: "0 0% 96.9%", type: "color" },
			"card-foreground": { value: "0 0% 24.7%", type: "color" },
			popover: { value: "0 0% 96.9%", type: "color" },
			"popover-foreground": { value: "0 0% 24.7%", type: "color" },
			primary: { value: "349 100% 61%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			secondary: { value: "349 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "349 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "349 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "11 80.4% 42%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "349 100% 61%", type: "color" },
			radius: { value: "0.875rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "0 0% 3.1%", type: "color" },
			foreground: { value: "0 0% 75.3%", type: "color" },
			card: { value: "0 0% 3.1%", type: "color" },
			popover: { value: "0 0% 3.1%", type: "color" },
			primary: { value: "349 75% 39%", type: "color" },
			secondary: { value: "349 3.8% 4.1%", type: "color" },
			muted: { value: "349 3.8% 4.1%", type: "color" },
			accent: { value: "349 3.8% 4.1%", type: "color" },
			destructive: { value: "11 60.3% 58%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "349 75% 39%", type: "color" },
			radius: { value: "0.875rem", type: "radius" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			...sharedTokens,
		},
	},
};
