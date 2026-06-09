import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceIncentivesSchema: ComponentSchemaDefinition = {
	name: "commerce-incentives",
	displayName: "CommerceIncentives",
	description:
		"Value-prop band: a row of incentives (free shipping, returns, support, secure checkout) — each with an optional icon, title, and short body. Three or four columns. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "incentives",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; description?; icon?: ReactNode }>. The incentive cells. Icons are ReactNode — no icon set bundled.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Items per row on ≥lg: 'three' or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Items per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "Three headline policies (shipping, returns, support)." },
				{ value: "four", description: "Four across.", useWhen: "Four short policies that fit at smaller width." },
			],
		},
	],
	slots: [{ name: "incentives[].icon", description: "Per-item leading icon.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "Storefront value-prop band",
			description: "Three incentives under the product grid.",
			code: `import { CommerceIncentives } from "@hex-core/components";

<CommerceIncentives
  incentives={[
    { title: "Free shipping over $50", description: "On orders shipped within the US." },
    { title: "30-day returns", description: "Easy returns on everything, no questions asked." },
    { title: "Secure checkout", description: "Encrypted from cart to confirmation." },
  ]}
/>`,
			composition: ["commerce", "incentives", "trust", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use as a trust band on the storefront homepage, below the product grid, or just above the footer. Three columns reads best; four when policies are short.",
		whenNotToUse:
			"Don't use for product features (use commerce-product-features) or marketing claims (use marketing-feature-grid). Don't promise things you can't deliver — keep the copy accurate.",
		commonMistakes: [
			"Passing an <img> as an icon — the icon well is sized for a glyph (size-5); use an SVG.",
			"Long-paragraph descriptions — one short line keeps the band scannable.",
			"Mixing tone (formal + casual) across items — pick one voice.",
		],
		relatedComponents: ["commerce-product-grid", "marketing-feature-grid", "marketing-footer"],
		accessibilityNotes:
			"Each cell title renders as <h3>. Decorative icons are presentational; if an icon conveys meaning (e.g. a shipping truck), the adjacent title text carries the meaning.",
		tokenBudget: 909,
	},
	tags: ["block", "commerce", "incentives", "trust", "storefront"],
};
