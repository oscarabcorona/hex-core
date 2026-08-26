import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const canvasSchema: ComponentSchemaDefinition = {
	name: "canvas",
	displayName: "Canvas",
	description:
		"Headless node-graph canvas backed by reactflow. Renders interactive agent workflows, RAG graphs, document relationships. Default Background + Controls; slot for MiniMap or custom overlays.",
	category: "ai",
	subcategory: "code",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description: "Reactflow Node[] — array of node objects. See reactflow docs for shape.",
		},
		{
			name: "edges",
			type: "object",
			required: true,
			description: "Reactflow Edge[] — array of edge objects.",
		},
		{
			name: "onNodesChange",
			type: "function",
			required: false,
			description: "Forwarded to ReactFlow.onNodesChange — fires on drag/select/remove.",
		},
		{
			name: "onEdgesChange",
			type: "function",
			required: false,
			description: "Forwarded to ReactFlow.onEdgesChange.",
		},
		{
			name: "onConnect",
			type: "function",
			required: false,
			description: "Forwarded to ReactFlow.onConnect — fires when the user draws an edge.",
		},
		{
			name: "hideControls",
			type: "boolean",
			required: false,
			default: false,
			description: "Hide the bottom-left zoom/pan/fit controls.",
		},
		{
			name: "hideBackground",
			type: "boolean",
			required: false,
			default: false,
			description: "Hide the dotted background.",
		},
		{
			name: "fitView",
			type: "boolean",
			required: false,
			default: true,
			description: "Auto-fit the view to all nodes on first render.",
		},
		{
			name: "children",
			type: "ReactNode",
			required: false,
			description: "Slot for MiniMap, Panel, or custom overlays inside ReactFlow.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the container div.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Rendered inside ReactFlow — for MiniMap, Panel, or custom overlays.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
		heavyPeer: [
			{
				name: "reactflow",
				version: "^11.11.0",
				bundleKbGzip: 80,
				reason: "Renders the node graph + handles drag/zoom/pan",
			},
		],
	},
	tokensUsed: ["muted"],
	examples: [
		{
			title: "Static agent workflow",
			description: "Render a fixed graph of agent steps.",
			code: 'import { Canvas } from "@hex-core/components";\nimport "reactflow/dist/style.css";\n\nconst nodes = [\n  { id: "1", position: { x: 0, y: 0 }, data: { label: "Receive query" } },\n  { id: "2", position: { x: 250, y: 100 }, data: { label: "Retrieve context" } },\n];\nconst edges = [{ id: "e1-2", source: "1", target: "2" }];\n<Canvas nodes={nodes} edges={edges} />',
			composition: ["workflow", "diagram"],
		},
		{
			title: "Editable graph with onConnect",
			description: "Let the user wire nodes together.",
			code: 'const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);\nconst [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);\nconst onConnect = useCallback((p) => setEdges((e) => addEdge(p, e)), []);\n<Canvas\n  nodes={nodes}\n  edges={edges}\n  onNodesChange={onNodesChange}\n  onEdgesChange={onEdgesChange}\n  onConnect={onConnect}\n/>',
			composition: ["workflow", "interactive"],
		},
	],
	ai: {
		whenToUse:
			"Visualize agent workflows, multi-step plans, RAG document graphs, or any DAG-shaped AI process where nodes/edges convey meaning. Pair with `useNodesState` / `useEdgesState` from reactflow for editable graphs.",
		whenNotToUse:
			"Don't use for tabular data (use `data-table`). Don't use for trees with no horizontal relationships (use `tree`). Don't use as a static SVG diagram (use `<Diagram>` with mermaid for that).",
		commonMistakes: [
			"Forgetting `import \"reactflow/dist/style.css\"` — without it, nodes render as unstyled divs and the canvas appears empty",
			"Setting fitView={false} without specifying viewport bounds — nodes may render off-screen",
			"Re-creating the nodes/edges arrays on every render without memoization — reactflow re-runs layout on identity change",
			"Forgetting the canvas needs explicit height — wrap in a sized container or it collapses to 0px",
		],
		relatedComponents: ["diagram", "tree"],
		accessibilityNotes:
			"Reactflow's accessibility is limited (the canvas is a div graph, not native semantics). For agent-workflow visualization, also expose a parallel screen-reader-friendly text/list representation of the nodes via aria-describedby.",
		tokenBudget: 1190,
	},
	tags: ["ai", "canvas", "graph", "workflow", "reactflow", "node-graph", "dag"],
};
