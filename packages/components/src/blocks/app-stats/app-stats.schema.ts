import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appStatsSchema: ComponentSchemaDefinition = {
	name: "app-stats",
	displayName: "AppStats",
	description:
		"A row of KPI stat cards: label, value, and an optional colored delta with a directional caret (increase / decrease / neutral). Two, three, or four columns. Presentational and theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "stats",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ label; value; change?; changeType?: 'increase'|'decrease'|'neutral'; icon? }>. The metric cards. changeType colors the delta and picks its caret.",
		},
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "four",
			description: "Card count per row on ≥lg: 'two', 'three', or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root grid." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "four",
			values: [
				{ value: "four", description: "Four across.", useWhen: "Four headline KPIs on a wide dashboard." },
				{ value: "three", description: "Three across.", useWhen: "Three primary metrics." },
				{ value: "two", description: "Two across.", useWhen: "Two metrics, or a narrow content column." },
			],
		},
	],
	slots: [{ name: "stats[].icon", description: "Per-stat leading icon.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "card", "card-foreground", "border", "primary", "destructive"],
	examples: [
		{
			title: "Four KPI cards with deltas",
			description: "Headline metrics with colored change indicators.",
			code: `import { AppStats } from "@hex-core/components";

<AppStats
  stats={[
    { label: "Revenue", value: "$48.2k", change: "+12%", changeType: "increase" },
    { label: "Active users", value: "12,480", change: "+4%", changeType: "increase" },
    { label: "Churn", value: "1.8%", change: "-0.3%", changeType: "decrease" },
    { label: "Open tickets", value: "37", change: "0%", changeType: "neutral" },
  ]}
/>`,
			composition: ["app", "stats", "kpi", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use at the top of a dashboard to surface headline KPIs. Match the columns count to the number of stats. Set changeType so deltas read as good/bad at a glance.",
		whenNotToUse:
			"Don't use for a single metric (use plain text) or for time-series data (use a chart artifact). Don't pack more than four cards per row.",
		commonMistakes: [
			"Relying on color alone for increase/decrease — the caret direction and the sign in the change text both encode it, so keep the sign (e.g. '-0.3%').",
			"Setting changeType='increase' for a metric where down is good (e.g. churn) — pick the type by sentiment, not arithmetic.",
			"Mismatched columns and stat count, leaving a ragged row.",
		],
		relatedComponents: ["app-shell", "card", "app-data-table", "funnel"],
		accessibilityNotes:
			"Deltas don't rely on color alone: a directional caret plus the signed change text convey direction. Carets are aria-hidden. Values and labels are plain text, read in source order.",
		tokenBudget: 650,
	},
	tags: ["block", "app", "stats", "kpi", "dashboard", "metrics"],
};
