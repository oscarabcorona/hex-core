import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingHeaderSchema: ComponentSchemaDefinition = {
	name: "marketing-header",
	displayName: "MarketingHeader",
	description:
		"A marketing site header: brand mark, inline primary nav on desktop, and a collapsible panel on mobile. Client Component (owns the open/close state). Theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "logo",
			type: "ReactNode",
			required: true,
			description: "Brand mark — a logo / wordmark node, ideally wrapping a link to '/'.",
		},
		{
			name: "links",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<{ label: ReactNode; href: string }>. Primary nav links shown inline on ≥md and stacked in the mobile panel.",
		},
		{
			name: "actions",
			type: "ReactNode",
			required: false,
			description: "Trailing actions (sign-in / CTA buttons).",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <header>." },
	],
	variants: [],
	slots: [
		{ name: "logo", description: "Brand mark.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Trailing CTA / sign-in buttons.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "border", "ring"],
	examples: [
		{
			title: "Header with nav and CTA",
			description: "Logo, three links, and a sign-in + CTA pair.",
			code: `import { MarketingHeader } from "@hex-core/components";
import { Button } from "@hex-core/components";

<MarketingHeader
  logo={<a href="/" className="text-lg font-semibold">Acme</a>}
  links={[
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/docs" },
  ]}
  actions={
    <>
      <Button variant="ghost" asChild><a href="/sign-in">Sign in</a></Button>
      <Button asChild><a href="/sign-up">Get started</a></Button>
    </>
  }
/>`,
			composition: ["marketing", "header", "navigation", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use as the top nav of a marketing / landing site. Pair with marketing-hero directly below it.",
		whenNotToUse:
			"Don't use as an in-app navigation chrome (use the sidebar / navigation-menu components). Don't nest interactive menus inside — keep links flat.",
		commonMistakes: [
			"Passing more than ~5 links — the inline row gets crowded; group secondary items under the CTA or a footer.",
			"Putting raw <a> tags in actions instead of <Button asChild><a>…</a></Button>, losing button styling.",
			"Forgetting the logo links to '/' — wrap the logo node in an anchor.",
		],
		relatedComponents: ["button", "navigation-menu", "marketing-hero", "marketing-footer"],
		accessibilityNotes:
			"The mobile toggle is a <button> with aria-expanded + aria-controls pointing at the panel and an aria-label that flips between 'Open menu' / 'Close menu'. Links are real anchors, keyboard-focusable, with visible focus rings.",
		tokenBudget: 700,
	},
	tags: ["block", "marketing", "header", "navigation", "landing"],
};
