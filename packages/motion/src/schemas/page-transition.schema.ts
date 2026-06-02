import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const pageTransitionSchema: ComponentSchemaDefinition = {
	name: "page-transition",
	displayName: "PageTransition",
	description:
		"Wraps the current page tree in a keyed Motion.div inside Presence — adds enter/exit transitions for client-side route changes. Caller passes `pageKey` (typically the pathname) so React can tell old vs new routes apart.",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "pageKey", type: "string", required: true, description: "Stable key for the current page (pathname/route id)." },
		{ name: "initial", type: "object", required: false, description: "Initial AnimateProps for entering pages." },
		{ name: "animate", type: "object", required: false, description: "Animate target." },
		{ name: "exit", type: "object", required: false, description: "Exit AnimateProps for leaving pages." },
		{ name: "duration", type: "number", required: false, default: 200, description: "Duration in ms." },
		{
			name: "easing",
			type: "enum",
			required: false,
			description: "Named easing or CSS easing string.",
			enumValues: ["linear", "standard", "emphasized", "decelerate", "accelerate", "bounce"],
		},
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Page tree (single React subtree).", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion", "presence"],
		peer: ["react"],
	},
	tokensUsed: ["duration-fast"],
	examples: [
		{
			title: "Next.js App Router",
			description: "Wraps children of a layout with a pathname-keyed transition.",
			code: 'import { usePathname } from "next/navigation";\nconst pathname = usePathname();\nreturn <PageTransition pageKey={pathname}>{children}</PageTransition>;',
		},
	],
	ai: {
		whenToUse:
			"Use in any router that re-renders the page tree on navigation (Next.js App Router, React Router, TanStack Router). Adds polish to client-side route changes.",
		whenNotToUse:
			"Don't use in MPA contexts — the wrapper relies on React keeping the tree mounted across navigations. Don't use for nested layouts that don't change between routes.",
		commonMistakes: [
			"Forgetting to pass a stable, route-derived pageKey — without it Presence can't tell pages apart and the transition no-ops.",
			"Wrapping individual page sections instead of the whole page subtree — produces broken layouts mid-transition.",
		],
		relatedComponents: ["motion", "presence"],
		accessibilityNotes:
			"Reduced-motion mode collapses both enter and exit to instant, preserving content visibility for users who navigate rapidly.",
		tokenBudget: 711,
	},
	tags: ["motion", "page-transition", "wrapper", "router", "navigation"],
};
