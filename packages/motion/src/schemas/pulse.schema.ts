import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const pulseSchema: ComponentSchemaDefinition = {
	name: "pulse",
	displayName: "Pulse",
	description:
		"Infinite scale pulse for attention-seeking UI: notification dots, hint buttons before first interaction, beating CTA hearts. Honors prefers-reduced-motion (animation never starts when reduce is active).",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "intensity", type: "number", required: false, default: 0.05, description: "Scale delta at apex." },
		{ name: "duration", type: "number", required: false, default: 1500, description: "Cycle duration in ms." },
		{
			name: "easing",
			type: "enum",
			required: false,
			description: "Named easing or CSS easing string.",
			enumValues: ["linear", "standard", "emphasized", "decelerate", "accelerate", "bounce"],
		},
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Content that pulses.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react"],
	},
	tokensUsed: ["duration-slow"],
	examples: [
		{
			title: "Notification dot",
			description: "Slowly pulsing red dot on a navbar icon.",
			code: '<Pulse intensity={0.08}><span className="bg-destructive size-2 rounded-full" /></Pulse>',
		},
	],
	ai: {
		whenToUse:
			"Use for unread-state badges, hint buttons, or 'click here' prompts — anything that must draw the eye without taking focus.",
		whenNotToUse:
			"Don't use on text — the rescale blurs glyph edges. Don't use multiple Pulses on the same screen — they compete for attention and lose effect.",
		commonMistakes: [
			"Intensity > 0.15 looks like a malfunction; cap at 0.1.",
			"Wrapping a focusable element — the pulsing scale can disorient keyboard users; pulse the parent container or a sibling indicator.",
		],
		relatedComponents: ["motion", "shake", "bounce"],
		accessibilityNotes:
			"Animation is suppressed under prefers-reduced-motion, so the visual hint goes away — pair with an aria-live or visible label for users who rely on it.",
		tokenBudget: 220,
	},
	tags: ["motion", "pulse", "wrapper", "loop", "attention"],
};
