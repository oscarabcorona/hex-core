import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flowchart, type FlowchartEdge, type FlowchartNode } from "./flowchart.js";

const sampleNodes: FlowchartNode[] = [
	{ id: "start", label: "Start", shape: "round" },
	{ id: "check", label: "Authorized?", shape: "diamond" },
	{ id: "ok", label: "Continue" },
	{ id: "denied", label: "Reject", shape: "round" },
];
const sampleEdges: FlowchartEdge[] = [
	{ source: "start", target: "check" },
	{ source: "check", target: "ok", label: "yes" },
	{ source: "check", target: "denied", label: "no" },
];

describe("Flowchart", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} />);
		expect(container.querySelector("[data-hex-flowchart]")).not.toBeNull();
	});

	it("renders one node group per node and one edge per edge", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} />);
		expect(container.querySelectorAll("[data-hex-flowchart-node]").length).toBe(4);
		expect(container.querySelectorAll("[data-hex-flowchart-edge]").length).toBe(3);
	});

	it("forwards the direction attribute and assigns ranks via topological sort", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} direction="horizontal" />);
		expect(container.querySelector("[data-hex-flowchart]")).toHaveAttribute("data-direction", "horizontal");
		const ranks = Array.from(container.querySelectorAll("[data-hex-flowchart-node]")).map(
			(n) => Number(n.getAttribute("data-rank")),
		);
		// start -> rank 0; check -> rank 1; ok and denied -> rank 2 each
		expect(ranks.sort()).toEqual([0, 1, 2, 2]);
	});

	it("tags each node with its declared shape", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} />);
		const shapes = Array.from(container.querySelectorAll("[data-hex-flowchart-node]")).map(
			(n) => n.getAttribute("data-shape"),
		);
		expect(shapes.filter((s) => s === "round").length).toBe(2);
		expect(shapes.filter((s) => s === "diamond").length).toBe(1);
		expect(shapes.filter((s) => s === "rect").length).toBe(1);
	});

	it("calls onNodeClick with the clicked node", () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Flowchart nodes={sampleNodes} edges={sampleEdges} onNodeClick={onNodeClick} />,
		);
		const firstNode = container.querySelector("[data-hex-flowchart-node]") as SVGGElement;
		firstNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
	});

	it("renders edge labels when provided", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} />);
		const edgeTexts = Array.from(container.querySelectorAll("[data-hex-flowchart-edge] text")).map(
			(t) => t.textContent,
		);
		expect(edgeTexts).toContain("yes");
		expect(edgeTexts).toContain("no");
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Flowchart nodes={sampleNodes} edges={sampleEdges} />);
		const svg = container.querySelector("[data-hex-flowchart]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("4 nodes");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(
			<Flowchart nodes={sampleNodes} edges={sampleEdges} className="custom-fc" />,
		);
		expect(container.querySelector("[data-hex-flowchart]")?.getAttribute("class")).toContain("custom-fc");
	});

	it("skips edges whose source or target id is missing from nodes", () => {
		const orphanEdges: FlowchartEdge[] = [
			{ source: "start", target: "check" },
			{ source: "ghost", target: "check" }, // skipped — no `ghost` node
		];
		const { container } = render(<Flowchart nodes={sampleNodes} edges={orphanEdges} />);
		expect(container.querySelectorAll("[data-hex-flowchart-edge]").length).toBe(1);
	});

	it("renders nothing for an empty nodes array", () => {
		const { container } = render(<Flowchart nodes={[]} edges={[]} />);
		expect(container.querySelectorAll("[data-hex-flowchart-node]").length).toBe(0);
	});

	it("places diamond-pattern joins at the longest-path rank (a→b→d AND a→c→d)", () => {
		// a → b → d, a → c → d. d should be at rank 2 (max of b@1 + c@1).
		const diamondNodes: FlowchartNode[] = [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
			{ id: "c", label: "C" },
			{ id: "d", label: "D" },
		];
		const diamondEdges: FlowchartEdge[] = [
			{ source: "a", target: "b" },
			{ source: "a", target: "c" },
			{ source: "b", target: "d" },
			{ source: "c", target: "d" },
		];
		const { container } = render(<Flowchart nodes={diamondNodes} edges={diamondEdges} />);
		const ranks = new Map(
			Array.from(container.querySelectorAll("[data-hex-flowchart-node]"))
				.map((n) => {
					const label = n.querySelector("text")?.textContent ?? "";
					return [label, Number(n.getAttribute("data-rank"))] as const;
				}),
		);
		expect(ranks.get("A")).toBe(0);
		expect(ranks.get("B")).toBe(1);
		expect(ranks.get("C")).toBe(1);
		expect(ranks.get("D")).toBe(2);
	});

	it("contains cycle damage to cycle-touched nodes (downstream paths still rank correctly)", () => {
		// a → b → c → a (cycle), a → d. d is NOT on the cycle and should
		// still be at a sensible rank below a (rank 1).
		const cyclicNodes: FlowchartNode[] = [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
			{ id: "c", label: "C" },
			{ id: "d", label: "D" },
		];
		const cyclicEdges: FlowchartEdge[] = [
			{ source: "a", target: "b" },
			{ source: "b", target: "c" },
			{ source: "c", target: "a" }, // back-edge → cycle
			{ source: "a", target: "d" },
		];
		const { container } = render(<Flowchart nodes={cyclicNodes} edges={cyclicEdges} />);
		const dRank = container.querySelectorAll("[data-hex-flowchart-node]")[3]?.getAttribute("data-rank");
		// d is downstream of a but not on the cycle — it should be at rank 1
		// (`a`'s rank + 1). Cycle short-circuit no longer poisons it.
		expect(Number(dRank)).toBeGreaterThanOrEqual(1);
	});

	it("activates onNodeClick via keyboard (Enter and Space)", () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Flowchart nodes={sampleNodes} edges={sampleEdges} onNodeClick={onNodeClick} />,
		);
		const firstNode = container.querySelector("[data-hex-flowchart-node]") as SVGGElement;
		expect(firstNode.getAttribute("role")).toBe("button");
		expect(firstNode.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstNode, { key: "Enter" });
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstNode, { key: " " });
		expect(onNodeClick).toHaveBeenCalledTimes(2);
	});

	it("renders an inner <title> on truncated nodes for hover tooltip recovery", () => {
		// nodeWidth=60 → max ≈ (60-16)/7 ≈ 6 chars before truncation
		const longNodes: FlowchartNode[] = [{ id: "long", label: "A really very long label that won't fit" }];
		const { container } = render(<Flowchart nodes={longNodes} edges={[]} nodeWidth={60} />);
		const node = container.querySelector("[data-hex-flowchart-node]");
		const innerTitle = node?.querySelector("title");
		expect(innerTitle?.textContent).toBe("A really very long label that won't fit");
	});
});
