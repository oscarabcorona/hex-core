import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceOrderSummarySchema: ComponentSchemaDefinition = {
	name: "commerce-order-summary",
	displayName: "CommerceOrderSummary",
	description:
		"Read-only order detail card: header (order id + status) + line items + totals breakdown + optional meta panel + optional actions. Distinct from commerce-cart (which is editable). Use on order confirmation / order-detail pages. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{ name: "orderId", type: "ReactNode", required: true, description: "Order identifier (number / hash)." },
		{
			name: "items",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; price; quantity; image?; meta? }>. Line items in the order — non-editable display.",
		},
		{
			name: "totals",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ label; value; emphasized? }>. Totals rows (subtotal, shipping, tax, total). Set emphasized on the final Total to visually separate it.",
		},
		{ name: "status", type: "ReactNode", required: false, description: "Optional status badge / text." },
		{ name: "meta", type: "ReactNode", required: false, description: "Optional meta panel (placed date, shipping address, payment method)." },
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Optional trailing actions (download invoice, contact support).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "status", description: "Status badge / text.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "meta", description: "Order meta panel.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Trailing actions.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "card", "card-foreground", "border"],
	examples: [
		{
			title: "Order confirmation card",
			description: "Order header, line items, totals breakdown, meta panel, and a download action.",
			code: `import { CommerceOrderSummary, Badge, Button } from "@hex-core/components";

<CommerceOrderSummary
  orderId="#1042"
  status={<Badge>Confirmed</Badge>}
  items={[
    { name: "Canvas Tote", price: "$48", quantity: 1, meta: "Natural" },
    { name: "Wool Beanie", price: "$56", quantity: 2, meta: "Charcoal" },
  ]}
  totals={[
    { label: "Subtotal", value: "$104" },
    { label: "Shipping", value: "Free" },
    { label: "Total", value: "$104", emphasized: true },
  ]}
  meta={
    <div className="flex flex-col gap-1">
      <p><strong>Placed:</strong> May 23, 2026</p>
      <p><strong>Shipping to:</strong> 123 Main St, Brooklyn NY</p>
    </div>
  }
  actions={<Button variant="outline">Download invoice</Button>}
/>`,
			composition: ["commerce", "order-summary", "confirmation", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use on order confirmation pages, order-detail pages from the customer's order history, and email-like detail views. For an editable shopping cart, use commerce-cart instead.",
		whenNotToUse:
			"Don't use as the active cart (use commerce-cart, which has per-item controls). Don't render line items as editable rows here — this card is read-only.",
		commonMistakes: [
			"Letting the consumer mutate the items array — this block doesn't expose edit handlers; pass the immutable snapshot of the order.",
			"Forgetting to mark the Total row as emphasized — without it the final total reads the same as subtotals and shipping.",
			"Long meta paragraphs that dominate the card — keep meta to a few short lines.",
		],
		relatedComponents: ["commerce-cart", "commerce-order-history", "badge", "button"],
		accessibilityNotes:
			"The card title (Order {id}) renders as <h2>; per-item names render as <h3>. Totals use <dl>/<dt>/<dd> for label→value semantics. The emphasized Total row carries a top border so the visual emphasis matches the bold weight.",
		tokenBudget: 750,
	},
	tags: ["block", "commerce", "order-summary", "confirmation", "storefront"],
};
