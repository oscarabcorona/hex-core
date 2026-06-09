import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const flowchartSchema: ComponentSchemaDefinition = {
	name: "flowchart",
	displayName: "Flowchart",
	description:
		"Typed React flowchart. Pass nodes (with optional shape) and directional edges; the component runs a topological-rank auto-layout and renders top-to-bottom or left-to-right. Pure SVG; no heavy peer dep.",
	category: "artifact",
	subcategory: "flow",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Array of { id, label, shape?, rank? }. shape ∈ \"rect\" (default) | \"round\" | \"diamond\".",
		},
		{
			name: "edges",
			type: "object",
			required: true,
			description: "Array of { source, target, label? }. The graph MUST be a DAG (no cycles).",
		},
		{
			name: "direction",
			type: "enum",
			required: false,
			default: "vertical",
			description: "Layout direction — vertical (top-to-bottom) or horizontal (left-to-right).",
			enumValues: ["vertical", "horizontal"],
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
			default: 480,
			description: "SVG pixel height.",
		},
		{
			name: "nodeWidth",
			type: "number",
			required: false,
			default: 140,
			description: "Pixel width of each node.",
		},
		{
			name: "nodeHeight",
			type: "number",
			required: false,
			default: 48,
			description: "Pixel height of each node.",
		},
		{
			name: "onNodeClick",
			type: "function",
			required: false,
			description: "Called with the clicked FlowchartNode.",
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
	tokensUsed: ["card", "border", "foreground", "muted-foreground", "background"],
	examples: [
		{
			title: "Authorization decision flow",
			description: "Diamond decision node + two outcomes.",
			code:
				"<Flowchart\n  nodes={[\n    { id: \"start\", label: \"Start\", shape: \"round\" },\n    { id: \"check\", label: \"Authorized?\", shape: \"diamond\" },\n    { id: \"ok\", label: \"Continue\" },\n    { id: \"denied\", label: \"Reject\", shape: \"round\" },\n  ]}\n  edges={[\n    { source: \"start\", target: \"check\" },\n    { source: \"check\", target: \"ok\", label: \"yes\" },\n    { source: \"check\", target: \"denied\", label: \"no\" },\n  ]}\n/>",
			composition: ["flowchart", "decision", "branching"],
		},
		{
			title: "Horizontal pipeline with click handler",
			description: "Left-to-right ETL stages.",
			code:
				"<Flowchart\n  direction=\"horizontal\"\n  nodes={stages}\n  edges={transitions}\n  onNodeClick={(n) => router.push(`/stages/${n.id}`)}\n/>",
			composition: ["flowchart", "horizontal", "pipeline"],
		},
	],
	ai: {
		whenToUse:
			"Render structured process / decision / pipeline diagrams from typed application data — onboarding flows, decision trees, ETL pipelines, agent step-graphs. Use when consumers want an SVG without the bundle cost of `<Diagram>` (Mermaid) or the free-form interaction of `<Canvas>` (ReactFlow).",
		whenNotToUse:
			"Don't use for cyclic graphs (use Canvas — Flowchart's topological layout assumes a DAG). Don't use when consumers want to drag nodes around (use Canvas). Don't use when the diagram source is a Mermaid string from an LLM (use Diagram).",
		commonMistakes: [
			"Cycles in the edge graph — `computeRanks` short-circuits cycles to rank 0, which produces a degenerate layout. Validate the DAG upstream",
			"An edge whose source or target id is missing from `nodes` — the edge is silently skipped. Validate ids upstream",
			"Too many nodes at the same rank — the cross-axis spacing collapses. Either provide explicit `rank` overrides to balance the layout, or grow the SVG width",
			"Mutating nodes/edges in place between renders — the layout pass treats inputs as immutable and re-runs on identity change",
		],
		relatedComponents: ["sankey", "funnel", "diagram", "canvas", "mind-map"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing node and edge counts. For agent outputs, also expose a parallel ordered list (or tree) of nodes-by-rank so screen-reader users get the flow without relying on visual position.",
		tokenBudget: 1188,
	},
	tags: ["artifact", "diagram", "flowchart", "flow", "dag", "process"],
};
