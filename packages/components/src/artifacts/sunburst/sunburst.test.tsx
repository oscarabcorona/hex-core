import { render, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { Sunburst, type SunburstNode } from "./sunburst.js";

const sample: SunburstNode = {
	id: "root",
	label: "Total",
	children: [
		{
			id: "a",
			label: "A",
			children: [
				{ id: "a1", label: "A1", value: 40 },
				{ id: "a2", label: "A2", value: 20 },
			],
		},
		{ id: "b", label: "B", value: 30 },
	],
};

describe("Sunburst", () => {
	it("renders a loading placeholder before d3 modules resolve", () => {
		const { container } = render(<Sunburst root={sample} />);
		expect(container.querySelector("[data-hex-sunburst-loading]")).not.toBeNull();
	});

	it("renders one segment per non-root descendant once d3 resolves", async () => {
		const { container } = render(<Sunburst root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sunburst]")).not.toBeNull();
		});
		const segments = container.querySelectorAll("[data-hex-sunburst-segment]");
		// A + B (depth 1) + A1 + A2 (depth 2) = 4 (root is rendered as the center, not a segment)
		expect(segments.length).toBe(4);
	});

	it("drills into a segment when drillable and clicked", async () => {
		const { container } = render(<Sunburst root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sunburst]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-sunburst]")).toHaveAttribute("data-focus-id", "root");
		// Click the first segment ("A" or "B")
		const firstSegment = container.querySelector("[data-hex-sunburst-segment]") as SVGPathElement;
		act(() => {
			firstSegment.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		await waitFor(() => {
			const focusId = container.querySelector("[data-hex-sunburst]")?.getAttribute("data-focus-id");
			expect(focusId).not.toBe("root");
		});
	});

	it("calls onSegmentClick with the clicked node", async () => {
		const onSegmentClick = vi.fn();
		const { container } = render(<Sunburst root={sample} onSegmentClick={onSegmentClick} drillable={false} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sunburst-segment]").length).toBeGreaterThan(0);
		});
		const firstSegment = container.querySelector("[data-hex-sunburst-segment]") as SVGPathElement;
		firstSegment.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onSegmentClick).toHaveBeenCalledTimes(1);
	});

	it("merges className onto the SVG", async () => {
		const { container } = render(<Sunburst root={sample} className="custom-sb" />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sunburst]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-sunburst]")?.getAttribute("class")).toContain("custom-sb");
	});

	it("fires onSegmentClick before drilling so consumers can observe the pre-drill focus", async () => {
		let focusAtCallbackTime: string | null = "<not-fired>";
		const { container } = render(
			<Sunburst
				root={sample}
				onSegmentClick={() => {
					focusAtCallbackTime = container
						.querySelector("[data-hex-sunburst]")
						?.getAttribute("data-focus-id") ?? null;
				}}
			/>,
		);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sunburst-segment]").length).toBeGreaterThan(0);
		});
		const firstSegment = container.querySelector("[data-hex-sunburst-segment]") as SVGPathElement;
		act(() => {
			firstSegment.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(focusAtCallbackTime).toBe("root"); // pre-drill
		await waitFor(() => {
			const focusId = container.querySelector("[data-hex-sunburst]")?.getAttribute("data-focus-id");
			expect(focusId).not.toBe("root"); // post-drill
		});
	});

	it("declares role=img + non-empty title and desc for screen readers", async () => {
		const { container } = render(<Sunburst root={sample} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-sunburst]")).not.toBeNull();
		});
		const svg = container.querySelector("[data-hex-sunburst]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain(sample.label);
	});

	it("tags each rendered segment with its hierarchy depth", async () => {
		const { container } = render(<Sunburst root={sample} />);
		await waitFor(() => {
			expect(container.querySelectorAll("[data-hex-sunburst-segment]").length).toBe(4);
		});
		const depths = Array.from(container.querySelectorAll("[data-hex-sunburst-segment]")).map(
			(n) => n.getAttribute("data-depth"),
		);
		expect(depths).toContain("1");
		expect(depths).toContain("2");
	});
});
