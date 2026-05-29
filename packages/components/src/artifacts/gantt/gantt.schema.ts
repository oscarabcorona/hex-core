import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const ganttSchema: ComponentSchemaDefinition = {
	name: "gantt",
	displayName: "Gantt",
	description:
		"Gantt chart — tasks as horizontal bars across a time axis with optional dependency arrows and progress fills. Pure SVG; no heavy peer dep.",
	category: "artifact",
	subcategory: "time",
	props: [
		{
			name: "tasks",
			type: "object",
			required: true,
			description: "Array of { id, label, start, end, progress?, dependencies? }. `start`/`end` accept Date / ISO string / epoch ms.",
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 800,
			description: "SVG pixel width.",
		},
		{
			name: "rowHeight",
			type: "number",
			required: false,
			default: 32,
			description: "Pixel height of each task row.",
		},
		{
			name: "labelMargin",
			type: "number",
			required: false,
			default: 140,
			description: "Pixel reserved on the left for task labels.",
		},
		{
			name: "tickCount",
			type: "number",
			required: false,
			default: 6,
			description: "Number of axis ticks to show across the top.",
		},
		{
			name: "onTaskClick",
			type: "function",
			required: false,
			description: "Called with the clicked GanttTask.",
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
	tokensUsed: ["primary", "foreground", "muted-foreground", "background"],
	examples: [
		{
			title: "Project schedule with dependencies",
			description: "Sequential tasks with dependency arrows and a progress fill.",
			code:
				"<Gantt tasks={[\n  { id: \"design\", label: \"Design\", start: \"2025-01-01\", end: \"2025-01-15\", progress: 1 },\n  { id: \"build\", label: \"Build\", start: \"2025-01-10\", end: \"2025-02-20\", progress: 0.6, dependencies: [\"design\"] },\n  { id: \"ship\", label: \"Ship\", start: \"2025-02-15\", end: \"2025-02-28\", dependencies: [\"build\"] },\n]} />",
			composition: ["gantt", "schedule", "dependencies"],
		},
		{
			title: "Sprint board across two weeks",
			description: "Click a bar to open the task detail.",
			code:
				"<Gantt\n  tasks={sprint}\n  onTaskClick={(t) => router.push(`/tasks/${t.id}`)}\n/>",
			composition: ["gantt", "sprint"],
		},
	],
	ai: {
		whenToUse:
			"Visualize project schedules where each task has a START and END date, plus optional dependencies and progress. Sprint boards, release plans, ETL job schedules, content publishing calendars.",
		whenNotToUse:
			"Don't use for point events without duration (use TimeAxis). Don't use for cyclic / recurring tasks (Gantt assumes a DAG of dependencies). Don't use for actor-message interactions (use Sequence). Don't use when the task list isn't ordered top-to-bottom by intended display order — Gantt trusts the array order.",
		commonMistakes: [
			"`end` before `start` — produces zero-or-negative width bars. Validate ranges upstream",
			"Dependency cycles — `dependencies: ['x']` where `x` transitively depends on the current task. The component still renders bars, but the arrow paths cross awkwardly. Validate the dependency DAG upstream",
			"Missing dependency target — `dependencies: ['ghost']` where `ghost` isn't in `tasks`. The arrow is silently skipped",
			"Passing dates as locale-dependent strings (`\"01/02/2025\"`) — pass ISO (`\"2025-01-02\"`), Date, or epoch ms",
			"Mutating tasks between renders — the layout pass is memoized on identity",
		],
		relatedComponents: ["time-axis", "sequence", "timeline", "flowchart"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing task count and date range. Interactive task bars declare role=\"button\", tabIndex, and Enter/Space activation. The aria-label includes label, date range, and progress percent. For agent outputs, also expose a parallel ordered list of tasks with their dates.",
		tokenBudget: 1055,
	},
	tags: ["artifact", "diagram", "gantt", "time", "schedule", "tasks"],
};
