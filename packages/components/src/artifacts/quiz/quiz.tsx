"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Single-question multiple-choice quiz. Renders the question + options
 * as native radio (single-select) or checkbox (multi-select) inputs;
 * after Submit, each option flips to data-state="correct|incorrect|missed"
 * so consumers can theme right / wrong / unselected-but-correct
 * differently. Pure HTML; no heavy peer.
 *
 * Headless on grading: the schema honors what the consumer passes for
 * `correct`. Reset between runs by clearing the `selectedIds` you
 * forwarded as `value` (controlled) or unmounting (uncontrolled).
 *
 * @example
 * <Quiz
 *   question="Which planets are gas giants?"
 *   selectionMode="multi"
 *   options={[
 *     { id: "j", label: "Jupiter", correct: true },
 *     { id: "v", label: "Venus" },
 *     { id: "s", label: "Saturn", correct: true, explanation: "Saturn's atmosphere is mostly hydrogen and helium." },
 *     { id: "m", label: "Mercury" },
 *   ]}
 *   onAnswer={(ids, allCorrect) => track(ids, allCorrect)}
 * />
 */
export type QuizOption = {
	id: string;
	label: React.ReactNode;
	correct?: boolean;
	explanation?: React.ReactNode;
};

export interface QuizProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** Question prompt (any ReactNode — supports rich content). */
	question: React.ReactNode;
	/** Options the learner picks from. */
	options: QuizOption[];
	/** "single" — radio inputs (one selection). "multi" — checkboxes. Default "single". */
	selectionMode?: "single" | "multi";
	/** Custom Submit button label. Default "Submit". */
	submitLabel?: string;
	/** Fired with the selected option ids and a boolean indicating whether the entire selection matches the correct set. */
	onAnswer?: (selectedIds: string[], allCorrect: boolean) => void;
}

type CellState = "correct" | "incorrect" | "missed" | "unanswered";

function Quiz({
	question,
	options,
	selectionMode = "single",
	submitLabel = "Submit",
	onAnswer,
	className,
	...rest
}: QuizProps) {
	const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
	const [submitted, setSubmitted] = React.useState(false);
	const onAnswerRef = React.useRef(onAnswer);
	onAnswerRef.current = onAnswer;
	const groupName = React.useId();

	const correctIds = React.useMemo(
		() => new Set(options.filter((o) => o.correct).map((o) => o.id)),
		[options],
	);

	const allCorrect = React.useMemo(() => {
		if (selected.size !== correctIds.size) return false;
		for (const id of correctIds) if (!selected.has(id)) return false;
		return true;
	}, [selected, correctIds]);

	const stateFor = (option: QuizOption): CellState => {
		if (!submitted) return "unanswered";
		const picked = selected.has(option.id);
		const isCorrect = correctIds.has(option.id);
		if (picked && isCorrect) return "correct";
		if (picked && !isCorrect) return "incorrect";
		if (!picked && isCorrect) return "missed";
		return "unanswered";
	};

	const toggle = (id: string) => {
		// Submit is sticky: data-state always reflects the CURRENT selection
		// against the correct set, so re-picking after submit auto-updates
		// the correct/incorrect/missed indicators without clearing the
		// "I've tried this" affordance. Next Submit re-grades and re-fires
		// onAnswer with the updated selection.
		setSelected((prev) => {
			if (selectionMode === "single") return new Set([id]);
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleSubmit = () => {
		setSubmitted(true);
		onAnswerRef.current?.(Array.from(selected), allCorrect);
	};

	const canSubmit = selected.size > 0;
	const statusText = submitted
		? allCorrect
			? "Correct — well done."
			: "Some selections are incorrect or missed. Review the highlighted options."
		: "";

	return (
		<div
			{...rest}
			data-hex-quiz
			data-submitted={submitted}
			data-all-correct={submitted && allCorrect}
			className={cn("rounded-lg border bg-card p-4 text-card-foreground", className)}
		>
			<div data-hex-quiz-question className="mb-3 text-base font-medium">
				{question}
			</div>
			<div data-hex-quiz-options className="space-y-2" role={selectionMode === "single" ? "radiogroup" : "group"}>
				{options.map((option) => {
					const state = stateFor(option);
					const isPicked = selected.has(option.id);
					return (
						<div key={option.id}>
							<label
								data-hex-quiz-option
								data-state={state}
								data-picked={isPicked}
								className={cn(
									"flex cursor-pointer items-start gap-2 rounded-md border bg-background p-2 transition-all duration-[var(--duration-normal,200ms)] ease-out active:scale-[0.98]",
									"hover:bg-muted/50",
									state === "correct" && "border-primary bg-primary/10",
									state === "incorrect" && "border-destructive bg-destructive/10",
									state === "missed" && "border-primary/60 bg-primary/5 ring-1 ring-primary/40",
								)}
							>
								<input
									type={selectionMode === "single" ? "radio" : "checkbox"}
									name={selectionMode === "single" ? groupName : undefined}
									value={option.id}
									checked={isPicked}
									onChange={() => toggle(option.id)}
									className="mt-0.5"
								/>
								<div className="flex-1">
									<div data-hex-quiz-label>{option.label}</div>
									{submitted && option.explanation && (state === "correct" || state === "incorrect" || state === "missed") ? (
										<div data-hex-quiz-explanation className="mt-1 text-xs text-muted-foreground">
											{option.explanation}
										</div>
									) : null}
								</div>
							</label>
						</div>
					);
				})}
			</div>
			<div className="mt-3 flex items-center gap-3">
				<button
					type="button"
					data-hex-quiz-submit
					disabled={!canSubmit}
					onClick={handleSubmit}
					className={cn(
						"inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out active:scale-[0.98]",
						"hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					)}
				>
					{submitLabel}
				</button>
				<div data-hex-quiz-status role="status" aria-live="polite" className="text-sm text-muted-foreground">
					{statusText}
				</div>
			</div>
		</div>
	);
}

export { Quiz };
