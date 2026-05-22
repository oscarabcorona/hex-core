import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppDataTable } from "./app-data-table.js";

describe("AppDataTable", () => {
	it("renders title as <h2>, toolbar, table content, and footer", () => {
		render(
			<AppDataTable
				title="Users"
				description="Manage members."
				toolbar={<button type="button">Add user</button>}
				footer={<span>Page 1 of 4</span>}
			>
				<table>
					<tbody>
						<tr>
							<td>Ada Lovelace</td>
						</tr>
					</tbody>
				</table>
			</AppDataTable>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Users" })).toBeInTheDocument();
		expect(screen.getByText("Manage members.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add user" })).toBeInTheDocument();
		expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
		expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
	});

	it("renders the table with no header when none is given", () => {
		render(
			<AppDataTable>
				<table>
					<tbody>
						<tr>
							<td>Row</td>
						</tr>
					</tbody>
				</table>
			</AppDataTable>,
		);
		expect(screen.queryByRole("heading")).not.toBeInTheDocument();
		expect(screen.getByText("Row")).toBeInTheDocument();
	});
});
