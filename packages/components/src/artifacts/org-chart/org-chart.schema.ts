import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const orgChartSchema: ComponentSchemaDefinition = {
	name: "org-chart",
	displayName: "OrgChart",
	description:
		"Top-down organizational chart with collapsible subtrees. Each node renders as a rounded card showing label + subtitle; click any node with children to fold its subtree behind a +N badge.",
	category: "artifact",
	subcategory: "hierarchy",
	props: [
		{
			name: "root",
			type: "object",
			required: true,
			description: "Hierarchy root: { id, label, subtitle?, avatarUrl?, children? }.",
		},
		{
			name: "collapsible",
			type: "boolean",
			required: false,
			default: true,
			description: "When true, clicking a node with children toggles its collapsed state.",
		},
		{
			name: "defaultExpandedDepth",
			type: "number",
			required: false,
			description: "Nodes deeper than this depth render collapsed initially. Defaults to Infinity (all expanded).",
		},
		{
			name: "nodeWidth",
			type: "number",
			required: false,
			default: 180,
			description: "Pixel width of each node card.",
		},
		{
			name: "nodeHeight",
			type: "number",
			required: false,
			default: 64,
			description: "Pixel height of each node card.",
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 800,
			description: "SVG pixel width.",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 480,
			description: "SVG pixel height.",
		},
		{
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked OrgNode. Fires before any internal collapse toggle.",
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
				reason: "Computes the top-down tree layout; the component renders SVG node cards with the result",
			},
		],
	},
	tokensUsed: ["card", "border", "foreground", "muted-foreground", "primary", "primary-foreground", "background"],
	examples: [
		{
			title: "Three-level org chart",
			description: "CEO with two reports, one of whom has further reports.",
			code:
				"<OrgChart root={{\n  id: \"ceo\", label: \"Jane Doe\", subtitle: \"CEO\",\n  children: [\n    { id: \"cto\", label: \"Bob Smith\", subtitle: \"CTO\",\n      children: [{ id: \"eng\", label: \"Eng Team\", subtitle: \"12 people\" }] },\n    { id: \"cfo\", label: \"Sara Lin\", subtitle: \"CFO\" },\n  ],\n}} />",
			composition: ["org-chart", "hierarchy", "people"],
		},
		{
			title: "Initially collapsed past depth 1",
			description: "Render only the top two layers expanded; click +N badges to drill down.",
			code: "<OrgChart defaultExpandedDepth={1} root={orgTree} />",
			composition: ["org-chart", "collapsible"],
		},
	],
	ai: {
		whenToUse:
			"Visualize people / team / department hierarchies, or any tree where each node is a labeled entity (not a value-sized bucket). Use when relationships are strictly parent-child and the user wants to drill into branches. `onNodeClick` fires for ALL nodes (root, internal, leaves) BEFORE the internal collapse toggle so consumers can observe pre-toggle state.",
		whenNotToUse:
			"Don't use for value-scaled hierarchies (use TreeMap or Sunburst). Don't use for arbitrary node graphs with cross-edges (use Canvas). Don't use for purely conceptual maps (use MindMap).",
		commonMistakes: [
			"Hierarchies thousands of nodes deep — d3.tree's horizontal spread becomes unreadable. Combine with `defaultExpandedDepth` and let users drill",
			"Mutating `root` in place when toggling expansion externally — internal collapse state keys off ids, so the controlled escape hatch should provide a stable id and a NEW root object",
			"Placing the SVG in a 0×0 container — the layout computes from `width`/`height`, but the rendered SVG inherits its container's dimensions",
		],
		relatedComponents: ["mind-map", "tree-map", "sunburst", "dendrogram", "canvas", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing the visible node count and root label. Collapsed-count badges are visual; for screen readers, also expose a parallel <ul> listing label/subtitle/depth.",
		tokenBudget: 360,
	},
	tags: ["artifact", "diagram", "org-chart", "hierarchy", "tree", "people"],
};
