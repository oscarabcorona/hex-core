import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceReviewsSchema: ComponentSchemaDefinition = {
	name: "commerce-reviews",
	displayName: "CommerceReviews",
	description:
		"A product reviews section: a summary header (average rating + count) above a list of individual reviews, each with a star rating, author, optional date, and body. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "reviews",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ author; rating: number (0–5); title?; body; date? }>. Individual reviews. rating is clamped to 0–5 and rounded for the star display.",
		},
		{ name: "averageRating", type: "number", required: false, description: "Average rating (0–5) shown in the summary header." },
		{ name: "totalCount", type: "number", required: false, description: "Total review count shown in the summary header." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "border", "primary"],
	examples: [
		{
			title: "Reviews with an average summary",
			description: "Average rating header above two reviews.",
			code: `import { CommerceReviews } from "@hex-core/components";

<CommerceReviews
  averageRating={4.5}
  totalCount={128}
  reviews={[
    { author: "Jordan", rating: 5, title: "Perfect", body: "Exactly as described.", date: "Mar 2026" },
    { author: "Sam", rating: 4, body: "Great quality, runs slightly large.", date: "Feb 2026" },
  ]}
/>`,
			composition: ["commerce", "reviews", "ratings", "pdp"],
		},
	],
	ai: {
		whenToUse:
			"Use below the product detail to show social proof. Provide averageRating and totalCount for the summary header, and the individual reviews list.",
		whenNotToUse:
			"Don't use for testimonials on a marketing page (use marketing-testimonial). Don't fabricate ratings — derive them from real review data.",
		commonMistakes: [
			"Passing a rating outside 0–5 — it's clamped, but supply real values so the stars are accurate.",
			"Relying on star color alone to convey the rating — pair it with the numeric '4.5 out of 5' text (the summary does this).",
			"Omitting the author, leaving reviews unattributed.",
		],
		relatedComponents: ["commerce-product-detail", "commerce-product-grid", "marketing-testimonial"],
		accessibilityNotes:
			"Star rows are decorative (aria-hidden); the numeric 'X out of 5' text carries the rating for assistive tech. The section title is an <h2> and review titles are <h3>, preserving heading order.",
		tokenBudget: 650,
	},
	tags: ["block", "commerce", "reviews", "ratings", "pdp"],
};
