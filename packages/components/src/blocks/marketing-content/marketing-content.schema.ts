import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingContentSchema: ComponentSchemaDefinition = {
	name: "marketing-content",
	displayName: "MarketingContent",
	description:
		"A blog / content grid: an optional heading block above a responsive grid of content cards (preview image, meta, title, excerpt). Cards become a single linked surface when href is set. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "posts",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; excerpt?; href?; image?: ReactNode; meta? }>. Posts in display order. Set href to make the whole card a link to the article.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Cards per row on ≥lg: 'two' or 'three'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "Standard blog index — 6 or 9 cards." },
				{ value: "two", description: "Two across.", useWhen: "Longer excerpts or larger preview imagery." },
			],
		},
	],
	slots: [{ name: "posts[].image", description: "Preview image node.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "primary"],
	examples: [
		{
			title: "Blog index grid",
			description: "Three-up grid of linked posts with images and meta.",
			code: `import { MarketingContent } from "@hex-core/components";

<MarketingContent
  title="From the blog"
  description="Notes on shipping spec-driven UI."
  posts={[
    { title: "Page recipes, explained", excerpt: "Why we built a page-level recipe model.", href: "/blog/page-recipes", meta: "May 22 · 4 min read", image: <img src="/blog/recipes.jpg" alt="Page recipes hero" /> },
    { title: "Theming with semantic tokens", excerpt: "One swap, the whole site restyles.", href: "/blog/theming", meta: "May 14 · 6 min read", image: <img src="/blog/theming.jpg" alt="Theme cards" /> },
  ]}
/>`,
			composition: ["marketing", "content", "blog", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use on a /blog index, an about page's 'latest writing' section, or below the hero to surface fresh content. Three columns for short cards; two when excerpts are longer.",
		whenNotToUse:
			"Don't use for product features (use marketing-feature-grid) or product cards (use commerce-product-grid). Don't pad with stale posts to fill a row.",
		commonMistakes: [
			"Omitting alt on preview images, so the index isn't navigable by screen reader.",
			"Putting the meta as part of the title — keep it as a separate line so search results and feeds parse the title cleanly.",
			"Mixing aspect ratios — the card uses 16/10; supply consistently cropped previews.",
		],
		relatedComponents: ["marketing-feature-grid", "marketing-faq", "commerce-product-grid"],
		accessibilityNotes:
			"When href is set, the whole card is a single anchor with an accessible name from the title (and excerpt becomes adjacent text). When unset, the card renders as <article>. Images need alt text describing the preview.",
		tokenBudget: 650,
	},
	tags: ["block", "marketing", "content", "blog", "landing"],
};
