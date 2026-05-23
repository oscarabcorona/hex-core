import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingPricingSchema: ComponentSchemaDefinition = {
	name: "marketing-pricing",
	displayName: "MarketingPricing",
	description:
		"A pricing section: an optional heading block above a row of plan cards, with one tier highlightable as recommended. Each tier has a name, price, feature list, and a caller-supplied CTA. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "tiers",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; price; period?; description?; features: ReactNode[]; cta: ReactNode; highlighted?; badge? }>. The plan cards, rendered left-to-right. Set highlighted on the recommended tier and pass a badge for its flag.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "tiers[].cta", description: "Per-tier CTA button.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "tiers[].badge", description: "Flag on the highlighted tier.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "card", "card-foreground", "border", "primary"],
	examples: [
		{
			title: "Three-tier pricing with a highlighted plan",
			description: "Middle plan emphasized with a ring and a badge.",
			code: `import { MarketingPricing } from "@hex-core/components";
import { Badge, Button } from "@hex-core/components";

<MarketingPricing
  title="Pricing that scales with you"
  tiers={[
    { name: "Starter", price: "$0", period: "/mo", features: ["1 project", "Community support"], cta: <Button variant="outline">Start free</Button> },
    { name: "Pro", price: "$29", period: "/mo", highlighted: true, badge: <Badge>Most popular</Badge>, features: ["Unlimited projects", "Priority support", "Analytics"], cta: <Button>Choose Pro</Button> },
    { name: "Team", price: "$99", period: "/mo", features: ["Everything in Pro", "SSO", "Audit log"], cta: <Button variant="outline">Contact sales</Button> },
  ]}
/>`,
			composition: ["marketing", "pricing", "saas", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use to present 2–3 subscription tiers on a landing or pricing page. Highlight the recommended tier and pass a badge. Supersedes the older 'pricing-table' recipe.",
		whenNotToUse:
			"Don't use for a single plan (use marketing-cta) or for a feature comparison matrix (use a table). Keep to ≤3 tiers — more belongs in a comparison table.",
		commonMistakes: [
			"Highlighting more than one tier — the emphasis is meant to steer toward a single recommended plan.",
			"Giving the highlighted tier a generic CTA label like 'Choose' — name the plan ('Choose Pro') for screen readers and analytics.",
			"Passing plain text as cta instead of a <Button> — you lose the full-width styling and focus ring.",
		],
		relatedComponents: ["button", "badge", "card", "marketing-feature-grid", "marketing-cta"],
		accessibilityNotes:
			"Each tier name renders as an <h3> under the section <h2>. Feature check glyphs are aria-hidden; the feature text conveys meaning. Give generic CTAs an aria-label naming the plan.",
		tokenBudget: 750,
	},
	tags: ["block", "marketing", "pricing", "saas", "landing"],
};
