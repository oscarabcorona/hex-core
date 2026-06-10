"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";
import { Flashcard } from "../flashcard/flashcard.js";

/**
 * Deck — a paged sequence of flashcards with optional shuffle, prev/next
 * navigation, a progress bar, and a slot for per-card SRS rating.
 * Composes [Flashcard] internally; consumers don't render Flashcard
 * themselves when they're inside a Deck.
 *
 * @example
 * <Deck
 *   cards={[
 *     { id: "1", front: "Term 1", back: "Definition 1" },
 *     { id: "2", front: "Term 2", back: "Definition 2" },
 *   ]}
 *   shuffle
 *   ratingSlot={(card) => (
 *     <SpacedRepetition cardId={card.id} onRate={(rating) => save(rating, card.id)} />
 *   )}
 * />
 */
export type DeckCard = {
	id: string;
	front: React.ReactNode;
	back: React.ReactNode;
};

export interface DeckProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** Cards in order. */
	cards: DeckCard[];
	/** Initial shuffle. Default false (preserves order). */
	shuffle?: boolean;
	/** Optional render slot below the card; passed the current card. Useful for SpacedRepetition. */
	ratingSlot?: (card: DeckCard) => React.ReactNode;
	/** Fired whenever the active card changes (after shuffle / prev / next). */
	onCardChange?: (index: number, card: DeckCard) => void;
	/** Pixel width of the inner Flashcard. Default 360. */
	cardWidth?: number;
	/** Pixel height of the inner Flashcard. Default 240. */
	cardHeight?: number;
}

function shuffleArray<T>(arr: T[]): T[] {
	// Fisher-Yates. Cheap and deterministic-shape (just non-deterministic
	// order on each call). Consumers wanting reproducibility wire their own
	// pre-shuffled array and pass `shuffle={false}`.
	const out = arr.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

function Deck({
	cards,
	shuffle = false,
	ratingSlot,
	onCardChange,
	cardWidth = 360,
	cardHeight = 240,
	className,
	...rest
}: DeckProps) {
	// Order is recomputed only when `cards` identity OR `shuffle` flips —
	// not on every prev/next, so the user never gets re-shuffled mid-session.
	const order = React.useMemo(() => (shuffle ? shuffleArray(cards) : cards.slice()), [cards, shuffle]);
	const [index, setIndex] = React.useState(0);
	const [flipped, setFlipped] = React.useState(false);
	const onCardChangeRef = React.useRef(onCardChange);
	onCardChangeRef.current = onCardChange;

	// Reset to the first card when the order changes (cards swap, shuffle toggles).
	React.useEffect(() => {
		setIndex(0);
		setFlipped(false);
	}, [order]);

	const total = order.length;
	const currentCard = order[index];

	const goPrev = React.useCallback(() => {
		if (index === 0) return;
		const next = index - 1;
		setIndex(next);
		setFlipped(false);
		const card = order[next];
		if (card) onCardChangeRef.current?.(next, card);
	}, [index, order]);

	const goNext = React.useCallback(() => {
		if (index >= total - 1) return;
		const next = index + 1;
		setIndex(next);
		setFlipped(false);
		const card = order[next];
		if (card) onCardChangeRef.current?.(next, card);
	}, [index, order, total]);

	if (total === 0) {
		return (
			<div
				{...rest}
				data-hex-deck
				data-empty="true"
				className={cn("rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground", className)}
			>
				No cards in this deck.
			</div>
		);
	}

	const progressPercent = total > 0 ? ((index + 1) / total) * 100 : 0;

	return (
		<div
			{...rest}
			data-hex-deck
			data-index={index}
			data-total={total}
			className={cn("inline-flex flex-col items-center gap-4", className)}
		>
			{currentCard ? (
				<Flashcard
					key={currentCard.id}
					front={currentCard.front}
					back={currentCard.back}
					flipped={flipped}
					onFlipChange={setFlipped}
					width={cardWidth}
					height={cardHeight}
				/>
			) : null}
			<div data-hex-deck-controls className="flex w-full items-center gap-3" style={{ width: cardWidth }}>
				<button
					type="button"
					data-hex-deck-prev
					disabled={index === 0}
					onClick={goPrev}
					aria-label={`Previous card. Currently ${index + 1} of ${total}.`}
					className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium transition-all duration-[var(--duration-normal,200ms)] ease-out active:scale-[0.98] hover:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Prev
				</button>
				<div data-hex-deck-progress className="flex-1" aria-hidden="true">
					<div className="h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-primary transition-all"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<div className="mt-1 text-center text-xs text-muted-foreground">
						{index + 1} / {total}
					</div>
				</div>
				<button
					type="button"
					data-hex-deck-next
					disabled={index >= total - 1}
					onClick={goNext}
					aria-label={`Next card. Currently ${index + 1} of ${total}.`}
					className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium transition-all duration-[var(--duration-normal,200ms)] ease-out active:scale-[0.98] hover:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Next
				</button>
			</div>
			{ratingSlot && currentCard ? (
				<div data-hex-deck-rating-slot className="w-full" style={{ width: cardWidth }}>
					{ratingSlot(currentCard)}
				</div>
			) : null}
		</div>
	);
}

export { Deck };
