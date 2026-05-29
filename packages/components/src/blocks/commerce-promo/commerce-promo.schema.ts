import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commercePromoSchema: ComponentSchemaDefinition = {
	name: "commerce-promo",
	displayName: "CommercePromo",
	description:
		"Featured-deal promo banner: heading + subcopy + CTA + media, with image-left, image-right, or overlay layouts. Drop it between catalog sections to surface a sale, new collection, or seasonal campaign. Presentational and theme-driven.",
	category: "block",
	subcategory: "commerce",
	props: [
		{ name: "title", type: "ReactNode", required: true, description: "Promo headline." },
		{ name: "description", type: "ReactNode", required: false, description: "Supporting subcopy below the title." },
		{ name: "actions", type: "ReactNode", required: false, description: "Call-to-action buttons. Pass one or more <Button>." },
		{ name: "media", type: "ReactNode", required: false, description: "Promo media (illustration / screenshot / lifestyle image)." },
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Optional eyebrow above the title." },
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "image-right",
			description: "'image-right' (default), 'image-left' (flipped), or 'overlay' (copy layered over media full-bleed).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "variant",
			description: "Layout.",
			default: "image-right",
			values: [
				{ value: "image-right", description: "Copy left, image right on ≥lg.", useWhen: "Standard promo, image reads as the visual punch on the right." },
				{ value: "image-left", description: "Image left, copy right on ≥lg.", useWhen: "Alternating with an image-right promo on the same page." },
				{ value: "overlay", description: "Copy layered over full-bleed media.", useWhen: "Strong lifestyle photography that should fill the band." },
			],
		},
	],
	slots: [
		{ name: "media", description: "Promo image / video region.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "CTA buttons.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "primary", "primary-foreground"],
	examples: [
		{
			title: "Image-right seasonal promo",
			description: "Headline, subcopy, CTA, and lifestyle image.",
			code: `import { CommercePromo, Button } from "@hex-core/components";

<CommercePromo
  eyebrow="Limited time"
  title="Summer collection — 20% off"
  description="New canvas totes, in five new colors. While they last."
  actions={<Button size="lg">Shop the collection</Button>}
  media={<img src="/promos/summer.jpg" alt="Summer canvas totes in lifestyle setting" />}
/>`,
			composition: ["commerce", "promo", "campaign", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use to feature a sale, new collection, or campaign on the storefront. 'image-right' / 'image-left' for product-led promos; 'overlay' when the image alone tells the story.",
		whenNotToUse:
			"Don't use as the only thing on a page (use commerce-product-grid for catalog). Don't stack multiple promos in a row — competing CTAs dilute conversion.",
		commonMistakes: [
			"Using variant='overlay' with low-contrast media — the copy renders on top in primary-foreground; check the foreground contrast against your photo.",
			"Forgetting alt text on the promo image, especially for variant='overlay' where the image is decorative-ish but still informative.",
			"Lifestyle imagery cropped wrong for the aspect — supply imagery sized for a wide hero band.",
		],
		relatedComponents: ["marketing-cta", "marketing-hero", "commerce-product-grid", "button"],
		accessibilityNotes:
			"Section title is <h2>. Media images need alt text describing the promo, even in overlay variant. Overlay copy uses primary-foreground; check contrast against your photo via a manual audit.",
		tokenBudget: 1080,
	},
	tags: ["block", "commerce", "promo", "campaign", "storefront"],
};
