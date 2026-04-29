import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "./scroll-area.js";

describe("ScrollArea", () => {
	it("renders its children", () => {
		render(
			<ScrollArea data-testid="root">
				<p>scrollable content</p>
			</ScrollArea>,
		);
		expect(screen.getByText("scrollable content")).toBeInTheDocument();
	});

	it("makes the viewport keyboard-focusable by default (tabIndex=0)", () => {
		const { container } = render(
			<ScrollArea>
				<p>x</p>
			</ScrollArea>,
		);
		// The viewport is the [data-radix-scroll-area-viewport] element.
		const viewport = container.querySelector("[data-radix-scroll-area-viewport]");
		expect(viewport).not.toBeNull();
		expect(viewport).toHaveAttribute("tabindex", "0");
	});

	it("opts the viewport out of the tab order when viewportTabIndex={-1}", () => {
		const { container } = render(
			<ScrollArea viewportTabIndex={-1}>
				<p>x</p>
			</ScrollArea>,
		);
		const viewport = container.querySelector("[data-radix-scroll-area-viewport]");
		expect(viewport).toHaveAttribute("tabindex", "-1");
	});

	it("merges consumer className on the root", () => {
		render(
			<ScrollArea className="custom-class" data-testid="root">
				<p>x</p>
			</ScrollArea>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("relative");
	});

	it("forwards ref to the underlying root element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(
			<ScrollArea ref={ref}>
				<p>x</p>
			</ScrollArea>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
