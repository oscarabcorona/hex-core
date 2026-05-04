import { render, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { OrgChart, type OrgNode } from "./org-chart.js";

const sample: OrgNode = {
	id: "ceo",
	label: "CEO",
	subtitle: "Chief Executive",
	children: [
		{ id: "cto", label: "CTO", subtitle: "Tech", children: [{ id: "eng", label: "Eng" }] },
		{ id: "cfo", label: "CFO", subtitle: "Finance" },
	],
};

describe("OrgChart", () => {
	it("renders a loading placeholder before d3-hierarchy resolves", () => {
		const { container } = render(<OrgChart root={sample} />);
		expect(container.querySelector("[data-hex-org-chart-loading]")).not.toBeNull();
	});

	it("renders one node group per visible node once d3-hierarchy resolves", async () => {
		const { container } = render(<OrgChart root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		// 1 root + 2 children + 1 grandchild = 4
		expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(4);
	});

	it("collapses children below defaultExpandedDepth", async () => {
		const { container } = render(<OrgChart root={sample} defaultExpandedDepth={1} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		// Root + 2 children — grandchild is hidden behind a +N badge
		expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(3);
	});

	it("toggles collapsed state when collapsible and clicking a node with children", async () => {
		const { container } = render(<OrgChart root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(4);
		// Click the CTO node (has 1 child)
		const nodes = container.querySelectorAll("[data-hex-org-chart-node]");
		const ctoNode = Array.from(nodes).find((n) => n.textContent?.includes("CTO")) as SVGGElement;
		act(() => {
			ctoNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(3);
		});
	});

	it("calls onNodeClick with the clicked node", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(<OrgChart root={sample} onNodeClick={onNodeClick} collapsible={false} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		const firstNode = container.querySelector("[data-hex-org-chart-node]") as SVGGElement;
		firstNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		expect(onNodeClick.mock.calls[0][0].id).toBe("ceo");
	});

	it("fires onNodeClick before toggling collapse so consumers can observe the pre-toggle state", async () => {
		// Snapshot the visible-node count from inside the callback; if the
		// callback fired AFTER the collapse, the count would already reflect
		// the collapsed tree.
		let visibleAtCallbackTime = -1;
		const { container } = render(
			<OrgChart
				root={sample}
				onNodeClick={() => {
					visibleAtCallbackTime = container.querySelectorAll("[data-hex-org-chart-node]").length;
				}}
			/>,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(4);
		});
		const ctoNode = Array.from(container.querySelectorAll("[data-hex-org-chart-node]")).find(
			(n) => n.textContent?.includes("CTO"),
		) as SVGGElement;
		act(() => {
			ctoNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(visibleAtCallbackTime).toBe(4); // pre-toggle
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(3); // post-toggle
		});
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<OrgChart root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-org-chart]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain(sample.label);
	});

	it("tags each rendered node with its hierarchy depth", async () => {
		const { container } = render(<OrgChart root={sample} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(4);
		});
		const depths = Array.from(container.querySelectorAll("[data-hex-org-chart-node]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		expect(depths).toContain("0");
		expect(depths).toContain("1");
		expect(depths).toContain("2");
	});

	it("re-seeds collapsed state when root reference changes", async () => {
		const { container, rerender } = render(<OrgChart root={sample} defaultExpandedDepth={1} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-org-chart]")).not.toBeNull();
		});
		expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(3); // 1 root + 2 mid (grandchild collapsed)

		// Swap to a different root — the previously-collapsed CTO id no longer exists
		const newRoot = { id: "new-ceo", label: "New CEO", children: [{ id: "x", label: "X" }] };
		rerender(<OrgChart root={newRoot} defaultExpandedDepth={1} />);
		await waitFor(() => {
			const labels = Array.from(container.querySelectorAll("[data-hex-org-chart-node]")).map(
				(n) => n.textContent,
			);
			expect(labels.some((l) => l?.includes("New CEO"))).toBe(true);
		});
		// New tree only has 2 nodes total — depth 1 is a leaf, so no collapse badges
		expect(container.querySelectorAll("[data-hex-org-chart-node]").length).toBe(2);
	});
});
