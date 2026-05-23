import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceProductGridSchema: ComponentSchemaDefinition = {
	name: "commerce-product-grid",
	displayName: "CommerceProductGrid",
	description:
		"A responsive product grid: an optional heading above a grid of product cards (image, name, optional meta, price). Cards link to a detail page when href is set. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "products",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; price; href?; image?: ReactNode; meta? }>. Product cards. Set href to make the whole card a link to the detail page; images are ReactNode so none is bundled.",
		},
		{ name: "title", type: "ReactNode", required: false, description: "Optional section heading above the grid." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "four",
			description: "Cards per row on ≥lg: 'three' or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "four",
			values: [
				{ value: "four", description: "Four across.", useWhen: "A dense catalog / category page." },
				{ value: "three", description: "Three across.", useWhen: "Larger imagery or fewer products." },
			],
		},
	],
	slots: [{ name: "products[].image", description: "Product image node.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground"],
	examples: [
		{
			title: "Category product grid",
			description: "Four-up grid of linked product cards.",
			code: `import { CommerceProductGrid } from "@hex-core/components";

<CommerceProductGrid
  title="New arrivals"
  products={[
    { name: "Canvas Tote", price: "$48", href: "/p/tote", meta: "Natural", image: <img src="/tote.jpg" alt="Canvas tote bag" /> },
    { name: "Wool Beanie", price: "$28", href: "/p/beanie", meta: "Charcoal", image: <img src="/beanie.jpg" alt="Wool beanie" /> },
  ]}
/>`,
			composition: ["commerce", "product-grid", "catalog", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use for category / catalog / search-results pages and 'related products' rows. Set href on each product so the card links to its detail page.",
		whenNotToUse:
			"Don't use for a single product (use commerce-product-detail) or for marketing feature cards (use marketing-feature-grid). Don't put add-to-cart controls in the grid — that belongs on the detail page.",
		commonMistakes: [
			"Omitting alt text on product images, so the catalog isn't navigable by screen reader.",
			"Mixing image aspect ratios — the grid uses a square frame; supply consistently cropped images.",
			"Putting the price inside the name instead of the price field, breaking the layout alignment.",
		],
		relatedComponents: ["commerce-product-detail", "commerce-reviews", "badge", "marketing-footer"],
		accessibilityNotes:
			"When href is set the whole card is a single anchor wrapping the image and text, so there's one focusable target per product with an accessible name from the product name. Product images require alt text.",
		tokenBudget: 600,
	},
	tags: ["block", "commerce", "product-grid", "catalog", "storefront", "store", "shop"],
};
