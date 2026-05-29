import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const mindMapSchema: ComponentSchemaDefinition = {
	name: "mind-map",
	displayName: "MindMap",
	description:
		"Typed React mind map. Pass a hierarchical root node and the component lays children out radially (or horizontally) using d3-hierarchy's tree layout — no Mermaid string DSL required.",
	category: "artifact",
	subcategory: "hierarchy",
	props: [
		{
			name: "root",
			type: "object",
			required: true,
			description: "Hierarchy root: { id, label, children?, data? }. Children are laid out radially around the root.",
		},
		{
			name: "orientation",
			type: "enum",
			required: false,
			default: "radial",
			description: "Layout direction — \"radial\" (children orbit the root) or \"horizontal\" (left-to-right tree).",
			enumValues: ["radial", "horizontal"],
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
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked MindMapNode when a user clicks any node.",
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
				reason: "Computes the radial / horizontal tree layout; the component renders SVG with the result",
			},
		],
	},
	tokensUsed: ["primary", "background", "foreground", "muted"],
	examples: [
		{
			title: "Radial mind map",
			description: "Default radial layout with three branches.",
			code:
				"<MindMap root={{\n  id: \"root\",\n  label: \"Project\",\n  children: [\n    { id: \"ui\", label: \"UI\", children: [{ id: \"btn\", label: \"Button\" }] },\n    { id: \"api\", label: \"API\" },\n    { id: \"db\", label: \"DB\" },\n  ],\n}} />",
			composition: ["mind-map", "hierarchy", "radial"],
		},
		{
			title: "Horizontal mind map with click handler",
			description: "Left-to-right tree useful for sidebars and detail panes.",
			code:
				"<MindMap orientation=\"horizontal\" onNodeClick={(n) => select(n.id)} root={data} />",
			composition: ["mind-map", "horizontal", "interactive"],
		},
	],
	ai: {
		whenToUse:
			"Visualize a typed hierarchy when you have structured data (not a Mermaid string) — concept maps, knowledge graphs, project decompositions, agent plan trees. Use radial when the root is conceptually central; horizontal when the hierarchy is left-to-right (file trees, decision trees).",
		whenNotToUse:
			"Don't use for free-form node graphs with arbitrary edges (use Canvas with reactflow). Don't use to render Mermaid markdown from agents (use Diagram). Don't use for hierarchies sized by value (use TreeMap or Sunburst).",
		commonMistakes: [
			"Passing an unmemoized `root` object on every render — the layout pass re-runs and node positions thrash. Memoize",
			"Sizing the SVG to 0 (no explicit width/height and no parent layout) — the layout returns degenerate coordinates",
			"Mutating the root hierarchy in place between renders — d3-hierarchy mutates its own internal tree, but the input object should be treated as immutable",
		],
		relatedComponents: ["tree-map", "org-chart", "sunburst", "dendrogram", "canvas", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing the node count and root label. For agent outputs, also expose a parallel text representation (a nested <ul> of node labels in a <details>) so screen-reader users get the structure.",
		tokenBudget: 945,
	},
	tags: ["artifact", "diagram", "mind-map", "hierarchy", "tree", "radial"],
};
