import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const gridSchema: ComponentSchemaDefinition = {
	name: "grid",
	displayName: "Grid",
	description:
		"CSS grid with column-count presets and token-bound gap. Pass `cols=\"auto-fit\"` + `minColWidth` for responsive grids without media queries.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "cols",
			type: "enum",
			required: false,
			default: "3",
			description:
				"Number of fixed columns, or `\"auto-fit\"` for responsive tracks (use with `minColWidth`).",
			enumValues: ["1", "2", "3", "4", "6", "auto-fit"],
		},
		{
			name: "gap",
			type: "enum",
			required: false,
			default: "md",
			description: "Gap between cells, bound to `--gap-*` tokens.",
			enumValues: ["xs", "sm", "md", "lg", "xl"],
		},
		{
			name: "align",
			type: "enum",
			required: false,
			default: "stretch",
			description: "Cell vertical alignment within their grid row.",
			enumValues: ["start", "center", "end", "stretch"],
		},
		{
			name: "minColWidth",
			type: "string",
			required: false,
			default: "16rem",
			description:
				"Min track size for `cols=\"auto-fit\"` (e.g. `\"20rem\"`). Ignored when `cols` is a fixed integer.",
		},
	],
	variants: [
		{
			name: "cols",
			description: "Column count or `auto-fit` mode.",
			values: [
				{ value: "1", description: "Single column — items stack vertically inside the grid." },
				{ value: "2", description: "Two even columns." },
				{ value: "3", description: "Default — three even columns." },
				{ value: "4", description: "Four even columns." },
				{ value: "6", description: "Six even columns — dense layouts." },
				{ value: "auto-fit", description: "Tracks repeat to fill width, never below `minColWidth`." },
			],
			default: "3",
		},
		{
			name: "gap",
			description: "Gap between cells, bound to `--gap-*` tokens.",
			values: [
				{ value: "xs", description: "0.25rem — minimal separation." },
				{ value: "sm", description: "0.5rem — tight grid." },
				{ value: "md", description: "1rem — default; standard rhythm." },
				{ value: "lg", description: "1.5rem — generous separation." },
				{ value: "xl", description: "2rem — major separation between cards." },
			],
			default: "md",
		},
		{
			name: "align",
			description: "Cell vertical alignment within their grid row.",
			values: [
				{ value: "start", description: "Cells align to top of row." },
				{ value: "center", description: "Cells center vertically." },
				{ value: "end", description: "Cells align to bottom of row." },
				{ value: "stretch", description: "Default — cells fill row height." },
			],
			default: "stretch",
		},
	],
	slots: [
		{
			name: "children",
			description: "Grid cells — typically Cards, images, or any uniform block.",
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
			title: "Three-column card grid",
			description: "Fixed 3 columns with medium gap.",
			code: '<Grid cols={3} gap="md">\n  {items.map((i) => <Card key={i.id}>{i.title}</Card>)}\n</Grid>',
		},
		{
			title: "Responsive auto-fit",
			description: "Tracks fit as many 20rem columns as the viewport allows; no media queries needed.",
			code: '<Grid cols="auto-fit" minColWidth="20rem" gap="lg">\n  {items.map(...)}\n</Grid>',
		},
	],
	ai: {
		whenToUse:
			"Use for visually-aligned grids of similar items: card galleries, image walls, dashboard tiles, settings panels. Prefer `cols=\"auto-fit\"` + `minColWidth` over hand-written breakpoints when the column count should adapt to viewport width.",
		whenNotToUse:
			"Don't use for one-dimensional flows — use `Stack` (vertical) or `Cluster` (horizontal). Don't use for tabular data — use `<table>` or DataTable. Don't fight `Grid` to make uneven columns; if cells need different sizes, use a flexbox layout or a CSS grid with named tracks directly.",
		commonMistakes: [
			"Setting `cols={5}` and getting nothing — the preset only supports 1/2/3/4/6 (deliberate, to avoid odd visual rhythms); use `cols=\"auto-fit\"` for arbitrary counts",
			"Passing `cols=\"auto-fit\"` without `minColWidth` — the default `16rem` may not match your design intent",
			"Using `Grid` for two children when `Cluster` or `Stack` would communicate intent better",
		],
		relatedComponents: ["stack", "cluster", "container", "card"],
		accessibilityNotes:
			"Grid is presentational. If the grid renders a list of similar items, wrap in `<ul>`/`<li>` for screen-reader semantics — Grid only handles visual layout.",
		tokenBudget: 1374,
	},
	tags: ["grid", "layout", "css-grid", "responsive", "auto-fit", "primitive"],
};
