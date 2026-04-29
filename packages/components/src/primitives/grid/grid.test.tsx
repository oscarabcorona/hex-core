import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./grid.js";

describe("Grid", () => {
	it("renders a div with the grid display class", () => {
		render(<Grid data-testid="root">x</Grid>);
		expect(screen.getByTestId("root")).toHaveClass("grid");
	});

	it("applies the default 3-column variant", () => {
		render(<Grid data-testid="root">x</Grid>);
		expect(screen.getByTestId("root")).toHaveClass("grid-cols-3");
	});

	it("applies the cols variant", () => {
		render(
			<Grid cols={6} data-testid="root">
				x
			</Grid>,
		);
		expect(screen.getByTestId("root")).toHaveClass("grid-cols-6");
	});

	it("uses gridTemplateColumns inline style for cols='auto-fit'", () => {
		render(
			<Grid cols="auto-fit" minColWidth="20rem" data-testid="root">
				x
			</Grid>,
		);
		const root = screen.getByTestId("root");
		expect(root.style.gridTemplateColumns).toBe(
			"repeat(auto-fit, minmax(20rem, 1fr))",
		);
	});

	it("defaults minColWidth to 16rem when cols='auto-fit' and not provided", () => {
		render(
			<Grid cols="auto-fit" data-testid="root">
				x
			</Grid>,
		);
		expect(screen.getByTestId("root").style.gridTemplateColumns).toBe(
			"repeat(auto-fit, minmax(16rem, 1fr))",
		);
	});

	it("lets the consumer's inline gridTemplateColumns win over auto-fit default", () => {
		render(
			<Grid
				cols="auto-fit"
				minColWidth="20rem"
				style={{ gridTemplateColumns: "1fr 2fr" }}
				data-testid="root"
			>
				x
			</Grid>,
		);
		expect(screen.getByTestId("root").style.gridTemplateColumns).toBe("1fr 2fr");
	});

	it("applies the gap and align variants", () => {
		render(
			<Grid gap="lg" align="center" data-testid="root">
				x
			</Grid>,
		);
		const root = screen.getByTestId("root");
		expect(root.className).toMatch(/gap-\[var\(--gap-lg/);
		expect(root).toHaveClass("items-center");
	});

	it("merges consumer className with default classes", () => {
		render(
			<Grid className="custom-class" data-testid="root">
				x
			</Grid>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("grid");
	});
});
