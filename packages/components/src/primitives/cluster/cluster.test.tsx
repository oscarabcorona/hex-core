import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cluster } from "./cluster.js";

describe("Cluster", () => {
	it("renders its children inside a flex-wrap row", () => {
		render(
			<Cluster data-testid="root">
				<span>a</span>
				<span>b</span>
			</Cluster>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("flex");
		expect(root).toHaveClass("flex-wrap");
		expect(root).toHaveTextContent("ab");
	});

	it("applies default gap, align, and justify variants", () => {
		render(<Cluster data-testid="root" />);
		const root = screen.getByTestId("root");
		expect(root.className).toMatch(/gap-\[var\(--gap-md/);
		expect(root).toHaveClass("items-center");
		expect(root).toHaveClass("justify-start");
	});

	it("applies the gap variant", () => {
		render(<Cluster gap="lg" data-testid="root" />);
		expect(screen.getByTestId("root").className).toMatch(/gap-\[var\(--gap-lg/);
	});

	it("applies the baseline align variant (cluster-only)", () => {
		render(<Cluster align="baseline" data-testid="root" />);
		expect(screen.getByTestId("root")).toHaveClass("items-baseline");
	});

	it("applies the justify variant", () => {
		render(<Cluster justify="between" data-testid="root" />);
		expect(screen.getByTestId("root")).toHaveClass("justify-between");
	});

	it("merges consumer className with default classes", () => {
		render(<Cluster className="custom-class" data-testid="root" />);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("flex");
	});
});
