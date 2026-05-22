import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingFooterSchema: ComponentSchemaDefinition = {
	name: "marketing-footer",
	displayName: "MarketingFooter",
	description:
		"A marketing site footer: a brand block, several columns of links, and a bottom bar with social links and a copyright line. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "columns",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<{ title: ReactNode; links: { label: ReactNode; href: string }[] }>. Labelled link columns rendered beside the brand.",
		},
		{
			name: "brand",
			type: "ReactNode",
			required: false,
			description: "Brand block (logo + tagline) shown in the lead column.",
		},
		{
			name: "social",
			type: "ReactNode",
			required: false,
			description: "Social / external icon links shown in the bottom bar.",
		},
		{
			name: "copyright",
			type: "ReactNode",
			required: false,
			description: "Copyright / legal line in the bottom bar.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <footer>." },
	],
	variants: [],
	slots: [
		{ name: "brand", description: "Brand block.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "social", description: "Social icon links.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "border"],
	examples: [
		{
			title: "Footer with columns and a bottom bar",
			description: "Brand block, two link columns, copyright, and social links.",
			code: `import { MarketingFooter } from "@hex-core/components";

<MarketingFooter
  brand={<div><div className="text-lg font-semibold">Acme</div><p className="mt-3 text-sm text-muted-foreground">Spec-driven UI for AI agents.</p></div>}
  columns={[
    { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "/careers" }] },
  ]}
  copyright={<>© 2026 Acme, Inc.</>}
/>`,
			composition: ["marketing", "footer", "navigation", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use as the last section of a marketing / landing page, below the closing CTA. Group links into 2–4 labelled columns.",
		whenNotToUse:
			"Don't use as in-app footer chrome. Don't dump every route here — curate the most useful links per column.",
		commonMistakes: [
			"One column with 20 links instead of a few grouped columns — group by topic.",
			"Omitting the copyright line, which most footers are expected to carry.",
			"Putting social icons with no accessible label — wrap each in a link with an aria-label or sr-only text.",
		],
		relatedComponents: ["marketing-header", "marketing-cta", "separator"],
		accessibilityNotes:
			"Each column title renders as an <h3>. Links are real anchors with visible hover/focus states. Social icon links need an accessible name (aria-label or sr-only text) since the icon alone isn't announced.",
		tokenBudget: 600,
	},
	tags: ["block", "marketing", "footer", "navigation", "landing"],
};
