import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appFeedSchema: ComponentSchemaDefinition = {
	name: "app-feed",
	displayName: "AppFeed",
	description:
		"Chronological activity feed, grouped by day. Each event shows a leading icon on a vertical rail, an actor + message line, optional time, and optional details. Presentational and theme-driven — sort events yourself before passing them in.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "groups",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ date; events: { message; actor?; time?; details?; icon? }[] }>. Day-grouped events; sort newest-first by convention.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "events[].icon", description: "Per-event leading icon / status dot.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "events[].details", description: "Optional per-event detail card.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "card", "card-foreground", "border"],
	examples: [
		{
			title: "Activity feed grouped by day",
			description: "Two days of events with actor, message, and time.",
			code: `import { AppFeed } from "@hex-core/components";

<AppFeed
  title="Activity"
  groups={[
    {
      date: "Today",
      events: [
        { actor: "Ada Lovelace", message: "merged pull request #42", time: "9:42 AM" },
        { actor: "Alan Turing", message: "commented on issue #18", time: "8:11 AM" },
      ],
    },
    {
      date: "May 21",
      events: [
        { actor: "Grace Hopper", message: "deployed to production", time: "4:55 PM" },
      ],
    },
  ]}
/>`,
			composition: ["app", "feed", "activity", "timeline", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use to show recent events: commits, deploys, mentions, audit log entries. Group by day so the rail reads as a timeline. Sort events within a group newest-first; sort groups newest-first too.",
		whenNotToUse:
			"Don't use for tabular audit logs that need filtering / column sort (use app-data-table). Don't use for navigation lists (use app-stacked-list).",
		commonMistakes: [
			"Mixing chronological order — events out of order break the day-grouped affordance.",
			"Long detail blocks that dominate the timeline — keep details to ~3 lines or move to a dedicated event detail page.",
			"No empty state — render <Empty> when groups is [].",
		],
		relatedComponents: ["app-stacked-list", "app-grid-list", "timeline", "empty"],
		accessibilityNotes:
			"Each group renders an <ol> for the chronological list. Leading icons are aria-hidden — the actor + message text carries the meaning. The vertical rail is purely decorative (border-l) and not announced.",
		tokenBudget: 650,
	},
	tags: ["block", "app", "feed", "activity", "timeline", "dashboard"],
};
