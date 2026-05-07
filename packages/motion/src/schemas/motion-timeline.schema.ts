import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const motionTimelineSchema: ComponentSchemaDefinition = {
	name: "motion-timeline",
	displayName: "Motion Timeline",
	description:
		"Deterministic scene composer for multi-step UI sequences. Imported from `@hex-core/motion/timeline`. NOT for video export — no FFmpeg, no MP4. Children are <Scene> and <Clip>. Slug is `motion-timeline` to avoid colliding with the existing chronological-event `timeline` component.",
	category: "motion",
	subcategory: "timeline",
	props: [
		{
			name: "duration",
			type: "number",
			required: true,
			description: "Total duration of the timeline in milliseconds.",
		},
		{
			name: "autoPlay",
			type: "boolean",
			required: false,
			default: false,
			description: "Start playing immediately on mount.",
		},
		{
			name: "loop",
			type: "boolean",
			required: false,
			default: false,
			description: "Restart from 0 after reaching `duration`.",
		},
		{
			name: "onTick",
			type: "function",
			required: false,
			description: "Called on each frame with the current time `(t: number) => void`.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "<Scene> and <Clip> nodes that describe the timeline.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@hex-core/motion"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["duration-normal"],
	examples: [
		{
			title: "Two-clip intro",
			description: "Title fades in, CTA slides up shortly after.",
			code: '<Timeline duration={2000} autoPlay>\n  <Scene start={0} duration={800}>\n    <Clip target="#title" from={{ opacity: 0 }} to={{ opacity: 1 }} />\n  </Scene>\n  <Scene start={600} duration={1400}>\n    <Clip target="#cta" from={{ y: 24 }} to={{ y: 0 }} easing="emphasized" />\n  </Scene>\n</Timeline>',
		},
	],
	ai: {
		whenToUse:
			"Use to script multi-step UI sequences agents can author and humans can read at a glance. Same input always renders identically.",
		whenNotToUse:
			"Don't use for video output — this is a UI motion composer, not Remotion/hyperframes. Don't use for one-shot animations — Motion is simpler.",
		commonMistakes: [
			"Targeting elements with selectors that don't exist yet — clips silently skip non-matches.",
			"Mixing imperative useAnimate calls on the same target — the timeline driver will overwrite them.",
		],
		relatedComponents: ["scene", "clip", "track", "motion"],
		accessibilityNotes:
			"Respects `prefers-reduced-motion`; with reduce active all clips collapse to their `to` state immediately.",
		tokenBudget: 350,
	},
	tags: ["motion", "timeline", "composer", "scene", "deterministic"],
};
