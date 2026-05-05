import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpacedRepetition, type SrsRating } from "./spaced-repetition.js";

describe("SpacedRepetition", () => {
	it("renders one button per rating in the canonical order", () => {
		const onRate = vi.fn();
		const { container } = render(<SpacedRepetition cardId="c1" onRate={onRate} />);
		const ratings = Array.from(container.querySelectorAll("[data-hex-spaced-repetition-button]")).map(
			(b) => b.getAttribute("data-rating"),
		);
		expect(ratings).toEqual(["again", "hard", "good", "easy"]);
	});

	it("calls onRate with the rating and cardId on click", () => {
		const onRate = vi.fn();
		const { container } = render(<SpacedRepetition cardId="c1" onRate={onRate} />);
		const easy = container.querySelector('[data-rating="easy"]') as HTMLButtonElement;
		fireEvent.click(easy);
		expect(onRate).toHaveBeenCalledWith("easy", "c1");
	});

	it("passes the cardId through unchanged for every rating", () => {
		const onRate = vi.fn();
		const { container } = render(<SpacedRepetition cardId="card-42" onRate={onRate} />);
		(["again", "hard", "good", "easy"] as SrsRating[]).forEach((rating) => {
			const btn = container.querySelector(`[data-rating="${rating}"]`) as HTMLButtonElement;
			fireEvent.click(btn);
		});
		expect(onRate.mock.calls.map((c) => c[1])).toEqual(["card-42", "card-42", "card-42", "card-42"]);
	});

	it("uses default labels when none are provided", () => {
		const { container } = render(<SpacedRepetition cardId="c1" onRate={vi.fn()} />);
		const labels = Array.from(container.querySelectorAll("[data-hex-spaced-repetition-button]")).map(
			(b) => b.textContent,
		);
		expect(labels).toEqual(["Again", "Hard", "Good", "Easy"]);
	});

	it("honors custom labels via the labels prop and falls back per-rating", () => {
		const { container } = render(
			<SpacedRepetition
				cardId="c1"
				onRate={vi.fn()}
				labels={{ again: "Forgot", easy: "Trivial" }}
			/>,
		);
		const labels = Array.from(container.querySelectorAll("[data-hex-spaced-repetition-button]")).map(
			(b) => b.textContent,
		);
		expect(labels).toEqual(["Forgot", "Hard", "Good", "Trivial"]);
	});

	it("declares role=group with aria-label on the container", () => {
		const { container } = render(<SpacedRepetition cardId="c1" onRate={vi.fn()} />);
		const group = container.querySelector("[data-hex-spaced-repetition]");
		expect(group?.getAttribute("role")).toBe("group");
		expect(group?.getAttribute("aria-label")).toBe("Confidence rating");
	});

	it("includes the rating hint in each button's aria-label", () => {
		const { container } = render(<SpacedRepetition cardId="c1" onRate={vi.fn()} />);
		const again = container.querySelector('[data-rating="again"]') as HTMLButtonElement;
		expect(again.getAttribute("aria-label")).toContain("show this card again soon");
		const easy = container.querySelector('[data-rating="easy"]') as HTMLButtonElement;
		expect(easy.getAttribute("aria-label")).toContain("push the next review further out");
	});

	it("sets data-card-id on the container for tooling introspection", () => {
		const { container } = render(<SpacedRepetition cardId="c1" onRate={vi.fn()} />);
		expect(container.querySelector("[data-hex-spaced-repetition]")).toHaveAttribute("data-card-id", "c1");
	});

	it("supports keyboard activation via native button (Enter triggers click)", () => {
		const onRate = vi.fn();
		const { container } = render(<SpacedRepetition cardId="c1" onRate={onRate} />);
		const good = container.querySelector('[data-rating="good"]') as HTMLButtonElement;
		good.click();
		expect(onRate).toHaveBeenCalledWith("good", "c1");
	});

	it("uses the latest onRate ref so consumers can swap handlers without remounting", () => {
		const first = vi.fn();
		const second = vi.fn();
		const { container, rerender } = render(<SpacedRepetition cardId="c1" onRate={first} />);
		rerender(<SpacedRepetition cardId="c1" onRate={second} />);
		fireEvent.click(container.querySelector('[data-rating="good"]') as HTMLButtonElement);
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledWith("good", "c1");
	});

	it("merges className onto the outer container", () => {
		const { container } = render(
			<SpacedRepetition cardId="c1" onRate={vi.fn()} className="custom-srs" />,
		);
		expect(container.querySelector("[data-hex-spaced-repetition]")?.getAttribute("class")).toContain(
			"custom-srs",
		);
	});
});
