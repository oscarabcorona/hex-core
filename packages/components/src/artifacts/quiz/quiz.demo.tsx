import { Quiz } from "@hex-core/components";

/** Quiz demo: single-answer planet question with one correct option. */
export function QuizDemo() {
	return (
		<Quiz
			question="Which planet is closest to the sun?"
			options={[
				{ id: "m", label: "Mercury", correct: true },
				{ id: "v", label: "Venus" },
				{ id: "e", label: "Earth" },
				{ id: "ma", label: "Mars" },
			]}
		/>
	);
}
