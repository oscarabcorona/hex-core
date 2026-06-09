import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sidebarSchema: ComponentSchemaDefinition = {
	name: "sidebar",
	displayName: "Sidebar",
	description:
		"App-shell sidebar with collapsible width, context-driven open state, and composable Header/Content/Footer/Item parts. Provider-based so any descendant can toggle it.",
	category: "component",
	subcategory: "navigation",
	props: [
		{
			name: "open",
			type: "boolean",
			required: false,
			description: "Controlled open state — read from SidebarProvider",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: true,
			description: "Initial open state (uncontrolled)",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description: "Callback when open state flips: (open: boolean) => void",
		},
		{
			name: "side",
			type: "string",
			required: false,
			default: "left",
			description: "Which edge the sidebar sits on: 'left' | 'right'",
		},
	],
	variants: [
		{
			name: "side",
			description: "Which edge the sidebar docks against",
			values: [
				{ value: "left", description: "Docks to the left edge (default)" },
				{ value: "right", description: "Docks to the right edge" },
			],
			default: "left",
		},
		{
			name: "state",
			description: "Width state (derived from SidebarProvider open value)",
			values: [
				{ value: "open", description: "Sidebar expanded at full width" },
				{ value: "closed", description: "Sidebar collapsed to zero width" },
			],
			default: "open",
		},
	],
	slots: [
		{
			name: "children",
			description: "SidebarHeader + SidebarContent + SidebarFooter (any combination)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "border", "accent", "accent-foreground", "muted-foreground", "ring"],
	examples: [
		{
			title: "App shell with collapsible sidebar",
			description: "Provider holds open state; the trigger toggles it",
			code: '<SidebarProvider>\n  <Sidebar>\n    <SidebarHeader>\n      <span className="font-semibold">Acme</span>\n    </SidebarHeader>\n    <SidebarContent>\n      <SidebarItem active>Dashboard</SidebarItem>\n      <SidebarItem>Projects</SidebarItem>\n      <SidebarItem>Settings</SidebarItem>\n    </SidebarContent>\n    <SidebarFooter>Signed in as jane</SidebarFooter>\n  </Sidebar>\n  <main className="flex-1 p-4">\n    <SidebarTrigger />\n    <h1>Hello</h1>\n  </main>\n</SidebarProvider>',
		},
	],
	ai: {
		whenToUse:
			"Use for persistent app-shell navigation: admin dashboards, document editors, SaaS sidebars. The Provider pattern lets any descendant component toggle the sidebar (e.g. a topbar button on mobile).",
		whenNotToUse:
			"Don't use for mobile-first UX (use Sheet — sidebar collapses to zero-width but Sheet gives a native drawer feel). Don't use for marketing sites (no shell). Don't use for contextual menus (use DropdownMenu or NavigationMenu).",
		commonMistakes: [
			"Rendering Sidebar outside SidebarProvider — useSidebar throws",
			"Forgetting that SidebarProvider is a flex container — main content must be its direct sibling",
			"Using the wrong ordering for side='right' — SidebarProvider handles this via order-last",
			"Overriding the width variant manually instead of toggling open state",
		],
		relatedComponents: ["sheet", "navigation-menu", "separator"],
		accessibilityNotes:
			"Sidebar is an <aside> landmark (not a modal — no focus trap). When collapsed, the aside sets inert + aria-hidden so its children are removed from the tab order and the accessibility tree. SidebarTrigger exposes aria-expanded and a rotating aria-label (suppressed when asChild so the consumer's visible label/aria-label wins). SidebarItem uses aria-current='page' when active. Focus rings use the ring token.",
		tokenBudget: 960,
	},
	tags: ["sidebar", "navigation", "app-shell", "layout"],
};
