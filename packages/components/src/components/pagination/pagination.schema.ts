import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const paginationSchema: ComponentSchemaDefinition = {
	name: "pagination",
	displayName: "Pagination",
	description: "Composable pagination controls (Pagination / PaginationContent / PaginationItem / PaginationLink / PaginationPrevious / PaginationNext / PaginationEllipsis). Link-based by default — pair with client-side navigation or server params.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "className", type: "string", required: false, description: "Additional CSS classes on the <nav>" },
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "PaginationContent containing PaginationItem elements (PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils", "primitives/button/button"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["accent", "accent-foreground", "input", "background"],
	examples: [
		{
			title: "Basic pagination",
			description: "Previous + 3 pages + ellipsis + Next with current page marked",
			code: '<Pagination>\n  <PaginationContent>\n    <PaginationItem>\n      <PaginationPrevious href="#" />\n    </PaginationItem>\n    <PaginationItem>\n      <PaginationLink href="#">1</PaginationLink>\n    </PaginationItem>\n    <PaginationItem>\n      <PaginationLink href="#" isActive>2</PaginationLink>\n    </PaginationItem>\n    <PaginationItem>\n      <PaginationLink href="#">3</PaginationLink>\n    </PaginationItem>\n    <PaginationItem>\n      <PaginationEllipsis />\n    </PaginationItem>\n    <PaginationItem>\n      <PaginationNext href="#" />\n    </PaginationItem>\n  </PaginationContent>\n</Pagination>',
		},
	],
	ai: {
		whenToUse:
			"Use for navigating between pages of a paginated dataset: blog lists, search results, table rows. Use PaginationEllipsis to truncate long ranges.",
		whenNotToUse:
			"Don't use for infinite scroll (use IntersectionObserver). Don't use for step-by-step wizards (use a stepper). Don't use for fewer than ~3 pages (just show all the items).",
		commonMistakes: [
			"Using PaginationLink without href (anchor is not keyboard-reachable)",
			"Forgetting isActive on the current page (no visual or aria-current feedback)",
			"Showing every page number on long ranges — use PaginationEllipsis to truncate",
			"Using onClick-only <button> instead of PaginationLink — loses right-click-open-new-tab affordance; prefer href + Next.js Link when client-side routing is needed",
		],
		relatedComponents: ["table", "data-table"],
		accessibilityNotes:
			"Root is role='navigation' aria-label='pagination'. Active link gets aria-current='page'. Previous/Next have aria-label. Ellipsis is decorative (aria-hidden) with a sr-only 'More pages' label.",
		tokenBudget: 634,
	},
	tags: ["pagination", "pages", "navigation", "list"],
};
