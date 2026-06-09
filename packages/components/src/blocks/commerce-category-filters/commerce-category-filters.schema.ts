import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commerceCategoryFiltersSchema: ComponentSchemaDefinition = {
	name: "commerce-category-filters",
	displayName: "CommerceCategoryFilters",
	description:
		"Filter sidebar for a category page: a stack of collapsible filter groups (price, color, size, brand). Uses native <details> so no JS is needed for collapse — Server Component friendly. Each group's controls are caller-supplied; state and submission live with the consumer.",
	category: "block",
	subcategory: "commerce",
	props: [
		{
			name: "groups",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title; content: ReactNode; defaultOpen? }>. Filter groups. Each content is a caller-supplied stack of controls (Checkbox / RadioGroup / Slider / range Input).",
		},
		{ name: "title", type: "ReactNode", required: false, description: "Optional sidebar title (e.g. 'Filters')." },
		{ name: "actions", type: "ReactNode", required: false, description: "Optional header actions (e.g. a 'Clear all' link)." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <aside>." },
	],
	variants: [],
	slots: [
		{ name: "groups[].content", description: "Filter controls inside each group.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "actions", description: "Header actions (clear all).", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "border"],
	examples: [
		{
			title: "Sidebar with price + color filters",
			description: "Two collapsible groups with caller-supplied controls.",
			code: `import { CommerceCategoryFilters, Checkbox, Label, Slider } from "@hex-core/components";

<CommerceCategoryFilters
  title="Filters"
  actions={<a href="?reset" className="text-xs text-muted-foreground hover:text-foreground">Clear all</a>}
  groups={[
    {
      title: "Price",
      content: <Slider defaultValue={[0, 200]} max={500} step={10} />,
    },
    {
      title: "Color",
      content: (
        <div className="flex flex-col gap-2">
          {["Natural", "Black", "Charcoal"].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm"><Checkbox /> <span>{c}</span></label>
          ))}
        </div>
      ),
    },
  ]}
/>`,
			composition: ["commerce", "filters", "category", "storefront"],
		},
	],
	ai: {
		whenToUse:
			"Use on a category / search results page beside the product grid. The block is layout-only — pass real controls (Checkbox, RadioGroup, Slider, range Input) in each group's content. Wire selection state and result filtering in the parent.",
		whenNotToUse:
			"Don't use for storefront top nav (use commerce-store-nav). Don't use for in-product settings (use app-settings). Don't put the entire facet tree here — group by ~3–6 most-useful facets.",
		commonMistakes: [
			"Putting form submission inside the block — the block doesn't render a form; wrap your controls in a parent <form> if you want classic submit, or wire onChange handlers per control.",
			"Putting more than ~6 groups — long sidebars get ignored; lift secondary facets into a modal or 'More filters' affordance.",
			"Forgetting `<Label htmlFor>` on inputs — accessible names are the consumer's job.",
		],
		relatedComponents: ["checkbox", "radio-group", "slider", "input", "label", "commerce-category", "commerce-product-grid"],
		accessibilityNotes:
			"Root is an <aside> labelled 'Filters'. Each group uses native <details>/<summary> — keyboard-toggleable (Enter/Space) with built-in aria-expanded. The chevron rotates via CSS on [open]; it's aria-hidden so it doesn't pollute the summary's accessible name.",
		tokenBudget: 982,
	},
	tags: ["block", "commerce", "filters", "category", "storefront"],
};
