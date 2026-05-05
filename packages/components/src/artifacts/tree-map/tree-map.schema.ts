import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const treeMapSchema: ComponentSchemaDefinition = {
	name: "tree-map",
	displayName: "TreeMap",
	description:
		"Nested rectangles sized by value — each leaf's area is proportional to its `value`. Squarified by default for legibility.",
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
			name: "width",
			type: "number",
			required: false,
			default: 600,
			description: "SVG pixel width.",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 400,
			description: "SVG pixel height.",
		},
		{
			name: "padding",
			type: "number",
			required: false,
			default: 2,
			description: "Inner padding between sibling rectangles, in pixels.",
		},
		{
			name: "tile",
			type: "enum",
			required: false,
			default: "squarify",
			description: "Tiling algorithm — \"squarify\" keeps rectangles close to square; \"binary\" is faster; \"slice-dice\" alternates direction by depth.",
			enumValues: ["squarify", "binary", "slice-dice"],
		},
		{
			name: "colorBy",
			type: "enum",
			required: false,
			default: "depth",
			description: "Fill strategy — \"depth\" cycles palette tokens, \"value\" interpolates the primary token by value, or pass a (node, depth) => string.",
			enumValues: ["depth", "value"],
		},
		{
			name: "onLeafClick",
			type: "function",
			required: false,
			description: "Called with the clicked TreeMapNode when a user clicks any leaf.",
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
				reason: "Computes the squarified treemap layout; the component renders SVG rectangles with the result",
			},
		],
	},
	tokensUsed: ["primary", "accent", "secondary", "muted", "background", "foreground"],
	examples: [
		{
			title: "File-size treemap",
			description: "Visualize the relative size of files in a folder.",
			code:
				"<TreeMap root={{\n  id: \"root\", label: \"src\",\n  children: [\n    { id: \"a\", label: \"app\", value: 240 },\n    { id: \"l\", label: \"lib\", value: 90 },\n    { id: \"t\", label: \"tests\", value: 120 },\n  ],\n}} />",
			composition: ["tree-map", "hierarchy", "value-scaled"],
		},
		{
			title: "Heatmap-style coloring by value",
			description: "Use the value-interpolated palette to highlight outliers.",
			code: "<TreeMap colorBy=\"value\" root={budgetTree} />",
			composition: ["tree-map", "heatmap"],
		},
	],
	ai: {
		whenToUse:
			"Compare relative sizes inside a hierarchy — file sizes, budgets, market caps, allocations. Use when the user cares about \"which slice of the whole is biggest\" and the hierarchy is at most 2–3 levels deep.",
		whenNotToUse:
			"Don't use to show edges/relationships (use MindMap or Canvas). Don't use for time series (use a chart). Don't use when leaves all have similar values — area differences become invisible.",
		commonMistakes: [
			"Leaf values that don't sum to the parent — d3-hierarchy aggregates leaves; internal-node `value` props are ignored when children exist",
			"Negative or zero leaf values — produce zero-area rectangles or NaN positions. Filter or clamp upstream",
			"Passing the same root reference but mutating its children in place — React skips the re-layout. Provide a new root object on data change",
		],
		relatedComponents: ["mind-map", "sunburst", "org-chart", "dendrogram", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing the leaf count and root label. For large or interactive treemaps, also expose a parallel <table> of label/value pairs for screen readers.",
		tokenBudget: 320,
	},
	tags: ["artifact", "diagram", "tree-map", "hierarchy", "area", "squarify"],
};
