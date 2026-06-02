import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const fadeInSchema: ComponentSchemaDefinition = {
	name: "fade-in",
	displayName: "FadeIn",
	description:
		"Mount-time opacity 0 → 1 wrapper. Thinnest possible Motion.div invocation; same engine, same prefers-reduced-motion behavior, same easing tokens. Use as a building block for any fade.",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "duration", type: "number", required: false, description: "Duration in ms." },
		{ name: "delay", type: "number", required: false, description: "Delay before start, in ms." },
		{
			name: "easing",
			type: "enum",
			required: false,
			description: "Named easing token or CSS easing string.",
			enumValues: ["linear", "standard", "emphasized", "decelerate", "accelerate", "bounce"],
		},
		{ name: "as", type: "string", required: false, default: "div", description: "Host tag." },
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Content that fades in.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react"],
	},
	tokensUsed: ["duration-fast", "duration-normal", "ease-standard"],
	examples: [
		{
			title: "Mount fade",
			description: "Fades the wrapped element on mount.",
			code: '<FadeIn duration={300} easing="standard"><h1>Welcome</h1></FadeIn>',
		},
	],
	ai: {
		whenToUse:
			"Use when a single element should fade in on mount. Ideal building block under <Stagger> for cascading fades.",
		whenNotToUse:
			"Don't use for hover/tap or state-driven transitions — reach for <Motion.div> directly.",
		commonMistakes: [
			"Wrapping a static element that never re-renders — adds JS for no behavior.",
			"Stacking <FadeIn> over a parent that already fades — animations compound and look mushy.",
		],
		relatedComponents: ["motion", "stagger", "reveal-on-scroll"],
		accessibilityNotes:
			"Honors prefers-reduced-motion via the engine; collapses to instant render when reduce is active.",
		tokenBudget: 571,
	},
	tags: ["motion", "fade", "wrapper", "entry", "opacity"],
};
