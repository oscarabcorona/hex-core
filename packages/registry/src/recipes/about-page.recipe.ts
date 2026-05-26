import type { RecipeDefinition } from "../recipe-schema.js";

export const aboutPageRecipe: RecipeDefinition = {
	slug: "about-page",
	kind: "page",
	pageType: "landing",
	title: "About page",
	summary:
		"A company About page composed from the marketing header + hero, a team grid, a content/blog row, a contact section, and the marketing footer.",
	tags: ["about", "marketing", "team", "page"],
	brief:
		"Assemble a credibility-first About page: marketing-header for site nav, a marketing-hero introducing the company, a marketing-team grid for the people, marketing-content for recent writing or press, a marketing-contact section for getting in touch, and the marketing-footer. All sections are presentational and read from the same theme.",
	theme: { preset: "default", tokenBudget: 3800 },
	sections: [
		{ id: "header", block: "marketing-header", intent: "Top nav with brand, links, and a primary CTA.", role: "primary" },
		{ id: "hero", block: "marketing-hero", intent: "Introduce the company and its mission.", role: "primary" },
		{ id: "team", block: "marketing-team", intent: "Meet-the-team grid — credibility.", role: "primary" },
		{ id: "stats", block: "marketing-stats", intent: "Optional 'by the numbers' band for scale.", role: "optional" },
		{ id: "content", block: "marketing-content", intent: "Recent writing, press, or case studies.", role: "supporting" },
		{ id: "contact", block: "marketing-contact", intent: "How to reach the team.", role: "primary" },
		{ id: "footer", block: "marketing-footer", intent: "Site navigation, policies, and social links.", role: "primary" },
	],
	layout:
		"Stack the sections vertically in declared order inside a single page wrapper. Header first, footer last; everything between scrolls. Drop the optional stats band when there are no real numbers to share. Each section installs as its own file — import a block from `@/components/ui/<section.block>` (e.g. `import { MarketingTeam } from \"@/components/ui/marketing-team\"`).",
	tokenBudget: 3800,
};
