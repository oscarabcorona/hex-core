"use client";

import * as React from "react";
import { Flashcard, SpacedRepetition, type SrsRating } from "@hex-core/components";

const CARD = { id: "demo-1", front: "What does SM-2 stand for?", back: "SuperMemo 2" };

/**
 * SpacedRepetition demo: pairs a Flashcard with the four-button rating row
 * and surfaces the most recent rating so the wiring to a real SM-2 / FSRS
 * scheduler is obvious.
 */
export function SpacedRepetitionDemo() {
	const [lastRating, setLastRating] = React.useState<SrsRating | null>(null);

	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<Flashcard front={CARD.front} back={CARD.back} />
			<SpacedRepetition cardId={CARD.id} onRate={(rating) => setLastRating(rating)} />
			{lastRating ? (
				<p className="text-xs text-muted-foreground">
					Last rating: <span className="font-medium text-foreground">{lastRating}</span> — wire
					this into SM-2 / FSRS / your own scheduler to compute the next review interval.
				</p>
			) : (
				<p className="text-xs text-muted-foreground">
					Pick a confidence rating after recalling the card.
				</p>
			)}
		</div>
	);
}
