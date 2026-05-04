import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const arcSchema: ComponentSchemaDefinition = {
	name: "arc",
	displayName: "Arc",
	description:
		"Arc diagram. Nodes lie on a horizontal baseline; relationships are drawn as semicircle arcs above. Pure SVG; no heavy peer dep. Use when node ORDER matters (sequence, time, story position).",
	category: "artifact",
	subcategory: "relational",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Array of { id, label, value? }. Display order along the baseline matches array order.",
		},
		{
			name: "edges",
			type: "object",
			required: true,
			description: "Array of { source, target, value? }. Edges with missing source/target are skipped.",
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
			default: 360,
			description: "SVG pixel height.",
		},
		{
			name: "nodeRadius",
			type: "number",
			required: false,
			default: 5,
			description: "Pixel radius of each node circle.",
		},
		{
			name: "onEdgeHover",
			type: "function",
			required: false,
			description: "Called with the hovered ArcEdge (or null when hover ends).",
		},
		{
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked ArcNode.",
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
	},
	tokensUsed: ["primary", "background", "foreground"],
	examples: [
		{
			title: "Character co-occurrence",
			description: "Nodes in narrative order, arcs connect characters in the same chapter.",
			code:
				"<Arc\n  nodes={characters}\n  edges={cooccurrences}\n  onEdgeHover={(e) => setActive(e)}\n/>",
			composition: ["arc", "narrative", "cooccurrence"],
		},
		{
			title: "Train route transfer connections",
			description: "Stations on a baseline; arcs show transfer connections.",
			code:
				"<Arc\n  nodes={stations}\n  edges={transfers}\n/>",
			composition: ["arc", "transit", "sequence"],
		},
	],
	ai: {
		whenToUse:
			"Visualize relationships among entities WHERE THE ORDER OF ENTITIES IS MEANINGFUL — narrative co-occurrence (chapters), transit transfer points (route order), genome interactions (chromosomal position), citation networks (publication time). Arcs encode pair relationships without breaking the linear node order.",
		whenNotToUse:
			"Don't use when node order is arbitrary (use Chord — it places nodes on a ring with no implied order). Don't use for hierarchical relationships (use TreeMap, Sunburst, OrgChart). Don't use for >50 nodes — arcs overlap heavily; consider Matrix.",
		commonMistakes: [
			"Confusing Arc with Chord — Chord = ring (no order); Arc = baseline (order matters)",
			"Edge source/target id missing from `nodes` — silently skipped. Validate ids upstream",
			"Mutating nodes / edges between renders — the layout pass is memoized on identity",
		],
		relatedComponents: ["chord", "matrix", "venn", "sankey"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing node and edge counts. Interactive nodes/edges declare role=\"button\", tabIndex, and Enter/Space activation. For agent outputs, also expose a parallel ordered list of nodes plus an adjacency table.",
		tokenBudget: 320,
	},
	tags: ["artifact", "diagram", "arc", "relational", "sequence", "ordered"],
};
