import type { RecipeDefinition } from "../recipe-schema.js";

export const landingPageRecipe: RecipeDefinition = {
	slug: "landing-page",
	kind: "page",
	pageType: "landing",
	title: "Landing page",
	summary:
		"A full marketing landing page composed from header, hero, logo cloud, features, pricing, testimonials, a closing CTA, and a footer.",
	tags: ["landing", "marketing", "page", "saas"],
	brief:
		"Assemble a conversion-focused marketing page top to bottom: sticky-ish header with nav + CTA, a hero, social-proof logos, a feature grid, pricing tiers with one plan highlighted, testimonials, a closing CTA, and a footer. All sections are presentational and read from a single theme — keep colors on semantic tokens so the page restyles with the theme.",
	theme: { preset: "default", tokenBudget: 4200 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Top nav with brand, links, and a primary CTA.", role: "primary" },
		{ id: "hero", block: "marketing-hero", intent: "The headline pitch and primary call-to-action.", role: "primary" },
		{ id: "logos", block: "marketing-logo-cloud", intent: "Social proof — customer or integration logos.", role: "optional" },
		{ id: "features", block: "marketing-feature-grid", intent: "Explain the core product value in a grid.", role: "primary" },
		{ id: "pricing", block: "marketing-pricing", intent: "Plan tiers with one recommended plan highlighted.", role: "supporting" },
		{ id: "testimonials", block: "marketing-testimonial", intent: "Quotes that build trust before the close.", role: "optional" },
		{ id: "cta", block: "marketing-cta", intent: "Final conversion push before the footer.", role: "primary" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, social links, and legal line.", role: "primary" },
	],
	layout:
		"Stack the sections vertically in declared order inside a single page wrapper (no max-width on the page itself — each block manages its own container and padding). Header first, footer last; everything between scrolls. Drop the optional logos/testimonials sections when you lack real content rather than filling them with placeholders.",
	tokenBudget: 4200,
};
