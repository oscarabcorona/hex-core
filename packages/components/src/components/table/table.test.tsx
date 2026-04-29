import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./table.js";

describe("Table", () => {
	it("renders a table inside an overflow wrapper", () => {
		render(<Table data-testid="t" />);
		const t = screen.getByTestId("t");
		expect(t.tagName).toBe("TABLE");
		expect(t.parentElement).toHaveClass("overflow-auto");
	});

	it("merges consumer className on the table element", () => {
		render(<Table className="custom-class" data-testid="t" />);
		const t = screen.getByTestId("t");
		expect(t).toHaveClass("custom-class");
		expect(t).toHaveClass("caption-bottom");
	});

	it("forwards ref to the table element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLTableElement | null>;
		render(<Table ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLTableElement);
	});
});

describe("Table sections", () => {
	it("TableHeader renders a thead element", () => {
		render(
			<Table>
				<TableHeader data-testid="head" />
			</Table>,
		);
		expect(screen.getByTestId("head").tagName).toBe("THEAD");
	});

	it("TableBody renders a tbody element", () => {
		render(
			<Table>
				<TableBody data-testid="body" />
			</Table>,
		);
		expect(screen.getByTestId("body").tagName).toBe("TBODY");
	});

	it("TableFooter renders a tfoot element", () => {
		render(
			<Table>
				<TableFooter data-testid="foot" />
			</Table>,
		);
		expect(screen.getByTestId("foot").tagName).toBe("TFOOT");
	});

	it("TableCaption renders a caption element", () => {
		render(
			<Table>
				<TableCaption data-testid="cap">Users</TableCaption>
			</Table>,
		);
		const cap = screen.getByTestId("cap");
		expect(cap.tagName).toBe("CAPTION");
		expect(cap).toHaveTextContent("Users");
	});
});

describe("Table row + cells", () => {
	it("TableRow renders a tr with the row classes", () => {
		render(
			<Table>
				<TableBody>
					<TableRow data-testid="row" />
				</TableBody>
			</Table>,
		);
		const row = screen.getByTestId("row");
		expect(row.tagName).toBe("TR");
		expect(row).toHaveClass("border-b");
	});

	it("TableHead renders a th", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead data-testid="th">Name</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		);
		expect(screen.getByTestId("th").tagName).toBe("TH");
	});

	it("TableCell renders a td", () => {
		render(
			<Table>
				<TableBody>
					<TableRow>
						<TableCell data-testid="td">Alice</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByTestId("td").tagName).toBe("TD");
	});
});

describe("Table composition", () => {
	it("renders a complete table tree with header, body, and accessible cells", () => {
		render(
			<Table>
				<TableCaption>Quarterly results</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Quarter</TableHead>
						<TableHead>Revenue</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Q1</TableCell>
						<TableCell>$1M</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Q2</TableCell>
						<TableCell>$1.2M</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		const table = screen.getByRole("table");
		expect(table).toBeInTheDocument();
		expect(screen.getAllByRole("columnheader")).toHaveLength(2);
		expect(screen.getAllByRole("cell")).toHaveLength(4);
		expect(screen.getByText("Q1")).toBeInTheDocument();
		expect(screen.getByText("$1.2M")).toBeInTheDocument();
	});
});
