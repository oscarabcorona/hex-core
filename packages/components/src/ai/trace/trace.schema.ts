import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const traceSchema: ComponentSchemaDefinition = {
	name: "trace",
	displayName: "Trace",
	description:
		"Vertical agent-decision timeline. Each step is a thought, tool call, observation, or error — with optional duration and timestamp. Distinct from `<Task>` (in-flight progress) and `<ChainOfThought>` (structured ReAct trace) — Trace is a chronological audit log for post-hoc inspection.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "steps",
			type: "object",
			required: true,
			description: "Array of `TraceStep` objects ({ id: string; kind: TraceStepKind; title: string; detail?: ReactNode; durationMs?: number; timestamp?: ReactNode }). `kind` is one of `\"think\"` / `\"tool-call\"` / `\"observation\"` / `\"error\"`.",
		},
		{
			name: "ariaLabel",
			type: "string",
			required: true,
			description: "Accessible name for the timeline list. e.g. \"Agent decision trace\".",
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "md",
			description: "Indicator size — `\"sm\"` for tight inline traces, `\"md\"` for the default detailed view.",
			enumValues: ["sm", "md"],
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root `<ol>`.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "background", "muted-foreground", "primary", "destructive"],
	examples: [
		{
			title: "Migration agent trace",
			description: "Mixed kinds — think, tool-call, observation, error.",
			code: '<Trace\n  ariaLabel="Migration agent trace"\n  steps={[\n    { id: "1", kind: "think", title: "Plan the migration", durationMs: 450 },\n    { id: "2", kind: "tool-call", title: "read users.sql", durationMs: 120 },\n    { id: "3", kind: "observation", title: "12 columns, 1.2M rows" },\n    { id: "4", kind: "error", title: "ALTER failed: column already exists" },\n  ]}\n/>',
			composition: ["agent", "trace", "audit"],
		},
		{
			title: "Compact inline trace",
			description: "Use `size=\"sm\"` for a tight trace embedded inside a card.",
			code: '<Trace\n  ariaLabel="Recent steps"\n  size="sm"\n  steps={recentSteps}\n/>',
			composition: ["agent", "trace", "compact"],
		},
		{
			title: "Per-step detail with timestamp",
			description: "Pass `timestamp` for absolute clock time and `detail` for a body line beneath the title.",
			code: '<Trace\n  ariaLabel="Today\'s agent activity"\n  steps={[\n    {\n      id: "fetch",\n      kind: "tool-call",\n      title: "GET /api/users",\n      detail: "200 OK · 1.2KB",\n      timestamp: "14:30:02",\n      durationMs: 240,\n    },\n  ]}\n/>',
			composition: ["agent", "trace", "audit"],
		},
	],
	ai: {
		whenToUse:
			"To show a chronological audit log of an agent's decisions — every think / tool-call / observation / error in order, with timing. Pair with `<ToolCall>` for richer per-step tool invocation rendering and `<Reasoning>` when a step's detail expands a thinking trace.",
		whenNotToUse:
			"Don't use for in-flight task progress (use `<Task>`). Don't use for structured ReAct reasoning (use `<ChainOfThought>` — it enforces the thought/action/observation triple per step). Don't use as a generic activity feed for non-agent content (use `<Timeline>` from the components category).",
		commonMistakes: [
			"Using a `kind` value outside `\"think\"` / `\"tool-call\"` / `\"observation\"` / `\"error\"` — unknown kinds fall back to the error indicator visually but TS will reject the value at the type level",
			"Putting agent reasoning prose in `step.title` — keep titles short imperative phrases; put the body in `step.detail` or compose `<Reasoning>` separately",
			"Mixing user/assistant message turns into a Trace (Trace is the agent's internal log; conversational turns belong in `<MessageList>`)",
			"Setting `durationMs` < 1 — render formats as `0ms` which is rarely useful; omit the prop instead when timing isn't measured",
		],
		relatedComponents: ["timeline", "task", "chain-of-thought", "tool-call", "reasoning"],
		accessibilityNotes:
			"Renders a real `<ol>` with the consumer-supplied `ariaLabel` so screen readers announce it as an ordered list. Each step indicator has a kind-specific aria-label (\"Thought\", \"Tool call\", \"Observation\", \"Error\") so AT can voice the step kind without color cues. Step titles use semantic text — error-kind steps inherit `text-destructive` for visual emphasis but the kind label is the announced semantic.",
		tokenBudget: 240,
	},
	tags: ["ai", "agent", "trace", "audit", "timeline", "log"],
};
