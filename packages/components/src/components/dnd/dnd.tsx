"use client";

import * as React from "react";
import {
	DndContext,
	type DndContextProps,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../lib/utils.js";

/**
 * Composable drag-and-drop primitives for hex-core, built on @dnd-kit.
 *
 * Three exports:
 *   - `<DndProvider>` — root context with sensible defaults (PointerSensor +
 *     KeyboardSensor for out-of-box keyboard a11y, closestCenter collision).
 *     Pass `onDragEnd` to receive the active+over IDs.
 *   - `<SortableList items renderItem onChange>` — turnkey single-list wrapper.
 *     Handles its own DndContext + SortableContext + arrayMove for the 80%
 *     case (reorderable list of cards / rows / nav items).
 *   - `useSortableItem(id)` — the headless hook for advanced consumers
 *     (Kanban cards, DataTable rows, Tree nodes). Returns the dnd-kit refs +
 *     attributes + listeners + a CSS-ready transform.
 *
 * Heavy peer: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
 * (~43 KB gzip total). Install via the hex-core CLI's `add` flow.
 *
 * Re-exports the three sortable strategies (`vertical`, `horizontal`, `rect`)
 * + `arrayMove` so consumers don't add @dnd-kit to their import list.
 */

export type SortStrategy = "vertical" | "horizontal" | "rect";

const STRATEGIES = {
	vertical: verticalListSortingStrategy,
	horizontal: horizontalListSortingStrategy,
	rect: rectSortingStrategy,
} as const;

export interface DndProviderProps
	extends Omit<DndContextProps, "sensors" | "collisionDetection"> {
	children: React.ReactNode;
}

/**
 * Root drag-and-drop context. Wires up sensible default sensors
 * (Pointer + Keyboard for keyboard a11y) and closestCenter collision.
 * @param props - Pass through to dnd-kit's DndContext (e.g. onDragEnd, onDragStart, modifiers)
 * @returns A DndContext provider with hex-core defaults
 */
function DndProvider({ children, ...rest }: DndProviderProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 4 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} {...rest}>
			{children}
		</DndContext>
	);
}

export interface SortableListProps<T extends { id: string | number }>
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
	/** Items to render. Each must carry a stable `id` field. */
	items: T[];
	/** Render function for one item. Wrap the returned node with `useSortableItem` for the drag wiring. */
	renderItem: (item: T, index: number) => React.ReactNode;
	/** Called with the new item array after a drop. */
	onChange: (next: T[]) => void;
	/** Sortable strategy. Default `"vertical"`. */
	strategy?: SortStrategy;
}

/**
 * Turnkey sortable list. Handles its own DndContext + SortableContext.
 *
 * The `renderItem` callback typically returns a wrapper that calls
 * `useSortableItem(item.id)` and spreads its refs/listeners onto a
 * draggable root element.
 *
 * @example
 * <SortableList
 *   items={items}
 *   onChange={setItems}
 *   renderItem={(item) => (
 *     <SortableCard id={item.id}>{item.title}</SortableCard>
 *   )}
 * />
 */
function SortableList<T extends { id: string | number }>({
	items,
	renderItem,
	onChange,
	strategy = "vertical",
	className,
	...rest
}: SortableListProps<T>) {
	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;

	const handleDragEnd = React.useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const oldIndex = items.findIndex((it) => it.id === active.id);
			const newIndex = items.findIndex((it) => it.id === over.id);
			if (oldIndex === -1 || newIndex === -1) return;
			onChangeRef.current(arrayMove(items, oldIndex, newIndex));
		},
		[items],
	);

	const ids = React.useMemo(() => items.map((it) => it.id), [items]);

	return (
		<DndProvider onDragEnd={handleDragEnd}>
			<SortableContext items={ids} strategy={STRATEGIES[strategy]}>
				<div
					{...rest}
					data-hex-sortable-list
					data-strategy={strategy}
					className={cn(
						strategy === "horizontal" ? "flex gap-2" : "flex flex-col gap-2",
						className,
					)}
				>
					{items.map((item, index) => (
						<React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
					))}
				</div>
			</SortableContext>
		</DndProvider>
	);
}

export interface UseSortableItemReturn {
	/** Attach to the outer draggable element. */
	setNodeRef: (element: HTMLElement | null) => void;
	/** Spread onto the draggable root for ARIA + keyboard wiring. */
	attributes: React.HTMLAttributes<HTMLElement>;
	/** Spread onto the drag handle (or the draggable root if no separate handle). */
	listeners: React.DOMAttributes<HTMLElement> | undefined;
	/** Pre-computed `style` with the active drag transform. Apply to `setNodeRef` element. */
	style: React.CSSProperties;
	/** True while this item is being dragged. */
	isDragging: boolean;
}

/**
 * Headless hook for one sortable item. Wire the returned refs/listeners
 * onto your draggable root (and optionally a separate drag handle via
 * the `listeners` value).
 *
 * Must be called inside a `<SortableContext>` (provided automatically by
 * `<SortableList>` or `<Kanban>`, manually by advanced consumers).
 *
 * @param id - Stable identifier for this item (must match the SortableContext items array)
 * @returns Refs + attributes + listeners + style + isDragging flag
 */
function useSortableItem(id: string | number): UseSortableItemReturn {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id,
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return {
		setNodeRef,
		attributes,
		listeners,
		style,
		isDragging,
	};
}

export {
	DndProvider,
	SortableList,
	useSortableItem,
	// Re-exports so consumers don't have to add @dnd-kit/sortable to their imports.
	arrayMove,
	verticalListSortingStrategy,
	horizontalListSortingStrategy,
	rectSortingStrategy,
};
