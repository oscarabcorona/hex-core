import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingStatsSchema: ComponentSchemaDefinition = {
	name: "marketing-stats",
	displayName: "MarketingStats",
	description:
		"A marketing stats band: an optional heading above a grid of big-number tiles (value, label, optional context). Distinct from app-stats — no change deltas, larger typography, designed for landing-page 'by the numbers' sections. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "stats",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ value; label; description? }>. The tiles. value is the big number, label is the short label under it, optional description is a one-line context.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Tiles per row on ≥lg: 'three' or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Tiles per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "Three headline metrics, the default." },
				{ value: "four", description: "Four across.", useWhen: "Four short metrics that fit at smaller width." },
			],
		},
	],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary"],
	examples: [
		{
			title: "By-the-numbers band",
			description: "Three big-number tiles below the hero.",
			code: `import { MarketingStats } from "@hex-core/components";

<MarketingStats
  eyebrow="By the numbers"
  title="Teams that ship faster"
  stats={[
    { value: "12,480", label: "Active teams", description: "Across 64 countries." },
    { value: "$48M", label: "Shipped value", description: "Revenue unlocked." },
    { value: "99.9%", label: "Uptime", description: "Last 12 months." },
  ]}
/>`,
			composition: ["marketing", "stats", "social-proof", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use below the hero or features to show 'by the numbers' impact (customer count, scale, uptime). Three big numbers read best; four when the metrics are shorter.",
		whenNotToUse:
			"Don't use for in-app KPIs (use app-stats — has change deltas). Don't fabricate numbers — surface real metrics.",
		commonMistakes: [
			"Padding labels with the metric type (e.g. 'Active users (count)') — the value carries the meaning, the label stays short.",
			"Stuffing 5+ tiles into 'three' columns — use 'four' or split into two sections.",
			"Using app-stats-style change deltas — marketing-stats is for static milestones, not trending metrics.",
		],
		relatedComponents: ["app-stats", "marketing-feature-grid", "marketing-logo-cloud"],
		accessibilityNotes:
			"Renders a <dl> with each tile as a <dt>/<dd> pair, so screen readers parse 'label / value' associations. The value uses 'order-first' on flex to render visually above the label while keeping the semantic dt→dd order.",
		tokenBudget: 600,
	},
	tags: ["block", "marketing", "stats", "metrics", "social-proof", "landing"],
};
