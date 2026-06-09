import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const motionProSchema: ComponentSchemaDefinition = {
	name: "motion-pro",
	displayName: "Motion Pro",
	description:
		"Optional adapter that wraps `motion@^11`'s React API. Use only when the zero-dep core can't cover the need (layout/FLIP, drag gestures, shared-element transitions). Imported from `@hex-core/motion/adapters/motion`.",
	category: "motion",
	subcategory: "adapters",
	props: [],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: [],
		peer: ["react", "react-dom", "motion"],
		heavyPeer: [
			{
				name: "motion",
				version: "^11.0.0",
				bundleKbGzip: 35,
				reason:
					"Adapter wraps the motion package's React API for layout animations, drag gestures, and shared-element transitions.",
			},
		],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Lazy load adapter",
			description: "Async loader pattern.",
			code: 'import { loadMotionAdapter } from "@hex-core/motion/adapters/motion";\nconst { motion: MotionPro, AnimatePresence: PresencePro } = await loadMotionAdapter();\nreturn <MotionPro.div layout />;',
		},
	],
	ai: {
		whenToUse:
			"Use when you need motion@^11 specifics: `layout`, `LayoutGroup`, `Reorder`, drag gestures, or shared-element transitions.",
		whenNotToUse:
			"Don't reach for the adapter for hover/tap/mount animations — the zero-dep Motion in @hex-core/motion is enough and lighter.",
		commonMistakes: [
			"Importing both Motion (core) and MotionPro (adapter) on the same element — only one driver should own a given target.",
			"Forgetting to install `motion` as a peer — the adapter throws MotionAdapterMissingError at runtime.",
		],
		relatedComponents: ["motion", "presence"],
		accessibilityNotes:
			"motion@^11 also honors `prefers-reduced-motion`; align MotionConfig.reducedMotion across both layers.",
		tokenBudget: 374,
	},
	tags: ["motion", "adapter", "motion-pro", "layout", "gestures"],
};
