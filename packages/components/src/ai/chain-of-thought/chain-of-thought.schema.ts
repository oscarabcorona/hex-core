import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const chainOfThoughtSchema: ComponentSchemaDefinition = {
	name: "chain-of-thought",
	displayName: "ChainOfThought",
	description:
		"Structured ReAct-shape reasoning trace — each step has a thought, optional action, and optional observation. Final answer renders below the trace. Distinct from `<Reasoning>` (unstructured prose).",
	category: "ai",
	subcategory: "reasoning",
	props: [
		{
			name: "steps",
			type: "object",
			required: true,
			description: "Array of `ChainOfThoughtStep` objects ({ thought: ReactNode; action?: ReactNode; observation?: ReactNode }). Every step has a thought; action and observation are optional.",
		},
		{
			name: "finalAnswer",
			type: "ReactNode",
			required: false,
			description: "Optional final answer rendered beneath the collapsible trace — typically a `<Markdown>` block.",
		},
		{
			name: "label",
			type: "string",
			required: false,
			default: "Chain of thought",
			description: "Header label on the collapsible.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Whether the trace is expanded by default.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [
		{
			name: "finalAnswer",
			description: "Final answer rendered beneath the trace. Typically a `<Markdown>` block.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "components/reasoning/reasoning"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "muted", "ring"],
	examples: [
		{
			title: "ReAct trace with a final answer",
			description: "Two steps + a final summary rendered as Markdown.",
			code: '<ChainOfThought\n  steps={[\n    {\n      thought: "Need to look up the auth module",\n      action: "read auth.ts",\n      observation: "200 lines, uses bcrypt + jwt",\n    },\n    { thought: "The bug is on line 42 — missing salt rounds." },\n  ]}\n  finalAnswer={<Markdown>{"Set `bcrypt.hash(pw, 12)` instead of `bcrypt.hash(pw)`."}</Markdown>}\n/>',
			composition: ["agent", "react", "reasoning"],
		},
		{
			title: "Pure thought trace (no actions)",
			description: "When the model is reasoning without tool calls, omit action/observation.",
			code: '<ChainOfThought\n  steps={[\n    { thought: "The user wants a 3-step migration." },\n    { thought: "Step 1 is read-only, so it can run during business hours." },\n    { thought: "Steps 2-3 need maintenance window — recommend Saturday 2am." },\n  ]}\n/>',
			composition: ["agent", "reasoning"],
		},
	],
	ai: {
		whenToUse:
			"To expose the model's structured thinking when it's doing ReAct-style tool-augmented reasoning. Each step's thought / action / observation triple matches the canonical ReAct prompting format. Pair with `<ToolCall>` for the actual tool invocations and `<Markdown>` for the final answer.",
		whenNotToUse:
			"Don't use for unstructured reasoning prose (use `<Reasoning>`). Don't use for the user-facing answer itself (the `finalAnswer` slot is for the answer; the trace is the scratchpad). Don't use to render ALL agent thinking — most models also produce free-form prose that doesn't fit the ReAct shape. Don't pass a Server Component subtree as `finalAnswer` — `<ChainOfThought>` is client-only (it composes Radix Collapsible via `<Reasoning>`), so the answer must be client-renderable too.",
		commonMistakes: [
			"Putting the final answer inside a step's thought — it belongs in `finalAnswer` so it stays visible when the trace is collapsed",
			"Omitting `thought` on a step (it's required) — every step represents a reasoning move, even if the action is what carries the work",
			"Using `<ChainOfThought>` for arbitrary structured data (use a real list or table) — this primitive's labels are specifically `Thought` / `Action` / `Observation`",
			"Setting `defaultOpen={true}` for every assistant turn — the trace can be long; default-collapsed matches user expectations and lets them peek when they want more depth",
		],
		relatedComponents: ["reasoning", "tool-call", "markdown", "task"],
		accessibilityNotes:
			"Wraps `<Reasoning>` (Radix Collapsible) — header is a real `<button>` with aria-expanded; content gets aria-hidden when closed. The step list renders as an `<ol>`; per-step term labels (Thought / Action / Observation) read as inline text rather than `<dt>`/`<dd>` because the visual structure is a vertical row, not a definition list. Final answer renders outside the collapsible so it stays visible regardless of trace state.",
		tokenBudget: 1162,
	},
	tags: ["ai", "agent", "reasoning", "react", "chain-of-thought", "trace"],
};
