import type { RecipeDefinition } from "../recipe-schema.js";

export const pricingPageRecipe: RecipeDefinition = {
	slug: "pricing-page",
	kind: "page",
	pageType: "landing",
	title: "Pricing page",
	summary:
		"A dedicated pricing page: header + hero (text-only intro) + pricing tiers + FAQ + closing CTA + footer.",
	tags: ["pricing", "marketing", "landing", "page"],
	brief:
		"Build a focused pricing page: marketing-header for nav, marketing-hero (text-only) introducing the pricing model, marketing-pricing as the tier grid (with one tier highlighted), marketing-faq for common pre-purchase questions, marketing-cta as a closing push, and marketing-footer.",
	theme: { preset: "default", tokenBudget: 3600 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Top nav with brand, links, and a primary CTA.", role: "primary" },
		{ id: "hero", block: "marketing-hero", intent: "Brief intro framing the pricing model.", role: "primary" },
		{ id: "pricing", block: "marketing-pricing", intent: "The plan tier grid, one tier highlighted.", role: "primary" },
		{ id: "faq", block: "marketing-faq", intent: "Pre-purchase questions (billing, trials, switching plans).", role: "supporting" },
		{ id: "cta", block: "marketing-cta", intent: "Closing push to convert undecided visitors.", role: "primary" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, policies, social links.", role: "primary" },
	],
	layout:
		"Stack sections vertically in declared order. The hero is text-only (no media) since the pricing grid is the visual focal point. Drop the FAQ section if there's nothing nuanced about the plans. Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. `import { MarketingPricing } from \"@/components/ui/marketing-pricing\"`).",
	tokenBudget: 3600,
};
