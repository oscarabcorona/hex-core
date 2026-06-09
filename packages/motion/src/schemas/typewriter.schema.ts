import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const typewriterSchema: ComponentSchemaDefinition = {
	name: "typewriter",
	displayName: "Typewriter",
	description:
		"Reveals text character-by-character using the active MotionConfig clock. Doesn't go through the WAAPI driver (the animation is text content, not a CSS property). Optional blinking cursor while typing.",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "text", type: "string", required: true, description: "Full text to reveal." },
		{ name: "speed", type: "number", required: false, default: 40, description: "Milliseconds per character." },
		{ name: "delay", type: "number", required: false, default: 0, description: "Delay before the first character." },
		{ name: "cursor", type: "boolean", required: false, default: true, description: "Show a blinking cursor while typing." },
		{ name: "cursorChar", type: "string", required: false, description: "Cursor glyph." },
		{ name: "onDone", type: "function", required: false, description: "Called once when typing reaches the end." },
		{ name: "as", type: "enum", required: false, default: "span", description: "Render tag.", enumValues: ["span", "div", "p", "strong"] },
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Hero subhead",
			description: "Subhead types itself in.",
			code: '<Typewriter text="Spec-driven UI for AI agents." speed={30} />',
		},
	],
	ai: {
		whenToUse:
			"Use for hero subheads, AI assistant message reveals, terminal prompts — any place a typing cadence reinforces 'something is being authored'.",
		whenNotToUse:
			"Don't use for paragraphs > 100 chars — the wait becomes annoying. Don't use for navigation labels.",
		commonMistakes: [
			"Putting typewritten text in a flexbox row — the line wraps mid-character. Wrap in a fixed-height container.",
			"Speed < 20ms looks like a teleport. ≥ 30ms is the floor for human-paced typing.",
		],
		relatedComponents: ["motion", "fade-in"],
		accessibilityNotes:
			"Reduced-motion snaps to the full string immediately, still firing onDone. Add aria-live='polite' if the text reveals on user action so screen readers re-announce.",
		tokenBudget: 659,
	},
	tags: ["motion", "typewriter", "wrapper", "text", "reveal"],
};
