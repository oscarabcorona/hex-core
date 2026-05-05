import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flashcard } from "./flashcard.js";

describe("Flashcard", () => {
	it("renders both faces in the DOM (intentional for screen readers)", () => {
		const { container } = render(<Flashcard front="Q" back="A" />);
		expect(container.querySelector('[data-hex-flashcard-face][data-side="front"]')?.textContent).toBe("Q");
		expect(container.querySelector('[data-hex-flashcard-face][data-side="back"]')?.textContent).toBe("A");
	});

	it("starts unflipped by default", () => {
		const { container } = render(<Flashcard front="Q" back="A" />);
		expect(container.querySelector("[data-hex-flashcard]")).toHaveAttribute("data-flipped", "false");
	});

	it("honors defaultFlipped for the uncontrolled initial state", () => {
		const { container } = render(<Flashcard front="Q" back="A" defaultFlipped />);
		expect(container.querySelector("[data-hex-flashcard]")).toHaveAttribute("data-flipped", "true");
	});

	it("toggles flipped state on click in uncontrolled mode", () => {
		const { container } = render(<Flashcard front="Q" back="A" />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		fireEvent.click(card);
		expect(card).toHaveAttribute("data-flipped", "true");
		fireEvent.click(card);
		expect(card).toHaveAttribute("data-flipped", "false");
	});

	it("does not mutate internal state when controlled", () => {
		const { container, rerender } = render(<Flashcard front="Q" back="A" flipped={false} />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		fireEvent.click(card);
		// Still false because parent owns the state.
		expect(card).toHaveAttribute("data-flipped", "false");
		rerender(<Flashcard front="Q" back="A" flipped={true} />);
		expect(card).toHaveAttribute("data-flipped", "true");
	});

	it("calls onFlipChange with the next value", () => {
		const onFlipChange = vi.fn();
		const { container } = render(<Flashcard front="Q" back="A" onFlipChange={onFlipChange} />);
		fireEvent.click(container.querySelector("[data-hex-flashcard]") as HTMLDivElement);
		expect(onFlipChange).toHaveBeenCalledWith(true);
		fireEvent.click(container.querySelector("[data-hex-flashcard]") as HTMLDivElement);
		expect(onFlipChange).toHaveBeenCalledWith(false);
	});

	it("activates via Enter and Space keys", () => {
		const onFlipChange = vi.fn();
		const { container } = render(<Flashcard front="Q" back="A" onFlipChange={onFlipChange} />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		fireEvent.keyDown(card, { key: "Enter" });
		expect(onFlipChange).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(card, { key: " " });
		expect(onFlipChange).toHaveBeenCalledTimes(2);
	});

	it("calls preventDefault on Space so the page doesn't scroll", () => {
		const { container } = render(<Flashcard front="Q" back="A" />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
		card.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it("declares role=button and tabIndex=0 with an aria-label that reflects state", () => {
		const { container } = render(<Flashcard front="Q" back="A" />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		expect(card.getAttribute("role")).toBe("button");
		expect(card.getAttribute("tabindex")).toBe("0");
		expect(card.getAttribute("aria-pressed")).toBe("false");
		expect(card.getAttribute("aria-label")).toContain("front side");
		fireEvent.click(card);
		expect(card.getAttribute("aria-pressed")).toBe("true");
		expect(card.getAttribute("aria-label")).toContain("back side");
	});

	it("merges className onto the container", () => {
		const { container } = render(<Flashcard front="Q" back="A" className="custom-fc" />);
		expect(container.querySelector("[data-hex-flashcard]")?.getAttribute("class")).toContain("custom-fc");
	});

	it("respects width and height props as inline styles", () => {
		const { container } = render(<Flashcard front="Q" back="A" width={500} height={300} />);
		const card = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		expect(card.style.width).toBe("500px");
		expect(card.style.height).toBe("300px");
	});

	it("renders without crashing at zero dimensions (degenerate but defensive)", () => {
		const { container } = render(<Flashcard front="Q" back="A" width={0} height={0} />);
		expect(container.querySelector("[data-hex-flashcard]")).not.toBeNull();
	});

	it("applies the flipDurationMs prop to the inner transition-duration", () => {
		const { container } = render(<Flashcard front="Q" back="A" flipDurationMs={120} />);
		const inner = container.querySelector("[data-hex-flashcard-inner]") as HTMLDivElement;
		expect(inner.style.transitionDuration).toBe("120ms");
	});
});
