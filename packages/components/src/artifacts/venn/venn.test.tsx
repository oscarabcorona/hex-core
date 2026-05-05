import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Venn, type VennSet } from "./venn.js";

const threeSets: VennSet[] = [
	{ id: "linux", label: "Linux" },
	{ id: "mac", label: "Mac" },
	{ id: "windows", label: "Windows" },
];

describe("Venn", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Venn sets={threeSets} />);
		expect(container.querySelector("[data-hex-venn]")).not.toBeNull();
	});

	it("renders one circle group per set for valid (2 or 3) inputs", () => {
		const { container } = render(<Venn sets={threeSets} />);
		expect(container.querySelectorAll("[data-hex-venn-set]").length).toBe(3);
	});

	it("supports a 2-set Venn", () => {
		const { container } = render(
			<Venn sets={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} />,
		);
		expect(container.querySelectorAll("[data-hex-venn-set]").length).toBe(2);
		expect(container.querySelector("[data-hex-venn]")).toHaveAttribute("data-set-count", "2");
	});

	it("renders a fallback message for unsupported set counts (>3)", () => {
		const fourSets: VennSet[] = [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
			{ id: "c", label: "C" },
			{ id: "d", label: "D" },
		];
		const { container } = render(<Venn sets={fourSets} />);
		expect(container.querySelectorAll("[data-hex-venn-set]").length).toBe(0);
		expect(container.querySelector("[data-hex-venn]")?.textContent).toContain("2–3 sets");
	});

	it("renders a fallback message for empty inputs", () => {
		const { container } = render(<Venn sets={[]} />);
		expect(container.querySelectorAll("[data-hex-venn-set]").length).toBe(0);
		expect(container.querySelector("[data-hex-venn]")?.textContent).toContain("No sets");
	});

	it("calls onSetClick with the clicked set", () => {
		const onSetClick = vi.fn();
		const { container } = render(<Venn sets={threeSets} onSetClick={onSetClick} />);
		const firstSet = container.querySelector("[data-hex-venn-set]") as SVGGElement;
		firstSet.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onSetClick).toHaveBeenCalledTimes(1);
		expect(onSetClick.mock.calls[0][0].id).toBe("linux");
	});

	it("activates onSetClick via keyboard (Enter and Space)", () => {
		const onSetClick = vi.fn();
		const { container } = render(<Venn sets={threeSets} onSetClick={onSetClick} />);
		const firstSet = container.querySelector("[data-hex-venn-set]") as SVGGElement;
		expect(firstSet.getAttribute("role")).toBe("button");
		expect(firstSet.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstSet, { key: "Enter" });
		expect(onSetClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstSet, { key: " " });
		expect(onSetClick).toHaveBeenCalledTimes(2);
	});

	it("renders labels with values when provided", () => {
		const { container } = render(
			<Venn sets={[{ id: "p", label: "Paid", value: 1200 }, { id: "a", label: "Active", value: 480 }]} />,
		);
		const labels = Array.from(container.querySelectorAll("[data-hex-venn-label]")).map(
			(t) => t.textContent,
		);
		expect(labels).toContain("Paid (1200)");
		expect(labels).toContain("Active (480)");
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Venn sets={threeSets} />);
		const svg = container.querySelector("[data-hex-venn]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("Linux");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<Venn sets={threeSets} className="custom-vn" />);
		expect(container.querySelector("[data-hex-venn]")?.getAttribute("class")).toContain("custom-vn");
	});
});
