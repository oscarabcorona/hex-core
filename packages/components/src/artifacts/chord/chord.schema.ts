import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const chordSchema: ComponentSchemaDefinition = {
	name: "chord",
	displayName: "Chord",
	description:
		"Chord diagram. Nodes sit on a ring; ribbons inside encode weighted bidirectional relationships. Use for trade flows, migration, citation networks — \"A relates to B with weight w\" at scale.",
	category: "artifact",
	subcategory: "relational",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Array of { id, label }. Order matches matrix rows/columns.",
		},
		{
			name: "matrix",
			type: "object",
			required: true,
			description: "Square N×N matrix of weights. matrix[i][j] = flow from node i to node j.",
		},
		{
			name: "size",
			type: "number",
			required: false,
			default: 480,
			description: "Pixel size of the rendered SVG (it's square).",
		},
		{
			name: "padAngle",
			type: "number",
			required: false,
			default: 0.04,
			description: "Padding (in radians) between adjacent ring segments.",
		},
		{
			name: "onChordHover",
			type: "function",
			required: false,
			description: "Called with the hovered ribbon's { source, target, value } (or null when hover ends).",
		},
		{
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked ChordNode.",
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
				name: "d3-chord",
				version: "^3.0.1",
				bundleKbGzip: 3,
				reason: "Computes the chord layout (group ranges + chord pairs from the input matrix)",
			},
			{
				name: "d3-shape",
				version: "^3.2.0",
				bundleKbGzip: 6,
				reason: "Generates the SVG arc and ribbon paths (already a peer of Sunburst)",
			},
		],
	},
	tokensUsed: ["primary", "accent", "secondary", "muted", "background", "foreground"],
	examples: [
		{
			title: "Trade flow between four regions",
			description: "Bidirectional weighted relationships.",
			code:
				"<Chord\n  nodes={[\n    { id: \"americas\", label: \"Americas\" },\n    { id: \"emea\", label: \"EMEA\" },\n    { id: \"apac\", label: \"APAC\" },\n    { id: \"africa\", label: \"Africa\" },\n  ]}\n  matrix={[\n    [0, 12, 8, 1],\n    [10, 0, 5, 2],\n    [7, 4, 0, 3],\n    [1, 1, 2, 0],\n  ]}\n/>",
			composition: ["chord", "trade-flow", "weighted"],
		},
		{
			title: "Hover for ribbon details",
			description: "Wire `onChordHover` to populate a tooltip.",
			code:
				"<Chord nodes={people} matrix={interactions} onChordHover={(c) => setActive(c)} />",
			composition: ["chord", "interactive"],
		},
	],
	ai: {
		whenToUse:
			"Visualize bidirectional weighted relationships among a small set of entities (typically 4–12). Trade flows, migration corridors, citation/hyperlink networks, character interactions in narratives.",
		whenNotToUse:
			"Don't use for hierarchical relationships (use TreeMap, Sunburst, OrgChart). Don't use for unidirectional flows where direction matters (use Sankey). Don't use for >~15 nodes — ribbons stack and become unreadable. Don't use for sparse matrices — most ribbons collapse to invisible.",
		commonMistakes: [
			"Non-square matrix — d3-chord requires N×N where N matches `nodes.length`. Validate upstream",
			"Asymmetric weights expected to render symmetrically — the component honors per-direction weights as given (matrix[i][j] vs matrix[j][i])",
			"Mutating `nodes` / `matrix` between renders — the layout pass is memoized on identity. Memoize the matrix",
			"NaN entries in the matrix — the inline `descending` comparator treats NaN as equal (vs d3.descending which returns NaN). Sort positions for NaN entries are unstable; sanitize upstream",
			"Expecting `onChordHover.value` — the callback now exposes `{ sourceValue, targetValue }` so consumers see both directions of an asymmetric flow at once",
		],
		relatedComponents: ["sankey", "matrix", "arc", "venn"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing node and ribbon counts. Interactive ribbons and node arcs declare role=\"button\", tabIndex, and Enter/Space activation. For agent outputs, also expose a parallel adjacency table so screen-reader users get the matrix without relying on the visual.",
		tokenBudget: 1083,
	},
	tags: ["artifact", "diagram", "chord", "relational", "weighted", "circular"],
};
