/**
 * Docs navigation structure — single source of truth consumed by the sidebar
 * and the prev/next footer. Adding a new Getting Started page is a one-line
 * edit here; both surfaces pick it up.
 */
export interface DocNavLink {
	title: string;
	href: string;
}

export const GETTING_STARTED_NAV: readonly DocNavLink[] = [
	{ title: "Introduction", href: "/docs/getting-started" },
	{ title: "Installation", href: "/docs/installation" },
	{ title: "Theming", href: "/docs/theming" },
	{ title: "MCP Server", href: "/docs/mcp" },
	{ title: "Spec-driven", href: "/docs/spec-driven" },
	{ title: "Blocks", href: "/docs/blocks" },
	{ title: "Skills", href: "/docs/skills" },
	{ title: "FAQ", href: "/docs/faq" },
] as const;

export const GETTING_STARTED_CATEGORY = "Getting Started";
