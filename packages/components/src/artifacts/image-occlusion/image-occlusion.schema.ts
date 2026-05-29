import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const imageOcclusionSchema: ComponentSchemaDefinition = {
	name: "image-occlusion",
	displayName: "ImageOcclusion",
	description:
		"Image with rectangular regions hidden behind opaque overlays. Click any region to reveal what's underneath. Pure HTML; no heavy peer. Coordinates are 0–1 fractions so the layout stays correct at any rendered size.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "src",
			type: "string",
			required: true,
			description: "Image source URL.",
		},
		{
			name: "alt",
			type: "string",
			required: true,
			description: "Alt text for the underlying image.",
		},
		{
			name: "regions",
			type: "object",
			required: true,
			description:
				"Array of { id, x, y, width, height, label? }. All coords are 0–1 fractions of the rendered image.",
		},
		{
			name: "onRegionReveal",
			type: "function",
			required: false,
			description: "Called with the region id when a region is revealed (NOT when hidden again).",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the outer container.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "ring"],
	examples: [
		{
			title: "Anatomy diagram",
			description: "Heart cross-section with named chambers occluded.",
			code:
				'<ImageOcclusion\n  src="/anatomy/heart.png"\n  alt="Cross-section of a human heart"\n  regions={[\n    { id: "lv", x: 0.42, y: 0.55, width: 0.18, height: 0.22, label: "Left ventricle" },\n    { id: "ra", x: 0.58, y: 0.20, width: 0.16, height: 0.18, label: "Right atrium" },\n  ]}\n/>',
			composition: ["image-occlusion", "anatomy"],
		},
		{
			title: "Code snippet with redacted operators",
			description: "Hide language operators and have the learner reveal them.",
			code:
				'<ImageOcclusion\n  src="/code/snippet.png"\n  alt="JavaScript array map"\n  regions={[\n    { id: "op1", x: 0.30, y: 0.10, width: 0.05, height: 0.08 },\n  ]}\n  onRegionReveal={(id) => track(id)}\n/>',
			composition: ["image-occlusion", "code"],
		},
	],
	ai: {
		whenToUse:
			"Hide labels or sub-regions of a visual the learner needs to recall. Anatomy diagrams, geographic maps, code snippets, anatomical illustrations, mathematical figures — any image where the recall target is a region rather than the whole.",
		whenNotToUse:
			"Don't use for text-only fill-in-the-blank (use Cloze). Don't use when the entire image is the answer (use Flashcard with the image on `back`). Don't use when regions overlap heavily — overlapping overlays interfere with click targets.",
		commonMistakes: [
			"Passing pixel coordinates instead of fractions — `x: 168` instead of `x: 0.42`. The component warns in dev when any region's coords escape [0, 1]",
			"Region rectangles smaller than ~20px square — too tiny to hit on touch devices. Aim for ≥40 × 40px at the rendered image size",
			"Heavily overlapping regions — later array entries get higher z-index and catch the click; regions earlier in the array are visible but unclickable underneath. Order regions back-to-front (largest/outermost first, smallest/innermost last)",
			"Mutating the regions array between renders — react re-runs reveal state, but the input identity matters for any downstream memoization. Memoize the regions array",
		],
		relatedComponents: ["flashcard", "cloze", "quiz", "deck", "spaced-repetition"],
		accessibilityNotes:
			"Each overlay is a real <button> with type=\"button\", aria-pressed reflecting reveal state, and an aria-label that names the region's index, total, and label (when provided). The underlying <img> carries the user-supplied alt text. The decorative overlay container is aria-hidden so screen readers don't double-announce regions.",
		tokenBudget: 1032,
	},
	tags: ["artifact", "study", "image-occlusion", "active-recall", "visual"],
};
