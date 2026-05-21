import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const planSchema: ComponentSchemaDefinition = {
	name: "plan",
	displayName: "Plan",
	description:
		"Pre-execution multi-step plan card with an optional approval gate. Distinct from `<Task>` — Task is during/post-execution status; Plan is pre-execution intent.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "label",
			type: "string",
			required: false,
			description: "Optional title shown above the step list.",
		},
		{
			name: "description",
			type: "string",
			required: false,
			description: "Optional secondary description shown under the label.",
		},
		{
			name: "steps",
			type: "object",
			required: true,
			description: "Array of `PlanStep` objects ({ id: string; label: string; detail?: string }). Steps don't carry state — flip the rendered Plan into a Task once approved.",
		},
		{
			name: "onApprove",
			type: "function",
			required: false,
			description: "Called when the user clicks Approve. When provided, the footer renders an Approve button.",
		},
		{
			name: "onCancel",
			type: "function",
			required: false,
			description: "Called when the user clicks Cancel. When provided, the footer renders a Cancel button.",
		},
		{
			name: "approveLabel",
			type: "string",
			required: false,
			default: "Approve",
			description: "Override the approve button label.",
		},
		{
			name: "cancelLabel",
			type: "string",
			required: false,
			default: "Cancel",
			description: "Override the cancel button label.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge", "class-variance-authority", "@radix-ui/react-slot"],
		internal: ["lib/utils", "primitives/button/button"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "input", "muted", "muted-foreground", "foreground", "background"],
	examples: [
		{
			title: "Approval-gated plan",
			description: "Three steps with Approve/Cancel buttons in the footer.",
			code: '<Plan\n  label="Refactor auth"\n  steps={[\n    { id: "read", label: "Read existing auth" },\n    { id: "apply", label: "Apply changes" },\n    { id: "test", label: "Run tests" },\n  ]}\n  onApprove={() => execute()}\n  onCancel={() => discard()}\n/>',
			composition: ["agent", "plan", "approval"],
		},
		{
			title: "Read-only plan (no footer)",
			description: "Omit both onApprove and onCancel for a display-only plan.",
			code: '<Plan\n  label="Migration plan"\n  description="Three-table migration with backfill."\n  steps={[\n    { id: "users", label: "Migrate users", detail: "1.2M rows, batched" },\n    { id: "orders", label: "Migrate orders", detail: "8M rows, dual-write window" },\n    { id: "verify", label: "Verify integrity" },\n  ]}\n/>',
			composition: ["agent", "plan", "read-only"],
		},
		{
			title: "Flip Plan → Task once approved",
			description: "Plan renders pre-execution; once the user approves, swap to a Task driven by the running agent.",
			code: 'const [approved, setApproved] = useState(false);\n{approved ? (\n  <Task label="Refactor auth" steps={runningSteps} />\n) : (\n  <Plan label="Refactor auth" steps={proposedSteps} onApprove={() => setApproved(true)} />\n)}',
			composition: ["agent", "plan", "task", "lifecycle"],
		},
	],
	ai: {
		whenToUse:
			"To show an agent's proposed multi-step plan BEFORE it executes — typically gated on user approval. Pair with `<Task>` for the execution phase. Use the optional description prop to summarize tradeoffs the user is approving.",
		whenNotToUse:
			"Don't use `<Plan>` for the execution phase (use `<Task>` — its steps carry lifecycle state). Don't use it as a stateful wizard (use `<Stepper>` — Stepper is interactive, Plan is read-only intent). Don't use it for a single proposed action (just render a confirm dialog).",
		commonMistakes: [
			"Treating Plan as a stateful wizard — Plan is pre-execution display; once the user approves, swap the rendered Plan for a `<Task>` whose steps update as the agent runs",
			"Adding `state` to Plan steps — that's `TaskStep`. PlanStep has only `id`, `label`, `detail`",
			"Omitting both `onApprove` and `onCancel` when an approval gate is intended — the footer renders only when at least one handler is set",
			"Putting reasoning in `step.label` — keep labels short imperative phrases; put any rationale in `step.detail` or a separate `<Reasoning>` block above the Plan",
		],
		relatedComponents: ["task", "stepper", "reasoning", "tool-call"],
		accessibilityNotes:
			"The step list renders as a real `<ol>` with an aria-label tied to the optional plan label, so screen readers announce it as an ordered list. Step indicators are aria-hidden (decorative) — the step label is the announced content. Approve / Cancel buttons inherit Button primitive accessibility (real `<button>`, focus ring, disabled handling).",
		tokenBudget: 240,
	},
	tags: ["ai", "agent", "plan", "approval", "pre-execution"],
};
