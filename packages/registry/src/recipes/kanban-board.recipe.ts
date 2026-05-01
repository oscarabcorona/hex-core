import type { RecipeDefinition } from "../recipe-schema.js";

export const kanbanBoardRecipe: RecipeDefinition = {
	slug: "kanban-board",
	title: "Kanban board",
	summary:
		"Drag-and-drop Kanban board with multi-column cards, persistence on drop, and a richer card composing <Card>.",
	tags: ["kanban", "board", "dnd", "project-management", "agent-tasks"],
	brief:
		"Build a multi-column Kanban view for tasks/agents/issues. Columns are static (e.g. To do / Doing / Done); cards drag within and across columns. Persist the order on drop and reload it on mount.",
	steps: [
		{ component: "kanban", reason: "Headless Kanban + DnD wiring", role: "primary" },
		{ component: "dnd", reason: "Shared DnD primitives that Kanban + future sortable surfaces consume", role: "supporting" },
		{ component: "card", reason: "Optional richer card UI inside KanbanCard", role: "supporting" },
		{ component: "badge", reason: "Card metadata chips (priority, assignee, tag)", role: "supporting" },
		{ component: "avatar", reason: "Card assignee avatar", role: "supporting" },
		{ component: "button", reason: "Top-of-board actions (Add card, Filter)", role: "supporting" },
	],
	checklist: [
		{
			id: "stable-card-ids",
			check: "Card ids are stable strings (not array indices) — DnD breaks on reorder if ids shift.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "ids-globally-unique",
			check: "Card ids are unique across ALL columns, not just within one column. Cross-column drag uses ids as the canonical identity.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "persist-on-drop",
			check: "onChange persists the new shape (PATCH backend, write IndexedDB, etc.) — otherwise a refresh wipes the reorder.",
			severity: "warn",
			source: "author",
		},
		{
			id: "optimistic-server-write",
			check: "Server persistence is debounced or optimistic — synchronous fetch in onChange blocks the UI under fast drags.",
			severity: "warn",
			source: "author",
		},
		{
			id: "keyboard-flow",
			check: "Verified keyboard drag: Tab to a card, Space to pick up, arrows to move (within + across columns), Space to drop, Esc to cancel.",
			severity: "warn",
			source: "author",
		},
	],
	tokenBudget: 2400,
};
