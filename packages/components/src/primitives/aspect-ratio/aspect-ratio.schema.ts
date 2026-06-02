import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const aspectRatioSchema: ComponentSchemaDefinition = {
	name: "aspect-ratio",
	displayName: "Aspect Ratio",
	description: "Constrain children to a specific width-to-height ratio (e.g. 16/9 for video, 1/1 for square).",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "ratio",
			type: "number",
			required: false,
			default: 1,
			description: "Width-to-height ratio (e.g. 16/9 ≈ 1.778)",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Content to constrain (usually an image or iframe)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-aspect-ratio"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "16:9 video thumbnail",
			description: "Image constrained to widescreen ratio",
			code: '<AspectRatio ratio={16 / 9} className="bg-muted">\n  <img src="/hero.jpg" alt="Hero" className="h-full w-full rounded-md object-cover" />\n</AspectRatio>',
		},
	],
	ai: {
		whenToUse:
			"Use when an image or iframe must maintain a specific ratio regardless of container width: video thumbnails, product images, hero banners, embeds.",
		whenNotToUse:
			"Don't use for content with known fixed dimensions (just use width/height). Don't use for text content (ratios don't make sense for prose).",
		commonMistakes: [
			"Passing ratio as a string instead of a number (use {16/9}, not '16/9')",
			"Forgetting that children must fill 100% width + height (add object-cover or similar)",
		],
		relatedComponents: ["card", "avatar", "skeleton"],
		accessibilityNotes:
			"AspectRatio is purely structural. Ensure inner <img> has alt text and inner <iframe> has a descriptive title.",
		tokenBudget: 452,
	},
	tags: ["aspect-ratio", "layout", "image", "video", "ratio"],
};
