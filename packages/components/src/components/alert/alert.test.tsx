import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert.js";

describe("Alert", () => {
	it("renders with role='alert' and the default variant classes", () => {
		render(<Alert data-testid="root">x</Alert>);
		const root = screen.getByTestId("root");
		expect(root).toHaveAttribute("role", "alert");
		expect(root).toHaveClass("bg-background");
		expect(root).toHaveClass("text-foreground");
	});

	it("applies the destructive variant classes", () => {
		render(
			<Alert variant="destructive" data-testid="root">
				x
			</Alert>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("text-destructive");
		expect(root).not.toHaveClass("bg-background");
	});

	it("merges consumer className with default classes", () => {
		render(
			<Alert className="custom-class" data-testid="root">
				x
			</Alert>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("rounded-lg");
	});

	it("forwards Alert ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<Alert ref={ref}>x</Alert>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("AlertTitle", () => {
	it("renders as an h5 with title-styling classes", () => {
		render(<AlertTitle>Heads up</AlertTitle>);
		const title = screen.getByText("Heads up");
		expect(title.tagName).toBe("H5");
		expect(title).toHaveClass("font-medium");
	});

	it("merges consumer className", () => {
		render(<AlertTitle className="custom-class">x</AlertTitle>);
		expect(screen.getByText("x")).toHaveClass("custom-class");
	});

	it("forwards ref to the heading element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLHeadingElement | null>;
		render(<AlertTitle ref={ref}>x</AlertTitle>);
		expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
	});
});

describe("AlertDescription", () => {
	it("renders as a div with description text-styling classes", () => {
		render(<AlertDescription data-testid="desc">body text</AlertDescription>);
		const desc = screen.getByTestId("desc");
		expect(desc.tagName).toBe("DIV");
		expect(desc).toHaveClass("text-sm");
		expect(desc).toHaveTextContent("body text");
	});

	it("forwards ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<AlertDescription ref={ref}>x</AlertDescription>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("Alert composition", () => {
	it("renders title + description inside an Alert role region", () => {
		render(
			<Alert>
				<AlertTitle>Heads up</AlertTitle>
				<AlertDescription>You can change this later.</AlertDescription>
			</Alert>,
		);
		const region = screen.getByRole("alert");
		expect(region).toHaveTextContent("Heads up");
		expect(region).toHaveTextContent("You can change this later.");
	});
});
