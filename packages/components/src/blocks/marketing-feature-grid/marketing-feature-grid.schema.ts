import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingFeatureGridSchema: ComponentSchemaDefinition = {
	name: "marketing-feature-grid",
	displayName: "MarketingFeatureGrid",
	description:
		"A marketing feature grid: an optional heading block above a responsive grid of icon + title + description cells. Two- or three-column on desktop. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "features",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ icon?: ReactNode; title: ReactNode; description: ReactNode }>. The feature cells. Icons are ReactNode so any icon set works — none is bundled.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Grid width on ≥lg: 'two' or 'three' columns.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Desktop column count.",
			default: "three",
			values: [
				{ value: "three", description: "Three columns on ≥lg.", useWhen: "Six or nine short features." },
				{ value: "two", description: "Two columns on ≥lg.", useWhen: "Four longer features that need more width." },
			],
		},
	],
	slots: [{ name: "eyebrow", description: "Section eyebrow.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "Three-column features",
			description: "Heading block above three feature cells.",
			code: `import { MarketingFeatureGrid } from "@hex-core/components";

<MarketingFeatureGrid
  eyebrow="Why Hex"
  title="Everything your agents need"
  description="One source of truth for components, tokens, and blocks."
  features={[
    { title: "Spec-driven", description: "Every component ships a machine-readable schema." },
    { title: "Theme-native", description: "Swap tokens, not class names." },
    { title: "MCP-first", description: "Install and compose from any AI client." },
  ]}
/>`,
			composition: ["marketing", "features", "landing", "grid"],
		},
	],
	ai: {
		whenToUse:
			"Use to explain product value below the hero. Three columns for short features, two for longer copy. Pair icons from any set via the icon slot.",
		whenNotToUse:
			"Don't use for pricing tiers (use marketing-pricing) or for navigable links (use a list). Don't exceed ~9 cells — split into two sections instead.",
		commonMistakes: [
			"Passing an <img> as an icon — the icon well is sized for a glyph (size-5); use an SVG icon, not a photo.",
			"Writing a paragraph in each description — keep cells scannable, one or two sentences.",
			"Setting columns='three' with only two features, leaving a gap — match columns to the count.",
		],
		relatedComponents: ["marketing-hero", "marketing-cta", "card", "badge"],
		accessibilityNotes:
			"Each cell title renders as an <h3> under the section <h2>, preserving heading order. Decorative icons are presentational; if an icon conveys meaning, give it an accessible label.",
		tokenBudget: 650,
	},
	tags: ["block", "marketing", "features", "landing", "grid"],
};
