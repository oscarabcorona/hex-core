"use client";

import * as React from "react";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
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
 * Generic DataTable wrapper that renders a TanStack Table model using Hex UI's
 * Table primitives. Pass columns + data; use TanStack hooks for sorting,
 * filtering, pagination, row-selection as needed.
 * @template TData - Row data type. Cell value types are inferred per column by TanStack.
 */
export interface DataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	/**
	 * Visible caption rendered below the table. Announced by screen readers
	 * when the user enters the table. Provide either `caption` or `aria-label`.
	 */
	caption?: React.ReactNode;
	/**
	 * Accessible label for the table when no visible caption is shown.
	 * Forwarded as `aria-label` on the underlying `<table>` element. Kebab-case
	 * to match the canonical ARIA prop convention used elsewhere in Hex UI.
	 */
	"aria-label"?: string;
}

/**
 * Render a data-driven table from TanStack column definitions.
 * @param props - Columns, data, and optional accessible labelling (`caption` or `aria-label`)
 * @returns A styled Table rendered from the TanStack row model
 */
export function DataTable<TData>({
	columns,
	data,
	caption,
	"aria-label": ariaLabel,
}: DataTableProps<TData>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="rounded-md border">
			<Table aria-label={ariaLabel}>
				{caption ? <TableCaption>{caption}</TableCaption> : null}
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
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
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
