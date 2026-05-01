import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const kanbanSchema: ComponentSchemaDefinition = {
	name: "kanban",
	displayName: "Kanban",
	description:
		"Headless Kanban board with drag-to-reorder + drag-across-columns. Consumer keeps state as `{ id, title, cardIds }[]` and renders cards via children. Built on the shared `<Kanban>` + `<KanbanColumn>` + `<KanbanCard>` primitives over @dnd-kit. Columns are static in v1 (cards are the moving parts).",
	category: "component",
	subcategory: "data-display",
	props: [
		{
			name: "columns",
			type: "object",
			required: true,
			description:
				"Array of `{ id, title, cardIds }` describing each column. Order in the array is the rendered column order.",
		},
		{
			name: "onChange",
			type: "function",
			required: true,
			description:
				"Called with the next `columns` array after a drop. Receives the full new shape — no manual diffing required.",
		},
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description:
				"Render the columns + cards. Typically `columns.map(col => <KanbanColumn id={col.id}>{col.cardIds.map(cardId => <KanbanCard id={cardId}>...</KanbanCard>)}</KanbanColumn>)`.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the board container.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Render the columns + cards yourself via `<KanbanColumn>` + `<KanbanCard>`.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils", "dnd"],
		peer: ["react", "react-dom"],
		heavyPeer: [
			{
				name: "@dnd-kit/core",
				version: "^6.3.1",
				bundleKbGzip: 30,
				reason: "Drag-and-drop engine (sensors, context, collision detection)",
			},
			{
				name: "@dnd-kit/sortable",
				version: "^10.0.0",
				bundleKbGzip: 10,
				reason: "Sortable strategies + useSortable hook for cards",
			},
			{
				name: "@dnd-kit/utilities",
				version: "^3.2.2",
				bundleKbGzip: 3,
				reason: "CSS transform helpers used by KanbanCard",
			},
		],
	},
	tokensUsed: ["background", "muted", "muted-foreground", "accent", "ring"],
	examples: [
		{
			title: "Basic three-column board",
			description: "Standard To-do / Doing / Done board with text cards.",
			code: 'const [board, setBoard] = useState([\n  { id: "todo", title: "To do", cardIds: ["1", "2"] },\n  { id: "doing", title: "Doing", cardIds: ["3"] },\n  { id: "done", title: "Done", cardIds: [] },\n]);\nconst cards = { "1": "Wire DnD", "2": "Build Kanban", "3": "Ship PR" };\n\n<Kanban columns={board} onChange={setBoard}>\n  {board.map((col) => (\n    <KanbanColumn key={col.id} id={col.id} title={col.title}>\n      {col.cardIds.map((cardId) => (\n        <KanbanCard key={cardId} id={cardId}>{cards[cardId]}</KanbanCard>\n      ))}\n    </KanbanColumn>\n  ))}\n</Kanban>',
			composition: ["kanban", "board", "dnd"],
		},
		{
			title: "Cards composing <Card>",
			description: "Use the existing Card primitive inside KanbanCard for richer card UI.",
			code: '<KanbanCard id={item.id}>\n  <Card>\n    <CardHeader>\n      <CardTitle>{item.title}</CardTitle>\n      <CardDescription>{item.assignee}</CardDescription>\n    </CardHeader>\n    <CardContent><Badge>{item.priority}</Badge></CardContent>\n  </Card>\n</KanbanCard>',
			composition: ["kanban", "card"],
		},
	],
	ai: {
		whenToUse:
			"Project boards, agent task queues, build pipelines visualization, any column-grouped sortable list. Pair with a backend persistence call inside `onChange` so reorders survive a refresh.",
		whenNotToUse:
			"Don't use for a single sortable list (use `<SortableList>` from `dnd`). Don't use for free-positioning canvases (use `<Canvas>` with reactflow). Don't bake server-state writes into `onChange` synchronously — debounce or use optimistic state.",
		commonMistakes: [
			"Mutating the columns array in onChange — pass the returned array verbatim. Mutation breaks React's identity-based re-render and causes ghost cards",
			"Using array indices as cardIds — indices shift on reorder and break DnD. Use stable string IDs",
			"Forgetting that each KanbanCard id must be unique ACROSS columns, not just within one column — ids are the canonical identity for cross-column drag",
			"Wrapping the whole Kanban in an extra DndContext — Kanban already provides one. Nested contexts confuse dnd-kit's collision detection",
		],
		relatedComponents: ["dnd", "card", "data-table"],
		accessibilityNotes:
			"@dnd-kit's KeyboardSensor is wired by default — Tab to focus a card, Space/Enter to pick up, arrow keys to move (within or across columns), Space/Enter to drop, Escape to cancel. Live-region announcements describe drag state for screen readers. The drag-handle visual is the entire card; consumers can override the cursor via className.",
		tokenBudget: 460,
	},
	tags: ["kanban", "board", "dnd", "sortable", "drag-and-drop", "project-management"],
};
