import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeMap, type TreeMapNode } from "./tree-map.js";

const sample: TreeMapNode = {
	id: "root",
	label: "Root",
	children: [
		{ id: "a", label: "A", value: 60 },
		{ id: "b", label: "B", value: 30 },
		{ id: "c", label: "C", value: 10 },
	],
};

describe("TreeMap", () => {
	it("renders a loading placeholder before d3-hierarchy resolves", () => {
		const { container } = render(<TreeMap root={sample} />);
		expect(container.querySelector("[data-hex-tree-map-loading]")).not.toBeNull();
	});

	it("renders one leaf rect per leaf node once d3-hierarchy resolves", async () => {
		const { container } = render(<TreeMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-tree-map]")).not.toBeNull();
		});
		const leaves = container.querySelectorAll("[data-hex-tree-map-leaf]");
		expect(leaves.length).toBe(3);
	});

	it("forwards the tile attribute", async () => {
		const { container } = render(<TreeMap root={sample} tile="binary" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-tree-map]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-tree-map]")).toHaveAttribute("data-tile", "binary");
	});

	it("calls onLeafClick with the clicked leaf", async () => {
		const onLeafClick = vi.fn();
		const { container } = render(<TreeMap root={sample} onLeafClick={onLeafClick} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-tree-map-leaf]").length).toBe(3);
		});
		const firstLeaf = container.querySelector("[data-hex-tree-map-leaf]") as SVGGElement;
		firstLeaf.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onLeafClick).toHaveBeenCalledTimes(1);
		expect(["a", "b", "c"]).toContain(onLeafClick.mock.calls[0][0].id);
	});

	it("uses a custom colorBy function when provided", async () => {
		const colorBy = vi.fn(() => "rgb(255, 0, 0)");
		const { container } = render(<TreeMap root={sample} colorBy={colorBy} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-tree-map-leaf]").length).toBe(3);
		});
		expect(colorBy).toHaveBeenCalledTimes(3);
	});

	it("merges className onto the SVG", async () => {
		const { container } = render(<TreeMap root={sample} className="custom-tm" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-tree-map]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-tree-map]")?.getAttribute("class")).toContain("custom-tm");
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<TreeMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-tree-map]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-tree-map]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain(sample.label);
	});

	it("tags each rendered leaf with its hierarchy depth", async () => {
		const { container } = render(<TreeMap root={sample} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-tree-map-leaf]").length).toBe(3);
		});
		const depths = Array.from(container.querySelectorAll("[data-hex-tree-map-leaf]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		// All sample leaves are at depth 1 (root is depth 0, leaves directly under root)
		expect(depths.every((d) => d === "1")).toBe(true);
	});
});
