import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const tableSchema: ComponentSchemaDefinition = {
	name: "table",
	displayName: "Table",
	description: "Styled HTML table primitives (Table / TableHeader / TableBody / TableRow / TableHead / TableCell / TableCaption / TableFooter). Low-level building blocks — use DataTable for sorting/filtering/pagination.",
	category: "component",
	subcategory: "data",
	props: [
		{ name: "className", type: "string", required: false, description: "Additional CSS classes on the <table>" },
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "TableHeader + TableBody + TableFooter + TableCaption. Use TableRow/TableHead/TableCell inside.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Basic table",
			description: "Three-column styled table with header + rows",
			code: '<Table>\n  <TableCaption>A list of your recent invoices.</TableCaption>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Invoice</TableHead>\n      <TableHead>Status</TableHead>\n      <TableHead className="text-right">Amount</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell className="font-medium">INV001</TableCell>\n      <TableCell>Paid</TableCell>\n      <TableCell className="text-right">$250.00</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>',
		},
	],
	ai: {
		whenToUse:
			"Use for simple tabular data where you render rows manually: invoice lists, pricing rows, settings tables. Responsive container wraps the <table> to allow horizontal scroll on small screens.",
		whenNotToUse:
			"Don't use for large datasets that need sorting/filtering/pagination (use DataTable). Don't use for layout (use CSS grid/flex). Don't use for <form> field arrays (use native fields).",
		commonMistakes: [
			"Using <div> grids instead of a real <table> for tabular data (breaks a11y)",
			"Putting interactive controls in headers without keyboard semantics",
			"Missing TableCaption when the table has no other label",
		],
		relatedComponents: ["data-table", "pagination"],
		accessibilityNotes:
			"Semantic <table> / <thead> / <tbody> is used, so screen readers announce rows/columns. Include a TableCaption or aria-label. Mark column sort buttons with aria-sort.",
		tokenBudget: 582,
	},
	tags: ["table", "data", "rows", "tabular"],
};
