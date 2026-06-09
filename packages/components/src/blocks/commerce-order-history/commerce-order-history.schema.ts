import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceOrderHistorySchema: ComponentSchemaDefinition = {
	name: "commerce-order-history",
	displayName: "CommerceOrderHistory",
	description:
		"Customer order history table: each row is an order with id, date, total, status, and an optional link to the order detail page. Renders an empty-state when orders is []. Distinct from commerce-order-summary (a single order's detail card). Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "orders",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ id; date; total; status; href? }>. Orders newest-first by convention. Set href to make each row's 'View' link navigate to the order detail.",
		},
		{ name: "title", type: "ReactNode", required: false, description: "Optional section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Optional subcopy under the heading." },
		{ name: "emptyState", type: "ReactNode", required: false, description: "Optional empty-state node, rendered when orders is empty." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "emptyState", description: "Custom empty-state node.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "orders[].status", description: "Per-order status badge / text.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "card", "card-foreground", "border", "primary", "ring"],
	examples: [
		{
			title: "Order history table",
			description: "Three past orders with status badges and links to detail.",
			code: `import { CommerceOrderHistory, Badge } from "@hex-core/components";

<CommerceOrderHistory
  title="Order history"
  orders={[
    { id: "#1042", date: "May 23, 2026", total: "$104", status: <Badge>Confirmed</Badge>, href: "/orders/1042" },
    { id: "#1037", date: "May 12, 2026", total: "$76", status: <Badge variant="secondary">Delivered</Badge>, href: "/orders/1037" },
  ]}
/>`,
			composition: ["commerce", "order-history", "account", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use on a customer-account 'Order history' page. For a single order's detail, use commerce-order-summary. Sort orders newest-first; pair with pagination if the list is long.",
		whenNotToUse:
			"Don't use for admin order management (use app-data-table — needs sortable columns, filters). Don't show line items here — that's commerce-order-summary's job on the per-order page.",
		commonMistakes: [
			"Putting line-item rows here — this is a list of orders, not a list of items.",
			"Missing the View link's accessible name — the schema renders 'View' visually + 'order {id}' in sr-only text. Keep that pattern when customizing.",
			"Forgetting an empty-state — first-time customers see this; either pass `emptyState` or rely on the default copy.",
		],
		relatedComponents: ["commerce-order-summary", "app-data-table", "badge", "table"],
		accessibilityNotes:
			"Renders a semantic <table> with <thead>/<tbody>; column headers have scope='col'. The View link's accessible name includes 'order {id}' via sr-only text so screen-reader users can tell which row's link they're activating.",
		tokenBudget: 891,
	},
	tags: ["block", "commerce", "order-history", "account", "storefront"],
};
