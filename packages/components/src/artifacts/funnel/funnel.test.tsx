import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Funnel, type FunnelStage } from "./funnel.js";

const sample: FunnelStage[] = [
	{ id: "visit", label: "Visited", value: 10000 },
	{ id: "signup", label: "Signed up", value: 1200 },
	{ id: "active", label: "Active", value: 480 },
	{ id: "paid", label: "Paid", value: 95 },
];

describe("Funnel", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Funnel stages={sample} />);
		expect(container.querySelector("[data-hex-funnel]")).not.toBeNull();
	});

	it("renders one stage group per stage", () => {
		const { container } = render(<Funnel stages={sample} />);
		expect(container.querySelectorAll("[data-hex-funnel-stage]").length).toBe(4);
	});

	it("tags each stage with its depth", () => {
		const { container } = render(<Funnel stages={sample} />);
		const depths = Array.from(container.querySelectorAll("[data-hex-funnel-stage]")).map(
			(s) => s.getAttribute("data-depth"),
		);
		expect(depths).toEqual(["0", "1", "2", "3"]);
	});

	it("renders conversion percentages between stages by default", () => {
		const { container } = render(<Funnel stages={sample} />);
		const conversions = container.querySelectorAll("[data-hex-funnel-conversion]");
		// 3 stage-to-stage conversions for 4 stages (no conversion shown for the first stage)
		expect(conversions.length).toBe(3);
	});

	it("hides conversions when showConversion is false", () => {
		const { container } = render(<Funnel stages={sample} showConversion={false} />);
		expect(container.querySelectorAll("[data-hex-funnel-conversion]").length).toBe(0);
	});

	it("calls onStageClick with the clicked stage", () => {
		const onStageClick = vi.fn();
		const { container } = render(<Funnel stages={sample} onStageClick={onStageClick} />);
		const firstStage = container.querySelector("[data-hex-funnel-stage]") as SVGGElement;
		firstStage.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onStageClick).toHaveBeenCalledTimes(1);
		expect(onStageClick.mock.calls[0][0].id).toBe("visit");
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Funnel stages={sample} />);
		const svg = container.querySelector("[data-hex-funnel]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("4 stage");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<Funnel stages={sample} className="custom-fn" />);
		expect(container.querySelector("[data-hex-funnel]")?.getAttribute("class")).toContain("custom-fn");
	});

	it("renders nothing for an empty stages array", () => {
		const { container } = render(<Funnel stages={[]} />);
		expect(container.querySelectorAll("[data-hex-funnel-stage]").length).toBe(0);
	});

	it("renders a single-stage funnel without crashing or showing a conversion", () => {
		const { container } = render(<Funnel stages={[{ id: "only", label: "Only", value: 100 }]} />);
		expect(container.querySelectorAll("[data-hex-funnel-stage]").length).toBe(1);
		expect(container.querySelectorAll("[data-hex-funnel-conversion]").length).toBe(0);
	});

	it("activates onStageClick via keyboard (Enter and Space)", () => {
		const onStageClick = vi.fn();
		const { container } = render(<Funnel stages={sample} onStageClick={onStageClick} />);
		const firstStage = container.querySelector("[data-hex-funnel-stage]") as SVGGElement;
		expect(firstStage.getAttribute("role")).toBe("button");
		expect(firstStage.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstStage, { key: "Enter" });
		expect(onStageClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstStage, { key: " " });
		expect(onStageClick).toHaveBeenCalledTimes(2);
	});
});
