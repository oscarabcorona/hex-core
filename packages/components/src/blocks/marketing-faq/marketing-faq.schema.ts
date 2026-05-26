import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingFaqSchema: ComponentSchemaDefinition = {
	name: "marketing-faq",
	displayName: "MarketingFaq",
	description:
		"FAQ section composing the Accordion primitive: an optional heading above a stack of question/answer pairs. Defaults to 'single' (one open at a time, collapsible); pass type='multiple' for parallel-open. Client Component.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "items",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ question: ReactNode; answer: ReactNode }>. Q/A pairs in display order. Item ids derive from 1-based index so defaultValue stays stable.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "type",
			type: "enum",
			required: false,
			default: "single",
			description: "'single' (one open at a time, collapsible) or 'multiple' (parallel-open).",
		},
		{
			name: "defaultValue",
			type: "string",
			required: false,
			description: "Item id to start open (single type, e.g. 'item-1') or array of ids (multiple).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "type",
			description: "Open/close behavior.",
			default: "single",
			values: [
				{ value: "single", description: "One item open at a time, collapsible.", useWhen: "Standard FAQ pattern." },
				{ value: "multiple", description: "Multiple items open in parallel.", useWhen: "Long FAQ where users may scan several answers at once." },
			],
		},
	],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-accordion", "clsx", "tailwind-merge"],
		internal: ["components/accordion/accordion"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary"],
	examples: [
		{
			title: "FAQ with single-open",
			description: "Heading block above 3 collapsible Q/A pairs.",
			code: `import { MarketingFaq } from "@hex-core/components";

<MarketingFaq
  title="Frequently asked questions"
  description="Can't find what you need? Email support."
  items={[
    { question: "Can I switch plans anytime?", answer: "Yes — prorated to the day." },
    { question: "Do you offer a free trial?", answer: "14 days, no card required." },
    { question: "Is my data encrypted?", answer: "At rest and in transit." },
  ]}
/>`,
			composition: ["marketing", "faq", "accordion", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use to answer common pre-conversion questions on landing/pricing pages. 5–8 items is the sweet spot; more becomes a docs page.",
		whenNotToUse:
			"Don't use for support docs (use a full docs site) or content discovery (use marketing-content). Don't put critical info exclusively here — assume users scan the first 2–3.",
		commonMistakes: [
			"Writing answers as 1–2 word fragments — answers should be a complete sentence so they read in isolation.",
			"Using type='multiple' with 20+ items so the page becomes unscannable.",
			"Hard-coding defaultValue to 'item-3' then reordering items so the wrong one auto-opens.",
		],
		relatedComponents: ["accordion", "marketing-cta", "marketing-content"],
		accessibilityNotes:
			"Triggers are buttons with aria-expanded and aria-controls (inherited from Accordion / Radix). Keyboard: Tab to focus, Enter/Space to toggle, Up/Down to navigate items. Section title is <h2>, questions render as the button labels.",
		tokenBudget: 600,
	},
	tags: ["block", "marketing", "faq", "accordion", "landing"],
};
