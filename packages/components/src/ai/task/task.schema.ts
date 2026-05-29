import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const taskSchema: ComponentSchemaDefinition = {
	name: "task",
	displayName: "Task",
	description:
		"Multi-step task progress card. Each step's state re-uses the canonical ToolCallState vocabulary; the header tracks aggregate progress.",
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
			name: "steps",
			type: "object",
			required: true,
			description: "Array of `TaskStep` objects ({ id: string; label: string; state: ToolCallState; detail?: string }). State enum matches ToolCall: pending / running / result / error.",
		},
		{
			name: "durationMs",
			type: "number",
			required: false,
			description: "Total time spent on the task. Renders 'Done in X.Xs' when all steps complete.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: true,
			description: "Whether the step list is expanded by default.",
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
		npm: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "muted", "muted-foreground", "foreground", "primary", "destructive", "ring"],
	examples: [
		{
			title: "Refactor task in progress",
			description: "Three steps — first is done, second is running, third is pending.",
			code: 'const steps = [\n  { id: "read", label: "Read existing auth", state: "result" },\n  { id: "write", label: "Apply changes", state: "running" },\n  { id: "test", label: "Run tests", state: "pending" },\n];\n<Task label="Refactoring auth" steps={steps} />',
			composition: ["agent", "task", "progress"],
		},
		{
			title: "Completed task with duration",
			description: "All steps done; header shows total time.",
			code: 'const steps = [\n  { id: "a", label: "Plan", state: "result" },\n  { id: "b", label: "Apply", state: "result" },\n  { id: "c", label: "Verify", state: "result" },\n];\n<Task label="Migrate users table" steps={steps} durationMs={12_400} />',
			composition: ["agent", "task", "complete"],
		},
		{
			title: "Compose with Reasoning per step",
			description: "Wrap a step's detail prop with Reasoning when the model wants to expose a thinking trace inline.",
			code: 'const steps = [\n  { id: "plan", label: "Plan migration", state: "result", detail: "Identified 4 tables, 2 with existing indexes." },\n];\n<Task steps={steps} />',
			composition: ["agent", "task", "reasoning"],
		},
	],
	ai: {
		whenToUse:
			"To show an agent's multi-step plan execution. Each step should map to a discrete unit of work the model claims it's doing — read, write, run, verify. Pair with ToolCall when a step actually invokes a tool, and Reasoning when the step exposes thinking.",
		whenNotToUse:
			"Don't use for a flat list of facts (use a real list). Don't use for a single-step operation (just render the result directly). Don't use as a navigation surface — it's a status display, not an interactive component.",
		commonMistakes: [
			"Mixing `state` strings — use the canonical `ToolCallState` (`pending` / `running` / `result` / `error`); novel states like 'in-progress' or 'finished' will render with the pending icon",
			"Setting all steps to `pending` upfront and never updating — the component is a status display, not a planner; consumers must update step state as the agent progresses",
			"Using `Task` for stateful wizard flows (use `Stepper` instead — Stepper is interactive, Task is read-only)",
			"Putting agent reasoning in `step.label` — keep labels short; put thinking in `step.detail` or compose Reasoning separately",
		],
		relatedComponents: ["tool-call", "reasoning", "stepper", "message"],
		accessibilityNotes:
			"Wraps Radix Collapsible — trigger is a real <button> with aria-expanded; content gets aria-hidden when closed. Each step icon carries an aria-label so screen readers announce status (e.g. 'Done', 'Running', 'Error', 'Pending'). The 'running' spinner is gated on `motion-safe:` — users with `prefers-reduced-motion: reduce` see a static circle.",
		tokenBudget: 1114,
	},
	tags: ["ai", "agent", "task", "progress", "collapsible", "tool-use"],
};
