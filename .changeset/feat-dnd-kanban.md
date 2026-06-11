---
"@hex-core/components": minor
"@hex-core/registry": minor
---

feat(dnd, kanban): composable drag-and-drop primitives + Kanban + opt-in reorder for DataTable rows and Tree top-level nodes

Adds shared DnD infrastructure that hex-core compounds opt into, plus a canonical Kanban consumer. Designed so Kanban, sortable card lists, DataTable row reorder, and Tree node reorder all share the same `@dnd-kit` foundation — no per-feature DnD code.

**New components (`@hex-core/components`):**

- **`<DndProvider>`** — root context with sensible sensor defaults (PointerSensor + KeyboardSensor for built-in keyboard a11y, closestCenter collision).
- **`<SortableList items renderItem onChange>`** — turnkey single-list wrapper. Defaults to vertical strategy; accepts `"vertical" | "horizontal" | "rect"`.
- **`useSortableItem(id)`** — headless hook returning `{ setNodeRef, attributes, listeners, style, isDragging }` for advanced consumers (DataTable rows, Tree nodes, custom layouts).
- **`<Kanban>` + `<KanbanColumn>` + `<KanbanCard>`** — headless Kanban board. Drag cards within columns + across columns. Consumer keeps state as `{ id, title, cardIds }[]`; `onChange` fires with the new shape after every drop. Columns are static in v1.
- Re-exports: `arrayMove`, `verticalListSortingStrategy`, `horizontalListSortingStrategy`, `rectSortingStrategy`.

**Existing components, opt-in additions:**

- **`<DataTable>`** gains `reorderableRows?: boolean` + `onRowReorder?: (orderedIds: string[]) => void` + `getRowId?: (row, index) => string`. When enabled, a leading drag-handle column is added; rows reorder via mouse or keyboard. Throws a clear error if `reorderableRows={true}` without `getRowId` (TanStack's default index id breaks DnD).
- **`<Tree>`** gains `reorderable?: boolean` + `onNodeReorder?: (next: TreeNode[]) => void`. Top-level (root) nodes only — nested children are not individually reorderable in v1 (cross-parent semantics deferred to v2). Drag handle is its own focusable button so the existing tree keyboard nav (Space/Enter) is unchanged.

**Heavy peers (~43 KB gzip, all optional):**

- `@dnd-kit/core@^6.3.1` (~30 KB)
- `@dnd-kit/sortable@^10.0.0` (~10 KB)
- `@dnd-kit/utilities@^3.2.2` (~3 KB)

CLI heavy-peer prompt (shipped in PR #120) auto-prompts on `hex add kanban` / `hex add dnd`.

**New recipe (`@hex-core/registry`):**

- `kanban-board` — spec-driven blueprint with persistence + a11y checklist.

**Schema (`@hex-core/registry`):** no schema changes (reuses the `heavyPeer` field added in PR #120).
