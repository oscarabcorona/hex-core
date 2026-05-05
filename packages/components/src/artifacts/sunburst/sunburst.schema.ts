import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sunburstSchema: ComponentSchemaDefinition = {
	name: "sunburst",
	displayName: "Sunburst",
	description:
		"Radial hierarchy by value. Each ring is a deeper level of the tree; segment angles are proportional to summed values. Click a segment to drill in; click the center to zoom out.",
	category: "artifact",
	subcategory: "hierarchy",
	props: [
		{
			name: "root",
			type: "object",
			required: true,
			description: "Hierarchy root: { id, label, value?, children? }. Leaves require a positive `value`; internal nodes are summed.",
		},
		{
			name: "drillable",
			type: "boolean",
			required: false,
			default: true,
			description: "When true, clicking a segment with children focuses it as the new center. Click the center to zoom back out.",
		},
		{
			name: "centerLabel",
			type: "ReactNode",
			required: false,
			description: "Optional content rendered at the SVG center (e.g. a total). Falls back to the focused node's label.",
		},
		{
			name: "size",
			type: "number",
			required: false,
			default: 400,
			description: "Pixel size of the rendered SVG (it's square).",
		},
		{
			name: "onSegmentClick",
			type: "function",
			required: false,
			description: "Called with the clicked SunburstNode. Fires before any internal drill.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the SVG element.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
		heavyPeer: [
			{
				name: "d3-hierarchy",
				version: "^3.1.2",
				bundleKbGzip: 3,
				reason: "Computes the partition layout that positions each ring segment",
			},
			{
				name: "d3-shape",
				version: "^3.2.0",
				bundleKbGzip: 6,
				reason: "Generates the SVG arc path for each segment",
			},
		],
	},
	tokensUsed: ["primary", "accent", "secondary", "muted", "card", "border", "foreground", "background"],
	examples: [
		{
			title: "Two-level sunburst",
			description: "Visualize a portfolio split with sub-allocations.",
			code:
				"<Sunburst root={{\n  id: \"root\", label: \"Portfolio\",\n  children: [\n    { id: \"eq\", label: \"Equity\", children: [\n      { id: \"us\", label: \"US\", value: 60 },\n      { id: \"intl\", label: \"Intl\", value: 20 },\n    ]},\n    { id: \"fx\", label: \"Fixed Income\", value: 20 },\n  ],\n}} />",
			composition: ["sunburst", "hierarchy", "value-scaled"],
		},
		{
			title: "Custom center label with totals",
			description: "Use centerLabel to show the sum or other context.",
			code: "<Sunburst centerLabel={<strong>$1.2M</strong>} root={portfolio} />",
			composition: ["sunburst", "center-label"],
		},
	],
	ai: {
		whenToUse:
			"Visualize a value-scaled hierarchy where the user wants to see both the parent share and child sub-shares at once — portfolio allocations, time spent by category × subcategory, file system disk usage. Drill-down lets users focus a branch. `onSegmentClick` fires for ALL segments BEFORE the internal drill so consumers can observe pre-drill focus.",
		whenNotToUse:
			"Don't use for hierarchies without meaningful values per leaf (use MindMap or OrgChart). Don't use for >4 levels — outer rings become unreadable. Don't use for arbitrary node-edge graphs (use Canvas).",
		commonMistakes: [
			"Leaf values that don't sum at internal nodes — d3-hierarchy aggregates leaves; internal-node `value` props are ignored when children exist",
			"Negative or zero leaf values — produce zero-width arcs or NaN angles. Filter or clamp upstream",
			"Forgetting the resetting effect — when the parent updates `root` to a different tree, the focused id may no longer exist; the component re-syncs to the new root automatically",
		],
		relatedComponents: ["tree-map", "mind-map", "org-chart", "dendrogram", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing segment count and focused node. Drill-down is mouse-only by default; expose a parallel <table> or breadcrumb for keyboard / screen-reader users.",
		tokenBudget: 360,
	},
	tags: ["artifact", "diagram", "sunburst", "hierarchy", "radial", "value-scaled"],
};
