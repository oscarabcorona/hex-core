import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const diagramSchema: ComponentSchemaDefinition = {
	name: "diagram",
	displayName: "Diagram",
	description:
		"Render a Mermaid diagram from a source string. For AI outputs that emit flowcharts / sequence / class diagrams — pipe the Markdown code-fence body straight in.",
	category: "ai",
	subcategory: "code",
	props: [
		{
			name: "children",
			type: "string",
			required: true,
			description: "Mermaid source. Pass the raw text body of a ```mermaid``` code fence.",
		},
		{
			name: "theme",
			type: "enum",
			required: false,
			default: "default",
			description: "Mermaid color theme — one of \"default\" | \"dark\" | \"forest\" | \"neutral\".",
		},
		{
			name: "id",
			type: "string",
			required: false,
			description:
				"Stable ID for the rendered SVG. Required when multiple diagrams share a page; auto-generated when omitted.",
		},
		{
			name: "onError",
			type: "function",
			required: false,
			description: "Called with the engine's error message on parse/render failure.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the container.",
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
				name: "mermaid",
				version: "^11.0.0",
				bundleKbGzip: 700,
				reason: "Renders diagrams from Mermaid syntax (the largest engine in this set)",
			},
		],
	},
	tokensUsed: ["background", "destructive"],
	examples: [
		{
			title: "Inline flowchart",
			description: "Static diagram from string source.",
			code: '<Diagram>{`flowchart LR\\n  A[User query] --> B[Retrieve]\\n  B --> C[Generate]\\n  C --> D[Respond]`}</Diagram>',
			composition: ["diagram", "flowchart"],
		},
		{
			title: "Render mermaid blocks from streaming AI output",
			description: "Extract code-fence body from agent output, pass to Diagram.",
			code: 'const blocks = extractMermaidBlocks(agentMessage);\n{blocks.map((src, i) => (\n  <Diagram key={i} id={`d-${i}`} theme="dark" onError={(e) => log(e)}>\n    {src}\n  </Diagram>\n))}',
			composition: ["diagram", "agent-output"],
		},
	],
	ai: {
		whenToUse:
			"Render Mermaid diagrams emitted by AI agents in their responses (flowchart, sequence, class, ER, gitGraph, mindmap, timeline). Also good for static documentation diagrams in AI-app docs.",
		whenNotToUse:
			"Don't use for interactive node graphs (use `<Canvas>` with reactflow). Don't use for charts (use a charting lib). Don't use for static SVG icons (just render SVG directly).",
		commonMistakes: [
			"Forgetting to provide a stable `id` when rendering multiple diagrams on the same page — mermaid's internal cache keys collide and re-renders break",
			"Passing untrusted user input as `children` — mermaid's strict mode protects against XSS in the SVG output, but malformed input can still trip the parser. Validate upstream",
			"Re-creating the source string on every render — the effect re-renders the diagram on identity change, which is expensive for large diagrams. Memoize",
			"Not handling onError — broken syntax silently shows nothing without the error fallback being read",
		],
		relatedComponents: ["canvas", "code-block", "markdown"],
		accessibilityNotes:
			"Mermaid SVG output includes basic role='graphics-document' semantics, but lacks rich navigation. For agent diagram outputs, also expose a parallel text description (the original Mermaid source itself, in a <details> or aria-describedby) so screen-reader users get the structure.",
		tokenBudget: 845,
	},
	tags: ["ai", "diagram", "mermaid", "flowchart", "sequence", "documentation"],
};
