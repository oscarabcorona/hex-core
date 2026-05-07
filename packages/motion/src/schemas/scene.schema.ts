import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sceneSchema: ComponentSchemaDefinition = {
	name: "scene",
	displayName: "Scene",
	description:
		"A time window inside a Timeline. Children's Clip `start` props are interpreted relative to this scene's `start`. Renders no DOM — purely defines the time context.",
	category: "motion",
	subcategory: "timeline",
	props: [
		{
			name: "start",
			type: "number",
			required: true,
			description: "Absolute start time in the parent timeline, in ms.",
		},
		{
			name: "duration",
			type: "number",
			required: true,
			description: "Length of the scene in ms.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "<Clip> nodes (or nested <Scene> nodes).",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: ["motion-timeline"],
		peer: ["react"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Sequential scenes",
			description: "Two scenes back-to-back inside one timeline.",
			code: '<Scene start={0} duration={500}><Clip target="#a" to={{ opacity: 1 }} /></Scene>\n<Scene start={500} duration={500}><Clip target="#b" to={{ opacity: 1 }} /></Scene>',
		},
	],
	ai: {
		whenToUse:
			"Use to group clips that share a time window. Useful for staged sequences (intro / body / outro) and for keeping per-clip `start` values small.",
		whenNotToUse:
			"Don't use as the only direct child of Timeline if you have one clip — drop the Scene and put the Clip directly inside.",
		commonMistakes: [
			"Overlapping scenes that animate the same target with conflicting `to` values — the later animation will cancel the earlier one mid-flight.",
		],
		relatedComponents: ["motion-timeline", "clip", "track"],
		accessibilityNotes:
			"Inherits the Timeline's reduced-motion behavior.",
		tokenBudget: 180,
	},
	tags: ["motion", "timeline", "scene", "composer"],
};
