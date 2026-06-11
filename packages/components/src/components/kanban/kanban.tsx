"use client";

import * as React from "react";
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../lib/utils.js";

/**
 * Headless Kanban board backed by @dnd-kit. Cards drag within their column
 * (reorder) and across columns (move). Consumer keeps state shape:
 *
 *   columns: Array<{ id: string; title: string; cardIds: string[] }>
 *
 * Kanban receives that array + an `onChange(next)` callback, computes the
 * new state on drop, and fires the callback. No internal state. Card
 * content is fully consumer-rendered — pass any children to `<KanbanCard>`.
 *
 * Columns are static in v1 (no column reorder; cards are the moving parts).
 *
 * Heavy peer: `@dnd-kit/core` + `@dnd-kit/sortable` (~40 KB gzip). Shipped
 * via the hex-core CLI's heavy-peer prompt.
 *
 * @example
 * const [board, setBoard] = useState([
 *   { id: "todo", title: "To do", cardIds: ["1", "2"] },
 *   { id: "doing", title: "Doing", cardIds: ["3"] },
 *   { id: "done", title: "Done", cardIds: [] },
 * ]);
 * const cards = { "1": "Wire DnD", "2": "Build Kanban", "3": "Ship PR" };
 *
 * <Kanban columns={board} onChange={setBoard}>
 *   {board.map((col) => (
 *     <KanbanColumn key={col.id} id={col.id} title={col.title}>
 *       {col.cardIds.map((cardId) => (
 *         <KanbanCard key={cardId} id={cardId}>
 *           {cards[cardId]}
 *         </KanbanCard>
 *       ))}
 *     </KanbanColumn>
 *   ))}
 * </Kanban>
 */

export interface KanbanColumnData {
	id: string;
	title: string;
	cardIds: string[];
}

export interface KanbanProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
	columns: KanbanColumnData[];
	/** Called with the next columns array after a drop. */
	onChange: (next: KanbanColumnData[]) => void;
	/** Render the columns. Use `<KanbanColumn>` + `<KanbanCard>` inside. */
	children: React.ReactNode;
}

interface KanbanContextValue {
	columns: KanbanColumnData[];
}

const KanbanContext = React.createContext<KanbanContextValue | null>(null);

function useKanbanContext(): KanbanContextValue {
	const ctx = React.useContext(KanbanContext);
	if (!ctx) {
		throw new Error("KanbanColumn / KanbanCard must be rendered inside <Kanban>.");
	}
	return ctx;
}

/**
 * Find which column owns a given card id.
 * Exported for unit testing of the moveCard algorithm.
 */
export function findColumnIdForCard(columns: KanbanColumnData[], cardId: string): string | null {
	for (const col of columns) {
		if (col.cardIds.includes(cardId)) return col.id;
	}
	return null;
}

/**
 * Move a card to a target position. The target can be either another card
 * (insert at that card's index in its column) OR a column itself (append
 * to that column's cardIds).
 * Returns the same `columns` reference (===) when no move is possible — the
 * caller uses identity equality to skip an onChange call.
 * Exported for unit testing.
 */
export function moveCard(
	columns: KanbanColumnData[],
	activeId: string,
	overId: string,
): KanbanColumnData[] {
	const sourceColId = findColumnIdForCard(columns, activeId);
	if (!sourceColId) return columns;

	// Did we drop onto another card or onto a column?
	const overIsColumn = columns.some((c) => c.id === overId);
	const targetColId = overIsColumn ? overId : findColumnIdForCard(columns, overId);
	if (!targetColId) return columns;

	if (sourceColId === targetColId) {
		// Intra-column reorder.
		return columns.map((col) => {
			if (col.id !== sourceColId) return col;
			const oldIndex = col.cardIds.indexOf(activeId);
			const newIndex = overIsColumn ? col.cardIds.length - 1 : col.cardIds.indexOf(overId);
			if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return col;
			const next = [...col.cardIds];
			next.splice(oldIndex, 1);
			next.splice(newIndex, 0, activeId);
			return { ...col, cardIds: next };
		});
	}

	// Cross-column move.
	return columns.map((col) => {
		if (col.id === sourceColId) {
			return { ...col, cardIds: col.cardIds.filter((id) => id !== activeId) };
		}
		if (col.id === targetColId) {
			const insertAt = overIsColumn ? col.cardIds.length : col.cardIds.indexOf(overId);
			const next = [...col.cardIds];
			next.splice(insertAt < 0 ? next.length : insertAt, 0, activeId);
			return { ...col, cardIds: next };
		}
		return col;
	});
}

/**
 * Headless Kanban board root.
 * @param props - columns + onChange + children renderers
 * @returns A flex row of columns inside a DndContext
 */
function Kanban({ columns, onChange, children, className, ...rest }: KanbanProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 4 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;

	const handleDragEnd = React.useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const next = moveCard(columns, String(active.id), String(over.id));
			if (next === columns) return;
			onChangeRef.current(next);
		},
		[columns],
	);

	const contextValue = React.useMemo<KanbanContextValue>(() => ({ columns }), [columns]);

	return (
		<KanbanContext.Provider value={contextValue}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragEnd={handleDragEnd}
			>
				<div
					{...rest}
					data-hex-kanban
					className={cn("flex gap-4 overflow-x-auto", className)}
				>
					{children}
				</div>
			</DndContext>
		</KanbanContext.Provider>
	);
}

export interface KanbanColumnProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> {
	id: string;
	title: React.ReactNode;
	children?: React.ReactNode;
}

/**
 * Single Kanban column. Provides a SortableContext for its cards and
 * registers itself as a drop target so empty columns still accept cards.
 * @param props - column id + visible title + KanbanCard children
 */
function KanbanColumn({ id, title, children, className, ...rest }: KanbanColumnProps) {
	const { columns } = useKanbanContext();
	const col = columns.find((c) => c.id === id);
	const cardIds = col?.cardIds ?? [];
	// Make the column droppable too (so dropping onto an empty column works).
	const { setNodeRef } = useSortable({ id });

	return (
		<div
			{...rest}
			ref={setNodeRef}
			data-hex-kanban-column
			data-column-id={id}
			className={cn(
				"flex w-72 shrink-0 flex-col gap-2 rounded-lg border bg-muted/30 p-3",
				className,
			)}
		>
			<header className="text-sm font-medium text-muted-foreground">{title}</header>
			<SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
				<div className="flex min-h-[2rem] flex-col gap-2">{children}</div>
			</SortableContext>
		</div>
	);
}

export interface KanbanCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	id: string;
	children: React.ReactNode;
}

/**
 * Single sortable Kanban card. Spreads attributes + listeners onto a
 * draggable wrapper. Children are fully consumer-rendered — pass a
 * `<Card>` or any custom layout.
 * @param props - card id + children content
 */
function KanbanCard({ id, children, className, ...rest }: KanbanCardProps) {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id,
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			{...rest}
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			data-hex-kanban-card
			data-card-id={id}
			data-dragging={isDragging}
			className={cn(
				"cursor-grab rounded-md border bg-background p-3 text-sm shadow-sm",
				"hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"active:cursor-grabbing",
				className,
			)}
		>
			{children}
		</div>
	);
}

export { Kanban, KanbanColumn, KanbanCard };
