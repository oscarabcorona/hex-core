import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appGridListSchema: ComponentSchemaDefinition = {
	name: "app-grid-list",
	displayName: "AppGridList",
	description:
		"Grid variant of app-stacked-list — same item shape rendered as cards in a 2- or 3-column grid. Each card: optional leading media + title + meta + description + actions. Cards become a single linked surface when href is set. Presentational and theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "items",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; description?; meta?; leading?: ReactNode; actions?: ReactNode; href? }>. Set href to make the whole card a single linked anchor.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Cards per row on ≥lg: 'two' or 'three'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "Standard card grid for entities (projects, dashboards)." },
				{ value: "two", description: "Two across.", useWhen: "Longer descriptions or larger media previews." },
			],
		},
	],
	slots: [
		{ name: "items[].leading", description: "Card media region (avatar / preview).", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "items[].actions", description: "Card footer actions.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "card", "card-foreground", "border", "ring"],
	examples: [
		{
			title: "Projects grid",
			description: "Three cards with leading icon, title, meta, description, and an action.",
			code: `import { AppGridList, Button } from "@hex-core/components";

<AppGridList
  title="Projects"
  items={[
    {
      title: "Customer dashboard",
      meta: "Updated 2h ago",
      description: "Internal analytics for the sales team.",
      href: "/projects/customer-dashboard",
    },
  ]}
/>`,
			composition: ["app", "list", "grid-list", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use for browsing entities (projects, dashboards, files) where a card preview reads better than a row. Pair href on each card to navigate to the entity's detail page. For columnar data, use app-data-table; for compact row lists, use app-stacked-list.",
		whenNotToUse:
			"Don't use for tabular data (use app-data-table) or feed-style activity (use app-feed). Don't mix card sizes — let the grid stay uniform.",
		commonMistakes: [
			"Putting actions inside a linked card — nested interactive elements; either drop href or move actions off the card.",
			"Mixing very short descriptions with very long ones — cards line up by max content; truncate or normalize.",
			"Forgetting an empty-state — render <Empty> when items is [].",
		],
		relatedComponents: ["app-stacked-list", "app-data-table", "card", "empty"],
		accessibilityNotes:
			"When href is set the card is a single anchor with an accessible name from the title. Focus ring is visible (not inset). Unlinked cards render as <article>.",
		tokenBudget: 982,
	},
	tags: ["block", "app", "list", "grid-list", "dashboard"],
};
