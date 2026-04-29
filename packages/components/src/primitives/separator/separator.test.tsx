import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator.js";

describe("Separator", () => {
	it("renders a horizontal separator with the horizontal class by default", () => {
		render(<Separator data-testid="sep" />);
		const sep = screen.getByTestId("sep");
		expect(sep).toHaveClass("h-[1px]");
		expect(sep).toHaveClass("w-full");
	});

	it("renders a vertical separator when orientation='vertical'", () => {
		render(<Separator orientation="vertical" data-testid="sep" />);
		const sep = screen.getByTestId("sep");
		expect(sep).toHaveClass("h-full");
		expect(sep).toHaveClass("w-[1px]");
	});

	it("exposes role=separator when not decorative", () => {
		render(<Separator decorative={false} data-testid="sep" />);
		// non-decorative separators are exposed to AT
		expect(screen.getByRole("separator")).toBe(screen.getByTestId("sep"));
	});

	it("hides itself from AT when decorative (default)", () => {
		render(<Separator data-testid="sep" />);
		expect(screen.queryByRole("separator")).toBeNull();
	});

	it("merges consumer className with default classes", () => {
		render(<Separator className="custom-class" data-testid="sep" />);
		const sep = screen.getByTestId("sep");
		expect(sep).toHaveClass("custom-class");
		expect(sep).toHaveClass("shrink-0");
	});

	it("forwards ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<Separator ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
