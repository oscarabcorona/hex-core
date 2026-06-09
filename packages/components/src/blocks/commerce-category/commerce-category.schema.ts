import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceCategorySchema: ComponentSchemaDefinition = {
	name: "commerce-category",
	displayName: "CommerceCategory",
	description:
		"Category preview cards ('shop by category'): a responsive grid of category cards (image + name + optional product count). Cards link to the category page when href is set. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "categories",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; href?; image?: ReactNode; productCount? }>. Categories to render. Set href to make the whole card a link.",
		},
		{ name: "title", type: "ReactNode", required: false, description: "Optional section heading above the grid." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Cards per row on ≥lg: 'three' or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "A focused 'shop by category' row on the storefront." },
				{ value: "four", description: "Four across.", useWhen: "A larger category set or dense category index." },
			],
		},
	],
	slots: [{ name: "categories[].image", description: "Category image node.", required: false, acceptedTypes: ["ReactNode"] }],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground"],
	examples: [
		{
			title: "Shop-by-category grid",
			description: "Three category cards with images and product counts.",
			code: `import { CommerceCategory } from "@hex-core/components";

<CommerceCategory
  title="Shop by category"
  categories={[
    { name: "Bags", href: "/c/bags", productCount: "24 items", image: <img src="/c/bags.jpg" alt="Canvas tote bags" /> },
    { name: "Accessories", href: "/c/accessories", productCount: "48 items", image: <img src="/c/accessories.jpg" alt="Leather accessories" /> },
  ]}
/>`,
			composition: ["commerce", "category", "storefront", "navigation"],
		},
	],
	ai: {
		whenToUse:
			"Use on the storefront homepage to surface top-level categories. Pair with commerce-product-grid below for featured products. For deeper filtering, use commerce-category-filters on the category page.",
		whenNotToUse:
			"Don't use for product cards (use commerce-product-grid) or in-page filters (use commerce-category-filters). Don't show all categories — pick 3–8 most-shopped.",
		commonMistakes: [
			"Omitting alt text on category images so the grid isn't screen-reader navigable.",
			"Mixing image aspect ratios — the card uses 4/3; supply consistently cropped images.",
			"Stale productCount values — either keep them live or omit the field.",
		],
		relatedComponents: ["commerce-product-grid", "commerce-category-filters", "commerce-store-nav"],
		accessibilityNotes:
			"When href is set the card is a single anchor with an accessible name from the category name. Images need alt text describing the category.",
		tokenBudget: 843,
	},
	tags: ["block", "commerce", "category", "storefront", "navigation"],
};
