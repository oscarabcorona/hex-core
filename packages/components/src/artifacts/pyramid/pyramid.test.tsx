import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pyramid, type PyramidTier } from "./pyramid.js";

const sample: PyramidTier[] = [
	{ id: "self-actualization", label: "Self-actualization" },
	{ id: "esteem", label: "Esteem" },
	{ id: "love", label: "Love & belonging" },
	{ id: "safety", label: "Safety" },
	{ id: "physiological", label: "Physiological" },
];

describe("Pyramid", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Pyramid tiers={sample} />);
		expect(container.querySelector("[data-hex-pyramid]")).not.toBeNull();
	});

	it("renders one tier group per tier", () => {
		const { container } = render(<Pyramid tiers={sample} />);
		expect(container.querySelectorAll("[data-hex-pyramid-tier]").length).toBe(5);
	});

	it("forwards the shape attribute", () => {
		const { container } = render(<Pyramid tiers={sample} shape="narrowing" />);
		expect(container.querySelector("[data-hex-pyramid]")).toHaveAttribute("data-shape", "narrowing");
	});

	it("tags each tier with its depth", () => {
		const { container } = render(<Pyramid tiers={sample} />);
		const depths = Array.from(container.querySelectorAll("[data-hex-pyramid-tier]")).map(
			(t) => t.getAttribute("data-depth"),
		);
		expect(depths).toEqual(["0", "1", "2", "3", "4"]);
	});

	it("calls onTierClick with the clicked tier", () => {
		const onTierClick = vi.fn();
		const { container } = render(<Pyramid tiers={sample} onTierClick={onTierClick} />);
		const firstTier = container.querySelector("[data-hex-pyramid-tier]") as SVGGElement;
		firstTier.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onTierClick).toHaveBeenCalledTimes(1);
		expect(onTierClick.mock.calls[0][0].id).toBe("self-actualization");
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Pyramid tiers={sample} />);
		const svg = container.querySelector("[data-hex-pyramid]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("5 tier");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<Pyramid tiers={sample} className="custom-py" />);
		expect(container.querySelector("[data-hex-pyramid]")?.getAttribute("class")).toContain("custom-py");
	});

	it("renders nothing for an empty tiers array", () => {
		const { container } = render(<Pyramid tiers={[]} />);
		expect(container.querySelectorAll("[data-hex-pyramid-tier]").length).toBe(0);
	});

	it("renders a single-tier pyramid without crashing", () => {
		const { container } = render(<Pyramid tiers={[{ id: "only", label: "Only" }]} />);
		expect(container.querySelectorAll("[data-hex-pyramid-tier]").length).toBe(1);
	});

	it("activates onTierClick via keyboard (Enter and Space)", () => {
		const onTierClick = vi.fn();
		const { container } = render(<Pyramid tiers={sample} onTierClick={onTierClick} />);
		const firstTier = container.querySelector("[data-hex-pyramid-tier]") as SVGGElement;
		expect(firstTier.getAttribute("role")).toBe("button");
		expect(firstTier.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstTier, { key: "Enter" });
		expect(onTierClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstTier, { key: " " });
		expect(onTierClick).toHaveBeenCalledTimes(2);
	});

	it("warns once in development when given more than 7 tiers", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const tooMany: PyramidTier[] = Array.from({ length: 9 }, (_, i) => ({
			id: `t${i}`,
			label: `Tier ${i}`,
		}));
		render(<Pyramid tiers={tooMany} />);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("Pyramid");
		warn.mockRestore();
	});
});
