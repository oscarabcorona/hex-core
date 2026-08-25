// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: a2da08625f57e4bae475887678df1065efceee7b
// Brief updated: 2026-04-27T13:04:10+03:00
//
// Style reference inspired by Airtable's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by Airtable.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const airtableTheme: Theme = {
	name: "airtable",
	displayName: "Airtable",
	description: "Spreadsheet-database hybrid. Colorful, friendly, structured data aesthetic.",
	category: "design",
	tags: ["design"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "Airtable",
	},
	tokens: {
		light: {
			background: { value: "219 22.6% 12.2%", type: "color" },
			foreground: { value: "0 0% 95%", type: "color" },
			card: { value: "219 22.6% 12.2%", type: "color" },
			"card-foreground": { value: "0 0% 95%", type: "color" },
			popover: { value: "219 22.6% 12.2%", type: "color" },
			"popover-foreground": { value: "0 0% 95%", type: "color" },
			primary: { value: "219 22.6% 12.2%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "219 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "219 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "219 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "210 40% 98%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "219 22.6% 12.2%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "219 17% 87.8%", type: "color" },
			foreground: { value: "0 0% 5%", type: "color" },
			card: { value: "219 17% 87.8%", type: "color" },
			popover: { value: "219 17% 87.8%", type: "color" },
			primary: { value: "219 17% 87.8%", type: "color" },
			secondary: { value: "219 3.8% 4.1%", type: "color" },
			muted: { value: "219 3.8% 4.1%", type: "color" },
			accent: { value: "219 3.8% 4.1%", type: "color" },
			destructive: { value: "210 30% 2%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "219 17% 87.8%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
			"card-foreground": { value: "240 10% 3.9%", type: "color" },
			"popover-foreground": { value: "240 10% 3.9%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			"muted-foreground": { value: "0 0% 98%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			...sharedTokens,
		},
	},
};
