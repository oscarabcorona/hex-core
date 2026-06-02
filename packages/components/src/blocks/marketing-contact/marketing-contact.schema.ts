import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingContactSchema: ComponentSchemaDefinition = {
	name: "marketing-contact",
	displayName: "MarketingContact",
	description:
		"Contact section: heading + supporting copy + optional details column + caller-supplied form. 'split' (default) renders details left and form right on ≥lg; 'stacked' is single-column. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{ name: "title", type: "ReactNode", required: true, description: "Section heading." },
		{ name: "form", type: "ReactNode", required: true, description: "The contact form — pass your own <form> with fields + submit." },
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "description", type: "ReactNode", required: false, description: "Supporting subcopy below the title." },
		{
			name: "details",
			type: "ReactNode",
			required: false,
			description: "Optional left-column content (address / email / phone / hours) for the split layout.",
		},
		{
			name: "layout",
			type: "enum",
			required: false,
			default: "split",
			description: "'split' for details left + form right on ≥lg, 'stacked' for single-column.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "layout",
			description: "Composition.",
			default: "split",
			values: [
				{ value: "split", description: "Details left, form right on ≥lg.", useWhen: "You have address / hours / channels to show beside the form." },
				{ value: "stacked", description: "Single column, stacked.", useWhen: "Form-only contact page or narrow content column." },
			],
		},
	],
	slots: [
		{ name: "form", description: "The contact form.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "details", description: "Contact info column.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary"],
	examples: [
		{
			title: "Split contact section",
			description: "Contact details on the left, form on the right.",
			code: `import { MarketingContact, Label, Input, Textarea, Button } from "@hex-core/components";

<MarketingContact
  title="Get in touch"
  description="We'll get back to you within one business day."
  details={
    <dl className="flex flex-col gap-2">
      <div><dt className="text-foreground font-medium">Email</dt><dd>hello@acme.com</dd></div>
      <div><dt className="text-foreground font-medium">Phone</dt><dd>+1 555 0100</dd></div>
    </dl>
  }
  form={
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-2"><Label htmlFor="name">Name</Label><Input id="name" /></div>
      <div className="flex flex-col gap-2"><Label htmlFor="message">Message</Label><Textarea id="message" /></div>
      <Button type="submit" className="self-start">Send</Button>
    </form>
  }
/>`,
			composition: ["marketing", "contact", "form", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use on Contact / Support pages. 'split' when you have real contact details to show beside the form; 'stacked' for form-only pages.",
		whenNotToUse:
			"Don't use for newsletter signup (use marketing-newsletter) or sign-in (use auth-sign-in-split). Don't dump every channel — pick 2–4 most-useful.",
		commonMistakes: [
			"Inputs without <Label htmlFor> — the block is layout; pairing labels is the form's job.",
			"Hard-coding mailto:/tel: in details copy without making them links — visitors expect to click.",
			"Submitting via a button's onClick instead of <form onSubmit> — breaks keyboard Enter.",
		],
		relatedComponents: ["form", "input", "textarea", "label", "button", "marketing-cta"],
		accessibilityNotes:
			"Section title is <h2>. Details and form columns are siblings, so screen readers reach details first in source order — put the most important channel first. Form labels and submit handling are your responsibility.",
		tokenBudget: 1141,
	},
	tags: ["block", "marketing", "contact", "form", "landing"],
};
