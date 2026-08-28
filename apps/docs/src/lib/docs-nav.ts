/**
 * Docs navigation structure — single source of truth consumed by the sidebar,
 * the prev/next footer, the sitemap, and the llms.txt agent index. Adding a
 * new Getting Started page is a one-line edit here; every surface picks it up.
 */
export interface DocNavLink {
	title: string;
	href: string;
	/** One-line summary — shown to agents in llms.txt, not in the sidebar. */
	description: string;
}

export const GETTING_STARTED_NAV: readonly DocNavLink[] = [
	{
		title: "Introduction",
		href: "/docs/getting-started",
		description: "What Hex Core is and how the AI-native catalog fits together.",
	},
	{
		title: "Installation",
		href: "/docs/installation",
		description: "Add components via the Hex CLI, the shadcn CLI, or manual copy.",
	},
	{
		title: "CLI",
		href: "/docs/cli",
		description: "hex add, recipe, theme, map, poc, graph, migrate, doctor, skills.",
	},
	{
		title: "Theming",
		href: "/docs/theming",
		description: "HSL design tokens, brand theme presets, and the theme authoring CLI.",
	},
	{
		title: "MCP Server",
		href: "/docs/mcp",
		description: "MCP tools for search, intent, scaffolding, themes, and the graph.",
	},
	{
		title: "Spec-driven",
		href: "/docs/spec-driven",
		description: "Brief → screens → install manifest → runnable POC pipeline.",
	},
	{
		title: "Blocks",
		href: "/docs/blocks",
		description: "Page-scale composites: marketing, commerce, app, and auth blocks.",
	},
	{
		title: "Skills",
		href: "/docs/skills",
		description: "Installable agent skill packs covering the catalog and workflows.",
	},
	{
		title: "Motion",
		href: "/docs/motion",
		description: "Timeline, clips, wrappers, and reduced-motion-safe animation.",
	},
	{
		title: "FAQ",
		href: "/docs/faq",
		description: "Common questions about licensing, frameworks, and compatibility.",
	},
] as const;

export const GETTING_STARTED_CATEGORY = "Getting Started";
