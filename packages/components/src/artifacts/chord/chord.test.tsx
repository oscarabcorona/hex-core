import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chord, type ChordNode } from "./chord.js";

const sampleNodes: ChordNode[] = [
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

describe("Chord", () => {
	it("renders a loading placeholder before d3 modules resolve", () => {
		const { container } = render(<Chord nodes={sampleNodes} matrix={sampleMatrix} />);
		expect(container.querySelector("[data-hex-chord-loading]")).not.toBeNull();
	});

	it("renders one arc per node once d3 resolves", async () => {
		const { container } = render(<Chord nodes={sampleNodes} matrix={sampleMatrix} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-chord]")).not.toBeNull();
		});
		expect(container.querySelectorAll("[data-hex-chord-arc]").length).toBe(4);
	});

	it("renders ribbons for non-zero matrix entries", async () => {
		const { container } = render(<Chord nodes={sampleNodes} matrix={sampleMatrix} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-chord-ribbon]").length).toBeGreaterThan(0);
		});
	});

	it("calls onNodeClick with the clicked node", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Chord nodes={sampleNodes} matrix={sampleMatrix} onNodeClick={onNodeClick} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-chord-arc]").length).toBe(4);
		});
		const firstArc = container.querySelector("[data-hex-chord-arc]") as SVGGElement;
		firstArc.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		expect(["a", "b", "c", "d"]).toContain(onNodeClick.mock.calls[0][0].id);
	});

	it("activates onNodeClick via keyboard (Enter and Space)", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Chord nodes={sampleNodes} matrix={sampleMatrix} onNodeClick={onNodeClick} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-chord-arc]").length).toBe(4);
		});
		const firstArc = container.querySelector("[data-hex-chord-arc]") as SVGGElement;
		expect(firstArc.getAttribute("role")).toBe("button");
		expect(firstArc.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstArc, { key: "Enter" });
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstArc, { key: " " });
		expect(onNodeClick).toHaveBeenCalledTimes(2);
	});

	it("calls onChordHover with the ribbon details on enter and null on leave", async () => {
		const onChordHover = vi.fn();
		const { container } = render(
			<Chord nodes={sampleNodes} matrix={sampleMatrix} onChordHover={onChordHover} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-chord-ribbon]").length).toBeGreaterThan(0);
		});
		const firstRibbon = container.querySelector("[data-hex-chord-ribbon]") as SVGPathElement;
		fireEvent.mouseEnter(firstRibbon);
		expect(onChordHover).toHaveBeenCalledTimes(1);
		expect(onChordHover.mock.calls[0][0]).toMatchObject({
			source: { id: expect.any(String) },
			target: { id: expect.any(String) },
			sourceValue: expect.any(Number),
			targetValue: expect.any(Number),
		});
		fireEvent.mouseLeave(firstRibbon);
		expect(onChordHover).toHaveBeenCalledTimes(2);
		expect(onChordHover.mock.calls[1][0]).toBeNull();
	});

	it("fires onChordHover on focus + null on blur (keyboard parity)", async () => {
		const onChordHover = vi.fn();
		const { container } = render(
			<Chord nodes={sampleNodes} matrix={sampleMatrix} onChordHover={onChordHover} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-chord-ribbon]").length).toBeGreaterThan(0);
		});
		const firstRibbon = container.querySelector("[data-hex-chord-ribbon]") as SVGPathElement;
		expect(firstRibbon.getAttribute("tabindex")).toBe("0");
		fireEvent.focus(firstRibbon);
		expect(onChordHover).toHaveBeenCalledTimes(1);
		fireEvent.blur(firstRibbon);
		expect(onChordHover).toHaveBeenLastCalledWith(null);
	});

	it("does not render ribbons for chord pairs where both directions are zero", async () => {
		// Adjusting the sample so c-d direction is zero in both ways:
		const sparseMatrix: number[][] = [
			[0, 5, 0, 0],
			[5, 0, 0, 0],
			[0, 0, 0, 0], // c → all zero
			[0, 0, 0, 0], // d → all zero (and reverse to c is zero)
		];
		const { container } = render(<Chord nodes={sampleNodes} matrix={sparseMatrix} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-chord]")).not.toBeNull();
		});
		// Only the a↔b ribbon pair remains; pairs touching c/d are filtered out.
		const ribbonCount = container.querySelectorAll("[data-hex-chord-ribbon]").length;
		expect(ribbonCount).toBeLessThanOrEqual(2); // typically 1; allow some d3-chord variance
		expect(ribbonCount).toBeGreaterThan(0);
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<Chord nodes={sampleNodes} matrix={sampleMatrix} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-chord]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-chord]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("4 nodes");
	});

	it("merges className onto the SVG", async () => {
		const { container } = render(
			<Chord nodes={sampleNodes} matrix={sampleMatrix} className="custom-cd" />,
		);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-chord]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-chord]")?.getAttribute("class")).toContain("custom-cd");
	});
});
