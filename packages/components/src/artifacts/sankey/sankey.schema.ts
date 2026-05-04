import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sankeySchema: ComponentSchemaDefinition = {
	name: "sankey",
	displayName: "Sankey",
	description:
		"Weighted-flow diagram. Nodes arranged in horizontal columns by topological depth; link thickness encodes flow value. Use for funnels, energy/material/money flows, and any \"value moving from A to B\" picture.",
	category: "artifact",
	subcategory: "flow",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Array of { id, label }. Every link's source/target MUST match an id here.",
		},
		{
			name: "links",
			type: "object",
			required: true,
			description: "Array of { source, target, value }. Values must be positive.",
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 720,
			description: "SVG pixel width.",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 420,
			description: "SVG pixel height.",
		},
		{
			name: "nodeAlign",
			type: "enum",
			required: false,
			default: "justify",
			description: "Column alignment strategy.",
			enumValues: ["left", "right", "center", "justify"],
		},
		{
			name: "nodeWidth",
			type: "number",
			required: false,
			default: 12,
			description: "Pixel width of each node rectangle.",
		},
		{
			name: "nodePadding",
			type: "number",
			required: false,
			default: 8,
			description: "Vertical pixel gap between nodes in the same column.",
		},
		{
			name: "onLinkHover",
			type: "function",
			required: false,
			description: "Called with the hovered SankeyLink (or null when hover ends).",
		},
		{
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked SankeyNode.",
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
				name: "d3-sankey",
				version: "^0.12.3",
				bundleKbGzip: 6,
				reason: "Computes the column layout and link routing; the component renders SVG with the result",
			},
		],
	},
	tokensUsed: ["primary", "background", "foreground", "muted"],
	examples: [
		{
			title: "Energy flow",
			description: "Two sources flowing into a single sink.",
			code:
				"<Sankey\n  nodes={[\n    { id: \"coal\", label: \"Coal\" },\n    { id: \"gas\", label: \"Gas\" },\n    { id: \"grid\", label: \"Grid\" },\n  ]}\n  links={[\n    { source: \"coal\", target: \"grid\", value: 60 },\n    { source: \"gas\", target: \"grid\", value: 30 },\n  ]}\n/>",
			composition: ["sankey", "flow", "energy"],
		},
		{
			title: "Funnel-style with hover",
			description: "Surface link details on hover for tooltips.",
			code:
				"<Sankey\n  nodes={steps}\n  links={transitions}\n  onLinkHover={(l) => setActive(l)}\n/>",
			composition: ["sankey", "interactive", "tooltip"],
		},
	],
	ai: {
		whenToUse:
			"Visualize how a quantity is distributed and re-distributed across a multi-step pipeline — energy mix, marketing-funnel transitions, traffic referral flows, budget allocation by department × line-item. The thicker the link, the more value moves along it.",
		whenNotToUse:
			"Don't use for hierarchies (use TreeMap or Sunburst). Don't use for arbitrary node-edge graphs without a clear left-to-right flow (use Canvas). Don't use when total flow doesn't conserve from column to column — d3-sankey assumes a balanced graph.",
		commonMistakes: [
			"A link's source or target id not present in `nodes` — d3-sankey throws an opaque error. Validate ids upstream",
			"Negative or zero `value` — produces zero-width or NaN-positioned links. Filter or clamp upstream",
			"Cycles in the link graph — d3-sankey requires a DAG. If your data has feedback loops, collapse them or split into multiple Sankeys",
			"Mutating the input `nodes` / `links` between renders — the component clones internally to protect consumer arrays, but unmemoized inputs still trigger a full re-layout each render. Memoize",
		],
		relatedComponents: ["funnel", "pyramid", "flowchart", "canvas", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing node and link counts. For agent outputs, also expose a parallel <table> of source / target / value triples so screen-reader users get the flow magnitudes.",
		tokenBudget: 360,
	},
	tags: ["artifact", "diagram", "sankey", "flow", "weighted", "funnel"],
};
