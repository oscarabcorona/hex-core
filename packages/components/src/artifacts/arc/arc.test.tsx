import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Arc, type ArcEdge, type ArcNode } from "./arc.js";

const sampleNodes: ArcNode[] = [
	{ id: "alice", label: "Alice" },
	{ id: "bob", label: "Bob" },
	{ id: "carol", label: "Carol" },
	{ id: "dave", label: "Dave" },
];
const sampleEdges: ArcEdge[] = [
	{ source: "alice", target: "bob", value: 3 },
	{ source: "alice", target: "carol", value: 1 },
	{ source: "bob", target: "dave", value: 2 },
];

describe("Arc", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Arc nodes={sampleNodes} edges={sampleEdges} />);
		expect(container.querySelector("[data-hex-arc]")).not.toBeNull();
	});

	it("renders one node per node and one edge per edge", () => {
		const { container } = render(<Arc nodes={sampleNodes} edges={sampleEdges} />);
		expect(container.querySelectorAll("[data-hex-arc-node]").length).toBe(4);
		expect(container.querySelectorAll("[data-hex-arc-edge]").length).toBe(3);
	});

	it("tags each node with its display-order depth", () => {
		const { container } = render(<Arc nodes={sampleNodes} edges={sampleEdges} />);
		const depths = Array.from(container.querySelectorAll("[data-hex-arc-node]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		expect(depths).toEqual(["0", "1", "2", "3"]);
	});

	it("calls onNodeClick with the clicked node", () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Arc nodes={sampleNodes} edges={sampleEdges} onNodeClick={onNodeClick} />,
		);
		const firstNode = container.querySelector("[data-hex-arc-node]") as SVGGElement;
		firstNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		expect(onNodeClick.mock.calls[0][0].id).toBe("alice");
	});

	it("activates onNodeClick via keyboard (Enter and Space)", () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Arc nodes={sampleNodes} edges={sampleEdges} onNodeClick={onNodeClick} />,
		);
		const firstNode = container.querySelector("[data-hex-arc-node]") as SVGGElement;
		expect(firstNode.getAttribute("role")).toBe("button");
		expect(firstNode.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstNode, { key: "Enter" });
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstNode, { key: " " });
		expect(onNodeClick).toHaveBeenCalledTimes(2);
	});

	it("calls onEdgeHover with the edge on enter and null on leave", () => {
		const onEdgeHover = vi.fn();
		const { container } = render(
			<Arc nodes={sampleNodes} edges={sampleEdges} onEdgeHover={onEdgeHover} />,
		);
		const firstEdge = container.querySelector("[data-hex-arc-edge]") as SVGPathElement;
		fireEvent.mouseEnter(firstEdge);
		expect(onEdgeHover).toHaveBeenCalledTimes(1);
		expect(onEdgeHover.mock.calls[0][0]).toMatchObject({
			source: expect.any(String),
			target: expect.any(String),
		});
		fireEvent.mouseLeave(firstEdge);
		expect(onEdgeHover).toHaveBeenCalledTimes(2);
		expect(onEdgeHover.mock.calls[1][0]).toBeNull();
	});

	it("fires onEdgeHover on focus + null on blur (keyboard parity)", () => {
		const onEdgeHover = vi.fn();
		const { container } = render(
			<Arc nodes={sampleNodes} edges={sampleEdges} onEdgeHover={onEdgeHover} />,
		);
		const firstEdge = container.querySelector("[data-hex-arc-edge]") as SVGPathElement;
		expect(firstEdge.getAttribute("tabindex")).toBe("0");
		fireEvent.focus(firstEdge);
		expect(onEdgeHover).toHaveBeenCalledTimes(1);
		fireEvent.blur(firstEdge);
		expect(onEdgeHover).toHaveBeenLastCalledWith(null);
	});

	it("centers a single node at width/2 (no left-pin)", () => {
		const single: ArcNode[] = [{ id: "only", label: "Only" }];
		const { container } = render(<Arc nodes={single} edges={[]} width={400} height={200} />);
		const node = container.querySelector("[data-hex-arc-node]");
		const circle = node?.querySelector("circle");
		expect(Number(circle?.getAttribute("cx"))).toBeCloseTo(200, 0);
	});

	it("skips edges whose source or target id is missing from nodes", () => {
		const orphanEdges: ArcEdge[] = [
			{ source: "alice", target: "bob" },
			{ source: "ghost", target: "carol" }, // skipped
		];
		const { container } = render(<Arc nodes={sampleNodes} edges={orphanEdges} />);
		expect(container.querySelectorAll("[data-hex-arc-edge]").length).toBe(1);
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Arc nodes={sampleNodes} edges={sampleEdges} />);
		const svg = container.querySelector("[data-hex-arc]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("4 nodes");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<Arc nodes={sampleNodes} edges={sampleEdges} className="custom-ar" />);
		expect(container.querySelector("[data-hex-arc]")?.getAttribute("class")).toContain("custom-ar");
	});

	it("renders nothing for an empty nodes array", () => {
		const { container } = render(<Arc nodes={[]} edges={[]} />);
		expect(container.querySelectorAll("[data-hex-arc-node]").length).toBe(0);
	});
});
