import type { RecipeDefinition } from "../recipe-schema.js";

export const storefrontPageRecipe: RecipeDefinition = {
	slug: "storefront-page",
	kind: "page",
	pageType: "ecommerce",
	title: "Storefront page",
	summary:
		"An ecommerce storefront composed from a site header, a product grid, a promo band, and a footer — reusing the marketing header/footer for chrome.",
	tags: ["ecommerce", "storefront", "store", "shop", "catalog", "page"],
	brief:
		"Build a shoppable storefront / category page: a marketing-header for site nav, a commerce-product-grid as the catalog, a marketing-cta promo band, and a marketing-footer. Product cards link to detail pages (commerce-product-detail), which in turn lead to commerce-cart and commerce-checkout. Keep colors on semantic tokens so the store restyles with the theme; product imagery is supplied by the consumer.",
	theme: { preset: "default", tokenBudget: 3600 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Storefront nav with brand, categories, and cart link.", role: "primary" },
		{ id: "products", block: "commerce-product-grid", intent: "The catalog — linked product cards.", role: "primary" },
		{ id: "promo", block: "marketing-cta", intent: "A promotional band (sale, newsletter, free shipping).", role: "optional" },
		{ id: "footer", block: "marketing-footer", intent: "Store navigation, policies, and social links.", role: "primary" },
	],
	layout:
		"Stack vertically in declared order inside a single page wrapper. Header first, footer last. The product grid is the body; drop the optional promo band when there's nothing to promote. Product cards (href set) navigate to commerce-product-detail; that page links onward to commerce-cart and commerce-checkout, which are separate routes rather than sections of this page. Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. import { CommerceProductGrid } from \"@/components/ui/commerce-product-grid\").",
	tokenBudget: 3600,
};
