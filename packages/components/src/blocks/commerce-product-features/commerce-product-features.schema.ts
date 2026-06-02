import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceProductFeaturesSchema: ComponentSchemaDefinition = {
	name: "commerce-product-features",
	displayName: "CommerceProductFeatures",
	description:
		"Product features spotlight on a PDP — either an alternating row layout (image + copy, sides flip each row) or a compact icon-grid for spec lists. Presentational and theme-driven. Sits between commerce-product-detail and commerce-reviews on a product page.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "features",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; description?; media?: ReactNode; icon?: ReactNode }>. Alternating layout uses media; grid layout uses icon.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "alternating",
			description: "'alternating' (one per row, image alternating sides) or 'grid' (3-col icon-grid).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "variant",
			description: "Layout.",
			default: "alternating",
			values: [
				{ value: "alternating", description: "One feature per row, media alternating sides.", useWhen: "Detail-photo features that earn the full row width." },
				{ value: "grid", description: "Three-column icon-grid.", useWhen: "Compact spec lists — material, dimensions, warranty, care." },
			],
		},
	],
	slots: [
		{ name: "features[].media", description: "Detail photo / illustration (alternating).", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "features[].icon", description: "Spec icon (grid).", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "Alternating PDP features",
			description: "Two feature rows with detail photos on alternating sides.",
			code: `import { CommerceProductFeatures } from "@hex-core/components";

<CommerceProductFeatures
  eyebrow="Built to last"
  title="Why this tote earns its keep"
  features={[
    {
      title: "Heavyweight canvas",
      description: "16 oz natural canvas, twice as thick as standard totes.",
      media: <img src="/features/canvas.jpg" alt="Close-up of canvas weave" />,
    },
    {
      title: "Reinforced handles",
      description: "Bar-tacked at every stress point so handles never tear.",
      media: <img src="/features/handles.jpg" alt="Close-up of bar-tacked handle" />,
    },
  ]}
/>`,
			composition: ["commerce", "product-features", "pdp", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use on a PDP below commerce-product-detail to spotlight materials, construction, or signature details. 'alternating' for detail photos that deserve the full row; 'grid' for compact spec lists.",
		whenNotToUse:
			"Don't use for marketing claims on the storefront (use marketing-feature-grid). Don't put pricing here. Don't repeat the product title — that's the PDP's <h1>.",
		commonMistakes: [
			"Three+ alternating rows that all look the same — mix in copy length, image crop, or add a grid section to break the rhythm.",
			"Tiny icons in 'grid' that look like noise — use 24px glyphs sized to the size-5 well.",
			"Forgetting alt text on feature media — these are informative, not decorative.",
		],
		relatedComponents: ["commerce-product-detail", "commerce-reviews", "marketing-feature-grid"],
		accessibilityNotes:
			"Section title is <h2>; per-feature titles render as <h3>. The alternating order flip is purely visual — source order stays top-to-bottom, so screen readers reach features in declared order regardless of which side the image is on.",
		tokenBudget: 1084,
	},
	tags: ["block", "commerce", "product-features", "pdp", "storefront"],
};
