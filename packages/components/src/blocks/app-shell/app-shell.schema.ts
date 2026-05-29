import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appShellSchema: ComponentSchemaDefinition = {
	name: "app-shell",
	displayName: "AppShell",
	description:
		"Application layout frame: a fixed left sidebar on ≥lg, a sticky top bar, and a scrollable main region. On mobile the sidebar collapses behind a menu button and slides in as an overlay drawer. Client Component. Theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "sidebar",
			type: "ReactNode",
			required: true,
			description: "Sidebar content — typically an <AppSidebarNav>. Fixed on ≥lg, a drawer on mobile.",
		},
		{
			name: "header",
			type: "ReactNode",
			required: false,
			description: "Top-bar content (breadcrumbs, search, account menu) shown right of the mobile menu button.",
		},
		{ name: "children", type: "ReactNode", required: true, description: "Main page content." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "sidebar", description: "Sidebar nav content.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "header", description: "Top-bar content.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "children", description: "Main content region.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "card", "muted", "border", "ring"],
	examples: [
		{
			title: "Shell with sidebar nav and content",
			description: "App frame wrapping a nav and a dashboard body.",
			code: `import { AppShell, AppSidebarNav, Button } from "@hex-core/components";

<AppShell
  sidebar={<AppSidebarNav brand={<span className="font-semibold">Acme</span>} groups={[{ items: [{ label: "Dashboard", href: "/app", active: true }] }]} />}
  header={<><h1 className="text-sm font-semibold">Dashboard</h1><Button size="sm">New</Button></>}
>
  <p>Main content here.</p>
</AppShell>`,
			composition: ["app", "shell", "layout", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use as the outer frame of an authenticated app: dashboards, settings, data views. Put an AppSidebarNav in the sidebar slot and page content in children.",
		whenNotToUse:
			"Don't use for marketing pages (use marketing-header + sections). Don't nest an AppShell inside another. Don't put the page <h1> in the shell — put it in the page content or header slot once.",
		commonMistakes: [
			"Rendering the whole page as a Client Component because AppShell is one — keep page content in Server Components and pass it as children.",
			"Duplicating navigation in both the sidebar and the header — the sidebar is the primary nav.",
			"Forgetting to give the sidebar a scroll region when the nav is long — AppSidebarNav handles this; raw content may overflow.",
		],
		relatedComponents: ["app-sidebar-nav", "app-stats", "app-data-table", "sidebar", "breadcrumb"],
		accessibilityNotes:
			"The mobile menu button is a <button> with aria-expanded and an aria-label. The drawer backdrop is a labelled button so it's keyboard-dismissable. The sticky top bar stays above content via z-index without trapping focus.",
		tokenBudget: 838,
	},
	tags: ["block", "app", "shell", "layout", "dashboard", "sidebar"],
};
