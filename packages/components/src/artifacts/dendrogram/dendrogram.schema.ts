import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dendrogramSchema: ComponentSchemaDefinition = {
	name: "dendrogram",
	displayName: "Dendrogram",
	description:
		"Clustering tree where every leaf sits at the same depth, regardless of branch length — the visual signature of taxonomies, phylogenetic trees, and hierarchical-clustering output.",
	category: "artifact",
	subcategory: "hierarchy",
	props: [
		{
			name: "root",
			type: "object",
			required: true,
			description: "Hierarchy root: { id, label, children? }.",
		},
		{
			name: "orientation",
			type: "enum",
			required: false,
			default: "horizontal",
			description: "\"horizontal\" runs root-to-leaves left→right; \"vertical\" runs top→bottom.",
			enumValues: ["horizontal", "vertical"],
		},
		{
			name: "linkShape",
			type: "enum",
			required: false,
			default: "step",
			description: "\"step\" draws right-angle elbow links (taxonomy aesthetic); \"diagonal\" uses smooth Bezier curves.",
			enumValues: ["step", "diagonal"],
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
			name: "onLeafClick",
			type: "function",
			required: false,
			description: "Called with the clicked DendrogramNode when a user clicks any leaf.",
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
				reason: "Computes the cluster layout (equal-depth leaves) used to position nodes",
			},
		],
	},
	tokensUsed: ["primary", "muted-foreground", "foreground", "background"],
	examples: [
		{
			title: "Taxonomy dendrogram",
			description: "Equal-depth leaves arranged horizontally with step links.",
			code:
				"<Dendrogram root={{\n  id: \"root\", label: \"Animals\",\n  children: [\n    { id: \"mammals\", label: \"Mammals\", children: [\n      { id: \"cat\", label: \"Cat\" },\n      { id: \"dog\", label: \"Dog\" },\n    ]},\n    { id: \"birds\", label: \"Birds\", children: [{ id: \"robin\", label: \"Robin\" }] },\n  ],\n}} />",
			composition: ["dendrogram", "hierarchy", "taxonomy"],
		},
		{
			title: "Vertical dendrogram with diagonal links",
			description: "Top-down orientation with smooth Bezier links.",
			code: "<Dendrogram orientation=\"vertical\" linkShape=\"diagonal\" root={tree} />",
			composition: ["dendrogram", "vertical", "diagonal"],
		},
	],
	ai: {
		whenToUse:
			"Visualize taxonomic / phylogenetic / clustering hierarchies where the user expects every leaf to sit at the same depth. Ideal when the tree shape itself is the message (groupings, sibling relationships). `onLeafClick` fires for LEAVES ONLY — internal-node clicks are no-ops (use OrgChart if you need callbacks on every node).",
		whenNotToUse:
			"Don't use for value-scaled hierarchies (use TreeMap or Sunburst). Don't use for tree shapes where depth has meaning (use OrgChart, which uses d3.tree). Don't use for arbitrary node graphs (use Canvas).",
		commonMistakes: [
			"Confusing dendrogram with org chart — dendrogram aligns ALL leaves at a single edge regardless of branch depth, which is wrong for org structures where reporting depth is meaningful",
			"Hundreds of leaves on a fixed-size SVG — leaves overlap. Either grow the SVG or paginate the tree",
			"Mutating the root object in place — the layout pass treats input as immutable; always provide a new root reference on data change",
		],
		relatedComponents: ["mind-map", "tree-map", "org-chart", "sunburst", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing the leaf count and root label. For agent outputs, expose a parallel <ul> grouping leaves by their parent so screen-reader users get the clustering structure.",
		tokenBudget: 1024,
	},
	tags: ["artifact", "diagram", "dendrogram", "hierarchy", "cluster", "taxonomy"],
};
