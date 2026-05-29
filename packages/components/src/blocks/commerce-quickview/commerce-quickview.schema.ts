import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceQuickviewSchema: ComponentSchemaDefinition = {
	name: "commerce-quickview",
	displayName: "CommerceQuickview",
	description:
		"Quick-look product body — composable into a consumer's <Dialog> or <Sheet> to preview a product without leaving the listing. Distinct from commerce-product-detail (the full PDP layout): compact two-column with the essentials and a 'see full details' link.",
	category: "block",
	subcategory: "commerce",
	props: [
		{ name: "name", type: "ReactNode", required: true, description: "Product name (renders as <h2> inside the quickview)." },
		{ name: "price", type: "ReactNode", required: true, description: "Display price." },
		{ name: "media", type: "ReactNode", required: true, description: "Single product image — a ReactNode (img or media)." },
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Optional eyebrow above the name (brand / category)." },
		{ name: "description", type: "ReactNode", required: false, description: "Optional short body — abbreviated vs the full detail page." },
		{
			name: "options",
			type: "ReactNode",
			required: false,
			description: "Option selectors (size, color, quantity) — pass your own controls.",
		},
		{ name: "actions", type: "ReactNode", required: false, description: "Primary actions (add-to-cart)." },
		{ name: "detailsLink", type: "ReactNode", required: false, description: "Optional 'see full details' link to the PDP." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "media", description: "Product image / video.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "options", description: "Variant selectors.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Add-to-cart buttons.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "detailsLink", description: "Link to the full PDP.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground"],
	examples: [
		{
			title: "Quickview inside a Dialog",
			description: "Composed into a Dialog from a product card.",
			code: `import { CommerceQuickview, Dialog, DialogContent, Button } from "@hex-core/components";

<Dialog>
  <DialogContent className="sm:max-w-3xl">
    <CommerceQuickview
      name="Canvas Tote"
      price="$48"
      eyebrow="Bags"
      description="Roomy everyday tote in heavyweight natural canvas."
      media={<img src="/tote.jpg" alt="Canvas tote, natural" />}
      actions={<Button size="lg">Add to cart</Button>}
      detailsLink={<a href="/p/tote" className="text-primary hover:underline">See full details</a>}
    />
  </DialogContent>
</Dialog>`,
			composition: ["commerce", "quickview", "modal", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use to preview a product without navigating to the PDP — typically inside a Dialog/Sheet triggered from a product card's quick-view button. For the standalone PDP layout, use commerce-product-detail.",
		whenNotToUse:
			"Don't use as the PDP itself (use commerce-product-detail). Don't render a full description / gallery / reviews here — quickview is for fast browse → add-to-cart decisions.",
		commonMistakes: [
			"Forgetting the detailsLink — visitors who want the full page have no escape from the modal.",
			"Multi-image gallery in media — quickview shows one image; full galleries belong on the PDP.",
			"Form-style option controls without labels — accessible names are the consumer's job.",
		],
		relatedComponents: ["commerce-product-detail", "commerce-product-grid", "dialog", "sheet", "button"],
		accessibilityNotes:
			"Renders an <h2> for the product name — inside a Dialog the dialog's own aria-labelledby should point at this <h2> (Radix Dialog handles this when you set DialogTitle, OR you label the dialog separately). Media image needs alt text.",
		tokenBudget: 1123,
	},
	tags: ["block", "commerce", "quickview", "modal", "storefront"],
};
