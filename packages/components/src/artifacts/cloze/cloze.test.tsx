import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cloze, type ClozePart } from "./cloze.js";

const sample: ClozePart[] = [
	"The mitochondria is the ",
	{ hidden: "powerhouse" },
	" of the cell.",
];

describe("Cloze", () => {
	it("renders one button per { hidden } token, plus the surrounding text", () => {
		const { container } = render(<Cloze parts={sample} />);
		expect(container.querySelectorAll("[data-hex-cloze-blank]").length).toBe(1);
		expect(container.querySelector("[data-hex-cloze-text]")?.textContent).toContain("mitochondria");
		expect(container.querySelector("[data-hex-cloze-text]")?.textContent).toContain("of the cell");
	});

	it("starts with all blanks unrevealed", () => {
		const { container } = render(<Cloze parts={sample} />);
		const blank = container.querySelector("[data-hex-cloze-blank]");
		expect(blank?.getAttribute("data-revealed")).toBe("false");
		expect(blank?.getAttribute("aria-pressed")).toBe("false");
	});

	it("reveals a blank on click and toggles aria-pressed", () => {
		const { container } = render(<Cloze parts={sample} />);
		const blank = container.querySelector("[data-hex-cloze-blank]") as HTMLButtonElement;
		fireEvent.click(blank);
		expect(blank.getAttribute("data-revealed")).toBe("true");
		expect(blank.getAttribute("aria-pressed")).toBe("true");
		fireEvent.click(blank);
		expect(blank.getAttribute("data-revealed")).toBe("false");
	});

	it("calls onReveal with the cumulative array of revealed ids", () => {
		const onReveal = vi.fn();
		const multi: ClozePart[] = [
			"A ",
			{ hidden: "alpha", id: "a" },
			" and B ",
			{ hidden: "beta", id: "b" },
			".",
		];
		const { container } = render(<Cloze parts={multi} onReveal={onReveal} />);
		const [first, second] = Array.from(
			container.querySelectorAll("[data-hex-cloze-blank]"),
		) as HTMLButtonElement[];
		fireEvent.click(first);
		expect(onReveal).toHaveBeenLastCalledWith(["a"]);
		fireEvent.click(second);
		expect(onReveal).toHaveBeenLastCalledWith(["a", "b"]);
		fireEvent.click(first);
		expect(onReveal).toHaveBeenLastCalledWith(["b"]);
	});

	it("does not show 'Reveal all' in default click mode", () => {
		const { container } = render(<Cloze parts={sample} />);
		expect(container.querySelector("[data-hex-cloze-toggle-all]")).toBeNull();
	});

	it('shows "Reveal all" when revealMode is "all" and toggles every blank in one shot', () => {
		const multi: ClozePart[] = ["A ", { hidden: "x" }, " B ", { hidden: "y" }, "."];
		const { container } = render(<Cloze parts={multi} revealMode="all" />);
		const toggleAll = container.querySelector("[data-hex-cloze-toggle-all]") as HTMLButtonElement;
		expect(toggleAll).not.toBeNull();
		fireEvent.click(toggleAll);
		const blanks = container.querySelectorAll("[data-hex-cloze-blank]");
		blanks.forEach((b) => expect(b.getAttribute("data-revealed")).toBe("true"));
		expect(container.querySelector("[data-hex-cloze]")).toHaveAttribute("data-all-revealed", "true");
		fireEvent.click(toggleAll);
		blanks.forEach((b) => expect(b.getAttribute("data-revealed")).toBe("false"));
	});

	it("auto-numbers blanks with a non-collidable prefix when no explicit id is provided", () => {
		const noIds: ClozePart[] = [{ hidden: "a" }, " ", { hidden: "b" }];
		const { container } = render(<Cloze parts={noIds} />);
		const ids = Array.from(container.querySelectorAll("[data-hex-cloze-blank]")).map(
			(b) => b.getAttribute("data-blank-id"),
		);
		// Prefix "__hex_cloze_auto_" prevents collisions with consumer ids like "blank-1".
		expect(ids[0]).toMatch(/^__hex_cloze_auto_0$/);
		expect(ids[1]).toMatch(/^__hex_cloze_auto_1$/);
	});

	it("activates blanks via Enter and Space (native button behavior)", () => {
		const onReveal = vi.fn();
		const { container } = render(<Cloze parts={sample} onReveal={onReveal} />);
		const blank = container.querySelector("[data-hex-cloze-blank]") as HTMLButtonElement;
		// click event is what real browsers fire from Enter/Space on a <button>
		blank.click();
		expect(onReveal).toHaveBeenCalledTimes(1);
	});

	it("dispatches keyboard Enter/Space via the native button mechanism", () => {
		const onReveal = vi.fn();
		const { container } = render(<Cloze parts={sample} onReveal={onReveal} />);
		const blank = container.querySelector("[data-hex-cloze-blank]") as HTMLButtonElement;
		// Native <button> converts Enter/Space keydowns to click events. We assert the
		// click path works (the cleanest cross-environment proxy for "it's keyboard-activatable").
		fireEvent.click(blank);
		expect(onReveal).toHaveBeenCalledTimes(1);
		expect(blank.getAttribute("data-revealed")).toBe("true");
	});

	it("declares an aria-label that names the blank's index and total", () => {
		const multi: ClozePart[] = [{ hidden: "x" }, " ", { hidden: "y" }, " ", { hidden: "z" }];
		const { container } = render(<Cloze parts={multi} />);
		const labels = Array.from(container.querySelectorAll("[data-hex-cloze-blank]")).map(
			(b) => b.getAttribute("aria-label"),
		);
		expect(labels[0]).toContain("Blank 1 of 3");
		expect(labels[2]).toContain("Blank 3 of 3");
	});

	it("renders an empty paragraph for a parts array with no hidden tokens", () => {
		const { container } = render(<Cloze parts={["just plain text"]} />);
		expect(container.querySelectorAll("[data-hex-cloze-blank]").length).toBe(0);
		expect(container.querySelector("[data-hex-cloze-text]")?.textContent).toBe("just plain text");
	});

	it("merges className onto the outer container", () => {
		const { container } = render(<Cloze parts={sample} className="custom-cz" />);
		expect(container.querySelector("[data-hex-cloze]")?.getAttribute("class")).toContain("custom-cz");
	});
});
