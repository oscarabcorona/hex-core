import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sankey, type SankeyLink, type SankeyNode } from "./sankey.js";

const sampleNodes: SankeyNode[] = [
	{ id: "src-a", label: "Source A" },
	{ id: "src-b", label: "Source B" },
	{ id: "sink", label: "Sink" },
];
const sampleLinks: SankeyLink[] = [
	{ source: "src-a", target: "sink", value: 60 },
	{ source: "src-b", target: "sink", value: 30 },
];

describe("Sankey", () => {
	it("renders a loading placeholder before d3-sankey resolves", () => {
		const { container } = render(<Sankey nodes={sampleNodes} links={sampleLinks} />);
		expect(container.querySelector("[data-hex-sankey-loading]")).not.toBeNull();
	});

	it("renders one node group per node and one path per link once d3-sankey resolves", async () => {
		const { container } = render(<Sankey nodes={sampleNodes} links={sampleLinks} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sankey]")).not.toBeNull();
		});
		expect(container.querySelectorAll("[data-hex-sankey-node]").length).toBe(3);
		expect(container.querySelectorAll("[data-hex-sankey-link]").length).toBe(2);
	});

	it("forwards the nodeAlign attribute", async () => {
		const { container } = render(<Sankey nodes={sampleNodes} links={sampleLinks} nodeAlign="left" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sankey]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-sankey]")).toHaveAttribute("data-node-align", "left");
	});

	it("calls onLinkHover with the link on enter and null on leave", async () => {
		const onLinkHover = vi.fn();
		const { container } = render(
			<Sankey nodes={sampleNodes} links={sampleLinks} onLinkHover={onLinkHover} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sankey-link]").length).toBe(2);
		});
		const firstLink = container.querySelector("[data-hex-sankey-link]") as SVGPathElement;
		// fireEvent.mouseEnter triggers React's synthetic onMouseEnter handler
		// reliably; raw dispatchEvent("mouseenter") doesn't bubble through
		// React's root listener since mouseenter is a non-bubbling event.
		fireEvent.mouseEnter(firstLink);
		expect(onLinkHover).toHaveBeenCalledTimes(1);
		expect(onLinkHover.mock.calls[0][0]).toMatchObject({ source: expect.any(String), target: expect.any(String), value: expect.any(Number) });
		fireEvent.mouseLeave(firstLink);
		expect(onLinkHover).toHaveBeenCalledTimes(2);
		expect(onLinkHover.mock.calls[1][0]).toBeNull();
	});

	it("calls onNodeClick with the clicked node", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Sankey nodes={sampleNodes} links={sampleLinks} onNodeClick={onNodeClick} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sankey-node]").length).toBe(3);
		});
		const firstNode = container.querySelector("[data-hex-sankey-node]") as SVGGElement;
		firstNode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		expect(["src-a", "src-b", "sink"]).toContain(onNodeClick.mock.calls[0][0].id);
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<Sankey nodes={sampleNodes} links={sampleLinks} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sankey]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-sankey]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("3 nodes");
	});

	it("merges className onto the SVG", async () => {
		const { container } = render(
			<Sankey nodes={sampleNodes} links={sampleLinks} className="custom-sk" />,
		);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sankey]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-sankey]")?.getAttribute("class")).toContain("custom-sk");
	});

	it("forwards interactive nodes as keyboard-activatable buttons", async () => {
		const onNodeClick = vi.fn();
		const { container } = render(
			<Sankey nodes={sampleNodes} links={sampleLinks} onNodeClick={onNodeClick} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sankey-node]").length).toBe(3);
		});
		const firstNode = container.querySelector("[data-hex-sankey-node]") as SVGGElement;
		expect(firstNode.getAttribute("role")).toBe("button");
		expect(firstNode.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstNode, { key: "Enter" });
		expect(onNodeClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstNode, { key: " " });
		expect(onNodeClick).toHaveBeenCalledTimes(2);
	});

	it("preserves consumer-supplied extra fields on link callbacks (forward-compat)", async () => {
		// Widen with an index signature rather than casting: the public type
		// only declares { source, target, value }, but the layout passes the
		// original through via spread, so future widenings round-trip.
		const linkWithExtra: SankeyLink & Record<string, unknown> = {
			...sampleLinks[0],
			category: "main",
		};
		const linksWithExtra = [linkWithExtra, sampleLinks[1]];
		const onLinkHover = vi.fn();
		const { container } = render(
			<Sankey nodes={sampleNodes} links={linksWithExtra} onLinkHover={onLinkHover} />,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sankey-link]").length).toBe(2);
		});
		const firstLink = container.querySelector("[data-hex-sankey-link]") as SVGPathElement;
		fireEvent.mouseEnter(firstLink);
		expect(onLinkHover).toHaveBeenCalledTimes(1);
		expect(onLinkHover.mock.calls[0][0]).toMatchObject({ category: "main" });
	});
});
