import type { RecipeDefinition } from "../recipe-schema.js";

export const checkoutPageRecipe: RecipeDefinition = {
	slug: "checkout-page",
	kind: "page",
	pageType: "ecommerce",
	title: "Checkout page",
	summary:
		"Checkout page composed from the marketing header + commerce-checkout (form + order summary) + marketing footer.",
	tags: ["checkout", "ecommerce", "storefront", "page"],
	brief:
		"Build the checkout page: marketing-header for site nav, commerce-checkout as the body (form on the left, order summary on the right), and marketing-footer. Form submission and payment processing live with the consumer.",
	theme: { preset: "default", tokenBudget: 2800 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Storefront top nav.", role: "primary" },
		{ id: "checkout", block: "commerce-checkout", intent: "Checkout layout: form + order summary.", role: "primary" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, policies, social links.", role: "primary" },
	],
	layout:
		"Stack sections vertically. The body section (commerce-checkout) carries its own two-column layout (form left + summary right on ≥lg). Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. `import { CommerceCheckout } from \"@/components/ui/commerce-checkout\"`).",
	tokenBudget: 2800,
};
