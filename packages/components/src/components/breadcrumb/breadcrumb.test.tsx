import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./breadcrumb.js";

describe("Breadcrumb root", () => {
	it("renders a nav landmark with aria-label='breadcrumb'", () => {
		render(<Breadcrumb data-testid="root" />);
		const nav = screen.getByTestId("root");
		expect(nav.tagName).toBe("NAV");
		expect(nav).toHaveAttribute("aria-label", "breadcrumb");
	});

	it("forwards ref to the nav element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLElement | null>;
		render(<Breadcrumb ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLElement);
		expect(ref.current?.tagName).toBe("NAV");
	});
});

describe("BreadcrumbList", () => {
	it("renders an ol with the list-styling classes", () => {
		render(<BreadcrumbList data-testid="list" />);
		const list = screen.getByTestId("list");
		expect(list.tagName).toBe("OL");
		expect(list).toHaveClass("flex-wrap");
	});

	it("merges consumer className", () => {
		render(<BreadcrumbList className="custom-class" data-testid="list" />);
		expect(screen.getByTestId("list")).toHaveClass("custom-class");
	});
});

describe("BreadcrumbItem", () => {
	it("renders an li with item-styling classes", () => {
		render(<BreadcrumbItem data-testid="item" />);
		const item = screen.getByTestId("item");
		expect(item.tagName).toBe("LI");
		expect(item).toHaveClass("inline-flex");
	});
});

describe("BreadcrumbLink", () => {
	it("renders an anchor by default", () => {
		render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>);
		const link = screen.getByRole("link", { name: "Home" });
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/home");
	});

	it("renders the child element when asChild is true", () => {
		render(
			<BreadcrumbLink asChild>
				<button type="button">Back</button>
			</BreadcrumbLink>,
		);
		const btn = screen.getByRole("button", { name: "Back" });
		expect(btn.tagName).toBe("BUTTON");
	});

	it("merges consumer className", () => {
		render(
			<BreadcrumbLink href="/" className="custom-class">
				x
			</BreadcrumbLink>,
		);
		expect(screen.getByRole("link")).toHaveClass("custom-class");
	});
});

describe("BreadcrumbPage", () => {
	it("renders a span with role=link, aria-disabled='true', and aria-current='page'", () => {
		render(<BreadcrumbPage>Current</BreadcrumbPage>);
		const page = screen.getByRole("link", { name: "Current" });
		expect(page.tagName).toBe("SPAN");
		expect(page).toHaveAttribute("aria-disabled", "true");
		expect(page).toHaveAttribute("aria-current", "page");
	});
});

describe("BreadcrumbSeparator", () => {
	it("renders a presentational li hidden from AT", () => {
		render(<BreadcrumbSeparator data-testid="sep" />);
		const sep = screen.getByTestId("sep");
		expect(sep.tagName).toBe("LI");
		expect(sep).toHaveAttribute("role", "presentation");
		expect(sep).toHaveAttribute("aria-hidden", "true");
	});

	it("renders a default chevron svg when no children are passed", () => {
		render(<BreadcrumbSeparator data-testid="sep" />);
		expect(screen.getByTestId("sep").querySelector("svg")).not.toBeNull();
	});

	it("renders consumer-provided children instead of the default chevron", () => {
		render(
			<BreadcrumbSeparator data-testid="sep">
				<span>/</span>
			</BreadcrumbSeparator>,
		);
		const sep = screen.getByTestId("sep");
		expect(sep.querySelector("svg")).toBeNull();
		expect(sep).toHaveTextContent("/");
	});
});

describe("BreadcrumbEllipsis", () => {
	it("renders a sr-only 'More pages' label for AT", () => {
		render(<BreadcrumbEllipsis data-testid="ell" />);
		const ell = screen.getByTestId("ell");
		expect(ell).toHaveTextContent("More pages");
		// the visible svg is decorative
		expect(ell.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
	});
});

describe("Breadcrumb composition", () => {
	it("renders a full trail with link, separator, and current page", () => {
		render(
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Settings</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>,
		);
		expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
	});
});
