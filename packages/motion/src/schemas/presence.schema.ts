import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const presenceSchema: ComponentSchemaDefinition = {
	name: "presence",
	displayName: "Presence",
	description:
		"Defers child unmount until the child's `exit` animation completes. Tracks children by `key`; works with any Motion.* element.",
	category: "motion",
	subcategory: "primitives",
	props: [
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Keyed children. Each child should be a Motion.* element with an `exit` prop.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Keyed Motion children whose `exit` runs before unmount.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["duration-normal"],
	examples: [
		{
			title: "Toast list",
			description: "Toasts fade out before they're removed from the DOM.",
			code: '<Presence>\n  {toasts.map((t) => (\n    <Motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t.text}</Motion.div>\n  ))}\n</Presence>',
		},
	],
	ai: {
		whenToUse:
			"Use any time conditionally rendered children need an exit animation — toasts, dialogs, list-item removals, route transitions.",
		whenNotToUse:
			"Don't use for static or always-present children — Presence does nothing useful there and adds reconciliation work.",
		commonMistakes: [
			"Forgetting `key` on children — without keys Presence can't tell adds from removes.",
			"Using <Presence> around a wrapper that itself never changes; the conditional must be at the direct child level.",
		],
		relatedComponents: ["motion", "transition"],
		accessibilityNotes:
			"Exit animations honor `prefers-reduced-motion` and collapse to instant removal when reduce is active.",
		tokenBudget: 436,
	},
	tags: ["motion", "animation", "presence", "exit", "unmount"],
};
