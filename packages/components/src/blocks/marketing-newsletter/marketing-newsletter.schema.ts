import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingNewsletterSchema: ComponentSchemaDefinition = {
	name: "marketing-newsletter",
	displayName: "MarketingNewsletter",
	description:
		"Newsletter signup band: heading + subcopy + a caller-supplied form (email Input + Button) and an optional disclaimer line. Centered single column (default) or copy-left + form-right on ≥lg. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{ name: "title", type: "ReactNode", required: true, description: "Section heading." },
		{ name: "form", type: "ReactNode", required: true, description: "The signup form — pass your own <form> with email Input + Button." },
		{ name: "description", type: "ReactNode", required: false, description: "Supporting subcopy below the title." },
		{
			name: "disclaimer",
			type: "ReactNode",
			required: false,
			description: "Optional fine-print disclaimer below the form (privacy / unsubscribe note).",
		},
		{
			name: "layout",
			type: "enum",
			required: false,
			default: "centered",
			description: "'centered' for a hero-style band, 'split' for copy + form side-by-side on ≥lg.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "layout",
			description: "Composition.",
			default: "centered",
			values: [
				{ value: "centered", description: "Centered single column.", useWhen: "Standalone signup section, end-of-page push." },
				{ value: "split", description: "Copy left, form right on ≥lg.", useWhen: "Heavier marketing copy paired with a more prominent form." },
			],
		},
	],
	slots: [{ name: "form", description: "The signup form.", required: true, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Centered newsletter signup",
			description: "Heading + form + disclaimer.",
			code: `import { MarketingNewsletter, Input, Button } from "@hex-core/components";

<MarketingNewsletter
  title="Stay in the loop"
  description="One short email a month — what's new, no spam."
  form={
    <form className="flex gap-2">
      <Input type="email" placeholder="you@example.com" required />
      <Button type="submit">Subscribe</Button>
    </form>
  }
  disclaimer="We never share your email. Unsubscribe anytime."
/>`,
			composition: ["marketing", "newsletter", "signup", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use to capture email subscriptions on landing / blog / about pages. 'centered' for end-of-page push; 'split' when paired with marketing copy.",
		whenNotToUse:
			"Don't use as the primary CTA (use marketing-cta). Don't use without a privacy disclaimer when collecting an email — most jurisdictions require notice.",
		commonMistakes: [
			"Passing a button with no `type='submit'` — Enter on the input won't submit the form.",
			"Omitting `required` on the email Input — empty submissions reach the backend.",
			"Putting the form's submit handler in the parent's onClick instead of <form onSubmit> — breaks keyboard Enter and screen-reader announcements.",
		],
		relatedComponents: ["input", "button", "form", "marketing-cta", "marketing-footer"],
		accessibilityNotes:
			"The block is layout; the form's labels and accessible names depend on the form you pass. Use <Label htmlFor> or aria-label on the email Input. The disclaimer is plain text positioned after the form so screen readers reach it in source order.",
		tokenBudget: 949,
	},
	tags: ["block", "marketing", "newsletter", "signup", "landing"],
};
