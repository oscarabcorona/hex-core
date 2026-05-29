import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceCheckoutSchema: ComponentSchemaDefinition = {
	name: "commerce-checkout",
	displayName: "CommerceCheckout",
	description:
		"Checkout layout: the form on the left and a sticky order summary on the right (stacked on mobile). Layout only — supply the form (contact, shipping, payment) as children and the order review as summary. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "The checkout form (contact, shipping, payment fields) — pass your own form with submit handling.",
		},
		{
			name: "summary",
			type: "ReactNode",
			required: true,
			description: "Order summary (line items + totals) shown in the right column on ≥lg.",
		},
		{ name: "title", type: "ReactNode", required: false, description: "Optional page heading above the two columns." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "children", description: "The checkout form.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "summary", description: "Order review + totals.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "card", "card-foreground", "border"],
	examples: [
		{
			title: "Checkout with form and order summary",
			description: "Contact + shipping fieldsets beside a sticky summary.",
			code: `import { CommerceCheckout, Label, Input, Button } from "@hex-core/components";

<CommerceCheckout
  title="Checkout"
  summary={
    <>
      <div className="flex justify-between text-sm"><span>Subtotal</span><span>$104</span></div>
      <div className="flex justify-between text-base font-semibold"><span>Total</span><span>$110</span></div>
    </>
  }
>
  <form className="flex flex-col gap-6">
    <fieldset className="flex flex-col gap-4">
      <legend className="text-base font-semibold">Contact</legend>
      <div className="flex flex-col gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" /></div>
    </fieldset>
    <Button type="submit" size="lg">Pay now</Button>
  </form>
</CommerceCheckout>`,
			composition: ["commerce", "checkout", "form", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use for the checkout page. Put the contact/shipping/payment form (with its own fieldsets, labels, and submit) in children and the order review in summary.",
		whenNotToUse:
			"Don't use for the cart (use commerce-cart) or a single-field form. Don't wire payment logic into the block — it's layout; submission lives in the form you pass.",
		commonMistakes: [
			"Inputs without <Label htmlFor> — the block lays out the form but doesn't wire labels for you.",
			"Putting the submit button only in the summary — keep the primary 'Pay' action in the form's flow.",
			"Omitting fieldset/legend grouping for contact vs shipping vs payment, hurting form comprehension.",
		],
		relatedComponents: ["commerce-cart", "form", "input", "label", "button", "select"],
		accessibilityNotes:
			"The summary column is an <aside> labelled 'Order summary'. The optional title is the page <h1>. Accessible names depend on the Label/control pairing and fieldset/legend grouping in the form you supply.",
		tokenBudget: 886,
	},
	tags: ["block", "commerce", "checkout", "form", "storefront", "store", "shop"],
};
