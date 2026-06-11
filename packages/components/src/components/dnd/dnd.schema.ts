import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dndSchema: ComponentSchemaDefinition = {
	name: "dnd",
	displayName: "DnD",
	description:
		"Composable drag-and-drop primitives backed by @dnd-kit. Exports `<DndProvider>` (root context with sensible sensors), `<SortableList>` (turnkey wrapper), and `useSortableItem(id)` (headless hook for advanced consumers like Kanban cards, DataTable rows, Tree nodes).",
	category: "component",
	subcategory: "primitive",
	props: [
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "DndProvider: subtree to wrap. SortableList uses items + renderItem instead.",
		},
		{
			name: "onDragEnd",
			type: "function",
			required: false,
			description:
				"DndProvider: called with `{active, over}` after a drop. SortableList handles this internally and calls `onChange` with the new array.",
		},
		{
			name: "items",
			type: "object",
			required: false,
			description:
				"SortableList: array of `{ id, ... }` objects. Order in the array is the rendered order; reordering fires `onChange` with the next array.",
		},
		{
			name: "renderItem",
			type: "function",
			required: false,
			description:
				"SortableList: `(item, index) => ReactNode`. Typically returns a wrapper that calls `useSortableItem(item.id)` and applies its refs/listeners.",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description: "SortableList: called with the new item array after a drop.",
		},
		{
			name: "strategy",
			type: "enum",
			required: false,
			default: "vertical",
			description:
				"SortableList: collision strategy. One of \"vertical\" | \"horizontal\" | \"rect\". `rect` is for grid layouts (e.g. Kanban columns).",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "SortableList: additional CSS classes on the wrapper div.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
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
				reason: "Sortable strategies + useSortable hook",
			},
			{
				name: "@dnd-kit/utilities",
				version: "^3.2.2",
				bundleKbGzip: 3,
				reason: "CSS transform helpers used by useSortableItem",
			},
		],
	},
	tokensUsed: [],
	examples: [
		{
			title: "SortableList with Card",
			description: "Reorder a list of <Card> components in three lines. No DnD code in the consumer.",
			code: 'const [items, setItems] = useState([{id: "1", title: "First"}, {id: "2", title: "Second"}]);\n\n<SortableList\n  items={items}\n  onChange={setItems}\n  renderItem={(item) => (\n    <SortableCardWrapper id={item.id}>\n      <Card><CardHeader>{item.title}</CardHeader></Card>\n    </SortableCardWrapper>\n  )}\n/>\n\nfunction SortableCardWrapper({id, children}) {\n  const { setNodeRef, attributes, listeners, style } = useSortableItem(id);\n  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{children}</div>;\n}',
			composition: ["dnd", "card", "list"],
		},
		{
			title: "DataTable row reorder pattern",
			description: "Wrap each row with useSortableItem; the same hook works in any table-row context.",
			code: '// Inside a <DndProvider> wrapping the table body:\nfunction SortableRow({id, children}) {\n  const { setNodeRef, attributes, listeners, style, isDragging } = useSortableItem(id);\n  return (\n    <TableRow ref={setNodeRef} style={style} {...attributes} className={isDragging ? "opacity-50" : ""}>\n      <TableCell><span {...listeners} className="cursor-grab">⠿</span></TableCell>\n      {children}\n    </TableRow>\n  );\n}',
			composition: ["dnd", "data-table", "row"],
		},
	],
	ai: {
		whenToUse:
			"Whenever a list, grid, or tree needs reorder. Use `<SortableList>` for the 80% case (single-axis sorting). Drop down to `useSortableItem` for Kanban (multi-list with cross-list drag), DataTable rows, Tree nodes, or any custom layout where you control the wrapper element.",
		whenNotToUse:
			"Don't use for file drag-and-drop (use `<Dropzone>` — different concept, browser File API). Don't use for canvas-style free-positioning (use `<Canvas>` with reactflow). Don't reach for this if you only need to reorder via up/down buttons — that's lighter-weight without a DnD engine.",
		commonMistakes: [
			"Forgetting that each item needs a stable `id` field — re-using array index as id breaks DnD on reorder because the indices shift",
			"Mutating the items array in onChange instead of replacing it — use the returned array verbatim",
			"Calling useSortableItem outside a SortableContext — the hook will throw or no-op silently. SortableList provides one automatically; manual DndProvider users must wrap with <SortableContext items={ids} strategy={...}>",
			"Spreading `listeners` on a separate handle without keeping `attributes` on the wrapper — the wrapper needs ARIA wiring even if the handle is the only drag target",
		],
		relatedComponents: ["kanban", "card", "data-table", "tree"],
		accessibilityNotes:
			"@dnd-kit ships KeyboardSensor by default — Tab to focus a draggable, Space/Enter to pick up, arrow keys to move, Space/Enter to drop, Escape to cancel. Live-region announcements are built in. The PointerSensor uses a 4px activation distance so accidental clicks don't trigger drag.",
		tokenBudget: 420,
	},
	tags: ["dnd", "sortable", "drag-and-drop", "primitive", "headless", "dnd-kit"],
};
