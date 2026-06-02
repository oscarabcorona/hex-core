import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const timeAxisSchema: ComponentSchemaDefinition = {
	name: "time-axis",
	displayName: "TimeAxis",
	description:
		"Events plotted along a horizontal time axis. Pure SVG; no heavy peer dep. Distinct from the existing event-list `<Timeline>` — TimeAxis encodes elapsed time as horizontal distance, so the *gap between events* is the message.",
	category: "artifact",
	subcategory: "time",
	props: [
		{
			name: "events",
			type: "object",
			required: true,
			description: "Array of { id, label, date, category? }. `date` accepts Date / ISO string / epoch ms.",
		},
		{
			name: "start",
			type: "object",
			required: false,
			description: "Optional explicit axis start. Auto-derived from `events` if omitted.",
		},
		{
			name: "end",
			type: "object",
			required: false,
			description: "Optional explicit axis end. Auto-derived from `events` if omitted.",
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
			default: 200,
			description: "SVG pixel height.",
		},
		{
			name: "tickCount",
			type: "number",
			required: false,
			default: 6,
			description: "Number of axis ticks to show.",
		},
		{
			name: "onEventClick",
			type: "function",
			required: false,
			description: "Called with the clicked TimeAxisEvent.",
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
	tokensUsed: ["primary", "background", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Release timeline",
			description: "Major version releases plotted across a year.",
			code:
				"<TimeAxis events={[\n  { id: \"v1\", label: \"v1.0\", date: \"2025-01-15\" },\n  { id: \"v2\", label: \"v2.0\", date: \"2025-04-20\" },\n  { id: \"v3\", label: \"v3.0\", date: \"2025-09-10\" },\n]} />",
			composition: ["time-axis", "release"],
		},
		{
			title: "Incident frequency with explicit range",
			description: "Pin the axis to the quarter to compare incident clustering.",
			code:
				"<TimeAxis\n  start=\"2025-07-01\"\n  end=\"2025-09-30\"\n  events={incidents}\n  onEventClick={(e) => router.push(`/incidents/${e.id}`)}\n/>",
			composition: ["time-axis", "incidents"],
		},
	],
	ai: {
		whenToUse:
			"Plot events along a horizontal time axis where the *gap between events* matters — release cadence, incident frequency, sparse-then-dense activity, project milestones across a year. Auto-stacks overlapping events into rows.",
		whenNotToUse:
			"Don't use when only event ORDER matters and absolute dates are secondary (use the existing event-list `<Timeline>` in `components/`). Don't use for tasks with duration (use Gantt). Don't use for actor-message interactions (use Sequence).",
		commonMistakes: [
			"Passing dates as strings in non-ISO formats — `new Date(\"01/02/2025\")` is locale-dependent. Pass ISO strings (`\"2025-01-02\"`), Date objects, or epoch ms",
			"Forgetting to set `start`/`end` when comparing two TimeAxis renders side-by-side — auto-range scales each axis to its own events, which makes magnitudes incomparable. Pin the range explicitly",
			"Mutating `events` between renders — the layout pass is memoized on identity",
			"Confusing TimeAxis with the existing `<Timeline>` in `components/` — they coexist intentionally; pick by whether elapsed-time spacing matters",
		],
		relatedComponents: ["gantt", "sequence", "timeline"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing event count and axis range. Interactive event markers declare role=\"button\", tabIndex, and Enter/Space activation. For agent outputs, also expose a parallel chronologically-ordered list of label/date pairs.",
		tokenBudget: 1051,
	},
	tags: ["artifact", "diagram", "time-axis", "time", "events", "chronological"],
};
