import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./pagination.js";

describe("Pagination root", () => {
	it("renders a nav landmark with aria-label='pagination'", () => {
		render(<Pagination />);
		expect(
			screen.getByRole("navigation", { name: "pagination" }),
		).toBeInTheDocument();
	});

	it("merges consumer className", () => {
		render(<Pagination className="custom-class" />);
		expect(screen.getByRole("navigation")).toHaveClass("custom-class");
	});
});

describe("PaginationContent", () => {
	it("renders a ul with the row-layout classes", () => {
		render(<PaginationContent data-testid="list" />);
		const list = screen.getByTestId("list");
		expect(list.tagName).toBe("UL");
		expect(list).toHaveClass("flex-row");
	});

	it("forwards ref to the ul element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLUListElement | null>;
		render(<PaginationContent ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLUListElement);
	});
});

describe("PaginationItem", () => {
	it("renders an li", () => {
		render(<PaginationItem data-testid="item" />);
		expect(screen.getByTestId("item").tagName).toBe("LI");
	});
});

describe("PaginationLink", () => {
	it("renders an anchor with no aria-current when isActive is false", () => {
		render(
			<PaginationLink href="/page/2" data-testid="link">
				2
			</PaginationLink>,
		);
		const link = screen.getByTestId("link");
		expect(link.tagName).toBe("A");
		expect(link).not.toHaveAttribute("aria-current");
	});

	it("sets aria-current='page' when isActive is true", () => {
		render(
			<PaginationLink href="/page/3" isActive data-testid="link">
				3
			</PaginationLink>,
		);
		expect(screen.getByTestId("link")).toHaveAttribute("aria-current", "page");
	});
});

describe("PaginationPrevious", () => {
	it("renders a link with aria-label='Go to previous page'", () => {
		render(<PaginationPrevious href="/page/1" />);
		expect(
			screen.getByRole("link", { name: "Go to previous page" }),
		).toBeInTheDocument();
	});

	it("includes a 'Previous' label visible to all users", () => {
		render(<PaginationPrevious href="/page/1" />);
		expect(
			screen.getByRole("link", { name: "Go to previous page" }),
		).toHaveTextContent("Previous");
	});
});

describe("PaginationNext", () => {
	it("renders a link with aria-label='Go to next page'", () => {
		render(<PaginationNext href="/page/3" />);
		expect(
			screen.getByRole("link", { name: "Go to next page" }),
		).toBeInTheDocument();
	});

	it("includes a 'Next' label visible to all users", () => {
		render(<PaginationNext href="/page/3" />);
		expect(
			screen.getByRole("link", { name: "Go to next page" }),
		).toHaveTextContent("Next");
	});
});

describe("PaginationEllipsis", () => {
	it("renders a sr-only 'More pages' label for AT", () => {
		render(<PaginationEllipsis data-testid="ell" />);
		expect(screen.getByTestId("ell")).toHaveTextContent("More pages");
	});

	it("hides the visible svg from AT", () => {
		render(<PaginationEllipsis data-testid="ell" />);
		expect(screen.getByTestId("ell").querySelector("svg")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	});
});

describe("Pagination composition", () => {
	it("renders a multi-page navigation block", () => {
		render(
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="/page/1" />
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="/page/2" isActive>
							2
						</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="/page/3">3</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="/page/3" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>,
		);
		expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Go to previous page" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Go to next page" })).toBeInTheDocument();
		expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
		expect(screen.getByText("3")).not.toHaveAttribute("aria-current");
	});
});
