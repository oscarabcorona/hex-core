import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MindMap, type MindMapNode } from "./mind-map.js";

const sample: MindMapNode = {
	id: "root",
	label: "Root",
	children: [
		{ id: "a", label: "A", children: [{ id: "a1", label: "A1" }] },
		{ id: "b", label: "B" },
	],
};

describe("MindMap", () => {
	it("renders a loading placeholder before d3-hierarchy resolves", () => {
		const { container } = render(<MindMap root={sample} />);
		expect(container.querySelector("[data-hex-mind-map-loading]")).not.toBeNull();
	});

	it("renders an SVG with a node per hierarchy entry once d3-hierarchy resolves", async () => {
		const { container } = render(<MindMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-mind-map]")).not.toBeNull();
		});
		const nodes = container.querySelectorAll("[data-hex-mind-map-node]");
		// 1 root + 2 children + 1 grandchild = 4
		expect(nodes.length).toBe(4);
	});

	it("forwards the orientation attribute", async () => {
		const { container } = render(<MindMap root={sample} orientation="horizontal" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-mind-map]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-mind-map]")).toHaveAttribute("data-orientation", "horizontal");
	});

	it("calls onNodeClick with the clicked node", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(<MindMap root={sample} onNodeClick={onNodeClick} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-mind-map-node]").length).toBeGreaterThan(0);
		});
		const firstNode = container.querySelector("[data-hex-mind-map-node]") as SVGGElement;
		firstNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		expect(onNodeClick.mock.calls[0][0].id).toBe(sample.id);
	});

	it("merges className onto the SVG", async () => {
		const { container } = render(<MindMap root={sample} className="custom-mm" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-mind-map]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-mind-map]")?.getAttribute("class")).toContain("custom-mm");
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<MindMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-mind-map]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-mind-map]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain(sample.label);
	});

	it("tags each rendered node with its hierarchy depth", async () => {
		const { container } = render(<MindMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-mind-map-node]").length).toBeGreaterThan(0);
		});
		const depths = Array.from(container.querySelectorAll("[data-hex-mind-map-node]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		expect(depths).toContain("0");
		expect(depths).toContain("1");
	});
});
