import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appStackedListSchema: ComponentSchemaDefinition = {
	name: "app-stacked-list",
	displayName: "AppStackedList",
	description:
		"Labeled stacked list of items (members, inbox, threads, notifications). Each row: leading element + title + meta + description + trailing actions. Rows become a single linked surface when href is set. Distinct from app-data-table (no columns / no header). Presentational and theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "items",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; description?; meta?; leading?: ReactNode; actions?: ReactNode; href? }>. Set href to make the whole row a single linked anchor.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "divided",
			type: "boolean",
			required: false,
			default: true,
			description: "Show dividers between rows. Defaults to true.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "items[].leading", description: "Leading avatar / icon / status dot.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "items[].actions", description: "Trailing actions (button / menu).", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "card", "card-foreground", "border", "ring"],
	examples: [
		{
			title: "Workspace members list",
			description: "Avatar + name + role + actions per row.",
			code: `import { AppStackedList, Avatar, AvatarFallback, Button } from "@hex-core/components";

<AppStackedList
  title="Members"
  items={[
    {
      title: "Ada Lovelace",
      description: "ada@example.com",
      meta: "Owner",
      leading: <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>,
      actions: <Button variant="ghost" size="sm">Manage</Button>,
    },
  ]}
/>`,
			composition: ["app", "list", "stacked-list", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use for lists where each item is one entity (a person, a thread, a notification) — not tabular data. Set href to make the whole row a link to the item's detail page. For multi-column data, use app-data-table.",
		whenNotToUse:
			"Don't use for tabular data with sortable columns (use app-data-table). Don't put more than ~50 items without virtualization — long lists need a scroll container or pagination.",
		commonMistakes: [
			"Putting actions inside a clickable row (href set) — nested interactive elements break the row's linked behavior. Either drop the row href and link the title, OR drop per-row actions.",
			"Long descriptions that wrap — the row uses `truncate`; long descriptions get clipped. Move detail to a hover popover or expanded view.",
			"Using AppStackedList for what should be data-table (sortable columns) — the patterns are intentionally different.",
		],
		relatedComponents: ["app-grid-list", "app-feed", "app-data-table", "avatar", "button"],
		accessibilityNotes:
			"When href is set the row is a single anchor with an accessible name from the title. Focus ring is inset so it doesn't get clipped by the rounded container. Trailing actions inside a linked row are an anti-pattern (nested interactive); the schema notes this.",
		tokenBudget: 650,
	},
	tags: ["block", "app", "list", "stacked-list", "dashboard"],
};
