import type { RecipeDefinition } from "../recipe-schema.js";

export const productPageRecipe: RecipeDefinition = {
	slug: "product-page",
	kind: "page",
	pageType: "ecommerce",
	title: "Product page",
	summary:
		"Product detail (PDP) composed from the storefront header + commerce-product-detail + commerce-product-features + commerce-reviews + optional closing CTA + footer.",
	tags: ["product", "pdp", "ecommerce", "storefront", "page"],
	brief:
		"Build the product detail page (PDP): marketing-header for storefront nav, commerce-product-detail for the gallery + name + price + add-to-cart, commerce-product-features for the materials / construction spotlight, commerce-reviews for social proof, an optional marketing-cta closing band (gift card, cross-sell), and marketing-footer.",
	theme: { preset: "default", tokenBudget: 4200 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Storefront top nav with brand + categories + cart.", role: "primary" },
		{ id: "detail", block: "commerce-product-detail", intent: "Gallery + name + price + options + add-to-cart.", role: "primary" },
		{ id: "features", block: "commerce-product-features", intent: "Materials / construction / signature details.", role: "supporting" },
		{ id: "reviews", block: "commerce-reviews", intent: "Star summary + individual reviews — social proof.", role: "supporting" },
		{ id: "cta", block: "marketing-cta", intent: "Optional closing nudge (cross-sell, gift card).", role: "optional" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, policies, social links.", role: "primary" },
	],
	layout:
		"Stack sections vertically in declared order — the PDP scrolls top-to-bottom. Detail first (above the fold), then features, then reviews. Drop the closing CTA when there's nothing relevant to promote. Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. `import { CommerceProductDetail } from \"@/components/ui/commerce-product-detail\"`).",
	tokenBudget: 4200,
};
