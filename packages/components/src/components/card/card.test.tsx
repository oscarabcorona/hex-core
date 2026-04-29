import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card.js";

describe("Card", () => {
	it("renders a div with the card-styling classes", () => {
		render(<Card data-testid="root">x</Card>);
		const root = screen.getByTestId("root");
		expect(root.tagName).toBe("DIV");
		expect(root).toHaveClass("rounded-lg");
		expect(root).toHaveClass("bg-card");
	});

	it("merges consumer className", () => {
		render(
			<Card className="custom-class" data-testid="root">
				x
			</Card>,
		);
		expect(screen.getByTestId("root")).toHaveClass("custom-class");
	});

	it("forwards ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<Card ref={ref}>x</Card>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("CardHeader", () => {
	it("renders a div with the header layout classes", () => {
		render(<CardHeader data-testid="hdr">x</CardHeader>);
		const hdr = screen.getByTestId("hdr");
		expect(hdr.tagName).toBe("DIV");
		expect(hdr).toHaveClass("flex");
		expect(hdr).toHaveClass("flex-col");
	});

	it("forwards ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<CardHeader ref={ref}>x</CardHeader>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("CardTitle", () => {
	it("renders an h3 with the title-styling classes", () => {
		render(<CardTitle>Title</CardTitle>);
		const title = screen.getByText("Title");
		expect(title.tagName).toBe("H3");
		expect(title).toHaveClass("font-semibold");
	});

	it("forwards ref to the heading element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLHeadingElement | null>;
		render(<CardTitle ref={ref}>x</CardTitle>);
		expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
	});
});

describe("CardDescription", () => {
	it("renders a paragraph with the muted-text classes", () => {
		render(<CardDescription>desc</CardDescription>);
		const p = screen.getByText("desc");
		expect(p.tagName).toBe("P");
		expect(p).toHaveClass("text-muted-foreground");
	});

	it("forwards ref to the paragraph element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLParagraphElement | null>;
		render(<CardDescription ref={ref}>x</CardDescription>);
		expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
	});
});

describe("CardContent", () => {
	it("renders a div with content padding", () => {
		render(<CardContent data-testid="content">body</CardContent>);
		const c = screen.getByTestId("content");
		expect(c.tagName).toBe("DIV");
		expect(c).toHaveClass("pt-0");
	});
});

describe("CardFooter", () => {
	it("renders a div with footer layout classes", () => {
		render(<CardFooter data-testid="footer">x</CardFooter>);
		const f = screen.getByTestId("footer");
		expect(f.tagName).toBe("DIV");
		expect(f).toHaveClass("flex");
		expect(f).toHaveClass("items-center");
	});
});

describe("Card composition", () => {
	it("renders a full card with header, content, and footer slots", () => {
		render(
			<Card data-testid="root">
				<CardHeader>
					<CardTitle>Heading</CardTitle>
					<CardDescription>About this card</CardDescription>
				</CardHeader>
				<CardContent>Body content</CardContent>
				<CardFooter>Footer content</CardFooter>
			</Card>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveTextContent("Heading");
		expect(root).toHaveTextContent("About this card");
		expect(root).toHaveTextContent("Body content");
		expect(root).toHaveTextContent("Footer content");
		expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
	});
});
