import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingTestimonialSchema: ComponentSchemaDefinition = {
	name: "marketing-testimonial",
	displayName: "MarketingTestimonial",
	description:
		"A testimonials section. 'single' features one large centered quote; 'grid' lays out several quote cards with author + avatar. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "testimonials",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ quote; authorName; authorTitle?; avatar? }>. In 'single' layout only the first is shown; in 'grid' all are rendered as cards. Avatars are ReactNode (Avatar or img) — none is bundled.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title (grid layout)." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading (grid layout)." },
		{
			name: "layout",
			type: "enum",
			required: false,
			default: "single",
			description: "'single' for one large featured quote, 'grid' for a card grid.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "layout",
			description: "Testimonial composition.",
			default: "single",
			values: [
				{ value: "single", description: "One large centered quote.", useWhen: "You have one strong, high-trust quote to feature." },
				{ value: "grid", description: "A grid of quote cards.", useWhen: "You have several shorter quotes to show as social proof." },
			],
		},
	],
	slots: [{ name: "testimonials[].avatar", description: "Author avatar.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "card", "card-foreground", "border", "primary"],
	examples: [
		{
			title: "Featured single quote",
			description: "One large centered testimonial with author and avatar.",
			code: `import { MarketingTestimonial } from "@hex-core/components";
import { Avatar, AvatarImage, AvatarFallback } from "@hex-core/components";

<MarketingTestimonial
  testimonials={[
    {
      quote: "Hex cut our design-to-ship time in half.",
      authorName: "Jordan Lee",
      authorTitle: "Head of Design, Acme",
      avatar: <Avatar><AvatarImage src="/jordan.jpg" alt="" /><AvatarFallback>JL</AvatarFallback></Avatar>,
    },
  ]}
/>`,
			composition: ["marketing", "testimonial", "social-proof", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use to add social proof below features or pricing. 'single' for one high-trust quote; 'grid' for several shorter quotes.",
		whenNotToUse:
			"Don't use for logo-only social proof (use marketing-logo-cloud) or for case-study long-form content. Don't fabricate quotes.",
		commonMistakes: [
			"Using 'grid' layout with a single testimonial — leaves a lopsided row; use 'single'.",
			"Putting the author name inside the quote text instead of authorName, which breaks the figure/figcaption structure.",
			"Avatars with no empty alt — decorative avatars should have alt=\"\" since the name is already in text.",
		],
		relatedComponents: ["avatar", "marketing-logo-cloud", "marketing-feature-grid", "card"],
		accessibilityNotes:
			"Each testimonial is a <figure> with the attribution in <figcaption>, so the quote and its author are programmatically associated. Avatars are decorative (the name is text) and should carry empty alt.",
		tokenBudget: 650,
	},
	tags: ["block", "marketing", "testimonial", "social-proof", "landing"],
};
