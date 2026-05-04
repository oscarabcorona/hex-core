import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dendrogram, type DendrogramNode } from "./dendrogram.js";

const sample: DendrogramNode = {
	id: "root",
	label: "Animals",
	children: [
		{
			id: "mammals",
			label: "Mammals",
			children: [
				{ id: "cat", label: "Cat" },
				{ id: "dog", label: "Dog" },
			],
		},
		{ id: "birds", label: "Birds", children: [{ id: "robin", label: "Robin" }] },
	],
};

describe("Dendrogram", () => {
	it("renders a loading placeholder before d3-hierarchy resolves", () => {
		const { container } = render(<Dendrogram root={sample} />);
		expect(container.querySelector("[data-hex-dendrogram-loading]")).not.toBeNull();
	});

	it("renders one node group per hierarchy entry once d3-hierarchy resolves", async () => {
		const { container } = render(<Dendrogram root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-dendrogram]")).not.toBeNull();
		});
		// 1 root + 2 children + 3 grandchildren = 6
		expect(container.querySelectorAll("[data-hex-dendrogram-node]").length).toBe(6);
	});

	it("marks leaves vs internal nodes via data-leaf", async () => {
		const { container } = render(<Dendrogram root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-dendrogram]")).not.toBeNull();
		});
		const leafNodes = container.querySelectorAll("[data-hex-dendrogram-node][data-leaf=\"true\"]");
		expect(leafNodes.length).toBe(3);
	});

	it("forwards the orientation and linkShape attributes", async () => {
		const { container } = render(<Dendrogram root={sample} orientation="vertical" linkShape="diagonal" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-dendrogram]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-dendrogram]") as SVGSVGElement;
		expect(svg).toHaveAttribute("data-orientation", "vertical");
		expect(svg).toHaveAttribute("data-link-shape", "diagonal");
	});

	it("calls onLeafClick only on leaf clicks", async () => {
		const onLeafClick = vi.fn();
		const { container } = render(<Dendrogram root={sample} onLeafClick={onLeafClick} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-dendrogram]")).not.toBeNull();
		});
		const leaf = container.querySelector("[data-hex-dendrogram-node][data-leaf=\"true\"]") as SVGGElement;
		leaf.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onLeafClick).toHaveBeenCalledTimes(1);
		const internal = container.querySelector("[data-hex-dendrogram-node][data-leaf=\"false\"]") as SVGGElement;
		internal.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		// internal-node clicks are no-ops
		expect(onLeafClick).toHaveBeenCalledTimes(1);
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<Dendrogram root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-dendrogram]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-dendrogram]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain(sample.label);
	});

	it("tags each rendered node with its hierarchy depth", async () => {
		const { container } = render(<Dendrogram root={sample} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-dendrogram-node]").length).toBe(6);
		});
		const depths = Array.from(container.querySelectorAll("[data-hex-dendrogram-node]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		expect(depths).toContain("0");
		expect(depths).toContain("1");
		expect(depths).toContain("2");
	});
});
