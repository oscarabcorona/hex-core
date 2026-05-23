import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingHeroSchema: ComponentSchemaDefinition = {
	name: "marketing-hero",
	displayName: "MarketingHero",
	description:
		"Top-of-page marketing hero. Eyebrow, headline, subcopy, CTA buttons, and an optional media slot. Centered single-column or split copy + media layout. Presentational and fully theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "title",
			type: "ReactNode",
			required: true,
			description: "The headline. Required — a hero with no title is just a layout.",
		},
		{
			name: "eyebrow",
			type: "ReactNode",
			required: false,
			description: "Small announcement / eyebrow above the title, e.g. a <Badge> pill.",
		},
		{
			name: "description",
			type: "ReactNode",
			required: false,
			description: "Supporting subcopy below the title.",
		},
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Call-to-action buttons. Pass one or more <Button> elements.",
		},
		{
			name: "media",
			type: "ReactNode",
			required: false,
			description:
				"Visual (screenshot / illustration). Beside the copy when layout='split', below it otherwise.",
		},
		{
			name: "layout",
			type: "enum",
			required: false,
			default: "centered",
			description: "'centered' for a single-column hero, 'split' for copy + media side-by-side on ≥lg.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional classes applied to the root <section>.",
		},
	],
	variants: [
		{
			name: "layout",
			description: "Hero composition.",
			default: "centered",
			values: [
				{ value: "centered", description: "Single centered column.", useWhen: "Copy-led hero with no product shot, or above a full-width media strip." },
				{ value: "split", description: "Copy left, media right on ≥lg.", useWhen: "You have a strong screenshot or illustration to pair with the copy." },
			],
		},
	],
	slots: [
		{ name: "eyebrow", description: "Announcement pill above the title.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "CTA buttons.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "media", description: "Hero visual.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Centered hero",
			description: "Copy-led hero with two CTAs.",
			code: `import { MarketingHero } from "@hex-core/components";
import { Badge, Button } from "@hex-core/components";

<MarketingHero
  eyebrow={<Badge>v2 is here</Badge>}
  title="Ship spec-driven UI in minutes"
  description="AI-native components your agents can assemble end-to-end."
  actions={
    <>
      <Button size="lg">Get started</Button>
      <Button size="lg" variant="outline">Read the docs</Button>
    </>
  }
/>`,
			composition: ["marketing", "hero", "landing", "cta"],
		},
		{
			title: "Split hero with media",
			description: "Copy beside a product screenshot on desktop.",
			code: `<MarketingHero
  layout="split"
  title="Your design system, on autopilot"
  description="One source of truth for components, tokens, and blocks."
  actions={<Button size="lg">Start free</Button>}
  media={<img src="/hero.png" alt="Product dashboard" className="rounded-xl border border-border shadow-lg" />}
/>`,
			composition: ["marketing", "hero", "split", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use as the first section of a landing page. Pick layout='split' when you have a screenshot or illustration; layout='centered' for a copy-led hero.",
		whenNotToUse:
			"Don't use inside an app shell or for in-product page headers — use a page-heading pattern there. Don't stack two heroes on one page.",
		commonMistakes: [
			"Passing a long paragraph as the title — keep the title to one line; move detail into description.",
			"Putting raw <a> tags in actions instead of <Button asChild><a>…</a></Button>, which loses the button styling and focus ring.",
			"Using layout='split' with no media — it leaves an empty column; drop to 'centered'.",
			"Hard-coding colors via className instead of relying on the semantic tokens, which breaks theme switching.",
		],
		relatedComponents: ["button", "badge", "marketing-cta", "marketing-feature-grid"],
		accessibilityNotes:
			"Renders a single <h1> for the page — don't place another <h1> elsewhere. Decorative media should carry an empty alt or aria-hidden. CTA focus rings come from the Button primitive.",
		tokenBudget: 600,
	},
	tags: ["block", "marketing", "hero", "landing", "header", "cta"],
};
