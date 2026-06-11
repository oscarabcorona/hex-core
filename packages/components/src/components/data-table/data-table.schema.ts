import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dataTableSchema: ComponentSchemaDefinition = {
	name: "data-table",
	displayName: "Data Table",
	description: "Generic data-driven table built on TanStack Table + Hex Core Table primitives. Pass columns + data; add sorting/filtering/pagination via TanStack hooks.",
	category: "component",
	subcategory: "data",
	props: [
		{ name: "columns", type: "object", required: true, description: "ColumnDef<TData, TValue>[] from @tanstack/react-table" },
		{ name: "data", type: "object", required: true, description: "Array of row data" },
		{
			name: "caption",
			type: "ReactNode",
			required: false,
			description: "Visible caption rendered below the table; announced by screen readers when entering the table",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			description: "Accessible label forwarded as aria-label on the underlying <table>; use when no visible caption is shown",
		},
		{
			name: "reorderableRows",
			type: "boolean",
			required: false,
			default: false,
			description:
				"Enable drag-to-reorder rows. Adds a leading drag-handle column, wraps body in a DnD context. Requires `getRowId` (throws otherwise). Backwards-compatible default `false`.",
		},
		{
			name: "onRowReorder",
			type: "function",
			required: false,
			description:
				"Called with the next ordered list of row IDs after a drop. Required when `reorderableRows` is true; consumer re-derives `data` in the new order.",
		},
		{
			name: "getRowId",
			type: "function",
			required: false,
			description:
				"Stable row identifier `(row, index) => string`. Required when `reorderableRows` is true (TanStack's default index-based id breaks DnD on reorder).",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@tanstack/react-table", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "components/table/table", "dnd"],
		peer: ["react", "react-dom"],
		heavyPeer: [
			{
				name: "@dnd-kit/core",
				version: "^6.3.1",
				bundleKbGzip: 30,
				reason: "Required when reorderableRows={true}; not loaded otherwise",
			},
			{
				name: "@dnd-kit/sortable",
				version: "^10.0.0",
				bundleKbGzip: 10,
				reason: "Required when reorderableRows={true}",
			},
			{
				name: "@dnd-kit/utilities",
				version: "^3.2.2",
				bundleKbGzip: 3,
				reason: "Required when reorderableRows={true}",
			},
		],
	},
	tokensUsed: ["border", "muted", "muted-foreground"],
	examples: [
		{
			title: "Basic data table",
			description: "Three-column table rendered from TanStack column defs",
			code: 'import type { ColumnDef } from "@tanstack/react-table";\nimport { DataTable } from "@/components/ui/data-table";\n\ntype Payment = { id: string; amount: number; status: "pending" | "paid" | "failed"; email: string };\n\nconst columns: ColumnDef<Payment>[] = [\n  { accessorKey: "status", header: "Status" },\n  { accessorKey: "email", header: "Email" },\n  { accessorKey: "amount", header: "Amount" },\n];\n\nconst data: Payment[] = [\n  { id: "1", amount: 100, status: "paid", email: "a@x.com" },\n  { id: "2", amount: 250, status: "pending", email: "b@x.com" },\n];\n\nexport function Example() {\n  return <DataTable columns={columns} data={data} />;\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for tabular data that needs sorting, filtering, pagination, or row selection. Define columns once, feed data — TanStack handles the row model. Add more features incrementally (getSortedRowModel, getFilteredRowModel, getPaginationRowModel).",
		whenNotToUse:
			"Don't use for static/simple tables (use Table primitives directly). Don't use for virtualized very-large lists (use TanStack Virtual). Don't use for grid layouts (use CSS grid). DataTable is a Client Component (uses useReactTable hook) — fetch data in a Server Component and pass it as props.",
		commonMistakes: [
			"Forgetting getCoreRowModel() (table renders nothing)",
			"Recreating columns array on every render (breaks memoization — wrap in useMemo or define outside the component)",
			"Using accessorKey with nested paths without accessorFn",
			"Not adding filter/sort row models when those features are needed",
			"Shipping a table without `caption` or `aria-label` — the table is unlabelled to assistive tech",
			"Setting reorderableRows={true} without getRowId — throws at render. Pass `getRowId={(row) => row.id}` (or whatever your stable key field is)",
		],
		relatedComponents: ["table", "pagination"],
		accessibilityNotes:
			"Pass either `caption` (visible) or `aria-label` so screen readers announce the table when the user enters it. Add aria-sort to sortable column headers. Announce filter/sort changes via aria-live for dynamic updates.",
		tokenBudget: 820,
	},
	tags: ["data-table", "tanstack", "sortable", "filterable", "paginated"],
};
