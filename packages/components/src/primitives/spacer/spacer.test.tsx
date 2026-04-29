import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spacer } from "./spacer.js";

describe("Spacer", () => {
	it("renders an aria-hidden div", () => {
		render(<Spacer data-testid="sp" />);
		const sp = screen.getByTestId("sp");
		expect(sp).toBeInstanceOf(HTMLDivElement);
		expect(sp).toHaveAttribute("aria-hidden", "true");
	});

	it("applies default md size and vertical axis variants", () => {
		render(<Spacer data-testid="sp" />);
		const sp = screen.getByTestId("sp");
		expect(sp.className).toMatch(/--spacer-size:var\(--space-4/);
		expect(sp).toHaveClass("h-[var(--spacer-size)]");
		expect(sp).toHaveClass("w-0");
	});

	it("applies horizontal axis classes", () => {
		render(<Spacer axis="horizontal" data-testid="sp" />);
		const sp = screen.getByTestId("sp");
		expect(sp).toHaveClass("w-[var(--spacer-size)]");
		expect(sp).toHaveClass("h-0");
	});

	it("applies both-axis classes when axis='both'", () => {
		render(<Spacer axis="both" data-testid="sp" />);
		const sp = screen.getByTestId("sp");
		expect(sp).toHaveClass("h-[var(--spacer-size)]");
		expect(sp).toHaveClass("w-[var(--spacer-size)]");
	});

	it("applies the size variant CSS variable", () => {
		render(<Spacer size="xl" data-testid="sp" />);
		expect(screen.getByTestId("sp").className).toMatch(/--spacer-size:var\(--space-16/);
	});

	it("merges consumer className with default classes", () => {
		render(<Spacer className="custom-class" data-testid="sp" />);
		const sp = screen.getByTestId("sp");
		expect(sp).toHaveClass("custom-class");
		expect(sp).toHaveClass("shrink-0");
	});
});
