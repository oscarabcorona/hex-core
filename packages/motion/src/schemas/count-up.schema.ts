import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const countUpSchema: ComponentSchemaDefinition = {
	name: "count-up",
	displayName: "CountUp",
	description:
		"Numeric tween — animates a number from `from` to `to` over `duration` using the active MotionConfig clock. Pluggable formatter for currency, percent, compact units.",
	category: "motion",
	subcategory: "wrapper",
	props: [
		{ name: "from", type: "number", required: false, default: 0, description: "Starting number." },
		{ name: "to", type: "number", required: true, description: "Target number." },
		{ name: "duration", type: "number", required: false, description: "Tween duration in ms." },
		{ name: "delay", type: "number", required: false, description: "Delay before the tween starts." },
		{
			name: "easing",
			type: "enum",
			required: false,
			description: "Named easing or CSS easing string.",
			enumValues: ["linear", "standard", "emphasized", "decelerate", "accelerate", "bounce"],
		},
		{ name: "format", type: "function", required: false, description: "Custom formatter (value: number) => string." },
		{ name: "decimals", type: "number", required: false, default: 0, description: "Decimal places when no formatter." },
		{ name: "as", type: "enum", required: false, default: "span", description: "Render-as tag.", enumValues: ["span", "div", "strong", "b"] },
		{ name: "className", type: "string", required: false, description: "Element class name." },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react"],
	},
	tokensUsed: ["duration-slow", "ease-emphasized"],
	examples: [
		{
			title: "Stat tile",
			description: "Animate from 0 to 1.2M with locale grouping.",
			code: '<CountUp to={1_200_000} duration={1200} format={(v) => v.toLocaleString()} />',
		},
	],
	ai: {
		whenToUse:
			"Use for stat tiles, percentage readouts, gamified scores — any number that benefits from visible counting.",
		whenNotToUse:
			"Don't use for live data (stock tickers) — the tween masks the actual change. Don't use for tiny diffs (<5) — the animation finishes before the user notices it started.",
		commonMistakes: [
			"Forgetting to memoize the `format` callback — the tween restarts every render.",
			"Setting duration > 2000ms — feels artificial; users tune out.",
		],
		relatedComponents: ["motion", "reveal-on-scroll"],
		accessibilityNotes:
			"Reduced-motion snaps to the final value immediately. Wrap in role='status' aria-live='polite' if the value updates dynamically.",
		tokenBudget: 730,
	},
	tags: ["motion", "count-up", "wrapper", "tween", "numeric"],
};
