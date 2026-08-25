// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: 61d54ef44a5e118c5c4a6b81fb00861911fa6908
// Brief updated: 2026-04-28T16:10:34+03:00
//
// Style reference inspired by Ferrari's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Ferrari.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const ferrariTheme: Theme = {
	name: "ferrari",
	displayName: "Ferrari",
	description: "Luxury automotive. Chiaroscuro editorial, Ferrari Red accents, cinematic black.",
	category: "automotive",
	tags: ["automotive"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Ferrari",
	},
	tokens: {
		light: {
			background: { value: "0 0% 100%", type: "color" },
			foreground: { value: "240 10% 4%", type: "color" },
			card: { value: "0 0% 100%", type: "color" },
			"card-foreground": { value: "240 10% 4%", type: "color" },
			popover: { value: "0 0% 100%", type: "color" },
			"popover-foreground": { value: "240 10% 4%", type: "color" },
			primary: { value: "4 77.2% 48.2%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "4 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "4 5% 95.9%", type: "color" },
			"muted-foreground": { value: "240 8% 38%", type: "color" },
			accent: { value: "4 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "4 77.2% 48.2%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "240 8% 90%", type: "color" },
			input: { value: "240 8% 90%", type: "color" },
			ring: { value: "4 77.2% 48.2%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "0 0% 0%", type: "color" },
			foreground: { value: "240 7.5% 96%", type: "color" },
			card: { value: "0 0% 0%", type: "color" },
			popover: { value: "0 0% 0%", type: "color" },
			primary: { value: "4 57.9% 51.8%", type: "color" },
			secondary: { value: "4 3.8% 4.1%", type: "color" },
			muted: { value: "4 3.8% 4.1%", type: "color" },
			accent: { value: "4 3.8% 4.1%", type: "color" },
			destructive: { value: "4 57.9% 51.8%", type: "color" },
			border: { value: "240 6% 10%", type: "color" },
			input: { value: "240 6% 10%", type: "color" },
			ring: { value: "4 57.9% 51.8%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "0 0% 100%", type: "color" },
			...sharedTokens,
		},
	},
};
