import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingBentoSchema: ComponentSchemaDefinition = {
	name: "marketing-bento",
	displayName: "MarketingBento",
	description:
		"Asymmetric bento feature grid: one or two 'lg' hero tiles plus several 'md' tiles. Distinct from marketing-feature-grid (symmetric, icon-led) — bento is designed for landing pages wanting a richer, gallery-feel feature showcase. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "tiles",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; description?; media?: ReactNode; span?: 'lg' | 'md' }>. The tiles. Set span='lg' on one or two tiles to make them span two columns + two rows on ≥lg.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [{ name: "tiles[].media", description: "Per-tile illustration / screenshot.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "card", "card-foreground", "border", "primary"],
	examples: [
		{
			title: "5-tile bento with one large hero",
			description: "One lg hero tile + four md tiles in an asymmetric grid.",
			code: `import { MarketingBento } from "@hex-core/components";

<MarketingBento
  title="A feature gallery"
  description="Different sizes, same brand."
  tiles={[
    { title: "Spec-driven UI", description: "Every component ships a machine-readable schema.", span: "lg" },
    { title: "Theme-native", description: "Swap tokens, not class names." },
    { title: "MCP-first", description: "Discover and compose from any AI client." },
    { title: "Composable", description: "Page sections snap together into recipes." },
    { title: "Typed", description: "Strict TypeScript from registry to runtime." },
  ]}
/>`,
			composition: ["marketing", "bento", "features", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use when you have one standout feature that deserves the visual emphasis of a larger tile, alongside several supporting features. Pairs well below the hero on a landing page.",
		whenNotToUse:
			"Don't use for uniform feature lists (use marketing-feature-grid) or pricing tiers (use marketing-pricing). Don't span more than two tiles as 'lg' — the asymmetry breaks down.",
		commonMistakes: [
			"Putting six tiles all at default 'md' span — there's no visual hierarchy; either use marketing-feature-grid or promote one to 'lg'.",
			"Filling the lg tile's media with a tiny icon — the area is sized for a screenshot or illustration; use feature-grid for icon-led layouts.",
			"Two 'lg' tiles competing for attention — pick one hero feature.",
		],
		relatedComponents: ["marketing-feature-grid", "marketing-hero", "card"],
		accessibilityNotes:
			"Each tile heading is an <h3> under the section <h2>. Grid order matches source order; on mobile tiles stack one-per-row, so put your most important tile first.",
		tokenBudget: 650,
	},
	tags: ["block", "marketing", "bento", "features", "landing"],
};
