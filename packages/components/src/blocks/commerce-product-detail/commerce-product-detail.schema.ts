import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceProductDetailSchema: ComponentSchemaDefinition = {
	name: "commerce-product-detail",
	displayName: "CommerceProductDetail",
	description:
		"Product detail layout: imagery on the left, product info on the right (name, price, description, option controls, and add-to-cart actions), stacked on mobile. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{ name: "name", type: "ReactNode", required: true, description: "Product name (renders as the page <h1>)." },
		{ name: "price", type: "ReactNode", required: true, description: "Display price, e.g. '$48'." },
		{ name: "media", type: "ReactNode", required: true, description: "Product imagery (gallery / hero image), left column on ≥lg." },
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Optional eyebrow above the name (brand, category)." },
		{ name: "description", type: "ReactNode", required: false, description: "Product description / marketing copy." },
		{
			name: "options",
			type: "ReactNode",
			required: false,
			description: "Option selectors (size, color, quantity) — pass your own controls.",
		},
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Primary actions (add to cart / buy now) — pass <Button>s.",
		},
		{
			name: "details",
			type: "ReactNode",
			required: false,
			description: "Extra details (shipping, materials, an accordion) shown below the actions.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "media", description: "Product imagery / gallery.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "options", description: "Variant selectors.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Add-to-cart / buy buttons.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "details", description: "Shipping / materials / accordion.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Product detail with options and add-to-cart",
			description: "Image, info, a size selector, and an add-to-cart button.",
			code: `import { CommerceProductDetail } from "@hex-core/components";
import { Button, RadioGroup } from "@hex-core/components";

<CommerceProductDetail
  name="Canvas Tote"
  price="$48"
  eyebrow="Bags"
  description="A roomy everyday tote in heavyweight natural canvas."
  media={<img src="/tote.jpg" alt="Canvas tote bag, natural" />}
  options={<RadioGroup /* size selector */ />}
  actions={<Button size="lg">Add to cart</Button>}
/>`,
			composition: ["commerce", "product-detail", "pdp", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use for the product detail page (PDP). Put the gallery in media, variant selectors in options, and an add-to-cart Button in actions. Wire selection/cart state through those controls.",
		whenNotToUse:
			"Don't use for a list of products (use commerce-product-grid) or a cart (use commerce-cart). Don't render multiple <h1>s — the product name is the page heading.",
		commonMistakes: [
			"Hard-coding option selectors into the block — pass them as the options slot so selection state stays with the consumer.",
			"Missing alt text on the gallery image describing the product.",
			"Putting price in the name field — keep price separate so its larger styling applies.",
		],
		relatedComponents: ["commerce-product-grid", "commerce-reviews", "commerce-cart", "button", "radio-group", "accordion"],
		accessibilityNotes:
			"The product name renders as the page <h1>. The block is layout; option controls and buttons you pass must carry their own labels. Gallery images need descriptive alt text.",
		tokenBudget: 700,
	},
	tags: ["block", "commerce", "product-detail", "pdp", "storefront"],
};
