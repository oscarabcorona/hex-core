import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const breadcrumbSchema: ComponentSchemaDefinition = {
	name: "breadcrumb",
	displayName: "Breadcrumb",
	description: "A path trail showing the user's location within a hierarchy, with links back to ancestors and a non-interactive current page.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "className", type: "string", required: false, description: "Additional CSS classes on the nav element" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "BreadcrumbList containing BreadcrumbItem + BreadcrumbSeparator elements", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-slot", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground"],
	examples: [
		{
			title: "Three-level path",
			description: "Home / Components / Breadcrumb",
			code: '<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/">Home</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>',
		},
	],
	ai: {
		whenToUse:
			"Use to show location within a hierarchical site or app: docs pages, product categories, nested settings. Include the current page as a non-link BreadcrumbPage.",
		whenNotToUse:
			"Don't use for primary navigation (use NavigationMenu). Don't use for flat sites without hierarchy. Don't use when the hierarchy is too deep to display — truncate with BreadcrumbEllipsis.",
		commonMistakes: [
			"Making the current page a link (use BreadcrumbPage)",
			"Showing just one item (defeats the purpose)",
			"Using plain text separators without aria-hidden",
		],
		relatedComponents: ["navigation-menu"],
		accessibilityNotes:
			"Root <nav aria-label='breadcrumb'> creates a landmark. BreadcrumbPage has aria-current='page'. Separators are aria-hidden (decorative). BreadcrumbEllipsis is decorative (SVG aria-hidden) with a sr-only 'More pages' label.",
		tokenBudget: 510,
	},
	tags: ["breadcrumb", "navigation", "path", "trail", "hierarchy"],
};
