import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingLogoCloudSchema: ComponentSchemaDefinition = {
	name: "marketing-logo-cloud",
	displayName: "MarketingLogoCloud",
	description:
		"A row of customer / partner logos with an optional caption. Each logo is a caller-supplied ReactNode (img, inline SVG, or wordmark) — no image source is bundled. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "logos",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<ReactNode>. The logos to render — each an <img>, inline SVG, or wordmark. Give each a stable key.",
		},
		{
			name: "title",
			type: "ReactNode",
			required: false,
			description: "Optional caption above the grid, e.g. 'Trusted by teams everywhere'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [{ name: "logos", description: "Logo nodes.", required: true, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "muted-foreground"],
	examples: [
		{
			title: "Logo cloud with caption",
			description: "Five customer logos under a caption.",
			code: `import { MarketingLogoCloud } from "@hex-core/components";

<MarketingLogoCloud
  title="Trusted by teams everywhere"
  logos={[
    <img key="acme" src="/logos/acme.svg" alt="Acme" />,
    <img key="globex" src="/logos/globex.svg" alt="Globex" />,
    <img key="initech" src="/logos/initech.svg" alt="Initech" />,
  ]}
/>`,
			composition: ["marketing", "logos", "social-proof", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use directly below the hero as social proof. Supply real customer or integration logos as <img> or inline SVG nodes.",
		whenNotToUse:
			"Don't use for navigation or as a feature grid. Don't pad with placeholder logos — fewer real logos beat many fake ones.",
		commonMistakes: [
			"Forgetting alt text on logo <img>s, so the brand names aren't announced.",
			"Omitting the React key on each logo node, causing reconciliation warnings.",
			"Passing huge images — the grid caps height at ~2.5rem; export trimmed logos.",
		],
		relatedComponents: ["marketing-hero", "marketing-feature-grid"],
		accessibilityNotes:
			"Logos are images — each <img> needs an alt of the brand name. The caption is a plain <p>, not a heading, so it doesn't disrupt heading order.",
		tokenBudget: 665,
	},
	tags: ["block", "marketing", "logos", "social-proof", "landing"],
};
