import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const useAnimateSchema: ComponentSchemaDefinition = {
	name: "use-animate",
	displayName: "useAnimate",
	description:
		"Imperative animate hook. Returns `[scope, animate]` — `scope` is a ref to attach to a wrapper, `animate(target, to, transition)` runs an animation and returns a controllable handle with a `finished` Promise.",
	category: "motion",
	subcategory: "hooks",
	props: [],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: [],
		peer: ["react"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Chained sequence",
			description: "Two animations from a click handler.",
			code: 'const [scope, animate] = useAnimate();\nconst onClick = async () => {\n  await animate(scope.current, { x: 100 }, { duration: 200 }).finished;\n  await animate(scope.current, { x: 0 }, { duration: 200 }).finished;\n};\nreturn <button ref={scope} onClick={onClick}>Bounce</button>;',
		},
	],
	ai: {
		whenToUse:
			"Use when an animation should fire from an event handler or async sequence — not on every render. Ideal for chained or conditional sequences.",
		whenNotToUse:
			"Don't use for declarative mount/unmount animations — Motion + Presence are simpler and integrate with React's lifecycle.",
		commonMistakes: [
			"Calling animate() during render instead of from a handler/effect — causes the animation to re-fire on every re-render.",
			"Forgetting to await `.finished` when chaining; the next animation cancels the previous mid-flight.",
		],
		relatedComponents: ["motion", "transition"],
		accessibilityNotes:
			"Honors `prefers-reduced-motion` via the active MotionConfig.",
		tokenBudget: 220,
	},
	tags: ["motion", "hook", "imperative", "useAnimate"],
};
