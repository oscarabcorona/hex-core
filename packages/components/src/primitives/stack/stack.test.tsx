import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./stack.js";

describe("Stack", () => {
	it("renders a flex column with its children", () => {
		render(
			<Stack data-testid="root">
				<span>a</span>
				<span>b</span>
			</Stack>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("flex");
		expect(root).toHaveClass("flex-col");
		expect(root).toHaveTextContent("ab");
	});

	it("applies default gap, align, and justify variants", () => {
		render(<Stack data-testid="root">x</Stack>);
		const root = screen.getByTestId("root");
		expect(root.className).toMatch(/gap-\[var\(--gap-md/);
		expect(root).toHaveClass("items-stretch");
		expect(root).toHaveClass("justify-start");
	});

	it("applies the gap variant", () => {
		render(
			<Stack gap="xl" data-testid="root">
				x
			</Stack>,
		);
		expect(screen.getByTestId("root").className).toMatch(/gap-\[var\(--gap-xl/);
	});

	it("applies the align variant", () => {
		render(
			<Stack align="end" data-testid="root">
				x
			</Stack>,
		);
		expect(screen.getByTestId("root")).toHaveClass("items-end");
	});

	it("applies the justify variant", () => {
		render(
			<Stack justify="between" data-testid="root">
				x
			</Stack>,
		);
		expect(screen.getByTestId("root")).toHaveClass("justify-between");
	});

	it("merges consumer className with default classes", () => {
		render(
			<Stack className="custom-class" data-testid="root">
				x
			</Stack>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("flex-col");
	});
});
