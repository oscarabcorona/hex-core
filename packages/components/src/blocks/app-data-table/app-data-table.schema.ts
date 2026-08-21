import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appDataTableSchema: ComponentSchemaDefinition = {
	name: "app-data-table",
	displayName: "AppDataTable",
	description:
		"Page-level data-table view: a header row (title + description and a toolbar), a bordered table surface, and an optional footer for pagination. Layout only — supply the actual table as children. Presentational and theme-driven.",
	category: "block",
	subcategory: "app",
	props: [
		{ name: "children", type: "ReactNode", required: true, description: "The table itself — typically a <DataTable> or <Table>." },
		{ name: "title", type: "ReactNode", required: false, description: "Section title above the table." },
		{ name: "description", type: "ReactNode", required: false, description: "Optional copy under the title." },
		{
			name: "toolbar",
			type: "ReactNode",
			required: false,
			description: "Toolbar region (search field, filters, 'Add' button) aligned right of the title.",
		},
		{ name: "footer", type: "ReactNode", required: false, description: "Footer region under the table (pagination, row count)." },
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [],
	slots: [
		{ name: "toolbar", description: "Search / filters / actions.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "children", description: "The table.", required: true, acceptedTypes: ["ReactNode"] },
		{ name: "footer", description: "Pagination / row count.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "card", "border"],
	examples: [
		{
			title: "Users table view",
			description: "Title, a search + add toolbar, the table, and pagination.",
			code: `import { AppDataTable, DataTable, Input, Button, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@hex-core/components";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

const rows = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Owner" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", role: "Admin" },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", role: "Member" },
];

<AppDataTable
  title="Users"
  description="Manage workspace members."
  toolbar={<><Input placeholder="Search…" className="w-56" /><Button size="sm">Add user</Button></>}
  footer={
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationNext href="#" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  }
>
  <DataTable columns={columns} data={rows} aria-label="Workspace members" />
</AppDataTable>`,
			composition: ["app", "data-table", "table", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use to frame a list/table page: a header with search and actions, the table, and pagination. Drop a DataTable or Table into children.",
		whenNotToUse:
			"Don't use it as the data grid itself — it's the frame; the table comes from the data-table or table component. Don't use for dashboards of metrics (use app-stats).",
		commonMistakes: [
			"Expecting sorting/filtering from this block — it's layout; that logic lives in the DataTable you pass as children.",
			"Putting the page <h1> here when AppShell's header already has one — this title is a section <h2>.",
			"Omitting a footer with pagination on long tables, leaving no way to page.",
		],
		relatedComponents: ["data-table", "table", "pagination", "input", "button", "app-shell"],
		accessibilityNotes:
			"The section title renders as an <h2>. The block doesn't add table semantics — those come from the Table/DataTable in children. Toolbar controls should carry their own labels (e.g. a search input with an accessible name).",
		tokenBudget: 896,
	},
	tags: ["block", "app", "data-table", "table", "dashboard"],
};
