import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const clipSchema: ComponentSchemaDefinition = {
	name: "clip",
	displayName: "Clip",
	description:
		"A single animation segment inside a Timeline/Scene. Targets a CSS selector and animates from `from` → `to` over `duration`. Renders nothing.",
	category: "motion",
	subcategory: "timeline",
	props: [
		{
			name: "target",
			type: "string",
			required: true,
			description: "CSS selector for the element to animate.",
		},
		{
			name: "from",
			type: "object",
			required: false,
			description: "Starting AnimateProps. Defaults to {} (no inferred initial).",
		},
		{
			name: "to",
			type: "object",
			required: true,
			description: "Target AnimateProps.",
		},
		{
			name: "start",
			type: "number",
			required: false,
			description: "Offset within the parent Scene (ms). Defaults to 0.",
		},
		{
			name: "duration",
			type: "number",
			required: false,
			description: "Length of the clip in ms. Defaults to the parent Scene's duration.",
		},
		{
			name: "track",
			type: "string",
			required: false,
			description: "Optional track name for grouping/labeling parallel clips.",
		},
		{
			name: "easing",
			type: "enum",
			required: false,
			description: "Named easing token or CSS easing string.",
			enumValues: ["linear", "standard", "emphasized", "decelerate", "accelerate", "bounce"],
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion-timeline", "scene"],
		peer: ["react"],
	},
	tokensUsed: ["ease-standard", "ease-emphasized"],
	examples: [
		{
			title: "Fade and slide",
			description: "Element fades in while sliding up.",
			code: '<Clip target="#hero" from={{ opacity: 0, y: 24 }} to={{ opacity: 1, y: 0 }} easing="emphasized" />',
		},
	],
	ai: {
		whenToUse:
			"Use as the leaf node of a Timeline tree. Each Clip describes one animation against one target.",
		whenNotToUse:
			"Don't use outside <Timeline> — it relies on the timeline context to register and play.",
		commonMistakes: [
			"Omitting `from` and expecting an inferred initial — the engine treats undefined as the element's current style, which can flicker.",
			"Using non-unique selectors that match multiple elements — only the first match is animated.",
		],
		relatedComponents: ["motion-timeline", "scene", "track"],
		accessibilityNotes:
			"Inherits the Timeline's reduced-motion behavior.",
		tokenBudget: 624,
	},
	tags: ["motion", "timeline", "clip", "composer"],
};
