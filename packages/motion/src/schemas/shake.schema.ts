import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const shakeSchema: ComponentSchemaDefinition = {
	name: "shake",
	displayName: "Shake",
	description:
		"Shake-on-trigger primitive — typical use is form-error feedback. Pass a `trigger` value that bumps when you want the shake to fire (an error count, a timestamp). 5-keyframe horizontal jitter.",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "trigger", type: "string", required: false, description: "Any value change re-fires the shake." },
		{ name: "intensity", type: "number", required: false, default: 6, description: "Translation amplitude in px." },
		{ name: "duration", type: "number", required: false, default: 400, description: "Total shake duration in ms." },
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Element that shakes on trigger change.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Error feedback",
			description: "Shake the form when validation fails.",
			code: "const [errors, setErrors] = useState(0);\n<Shake trigger={errors}><InputField /></Shake>",
		},
	],
	ai: {
		whenToUse:
			"Use for password mismatch, invalid input, OTP failure — situations where the user's input was wrong and they need to try again.",
		whenNotToUse:
			"Don't use for success states (toasts, confirmations) — shake reads as 'something is broken'. Don't use for non-error attention; reach for <Pulse>.",
		commonMistakes: [
			"Shaking on every keystroke — debounce until validation actually fails.",
			"Using a boolean trigger that only flips once — shake fires only once. Use a counter that increments per error.",
		],
		relatedComponents: ["motion", "pulse"],
		accessibilityNotes:
			"Reduced-motion mode no-ops — pair with an aria-live='assertive' message so screen-reader users still get the error feedback.",
		tokenBudget: 220,
	},
	tags: ["motion", "shake", "wrapper", "feedback", "error"],
};
