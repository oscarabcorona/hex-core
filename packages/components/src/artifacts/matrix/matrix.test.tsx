import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Matrix, type MatrixNode } from "./matrix.js";

const sampleNodes: MatrixNode[] = [
	{ id: "a", label: "A" },
	{ id: "b", label: "B" },
	{ id: "c", label: "C" },
	{ id: "d", label: "D" },
];
const sampleMatrix: number[][] = [
	[0, 5, 8, 1],
	[3, 0, 2, 4],
	[6, 0, 0, 7],
	[2, 1, 9, 0],
];

describe("Matrix", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Matrix nodes={sampleNodes} matrix={sampleMatrix} />);
		expect(container.querySelector("[data-hex-matrix]")).not.toBeNull();
	});

	it("renders one cell per (row, col) pair (N²)", () => {
		const { container } = render(<Matrix nodes={sampleNodes} matrix={sampleMatrix} />);
		expect(container.querySelectorAll("[data-hex-matrix-cell]").length).toBe(16);
	});

	it("tags each cell with its row and col indices", () => {
		const { container } = render(<Matrix nodes={sampleNodes} matrix={sampleMatrix} />);
		const corner = container.querySelector('[data-hex-matrix-cell][data-row="0"][data-col="0"]');
		expect(corner).not.toBeNull();
		const farCorner = container.querySelector('[data-hex-matrix-cell][data-row="3"][data-col="3"]');
		expect(farCorner).not.toBeNull();
	});

	it("calls onCellClick with the clicked cell payload", () => {
		const onCellClick = vi.fn();
		const { container } = render(
			<Matrix nodes={sampleNodes} matrix={sampleMatrix} onCellClick={onCellClick} />,
		);
		const firstCell = container.querySelector("[data-hex-matrix-cell]") as SVGGElement;
		firstCell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onCellClick).toHaveBeenCalledTimes(1);
		expect(onCellClick.mock.calls[0][0]).toMatchObject({
			row: { id: "a" },
			col: { id: "a" },
			value: 0,
		});
	});

	it("activates onCellClick via keyboard (Enter and Space)", () => {
		const onCellClick = vi.fn();
		const { container } = render(
			<Matrix nodes={sampleNodes} matrix={sampleMatrix} onCellClick={onCellClick} />,
		);
		const firstCell = container.querySelector("[data-hex-matrix-cell]") as SVGGElement;
		expect(firstCell.getAttribute("role")).toBe("button");
		expect(firstCell.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstCell, { key: "Enter" });
		expect(onCellClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstCell, { key: " " });
		expect(onCellClick).toHaveBeenCalledTimes(2);
	});

	it("calls onCellHover with the cell on enter and null on leave", () => {
		const onCellHover = vi.fn();
		const { container } = render(
			<Matrix nodes={sampleNodes} matrix={sampleMatrix} onCellHover={onCellHover} />,
		);
		const firstCell = container.querySelector("[data-hex-matrix-cell]") as SVGGElement;
		fireEvent.mouseEnter(firstCell);
		expect(onCellHover).toHaveBeenCalledTimes(1);
		expect(onCellHover.mock.calls[0][0]).toMatchObject({ row: { id: "a" }, col: { id: "a" } });
		fireEvent.mouseLeave(firstCell);
		expect(onCellHover).toHaveBeenCalledTimes(2);
		expect(onCellHover.mock.calls[1][0]).toBeNull();
	});

	it("renders row and column labels", () => {
		const { container } = render(<Matrix nodes={sampleNodes} matrix={sampleMatrix} />);
		const rowLabels = container.querySelectorAll("[data-hex-matrix-rows] text");
		const colLabels = container.querySelectorAll("[data-hex-matrix-cols] text");
		expect(rowLabels.length).toBe(4);
		expect(colLabels.length).toBe(4);
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Matrix nodes={sampleNodes} matrix={sampleMatrix} />);
		const svg = container.querySelector("[data-hex-matrix]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("4");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(
			<Matrix nodes={sampleNodes} matrix={sampleMatrix} className="custom-mx" />,
		);
		expect(container.querySelector("[data-hex-matrix]")?.getAttribute("class")).toContain("custom-mx");
	});

	it("renders nothing for an empty nodes array", () => {
		const empty: number[][] = [];
		const { container } = render(<Matrix nodes={[]} matrix={empty} />);
		expect(container.querySelectorAll("[data-hex-matrix-cell]").length).toBe(0);
	});

	it("scales to a 50×50 matrix without errors (perf + correctness ceiling)", () => {
		const bigNodes: MatrixNode[] = Array.from({ length: 50 }, (_, i) => ({
			id: `n${i}`,
			label: `N${i}`,
		}));
		const bigMatrix: number[][] = Array.from({ length: 50 }, (_, i) =>
			Array.from({ length: 50 }, (_, j) => (i === j ? 0 : (i + j) % 7)),
		);
		const { container } = render(<Matrix nodes={bigNodes} matrix={bigMatrix} size={800} />);
		expect(container.querySelectorAll("[data-hex-matrix-cell]").length).toBe(2500);
	});

	it("treats short rows as zeros without crashing", () => {
		// values[2] is intentionally shorter than nodes.length — missing entries fall back to 0
		const shortValues: number[][] = [
			[0, 1, 2, 3],
			[1, 0, 1, 2],
			[2, 1], // short
			[3, 2, 1, 0],
		];
		const { container } = render(<Matrix nodes={sampleNodes} matrix={shortValues} />);
		expect(container.querySelectorAll("[data-hex-matrix-cell]").length).toBe(16);
	});
});
