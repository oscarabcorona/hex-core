import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appSidebarNavSchema: ComponentSchemaDefinition = {
	name: "app-sidebar-nav",
	displayName: "AppSidebarNav",
	description:
		"Sidebar navigation for AppShell: a pinned brand, a scrollable list of grouped links with active states and aria-current, and a pinned footer (account / sign-out). Presentational and theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "groups",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title?: ReactNode; items: { label; href; icon?; active? }[] }>. Navigation groups rendered top to bottom. Set active on the current page's item.",
		},
		{
			name: "brand",
			type: "ReactNode",
			required: false,
			description: "Brand block (logo + product name) pinned to the top.",
		},
		{
			name: "footer",
			type: "ReactNode",
			required: false,
			description: "Footer block pinned to the bottom (account menu / sign-out).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <div>." },
	],
	variants: [],
	slots: [
		{ name: "brand", description: "Brand block.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "footer", description: "Account / sign-out block.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Grouped sidebar nav",
			description: "Brand, two groups, and a footer.",
			code: `import { AppSidebarNav } from "@hex-core/components";

<AppSidebarNav
  brand={<span className="font-semibold">Acme</span>}
  groups={[
    { items: [{ label: "Dashboard", href: "/app", active: true }, { label: "Reports", href: "/app/reports" }] },
    { title: "Settings", items: [{ label: "Team", href: "/app/team" }, { label: "Billing", href: "/app/billing" }] },
  ]}
  footer={<a href="/logout" className="text-sm text-muted-foreground">Sign out</a>}
/>`,
			composition: ["app", "navigation", "sidebar", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use inside the AppShell sidebar slot as the primary app navigation. Group links by area; mark exactly one item active per page.",
		whenNotToUse:
			"Don't use as marketing site nav (use marketing-header). Don't nest sub-menus deeply — keep two levels (group + item) max.",
		commonMistakes: [
			"Marking multiple items active — only the current page should have active=true (it sets aria-current='page').",
			"Passing an <img> as an item icon — the icon slot is sized for a glyph (size-4); use an SVG.",
			"Putting more than ~3 groups with long lists without scannable titles — title each group.",
		],
		relatedComponents: ["app-shell", "sidebar", "navigation-menu", "avatar"],
		accessibilityNotes:
			"Links are real anchors; the active link carries aria-current='page'. Icons are aria-hidden since the adjacent label conveys meaning. The nav region scrolls independently so the brand and footer stay visible.",
		tokenBudget: 600,
	},
	tags: ["block", "app", "navigation", "sidebar", "dashboard"],
};
