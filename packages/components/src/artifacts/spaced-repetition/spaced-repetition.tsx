"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Anki-style confidence rating row. Four buttons (Again / Hard / Good /
 * Easy) emit a rating; the consumer applies SM-2 / FSRS / hand-rolled
 * scheduling to decide when to surface the card again. Headless on
 * scheduling — this primitive doesn't compute intervals, it just
 * captures the user's signal.
 *
 * @example
 * <SpacedRepetition
 *   cardId={card.id}
 *   onRate={(rating, id) => scheduler.update(id, rating)}
 * />
 *
 * <SpacedRepetition
 *   cardId={card.id}
 *   onRate={onRate}
 *   labels={{ again: "Forgot", hard: "Tough", good: "Got it", easy: "Easy" }}
 * />
 */
export type SrsRating = "again" | "hard" | "good" | "easy";

export interface SpacedRepetitionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onRate"> {
	/** Identifier of the card being rated; passed back to onRate. */
	cardId: string;
	/** Called with (rating, cardId) when the learner picks a button. */
	onRate: (rating: SrsRating, cardId: string) => void;
	/** Override the default button labels. Defaults: "Again" / "Hard" / "Good" / "Easy". */
	labels?: Partial<Record<SrsRating, string>>;
}

const RATINGS: SrsRating[] = ["again", "hard", "good", "easy"];

const DEFAULT_LABELS: Record<SrsRating, string> = {
	again: "Again",
	hard: "Hard",
	good: "Good",
	easy: "Easy",
};

const RATING_HINT: Record<SrsRating, string> = {
	again: "Couldn't recall — show this card again soon.",
	hard: "Recalled with effort — review sooner than usual.",
	good: "Recalled correctly — keep the standard interval.",
	easy: "Recalled instantly — push the next review further out.",
};

// Visual gradient: again (most concerning) → easy (most confident).
// `easy` carries a faint accent border so the four buttons read as a
// progression rather than three styled + one plain.
const RATING_CLASSES: Record<SrsRating, string> = {
	again:
		"border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/40",
	hard:
		"border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
	good:
		"border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15 focus-visible:ring-primary/40",
	easy:
		"border-accent bg-accent/10 text-accent-foreground hover:bg-accent/20 focus-visible:ring-accent/40",
};

function SpacedRepetition({
	cardId,
	onRate,
	labels,
	className,
	...rest
}: SpacedRepetitionProps) {
	const onRateRef = React.useRef(onRate);
	onRateRef.current = onRate;

	return (
		<div
			{...rest}
			data-hex-spaced-repetition
			data-card-id={cardId}
			role="group"
			aria-label="Confidence rating"
			className={cn("inline-flex flex-wrap items-center gap-2", className)}
		>
			{RATINGS.map((rating) => {
				const label = labels?.[rating] ?? DEFAULT_LABELS[rating];
				return (
					<button
						key={rating}
						type="button"
						data-hex-spaced-repetition-button
						data-rating={rating}
						aria-label={`${label}: ${RATING_HINT[rating]}`}
						onClick={() => onRateRef.current(rating, cardId)}
						className={cn(
							"inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-all duration-[var(--duration-normal,200ms)] ease-out active:scale-[0.98]",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							RATING_CLASSES[rating],
						)}
					>
						{label}
					</button>
				);
			})}
		</div>
	);
}

export { SpacedRepetition };
