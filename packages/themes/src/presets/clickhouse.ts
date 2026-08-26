// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: a2da08625f57e4bae475887678df1065efceee7b
// Brief updated: 2026-04-27T13:04:10+03:00
//
// Style reference inspired by ClickHouse's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by ClickHouse.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const clickhouseTheme: Theme = {
	name: "clickhouse",
	displayName: "ClickHouse",
	description: "Fast analytics database. Yellow-accented, technical documentation style.",
	category: "backend",
	tags: ["backend"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "ClickHouse",
	},
	tokens: {
		light: {
			background: { value: "0 0% 3.9%", type: "color" },
			foreground: { value: "0 0% 100%", type: "color" },
			card: { value: "0 0% 3.9%", type: "color" },
			"card-foreground": { value: "0 0% 100%", type: "color" },
			popover: { value: "0 0% 3.9%", type: "color" },
			"popover-foreground": { value: "0 0% 100%", type: "color" },
			primary: { value: "62 100% 70.6%", type: "color" },
			"primary-foreground": { value: "240 10% 3.9%", type: "color" },
			secondary: { value: "62 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "62 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "62 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "0 84.2% 60.2%", type: "color" },
			"destructive-foreground": { value: "240 10% 3.9%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "62 100% 70.6%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "0 0% 96.1%", type: "color" },
			foreground: { value: "0 0% 0%", type: "color" },
			card: { value: "0 0% 96.1%", type: "color" },
			popover: { value: "0 0% 96.1%", type: "color" },
			primary: { value: "62 75% 29.4%", type: "color" },
			secondary: { value: "62 3.8% 4.1%", type: "color" },
			muted: { value: "62 3.8% 4.1%", type: "color" },
			accent: { value: "62 3.8% 4.1%", type: "color" },
			destructive: { value: "0 63.2% 39.8%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "62 75% 29.4%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
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
