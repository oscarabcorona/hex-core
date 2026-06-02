import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const staggerSchema: ComponentSchemaDefinition = {
	name: "stagger",
	displayName: "Stagger",
	description:
		"Cascades the delays of motion-aware children. Each child receives an injected `transition.delay = initialDelay + index * gap`. Existing per-child delays are preserved (consumer intent wins on top of the cascade).",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "gap", type: "number", required: false, default: 60, description: "Per-child delay step in ms." },
		{ name: "initialDelay", type: "number", required: false, default: 0, description: "Delay before the first child." },
		{ name: "reverse", type: "boolean", required: false, default: false, description: "Reverse cascade order." },
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Motion-aware children to cascade.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion", "fade-in"],
		peer: ["react"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Cascade fade",
			description: "Three FadeIns cascade across 180ms.",
			code: "<Stagger gap={60}>\n  <FadeIn>One</FadeIn>\n  <FadeIn>Two</FadeIn>\n  <FadeIn>Three</FadeIn>\n</Stagger>",
		},
	],
	ai: {
		whenToUse:
			"Use to cascade a list of motion children — feature cards, nav links, list items — without writing per-child delay math.",
		whenNotToUse:
			"Don't use over non-motion children — the injected delay is ignored. Don't use over a single child — pass `delay` directly.",
		commonMistakes: [
			"Wrapping a non-motion element (a plain <div>) — the cascade no-ops without warning.",
			"Setting gap < 30ms — the cascade reads as a single fade rather than an ordered reveal.",
		],
		relatedComponents: ["fade-in", "slide-in", "scale-in", "motion"],
		accessibilityNotes:
			"Inherits children's reduced-motion behavior. Cascade collapses to instant when reduce is active.",
		tokenBudget: 556,
	},
	tags: ["motion", "stagger", "wrapper", "orchestration", "cascade"],
};
