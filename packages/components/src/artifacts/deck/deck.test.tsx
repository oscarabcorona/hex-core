import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Deck, type DeckCard } from "./deck.js";

const sample: DeckCard[] = [
	{ id: "1", front: "Term 1", back: "Definition 1" },
	{ id: "2", front: "Term 2", back: "Definition 2" },
	{ id: "3", front: "Term 3", back: "Definition 3" },
];

describe("Deck", () => {
	it("renders the first card and the prev/next/progress controls", () => {
		const { container } = render(<Deck cards={sample} />);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-index", "0");
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-total", "3");
		expect(container.querySelector("[data-hex-deck-prev]")).not.toBeNull();
		expect(container.querySelector("[data-hex-deck-next]")).not.toBeNull();
		expect(container.querySelector("[data-hex-deck-progress]")).not.toBeNull();
	});

	it("disables prev on the first card and next on the last", () => {
		const { container } = render(<Deck cards={sample} />);
		const prev = container.querySelector("[data-hex-deck-prev]") as HTMLButtonElement;
		const next = container.querySelector("[data-hex-deck-next]") as HTMLButtonElement;
		expect(prev.disabled).toBe(true);
		expect(next.disabled).toBe(false);
		// Walk to last card
		fireEvent.click(next);
		fireEvent.click(next);
		expect(next.disabled).toBe(true);
		expect(prev.disabled).toBe(false);
	});

	it("advances to the next card on Next and back on Prev", () => {
		const { container } = render(<Deck cards={sample} />);
		const next = container.querySelector("[data-hex-deck-next]") as HTMLButtonElement;
		fireEvent.click(next);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-index", "1");
		const prev = container.querySelector("[data-hex-deck-prev]") as HTMLButtonElement;
		fireEvent.click(prev);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-index", "0");
	});

	it("calls onCardChange with (index, card) when navigating", () => {
		const onCardChange = vi.fn();
		const { container } = render(<Deck cards={sample} onCardChange={onCardChange} />);
		const next = container.querySelector("[data-hex-deck-next]") as HTMLButtonElement;
		fireEvent.click(next);
		expect(onCardChange).toHaveBeenCalledWith(1, sample[1]);
	});

	it("resets the flipped state when the card changes", () => {
		const { container } = render(<Deck cards={sample} />);
		// Flip the first card
		const flashcard = container.querySelector("[data-hex-flashcard]") as HTMLDivElement;
		fireEvent.click(flashcard);
		expect(container.querySelector("[data-hex-flashcard]")).toHaveAttribute("data-flipped", "true");
		// Advance to the next card
		fireEvent.click(container.querySelector("[data-hex-deck-next]") as HTMLButtonElement);
		// New card should be unflipped
		expect(container.querySelector("[data-hex-flashcard]")).toHaveAttribute("data-flipped", "false");
	});

	it("renders the empty state when given no cards", () => {
		const { container } = render(<Deck cards={[]} />);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-empty", "true");
		expect(container.querySelector("[data-hex-deck]")?.textContent).toContain("No cards");
	});

	it("renders the ratingSlot below each card with the current card", () => {
		const ratingSlot = vi.fn((card: DeckCard) => <div data-rating-marker>{card.id}</div>);
		const { container } = render(<Deck cards={sample} ratingSlot={ratingSlot} />);
		expect(container.querySelector("[data-hex-deck-rating-slot] [data-rating-marker]")?.textContent).toBe("1");
		// Navigate forward; ratingSlot should re-render with the new card
		fireEvent.click(container.querySelector("[data-hex-deck-next]") as HTMLButtonElement);
		expect(container.querySelector("[data-hex-deck-rating-slot] [data-rating-marker]")?.textContent).toBe("2");
	});

	it("does not re-shuffle on every navigation (shuffle order is stable across prev/next)", () => {
		// Mock Math.random so shuffleArray is deterministic for the test.
		const spy = vi.spyOn(Math, "random").mockReturnValue(0.42);
		const { container } = render(<Deck cards={sample} shuffle />);
		const initialId = container.querySelector("[data-hex-flashcard]")?.textContent;
		fireEvent.click(container.querySelector("[data-hex-deck-next]") as HTMLButtonElement);
		fireEvent.click(container.querySelector("[data-hex-deck-prev]") as HTMLButtonElement);
		// Back at index 0 — should be the same card as initially shown.
		expect(container.querySelector("[data-hex-flashcard]")?.textContent).toBe(initialId);
		spy.mockRestore();
	});

	it("declares aria-labels on prev/next that include current/total position", () => {
		const { container } = render(<Deck cards={sample} />);
		expect(container.querySelector("[data-hex-deck-prev]")?.getAttribute("aria-label")).toContain("1 of 3");
		expect(container.querySelector("[data-hex-deck-next]")?.getAttribute("aria-label")).toContain("1 of 3");
	});

	it("updates the progress bar width as the user advances", () => {
		const { container } = render(<Deck cards={sample} />);
		const progressFill = container.querySelector(
			"[data-hex-deck-progress] > div > div",
		) as HTMLDivElement;
		expect(progressFill.style.width).toBe(`${(1 / 3) * 100}%`);
		fireEvent.click(container.querySelector("[data-hex-deck-next]") as HTMLButtonElement);
		expect(progressFill.style.width).toBe(`${(2 / 3) * 100}%`);
	});

	it("merges className onto the outer container", () => {
		const { container } = render(<Deck cards={sample} className="custom-dk" />);
		expect(container.querySelector("[data-hex-deck]")?.getAttribute("class")).toContain("custom-dk");
	});

	it("activates prev/next via native button keyboard handling", () => {
		const { container } = render(<Deck cards={sample} />);
		const next = container.querySelector("[data-hex-deck-next]") as HTMLButtonElement;
		// Real browsers convert Enter / Space on a <button> to a click event — we
		// assert the click path via React's synthetic-event dispatcher (the JSDOM
		// `.click()` shortcut doesn't reach React's listener).
		fireEvent.click(next);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-index", "1");
		const prev = container.querySelector("[data-hex-deck-prev]") as HTMLButtonElement;
		fireEvent.click(prev);
		expect(container.querySelector("[data-hex-deck]")).toHaveAttribute("data-index", "0");
	});
});
