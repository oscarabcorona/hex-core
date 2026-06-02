import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const clusterSchema: ComponentSchemaDefinition = {
	name: "cluster",
	displayName: "Cluster",
	description:
		"Horizontal flex flow with wrap and token-bound gap. Use for tag lists, button rows, breadcrumbs, and any group of equally-weighted inline items.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "gap",
			type: "enum",
			required: false,
			default: "md",
			description:
				"Gap between items, bound to `--gap-*` tokens. Applies to both row and column gaps when wrapping.",
			enumValues: ["xs", "sm", "md", "lg", "xl"],
		},
		{
			name: "align",
			type: "enum",
			required: false,
			default: "center",
			description:
				"Cross-axis alignment (CSS `align-items`). `baseline` aligns text-baselines for mixed-size siblings; `stretch` makes items fill row height (useful for wrap-card layouts).",
			enumValues: ["start", "center", "end", "stretch", "baseline"],
		},
		{
			name: "justify",
			type: "enum",
			required: false,
			default: "start",
			description: "Main-axis distribution (CSS `justify-content`).",
			enumValues: ["start", "center", "end", "between"],
		},
	],
	variants: [
		{
			name: "gap",
			description: "Gap between items, bound to `--gap-*` tokens (applies to row + column gaps when wrapping).",
			values: [
				{ value: "xs", description: "0.25rem — barely-there spacing." },
				{ value: "sm", description: "0.5rem — tight chip group." },
				{ value: "md", description: "1rem — default; standard rhythm." },
				{ value: "lg", description: "1.5rem — generous separation." },
				{ value: "xl", description: "2rem — section-scale spacing." },
			],
			default: "md",
		},
		{
			name: "align",
			description: "Cross-axis alignment (CSS `align-items`).",
			values: [
				{ value: "start", description: "Items align to top of row." },
				{ value: "center", description: "Default — items center vertically in the row." },
				{ value: "end", description: "Items align to bottom of row." },
				{ value: "stretch", description: "Items fill row height — use for wrap layouts of equal-height cards." },
				{ value: "baseline", description: "Text-baselines align across mixed-size siblings." },
			],
			default: "center",
		},
		{
			name: "justify",
			description: "Main-axis distribution (CSS `justify-content`).",
			values: [
				{ value: "start", description: "Default — items pack to start of row." },
				{ value: "center", description: "Items center horizontally." },
				{ value: "end", description: "Items pack to end of row." },
				{ value: "between", description: "First item flush left, last flush right, even distribution." },
			],
			default: "start",
		},
	],
	slots: [
		{
			name: "children",
			description: "Items to lay out horizontally with wrap.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority"],
		internal: ["lib/utils"],
		peer: ["react"],
	},
	tokensUsed: ["--gap-xs", "--gap-sm", "--gap-md", "--gap-lg", "--gap-xl"],
	examples: [
		{
			title: "Tag chips",
			description: "Small gap, wraps when overflowing the row.",
			code: '<Cluster gap="sm">\n  {tags.map((t) => <Badge key={t}>{t}</Badge>)}\n</Cluster>',
		},
		{
			title: "Action bar",
			description: "Right-aligned buttons inside a panel footer.",
			code: '<Cluster gap="sm" justify="end">\n  <Button variant="ghost">Cancel</Button>\n  <Button>Save</Button>\n</Cluster>',
		},
	],
	ai: {
		whenToUse:
			"Use for any horizontal row of items that should wrap when space runs out: tag clouds, breadcrumbs, button rows, social-link icon strips, inline metadata badges. Pick `Cluster` over `flex` when you want predictable wrap + gap behavior.",
		whenNotToUse:
			"Don't use for two-element rows where you need precise positional control (left/right) — use `Stack` rotated or a flex with `justify-between` directly. Don't use for grid-aligned layouts where columns must line up across rows — use `Grid`.",
		commonMistakes: [
			"Forgetting that `Cluster` wraps — adding `flex-nowrap` defeats the purpose; if you don't want wrap, use a flex row or `Stack` rotated",
			"Setting `align=\"baseline\"` for icon+text rows where the icon's bbox doesn't have a baseline — use `center` instead",
			"Reaching for `Cluster` for tabular alignment — use `Grid` or a real `<table>` when columns must line up",
		],
		relatedComponents: ["stack", "grid", "container"],
		accessibilityNotes:
			"Cluster is presentational. Lists of navigational items should be wrapped in `<nav>` (and ideally `<ul>` / `<li>`). Lists of tags can use a list element for screen-reader semantics; the visual wrap is independent.",
		tokenBudget: 1301,
	},
	tags: ["cluster", "layout", "flex", "wrap", "horizontal", "primitive"],
};
