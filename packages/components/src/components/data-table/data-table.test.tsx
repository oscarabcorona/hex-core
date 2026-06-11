import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./data-table.js";

interface Row {
	id: string;
	name: string;
}

const columns: ColumnDef<Row>[] = [
	{ accessorKey: "id", header: "Id" },
	{ accessorKey: "name", header: "Name" },
];

const data: Row[] = [
	{ id: "1", name: "Alpha" },
	{ id: "2", name: "Beta" },
];

describe("DataTable a11y wiring", () => {
	it("renders a visible <caption> when caption prop is passed", () => {
		render(<DataTable columns={columns} data={data} caption="Test caption" />);
		expect(screen.getByText("Test caption")).toBeInTheDocument();
		expect(screen.getByRole("table")).toContainElement(
			screen.getByText("Test caption"),
		);
	});

	it("forwards aria-label to the underlying <table>", () => {
		render(
			<DataTable columns={columns} data={data} aria-label="Active users" />,
		);
		expect(
			screen.getByRole("table", { name: "Active users" }),
		).toBeInTheDocument();
	});

	it("renders without caption when neither prop is provided", () => {
		render(<DataTable columns={columns} data={data} />);
		const table = screen.getByRole("table");
		expect(table).toBeInTheDocument();
		expect(table.querySelector("caption")).toBeNull();
	});
});

describe("DataTable row reorder", () => {
	it("renders unchanged when reorderableRows is false (default)", () => {
		render(<DataTable columns={columns} data={data} />);
		// No drag handle column, no data-row-id attribute on rows.
		expect(screen.queryByRole("button", { name: /Drag to reorder/ })).toBeNull();
		expect(document.querySelector("[data-row-id]")).toBeNull();
	});

	it("throws a clear error when reorderableRows is true without getRowId", () => {
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(<DataTable columns={columns} data={data} reorderableRows />),
		).toThrow(/reorderableRows.+requires getRowId/);
		errSpy.mockRestore();
	});

	it("adds a drag-handle column + data-row-id attributes when reorderableRows is true", () => {
		render(
			<DataTable
				columns={columns}
				data={data}
				reorderableRows
				getRowId={(row) => row.id}
				onRowReorder={() => {}}
			/>,
		);
		// One drag-handle button per row.
		expect(screen.getAllByRole("button", { name: "Drag to reorder row" })).toHaveLength(2);
		// data-row-id reflects the consumer's stable id.
		expect(document.querySelector('[data-row-id="1"]')).not.toBeNull();
		expect(document.querySelector('[data-row-id="2"]')).not.toBeNull();
	});

	it("each sortable row has data-dragging=false in static state", () => {
		render(
			<DataTable
				columns={columns}
				data={data}
				reorderableRows
				getRowId={(row) => row.id}
				onRowReorder={() => {}}
			/>,
		);
		document.querySelectorAll("[data-row-id]").forEach((row) => {
			expect(row.getAttribute("data-dragging")).toBe("false");
		});
	});

	it("'No results' colspan accounts for the extra drag-handle column", () => {
		render(
			<DataTable
				columns={columns}
				data={[]}
				reorderableRows
				getRowId={(row) => row.id}
				onRowReorder={() => {}}
			/>,
		);
		const empty = screen.getByText("No results.");
		// columns.length + 1 (drag handle)
		expect(empty.closest("td")?.getAttribute("colspan")).toBe(String(columns.length + 1));
	});
});
