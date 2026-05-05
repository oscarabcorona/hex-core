import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageOcclusion, type OcclusionRegion } from "./image-occlusion.js";

const sample: OcclusionRegion[] = [
	{ id: "lv", x: 0.42, y: 0.55, width: 0.18, height: 0.22, label: "Left ventricle" },
	{ id: "ra", x: 0.58, y: 0.2, width: 0.16, height: 0.18, label: "Right atrium" },
];

describe("ImageOcclusion", () => {
	it("renders the underlying <img> with alt text", () => {
		const { container } = render(
			<ImageOcclusion src="/heart.png" alt="Heart cross-section" regions={sample} />,
		);
		const img = container.querySelector("[data-hex-image-occlusion-img]") as HTMLImageElement;
		expect(img.getAttribute("src")).toBe("/heart.png");
		expect(img.getAttribute("alt")).toBe("Heart cross-section");
	});

	it("renders one button per region", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		expect(container.querySelectorAll("[data-hex-image-occlusion-region]").length).toBe(2);
	});

	it("positions each region using percentage coords from the fractional input", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		const first = container.querySelector('[data-region-id="lv"]') as HTMLButtonElement;
		// Float-arithmetic produces values like "55.00000000000001%" for 0.55*100.
		// Asserting a numeric prefix rather than exact-string compares is robust.
		expect(parseFloat(first.style.left)).toBeCloseTo(42, 6);
		expect(parseFloat(first.style.top)).toBeCloseTo(55, 6);
		expect(parseFloat(first.style.width)).toBeCloseTo(18, 6);
		expect(parseFloat(first.style.height)).toBeCloseTo(22, 6);
	});

	it("starts with all regions unrevealed", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		const regions = container.querySelectorAll("[data-hex-image-occlusion-region]");
		regions.forEach((r) => expect(r.getAttribute("data-revealed")).toBe("false"));
	});

	it("toggles a region's revealed state on click", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		const region = container.querySelector('[data-region-id="lv"]') as HTMLButtonElement;
		fireEvent.click(region);
		expect(region.getAttribute("data-revealed")).toBe("true");
		expect(region.getAttribute("aria-pressed")).toBe("true");
		fireEvent.click(region);
		expect(region.getAttribute("data-revealed")).toBe("false");
	});

	it("calls onRegionReveal with the id only when a region is revealed (not on hide)", () => {
		const onRegionReveal = vi.fn();
		const { container } = render(
			<ImageOcclusion
				src="/x.png"
				alt="x"
				regions={sample}
				onRegionReveal={onRegionReveal}
			/>,
		);
		const region = container.querySelector('[data-region-id="lv"]') as HTMLButtonElement;
		fireEvent.click(region); // reveal
		expect(onRegionReveal).toHaveBeenCalledWith("lv");
		fireEvent.click(region); // hide
		expect(onRegionReveal).toHaveBeenCalledTimes(1); // not called again on hide
	});

	it("includes the region label in aria-label when provided", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		const region = container.querySelector('[data-region-id="lv"]') as HTMLButtonElement;
		expect(region.getAttribute("aria-label")).toContain("Left ventricle");
		expect(region.getAttribute("aria-label")).toContain("Region 1 of 2");
	});

	it("works without a label by omitting the label segment from aria-label", () => {
		const noLabel: OcclusionRegion[] = [{ id: "x", x: 0.1, y: 0.1, width: 0.2, height: 0.2 }];
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={noLabel} />);
		const region = container.querySelector("[data-hex-image-occlusion-region]") as HTMLButtonElement;
		expect(region.getAttribute("aria-label")).toContain("Region 1 of 1");
		expect(region.getAttribute("aria-label")).not.toContain(":");
	});

	it("warns once in development when region coords escape [0, 1]", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const bad: OcclusionRegion[] = [
			{ id: "px-coords", x: 168, y: 220, width: 80, height: 90 }, // pixel-style — wrong
		];
		render(<ImageOcclusion src="/x.png" alt="x" regions={bad} />);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("ImageOcclusion");
		warn.mockRestore();
	});

	it("renders nothing in the overlay for an empty regions array", () => {
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={[]} />);
		expect(container.querySelectorAll("[data-hex-image-occlusion-region]").length).toBe(0);
	});

	it("merges className onto the outer container", () => {
		const { container } = render(
			<ImageOcclusion src="/x.png" alt="x" regions={sample} className="custom-io" />,
		);
		expect(
			container.querySelector("[data-hex-image-occlusion]")?.getAttribute("class"),
		).toContain("custom-io");
	});

	it("does not mark the overlay container as aria-hidden — it houses focusable region buttons", () => {
		// Regression: previously the overlay was `aria-hidden="true"` AND held
		// focusable <button> children, which trips axe's `aria-hidden-focus`
		// rule and silently strips the buttons' labels from assistive tech.
		// The buttons carry their own aria-label + aria-pressed; the overlay
		// must NOT be aria-hidden.
		const { container } = render(<ImageOcclusion src="/x.png" alt="x" regions={sample} />);
		expect(
			container.querySelector("[data-hex-image-occlusion-overlay]")?.getAttribute("aria-hidden"),
		).toBeNull();
	});
});
