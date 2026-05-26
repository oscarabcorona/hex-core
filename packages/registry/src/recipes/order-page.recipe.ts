import type { RecipeDefinition } from "../recipe-schema.js";

export const orderPageRecipe: RecipeDefinition = {
	slug: "order-page",
	kind: "page",
	pageType: "ecommerce",
	title: "Order page",
	summary:
		"Order confirmation / detail page composed from the storefront chrome + commerce-order-summary + an optional follow-up CTA + footer.",
	tags: ["order", "confirmation", "ecommerce", "storefront", "page"],
	brief:
		"Build the order confirmation / receipt page: marketing-header for site nav, commerce-order-summary as the body (line items + totals + status), an optional marketing-cta band for follow-up (review request, related products), and marketing-footer. Status / meta and totals are read-only — submission lives at checkout.",
	theme: { preset: "default", tokenBudget: 3200 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Storefront top nav with brand + categories + cart.", role: "primary" },
		{ id: "order", block: "commerce-order-summary", intent: "Read-only order detail: items + totals + status + meta.", role: "primary" },
		{ id: "follow-up", block: "marketing-cta", intent: "Optional follow-up nudge (review request, keep shopping).", role: "optional" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, policies, social links.", role: "primary" },
	],
	layout:
		"Stack sections vertically in declared order inside a single page wrapper. Drop the follow-up CTA when there's nothing to promote. Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. `import { CommerceOrderSummary } from \"@/components/ui/commerce-order-summary\"`).",
	tokenBudget: 3200,
};
