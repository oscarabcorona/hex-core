import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const timelineSchema: ComponentSchemaDefinition = {
	name: "timeline",
	displayName: "Timeline",
	description:
		"Vertical chronological event feed for activity logs, audit trails, release notes, and notification streams. Pure semantic <ol>/<li> with a status-colored indicator and an optional icon override.",
	category: "component",
	subcategory: "data-display",
	props: [
		{
			name: "events",
			type: "object",
			required: true,
			description:
				"Ordered list of { id, title, timestamp?, description?, icon?, status? } events.",
		},
		{
			name: "size",
			type: "string",
			required: false,
			default: "default",
			description: "Indicator size: 'sm' | 'default' | 'lg'",
		},
		{
			name: "aria-label",
			type: "string",
			required: true,
			description:
				"Required accessible name for the ordered list (e.g. 'Activity log', 'Release notes')",
		},
	],
	variants: [
		{
			name: "size",
			description: "Indicator size",
			values: [
				{ value: "sm", description: "Compact 1.25rem indicator" },
				{ value: "default", description: "Default 1.75rem indicator" },
				{ value: "lg", description: "Large 2.25rem indicator" },
			],
			default: "default",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"background",
		"foreground",
		"muted-foreground",
		"input",
		"primary",
		"destructive",
		"destructive-foreground",
		"ring",
	],
	examples: [
		{
			title: "Activity log",
			description: "Three-entry vertical feed with mixed status colors",
			code: 'import { Timeline } from "@hex-core/components";\n\n<Timeline\n  aria-label="Activity"\n  events={[\n    { id: "1", title: "Pull request opened", timestamp: "2 hours ago", status: "info" },\n    { id: "2", title: "CI passed", timestamp: "1 hour ago", status: "success" },\n    { id: "3", title: "Merged to main", timestamp: "12 minutes ago", description: "Squash + merge by @oscar", status: "success" },\n  ]}\n/>',
		},
		{
			title: "Custom icon",
			description: "Override the default dot with a custom node",
			code: 'import { Timeline } from "@hex-core/components";\n\n<Timeline\n  aria-label="Release notes"\n  events={[\n    { id: "v1", title: "v1.0", timestamp: "Apr 24", icon: <span>⚡</span> },\n    { id: "v2", title: "v1.1", timestamp: "Apr 27", icon: <span>🐛</span>, status: "warning" },\n  ]}\n/>',
		},
	],
	ai: {
		whenToUse:
			"Use to show a chronological event feed: activity logs, audit trails, release notes, notification history, ticket events. Each event has a title and optional timestamp + description.",
		whenNotToUse:
			"Don't use for project schedules / Gantt charts (build a custom layout). Don't use for navigation between time periods (use Tabs or Stepper). Don't use for paginated data (use Table or DataTable). Don't use for >50 events without virtualization — Timeline renders every item.",
		commonMistakes: [
			"Forgetting aria-label — the <ol> needs an accessible name to be understood as a feed",
			"Using duplicate event ids — breaks React keys and event reconciliation on re-render",
			"Stuffing the description with rich layouts that overflow the timeline rail — keep it short or move to a Card",
			"Setting status='error' on every event for emphasis — color loses meaning when overused",
			"Mixing controlled timestamps as Date objects without formatting — Timeline accepts ReactNode, so format upstream (date-fns) before passing in",
		],
		relatedComponents: ["card", "stepper", "separator"],
		accessibilityNotes:
			"Renders <ol> with the provided aria-label. The status-colored indicator and connector line are aria-hidden — meaning is carried entirely by the title/timestamp/description text. No aria-current; events are historical, not navigational. For >50 events consider a windowing solution outside Timeline.",
		tokenBudget: 990,
	},
	tags: ["timeline", "feed", "activity", "audit-log", "history"],
};
