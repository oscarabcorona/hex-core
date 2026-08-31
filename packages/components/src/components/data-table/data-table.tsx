"use client";

import * as React from "react";
import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import {
	columnVisibilityFeature,
	coreFeatures,
	createCoreRowModel,
	type RowData,
	rowSelectionFeature,
} from "@tanstack/table-core";
import {
	DndProvider,
	useSortableItem,
} from "../dnd/dnd.js";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../table/table.js";

/**
 * Feature set registered on the table instance.
 *
 * TanStack v9 is opt-in: an API is only present when its feature module is
 * registered, so each entry here is load-bearing for a call site below.
 * `coreRowModel` replaces v8's `getCoreRowModel()` option and now lives in
 * the feature slot. `rowSelectionFeature` backs `row.getIsSelected()`;
 * `columnVisibilityFeature` backs `row.getVisibleCells()`. Dropping either
 * one turns its call site into a type error rather than a silent no-op.
 *
 * Consumers that need sorting/filtering/pagination compose their own
 * feature set with `createSortedRowModel()` et al. and drive the table
 * themselves — this component intentionally stays core-only.
 */
export const dataTableFeatures = {
	...coreFeatures,
	rowSelectionFeature,
	columnVisibilityFeature,
	coreRowModel: createCoreRowModel(),
};

/** Feature set backing {@link DataTableProps.columns}. */
export type DataTableFeatures = typeof dataTableFeatures;

// Local declaration to avoid pulling @types/node into the package's
// type graph just for one NODE_ENV check.
declare const process: { env?: { NODE_ENV?: string } } | undefined;
function isProd(): boolean {
	return typeof process !== "undefined" && process?.env?.NODE_ENV === "production";
}

/**
 * Generic DataTable wrapper that renders a TanStack Table model using Hex Core's
 * Table primitives. Pass columns + data; use TanStack hooks for sorting,
 * filtering, pagination, row-selection as needed.
 *
 * Optional row-reorder support via `reorderableRows` + `onRowReorder` +
 * `getRowId`. When enabled, a drag-handle column is prepended; users can
 * drag rows to reorder, and `onRowReorder` fires with the new ID order.
 *
 * @template TData - Row data type. Cell value types are inferred per column by TanStack.
 *   Constrained to TanStack's `RowData` (an object or array shape) since v9.
 */
export interface DataTableProps<TData extends RowData> {
	columns: ColumnDef<DataTableFeatures, TData, unknown>[];
	data: TData[];
	/**
	 * Visible caption rendered below the table. Announced by screen readers
	 * when the user enters the table. Provide either `caption` or `aria-label`.
	 */
	caption?: React.ReactNode;
	/**
	 * Accessible label for the table when no visible caption is shown.
	 * Forwarded as `aria-label` on the underlying `<table>` element. Kebab-case
	 * to match the canonical ARIA prop convention used elsewhere in Hex Core.
	 */
	"aria-label"?: string;
	/**
	 * Enable drag-to-reorder rows. When true, a drag-handle column is added
	 * on the leading edge and rows can be reordered via mouse or keyboard.
	 * Requires `getRowId` (else throws — index-based IDs would break DnD on
	 * reorder because indices shift). Default false.
	 */
	reorderableRows?: boolean;
	/**
	 * Called with the next ordered list of row IDs after a drop. Consumer
	 * is responsible for re-deriving `data` in the new order. Required when
	 * `reorderableRows` is true.
	 */
	onRowReorder?: (orderedIds: string[]) => void;
	/**
	 * Stable row identifier. Required when `reorderableRows` is true.
	 * Forwarded to TanStack's `getRowId` so each row has a stable identity
	 * across renders (otherwise the row id is the array index, which shifts
	 * on reorder and breaks DnD).
	 */
	getRowId?: (row: TData, index: number) => string;
}

/**
 * Render a data-driven table from TanStack column definitions.
 * @param props - Columns, data, optional labelling, and optional reorder support
 * @returns A styled Table rendered from the TanStack row model
 */
export function DataTable<TData extends RowData>({
	columns,
	data,
	caption,
	"aria-label": ariaLabel,
	reorderableRows = false,
	onRowReorder,
	getRowId,
}: DataTableProps<TData>) {
	if (reorderableRows && !getRowId) {
		throw new Error(
			"DataTable: reorderableRows={true} requires getRowId. Without a stable row id, drag-and-drop breaks on reorder because TanStack's default index-based id shifts.",
		);
	}
	if (reorderableRows && !onRowReorder && !isProd()) {
		// eslint-disable-next-line no-console
		console.warn(
			"DataTable: reorderableRows={true} without onRowReorder — drops will animate but the new order is silently discarded.",
		);
	}

	const table = useTable({
		features: dataTableFeatures,
		data,
		columns,
		getRowId,
	});

	const onRowReorderRef = React.useRef(onRowReorder);
	onRowReorderRef.current = onRowReorder;

	const rows = table.getRowModel().rows;
	const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

	const handleDragEnd = React.useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const oldIndex = rowIds.indexOf(String(active.id));
			const newIndex = rowIds.indexOf(String(over.id));
			if (oldIndex === -1 || newIndex === -1) return;
			const next = [...rowIds];
			const [moved] = next.splice(oldIndex, 1);
			next.splice(newIndex, 0, moved);
			onRowReorderRef.current?.(next);
		},
		[rowIds],
	);

	const headerColCount = reorderableRows ? columns.length + 1 : columns.length;

	const tableInner = (
		<Table aria-label={ariaLabel}>
			{caption ? <TableCaption>{caption}</TableCaption> : null}
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{reorderableRows ? <TableHead className="w-8" aria-hidden /> : null}
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{rows.length ? (
					reorderableRows ? (
						<SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
							{rows.map((row) => (
								<SortableDataRow key={row.id} id={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</SortableDataRow>
							))}
						</SortableContext>
					) : (
						rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)
				) : (
					<TableRow>
						<TableCell colSpan={headerColCount} className="h-24 text-center">
							No results.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);

	return (
		<div className="rounded-md border border-foreground/[0.08]">
			{reorderableRows ? (
				<DndProvider onDragEnd={handleDragEnd}>{tableInner}</DndProvider>
			) : (
				tableInner
			)}
		</div>
	);
}

/**
 * Internal: a single sortable row. Renders the leading drag handle as a
 * focusable button (KeyboardSensor picks up Space/Enter from it) and
 * forwards the rest of the cells.
 */
function SortableDataRow({
	id,
	children,
}: {
	id: string;
	children: React.ReactNode;
}) {
	const { setNodeRef, attributes, listeners, style, isDragging } = useSortableItem(id);
	// dnd-kit ships `role="button"` + `tabIndex=0` + `aria-pressed` in
	// `attributes` for default keyboard a11y on draggable elements. <tr>
	// has implicit row semantics — overriding them with role="button" +
	// tabIndex=0 breaks table navigation, and `aria-pressed` is invalid
	// per ARIA 1.2 on non-button roles (Axe will flag it). Strip all three;
	// the drag-handle button below carries the listeners and is the actual
	// keyboard pickup target. The aria-roledescription="sortable" + the
	// aria-describedby live-region pointer survive — both are load-bearing
	// for screen-reader announcements.
	const {
		role: _role,
		tabIndex: _tabIndex,
		"aria-pressed": _ariaPressed,
		...safeAttrs
	} = attributes as React.HTMLAttributes<HTMLElement> & {
		role?: string;
		tabIndex?: number;
		"aria-pressed"?: boolean | "true" | "false";
	};
	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			data-row-id={id}
			data-dragging={isDragging}
			{...safeAttrs}
		>
			<TableCell className="w-8 cursor-grab active:cursor-grabbing">
				<button
					type="button"
					aria-label="Drag to reorder row"
					className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					{...listeners}
				>
					<svg aria-hidden viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
						<circle cx="6" cy="3.5" r="1.25" />
						<circle cx="6" cy="8" r="1.25" />
						<circle cx="6" cy="12.5" r="1.25" />
						<circle cx="10" cy="3.5" r="1.25" />
						<circle cx="10" cy="8" r="1.25" />
						<circle cx="10" cy="12.5" r="1.25" />
					</svg>
				</button>
			</TableCell>
			{children}
		</TableRow>
	);
}
