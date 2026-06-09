import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceCartSchema: ComponentSchemaDefinition = {
	name: "commerce-cart",
	displayName: "CommerceCart",
	description:
		"Shopping cart layout: a list of line items on the left and a sticky order summary on the right (stacked on mobile). Presentational and theme-driven — pass quantity steppers / remove buttons as per-item controls and the totals as summary.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "items",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; price; quantity; image?; meta?; controls? }>. Cart line items. quantity renders as text; pass an editable stepper + remove button via per-item controls.",
		},
		{
			name: "summary",
			type: "ReactNode",
			required: false,
			description: "Order summary rows (subtotal, shipping, total) — pass your own markup.",
		},
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Primary action(s) (proceed to checkout) — pass a <Button>.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "items[].controls", description: "Per-row quantity / remove controls.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "summary", description: "Totals rows.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Checkout button.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "card", "card-foreground", "border"],
	examples: [
		{
			title: "Cart with summary and checkout",
			description: "Line items beside a sticky totals card.",
			code: `import { CommerceCart, Button } from "@hex-core/components";

<CommerceCart
  items={[
    { name: "Canvas Tote", price: "$48", quantity: 1, meta: "Natural", image: <img src="/tote.jpg" alt="Canvas tote" /> },
    { name: "Wool Beanie", price: "$28", quantity: 2, meta: "Charcoal", image: <img src="/beanie.jpg" alt="Wool beanie" /> },
  ]}
  summary={
    <>
      <div className="flex justify-between text-sm"><span>Subtotal</span><span>$104</span></div>
      <div className="flex justify-between text-base font-semibold"><span>Total</span><span>$104</span></div>
    </>
  }
  actions={<Button size="lg">Checkout</Button>}
/>`,
			composition: ["commerce", "cart", "checkout", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use for the shopping cart page. Pass per-item quantity steppers and remove buttons via controls, and the totals via summary. Wire the checkout Button in actions.",
		whenNotToUse:
			"Don't use for a mini-cart popover (use a popover/sheet with a compact list) or for checkout itself (use commerce-checkout). Don't embed totals logic in the block — pass computed values.",
		commonMistakes: [
			"Rendering quantity as a static number with no way to edit — pass a stepper via controls for an editable cart.",
			"Putting the order total in items instead of summary, so it scrolls away with the list.",
			"Missing alt text on item thumbnails.",
		],
		relatedComponents: ["commerce-checkout", "commerce-product-detail", "button", "separator"],
		accessibilityNotes:
			"Each line item name renders as an <h3>. The summary card is sticky on desktop so totals stay visible. Per-item controls you pass must carry accessible names (e.g. 'Remove Canvas Tote').",
		tokenBudget: 929,
	},
	tags: ["block", "commerce", "cart", "checkout", "storefront", "store", "shop"],
};
