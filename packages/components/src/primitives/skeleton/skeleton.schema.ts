import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const skeletonSchema: ComponentSchemaDefinition = {
	name: "skeleton",
	displayName: "Skeleton",
	description: "A pulsing placeholder shown while content is loading. Pair with explicit dimensions.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{
			name: "className",
			type: "string",
			required: false,
			description: "Width/height and any additional styling via Tailwind classes",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted"],
	examples: [
		{
			title: "Card skeleton",
			description: "Avatar + two lines of text placeholder",
			code: '<div className="flex items-center gap-4">\n  <Skeleton className="h-12 w-12 rounded-full" />\n  <div className="space-y-2">\n    <Skeleton className="h-4 w-[250px]" />\n    <Skeleton className="h-4 w-[200px]" />\n  </div>\n</div>',
		},
	],
	ai: {
		whenToUse:
			"Use during async data loads to show the shape of forthcoming content. Match the dimensions and layout of the real content to avoid layout shift on load.",
		whenNotToUse:
			"Don't use for fast operations (<200ms — users prefer a brief spinner or nothing). Don't use as a permanent empty state (use proper empty-state UI).",
		commonMistakes: [
			"Skeleton dimensions don't match loaded content — causes layout shift",
			"Leaving Skeleton visible for long loads without a timeout/retry",
			"Using Skeleton for interactive elements users might tap",
		],
		relatedComponents: ["progress", "avatar", "card", "table"],
		accessibilityNotes:
			"Add aria-busy='true' on the loading container and a visually hidden status (aria-live='polite') to announce load completion to screen readers.",
		tokenBudget: 416,
	},
	tags: ["skeleton", "loading", "placeholder", "shimmer"],
};
