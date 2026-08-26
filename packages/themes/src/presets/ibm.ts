// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
// Brief commit: d2a7eb2d1e4ca5f5272be4bec46a5f35f7f01edd
// Brief updated: 2026-04-09T18:04:01+03:00
//
// Style reference inspired by IBM's publicly visible design system.
// Hex Core is not affiliated with, endorsed by, or sponsored by IBM.
// Re-run `pnpm import:themes` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const ibmTheme: Theme = {
	name: "ibm",
	displayName: "IBM",
	description: "Enterprise technology. Carbon design system, structured blue palette.",
	category: "media",
	tags: ["media"],
	attribution: {
		source: "voltagent/awesome-design-md",
		license: "MIT",
		url: "https://github.com/voltagent/awesome-design-md",
		brand: "IBM",
	},
	tokens: {
		light: {
			background: { value: "0 0% 100%", type: "color" },
			foreground: { value: "0 0% 8.6%", type: "color" },
			card: { value: "0 0% 100%", type: "color" },
			"card-foreground": { value: "0 0% 8.6%", type: "color" },
			popover: { value: "0 0% 100%", type: "color" },
			"popover-foreground": { value: "0 0% 8.6%", type: "color" },
			primary: { value: "219 99.2% 52.7%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "219 5% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 10% 3.9%", type: "color" },
			muted: { value: "219 5% 95.9%", type: "color" },
			"muted-foreground": { value: "0 0% 38%", type: "color" },
			accent: { value: "219 5% 95.9%", type: "color" },
			"accent-foreground": { value: "240 10% 3.9%", type: "color" },
			destructive: { value: "357 75.8% 48.6%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "0 0% 90%", type: "color" },
			input: { value: "0 0% 90%", type: "color" },
			ring: { value: "219 99.2% 52.7%", type: "color" },
			radius: { value: "0rem", type: "radius" },
			...sharedTokens,
		},
		dark: {
			background: { value: "0 0% 0%", type: "color" },
			foreground: { value: "0 0% 91.4%", type: "color" },
			card: { value: "0 0% 0%", type: "color" },
			popover: { value: "0 0% 0%", type: "color" },
			primary: { value: "219 74.4% 47.3%", type: "color" },
			secondary: { value: "219 3.8% 4.1%", type: "color" },
			muted: { value: "219 3.8% 4.1%", type: "color" },
			accent: { value: "219 3.8% 4.1%", type: "color" },
			destructive: { value: "357 56.9% 51.4%", type: "color" },
			border: { value: "0 0% 10%", type: "color" },
			input: { value: "0 0% 10%", type: "color" },
			ring: { value: "219 74.4% 47.3%", type: "color" },
			radius: { value: "0rem", type: "radius" },
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
