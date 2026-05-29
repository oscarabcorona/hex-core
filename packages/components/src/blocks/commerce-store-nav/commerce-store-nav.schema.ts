import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceStoreNavSchema: ComponentSchemaDefinition = {
	name: "commerce-store-nav",
	displayName: "CommerceStoreNav",
	description:
		"Storefront top navigation: brand + primary categories + search slot + trailing actions (cart, sign-in). Desktop inline nav; mobile collapses to a hamburger panel. Client Component (owns the open/close state). Theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{ name: "logo", type: "ReactNode", required: true, description: "Brand mark — a logo / wordmark node, ideally wrapping a link to '/'." },
		{
			name: "categories",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<{ label: ReactNode; href: string }>. Primary categories shown inline on ≥md and stacked in the mobile panel.",
		},
		{
			name: "search",
			type: "ReactNode",
			required: false,
			description: "Optional search region (an <Input> or composed search affordance).",
		},
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Trailing actions — typically a cart link/button, sign-in link.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <header>." },
	],
	variants: [],
	slots: [
		{ name: "logo", description: "Brand mark.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "search", description: "Search input region.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Trailing cart / sign-in actions.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "border", "ring"],
	examples: [
		{
			title: "Store nav with categories, search, and cart",
			description: "Brand, three category links, a search input, and a cart button.",
			code: `import { CommerceStoreNav, Input, Button } from "@hex-core/components";

<CommerceStoreNav
  logo={<a href="/" className="text-lg font-semibold">Hex Goods</a>}
  categories={[
    { label: "New", href: "/c/new" },
    { label: "Bags", href: "/c/bags" },
    { label: "Accessories", href: "/c/accessories" },
  ]}
  search={<Input type="search" placeholder="Search…" className="w-full" />}
  actions={<Button asChild><a href="/cart">Cart (2)</a></Button>}
/>`,
			composition: ["commerce", "store-nav", "navigation", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use as the top nav of a storefront. Pair with commerce-product-grid / commerce-category below it. For non-commerce marketing sites, use marketing-header instead.",
		whenNotToUse:
			"Don't use as in-app chrome (use the sidebar / navigation-menu components). Don't nest deep menus — surface only top-level categories here.",
		commonMistakes: [
			"Including the entire category tree — keep to ~3–6 top-level categories; deeper navigation lives on the category page.",
			"Putting raw <a> tags in actions instead of <Button asChild><a>…</a></Button>, losing button styling.",
			"Forgetting the logo links to '/' — wrap the logo node in an anchor.",
		],
		relatedComponents: ["marketing-header", "commerce-category", "commerce-category-filters", "input", "button"],
		accessibilityNotes:
			"The mobile toggle is a <button> with aria-expanded + aria-controls pointing at the panel and an aria-label that flips between 'Open menu' / 'Close menu'. Categories are real anchors with visible focus rings. Search and cart actions live both in the desktop bar and inside the mobile panel.",
		tokenBudget: 944,
	},
	tags: ["block", "commerce", "store-nav", "navigation", "storefront"],
};
