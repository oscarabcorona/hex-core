import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const matrixSchema: ComponentSchemaDefinition = {
	name: "matrix",
	displayName: "Matrix",
	description:
		"Adjacency-matrix diagram. Square grid where cell color intensity encodes the relationship from row to column. Pure SVG; no heavy peer dep. Best for dense graphs that turn into hairballs in node-link form.",
	category: "artifact",
	subcategory: "relational",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Array of { id, label }. Used as both rows AND columns. Order matches `matrix` rows/columns.",
		},
		{
			name: "matrix",
			type: "object",
			required: true,
			description: "Square N×N matrix. matrix[i][j] = relationship from node i to node j. Renamed from `values` to avoid colliding with the SVG `values` animation attribute.",
		},
		{
			name: "size",
			type: "number",
			required: false,
			default: 480,
			description: "Pixel size of the rendered SVG (it's square).",
		},
		{
			name: "labelMargin",
			type: "number",
			required: false,
			default: 80,
			description: "Pixel reserved for row/column labels along the top and left edges.",
		},
		{
			name: "showValues",
			type: "boolean",
			required: false,
			default: true,
			description: "Show numeric values inside cells when the cell is large enough (~28px+).",
		},
		{
			name: "onCellHover",
			type: "function",
			required: false,
			description: "Called with the hovered cell's { row, col, value } (or null when hover ends).",
		},
		{
			name: "onCellClick",
			type: "function",
			required: false,
			description: "Called with the clicked cell's { row, col, value }.",
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
			title: "Trade flow matrix",
			description: "Cell intensity reflects flow from row region to column region.",
			code:
				"<Matrix\n  nodes={regions}\n  matrix={tradeFlow}\n  onCellHover={(c) => setActive(c)}\n/>",
			composition: ["matrix", "trade-flow", "heatmap"],
		},
		{
			title: "Confusion matrix for a classifier",
			description: "Predicted vs actual labels.",
			code:
				"<Matrix\n  nodes={classes}\n  matrix={confusion}\n  showValues={true}\n/>",
			composition: ["matrix", "confusion", "ml"],
		},
	],
	ai: {
		whenToUse:
			"Visualize a dense relationship between many pairs of entities — adjacency matrices, confusion matrices, correlation matrices, trade-flow matrices, citation-count matrices. Scales gracefully to ~100 nodes where node-link diagrams degenerate. Use when SCALE matters more than seeing individual edges.",
		whenNotToUse:
			"Don't use for sparse relationships (most cells empty — Sankey or Arc surfaces the actual edges better). Don't use when the user needs to follow paths from node to node (use Canvas, Flowchart). Don't use for hierarchical data (use TreeMap, Sunburst).",
		commonMistakes: [
			"Non-square `matrix` — the component reads matrix[i][j], so missing rows or short rows render as zero. Validate dimensions upstream",
			"Mismatched length: `nodes.length` ≠ `matrix.length` — extra nodes get blank rows; extra rows are ignored. Validate upstream",
			"Mutating `nodes` / `matrix` between renders — the layout pass is memoized on identity",
			"Asymmetric values expected to render symmetrically — the component honors per-direction values exactly as given",
			"`labelMargin` smaller than the longest node label's pixel width — labels overflow the SVG. Set `labelMargin` ≥ ~0.75× longestLabelPx, or shorten labels upstream",
		],
		relatedComponents: ["chord", "arc", "venn", "sankey"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing dimensions. Interactive cells declare role=\"button\", tabIndex, and Enter/Space activation; hover/focus fire callback symmetrically. For agent outputs, also expose a parallel <table> so screen-reader users get the values without relying on color intensity.",
		tokenBudget: 1047,
	},
	tags: ["artifact", "diagram", "matrix", "adjacency", "relational", "heatmap"],
};
