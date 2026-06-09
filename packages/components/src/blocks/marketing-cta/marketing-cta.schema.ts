import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingCtaSchema: ComponentSchemaDefinition = {
	name: "marketing-cta",
	displayName: "MarketingCta",
	description:
		"A closing call-to-action band. 'simple' reads as centered copy on the page background; 'panel' lifts it into a primary-filled rounded card. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{ name: "title", type: "ReactNode", required: true, description: "The closing headline. Required." },
		{ name: "description", type: "ReactNode", required: false, description: "Supporting subcopy below the title." },
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Call-to-action buttons. Pass one or more <Button> elements.",
		},
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "simple",
			description: "'simple' sits on the page background; 'panel' wraps copy in a primary-filled card.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "variant",
			description: "Visual emphasis.",
			default: "simple",
			values: [
				{ value: "simple", description: "Centered copy on the page background.", useWhen: "A low-key CTA between content sections." },
				{ value: "panel", description: "Primary-filled rounded card.", useWhen: "The final, high-emphasis push at the end of a landing page." },
			],
		},
	],
	slots: [{ name: "actions", description: "CTA buttons.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "Panel CTA",
			description: "High-emphasis closing band.",
			code: `import { MarketingCta } from "@hex-core/components";
import { Button } from "@hex-core/components";

<MarketingCta
  variant="panel"
  title="Start building today"
  description="Install the MCP server and scaffold your first page in one prompt."
  actions={<Button size="lg" variant="secondary">Get started</Button>}
/>`,
			composition: ["marketing", "cta", "landing", "panel"],
		},
	],
	ai: {
		whenToUse:
			"Use as the final section before the footer to drive conversion. Use variant='panel' for the strongest emphasis; 'simple' between content sections.",
		whenNotToUse:
			"Don't use more than one panel CTA per page — competing emphasis dilutes both. Don't use as a hero (use marketing-hero, which renders the page <h1>).",
		commonMistakes: [
			"On variant='panel', passing a primary <Button> — it disappears against the primary background; use variant='secondary' or 'outline'.",
			"Omitting actions entirely — a CTA with no button is just a heading.",
			"Stacking multiple panel CTAs, creating competing focal points.",
		],
		relatedComponents: ["button", "marketing-hero", "marketing-footer"],
		accessibilityNotes:
			"Renders an <h2>, keeping it below the hero's <h1>. On variant='panel', button contrast must clear WCAG against the primary fill — prefer secondary/outline buttons.",
		tokenBudget: 833,
	},
	tags: ["block", "marketing", "cta", "landing", "conversion"],
};
