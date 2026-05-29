import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const stackSchema: ComponentSchemaDefinition = {
	name: "stack",
	displayName: "Stack",
	description:
		"Vertical flex flow with token-bound gap. The headless equivalent of `<div className=\"flex flex-col gap-X\">` with consistent spacing scale.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "gap",
			type: "enum",
			required: false,
			default: "md",
			description: "Vertical spacing between children, bound to `--gap-*` tokens.",
			enumValues: ["xs", "sm", "md", "lg", "xl"],
		},
		{
			name: "align",
			type: "enum",
			required: false,
			default: "stretch",
			description: "Cross-axis alignment (CSS `align-items`).",
			enumValues: ["start", "center", "end", "stretch"],
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
			description: "Vertical gap between children, bound to `--gap-*` tokens.",
			values: [
				{ value: "xs", description: "0.25rem — barely-there spacing." },
				{ value: "sm", description: "0.5rem — tight grouping." },
				{ value: "md", description: "1rem — default; standard rhythm." },
				{ value: "lg", description: "1.5rem — section-level spacing." },
				{ value: "xl", description: "2rem — major separation." },
			],
			default: "md",
		},
		{
			name: "align",
			description: "Cross-axis alignment (CSS `align-items`).",
			values: [
				{ value: "start", description: "Children align to left edge." },
				{ value: "center", description: "Children center horizontally." },
				{ value: "end", description: "Children align to right edge." },
				{ value: "stretch", description: "Default — children fill container width." },
			],
			default: "stretch",
		},
		{
			name: "justify",
			description: "Main-axis distribution (CSS `justify-content`).",
			values: [
				{ value: "start", description: "Default — children pack to top." },
				{ value: "center", description: "Children center vertically." },
				{ value: "end", description: "Children pack to bottom." },
				{ value: "between", description: "First child to top, last to bottom, even distribution." },
			],
			default: "start",
		},
	],
	slots: [
		{
			name: "children",
			description: "Items to stack vertically.",
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
			title: "Form sections",
			description: "Lg gap separates labelled groups; nested Stack with sm gap groups label+input.",
			code: '<Stack gap="lg">\n  <Stack gap="sm"><Label>Email</Label><Input /></Stack>\n  <Stack gap="sm"><Label>Password</Label><Input type="password" /></Stack>\n  <Button>Submit</Button>\n</Stack>',
		},
		{
			title: "Centered hero",
			description: "Center children horizontally for a centered call-to-action stack.",
			code: '<Stack gap="md" align="center">\n  <h1>Title</h1>\n  <p>Subtitle</p>\n  <Button>Get started</Button>\n</Stack>',
		},
	],
	ai: {
		whenToUse:
			"Use anywhere you'd write `flex flex-col gap-X`. Default for vertical lists of dissimilar items (label + input + helper text), section bodies, sidebar items, button groups stacked vertically.",
		whenNotToUse:
			"Don't use for tabular data — use `<table>` or DataTable. Don't use for grid-like layouts — use `Grid`. Don't reach for `Stack` when a single child needs no spacing — just render the child.",
		commonMistakes: [
			"Setting `gap=\"md\"` then adding `mt-*` / `space-y-*` on individual children — pick one spacing system",
			"Using `align=\"center\"` and wondering why children expand to full width — that's the `stretch` default for cross-axis",
			"Nesting Stack inside Stack with the same gap when one Stack with two children would suffice",
		],
		relatedComponents: ["cluster", "grid", "container"],
		accessibilityNotes:
			"Stack is presentational. Wrap stacked navigation links in a `<nav>`, stacked form fields in a `<form>`, etc. — Stack does not contribute landmark semantics.",
		tokenBudget: 1197,
	},
	tags: ["stack", "layout", "flex", "column", "vertical", "primitive"],
};
