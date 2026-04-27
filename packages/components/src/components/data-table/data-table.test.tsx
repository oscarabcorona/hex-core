import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
