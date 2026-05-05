import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Quiz, type QuizOption } from "./quiz.js";

const single: QuizOption[] = [
	{ id: "m", label: "Mercury", correct: true },
	{ id: "v", label: "Venus" },
	{ id: "e", label: "Earth" },
];

const multi: QuizOption[] = [
	{ id: "j", label: "Jupiter", correct: true },
	{ id: "v", label: "Venus" },
	{
		id: "s",
		label: "Saturn",
		correct: true,
		explanation: "Saturn's atmosphere is mostly H/He.",
	},
];

describe("Quiz", () => {
	it("renders the question and one option per entry", () => {
		const { container } = render(<Quiz question="Which planet is closest to the sun?" options={single} />);
		expect(container.querySelector("[data-hex-quiz-question]")?.textContent).toBe(
			"Which planet is closest to the sun?",
		);
		expect(container.querySelectorAll("[data-hex-quiz-option]").length).toBe(3);
	});

	it("uses radio inputs in single mode and checkbox inputs in multi mode", () => {
		const { container, rerender } = render(<Quiz question="Q" options={single} />);
		expect(container.querySelectorAll("input[type=radio]").length).toBe(3);
		rerender(<Quiz question="Q" options={multi} selectionMode="multi" />);
		expect(container.querySelectorAll("input[type=checkbox]").length).toBe(3);
	});

	it("disables Submit until at least one option is selected", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const submit = container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement;
		expect(submit.disabled).toBe(true);
		const firstInput = container.querySelector("input") as HTMLInputElement;
		fireEvent.click(firstInput);
		expect(submit.disabled).toBe(false);
	});

	it("marks the picked correct option as data-state=correct after submit", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[0]); // pick Mercury (correct)
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		expect(
			container.querySelector('[data-hex-quiz-option][data-picked="true"]')?.getAttribute("data-state"),
		).toBe("correct");
	});

	it("marks an unpicked correct option as data-state=missed in multi mode", () => {
		const { container } = render(<Quiz question="Q" options={multi} selectionMode="multi" />);
		// Pick only Jupiter (correct), miss Saturn (also correct).
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[0]); // Jupiter
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		const states = Array.from(container.querySelectorAll("[data-hex-quiz-option]")).map(
			(o) => o.getAttribute("data-state"),
		);
		expect(states).toContain("correct"); // Jupiter
		expect(states).toContain("missed"); // Saturn
	});

	it("marks a picked wrong option as data-state=incorrect", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[1]); // Venus (incorrect)
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		const incorrectStates = Array.from(container.querySelectorAll("[data-hex-quiz-option]")).map(
			(o) => o.getAttribute("data-state"),
		);
		expect(incorrectStates).toContain("incorrect");
		expect(incorrectStates).toContain("missed"); // Mercury was correct, unpicked
	});

	it("calls onAnswer with selected ids and allCorrect", () => {
		const onAnswer = vi.fn();
		const { container } = render(<Quiz question="Q" options={single} onAnswer={onAnswer} />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[0]); // Mercury
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		expect(onAnswer).toHaveBeenCalledWith(["m"], true);
	});

	it("reports allCorrect=false when picks are missing in multi mode", () => {
		const onAnswer = vi.fn();
		const { container } = render(
			<Quiz question="Q" options={multi} selectionMode="multi" onAnswer={onAnswer} />,
		);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[0]); // Jupiter (correct)
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		expect(onAnswer).toHaveBeenCalledWith(["j"], false);
	});

	it("reveals explanations only for correct/incorrect/missed cells after submit", () => {
		const { container } = render(<Quiz question="Q" options={multi} selectionMode="multi" />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[2]); // Saturn (correct, has explanation)
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		expect(
			container.querySelector("[data-hex-quiz-explanation]")?.textContent,
		).toContain("H/He");
	});

	it("keeps submitted=true when the user re-picks after submit (data-state recomputes from current selection)", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[1]); // Venus (incorrect)
		fireEvent.click(container.querySelector("[data-hex-quiz-submit]") as HTMLButtonElement);
		expect(container.querySelector("[data-hex-quiz]")).toHaveAttribute("data-submitted", "true");
		// Re-pick to the correct option without re-submitting
		fireEvent.click(inputs[0]); // Mercury (correct)
		expect(container.querySelector("[data-hex-quiz]")).toHaveAttribute("data-submitted", "true");
		// data-state on the now-picked Mercury reflects "correct" because submitted=true persists
		const mercuryOption = container.querySelector('[data-hex-quiz-option][data-picked="true"]');
		expect(mercuryOption?.getAttribute("data-state")).toBe("correct");
	});

	it("annotates the status region with role=status for screen readers", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const status = container.querySelector("[data-hex-quiz-status]");
		expect(status?.getAttribute("role")).toBe("status");
		expect(status?.getAttribute("aria-live")).toBe("polite");
	});

	it("merges className onto the outer container", () => {
		const { container } = render(<Quiz question="Q" options={single} className="custom-qz" />);
		expect(container.querySelector("[data-hex-quiz]")?.getAttribute("class")).toContain("custom-qz");
	});

	it("replaces the previous selection in single mode (radio constraint)", () => {
		const { container } = render(<Quiz question="Q" options={single} />);
		const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
		fireEvent.click(inputs[0]);
		expect(inputs[0].checked).toBe(true);
		fireEvent.click(inputs[2]);
		expect(inputs[0].checked).toBe(false);
		expect(inputs[2].checked).toBe(true);
	});
});
