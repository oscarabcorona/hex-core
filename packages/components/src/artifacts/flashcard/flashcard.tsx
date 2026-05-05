"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Flashcard — front/back card with a 3D flip animation. Click, Enter, or
 * Space to flip. Pure CSS 3D transform, no animation peer required.
 *
 * Headless on content: pass any ReactNode for `front` and `back`. Pair
 * with Deck (artifacts/deck) for shuffle / next / prev / progress, or
 * with SpacedRepetition (artifacts/spaced-repetition) for confidence
 * rating after each reveal.
 *
 * @example
 * <Flashcard
 *   front={<>What is the capital of France?</>}
 *   back={<>Paris</>}
 * />
 *
 * <Flashcard
 *   flipped={isFlipped}
 *   onFlipChange={setFlipped}
 *   front={term}
 *   back={definition}
 * />
 */
export interface FlashcardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** Content of the front face. */
	front: React.ReactNode;
	/** Content of the back face. */
	back: React.ReactNode;
	/** Uncontrolled initial flipped state. Default false. */
	defaultFlipped?: boolean;
	/** Controlled flipped state. */
	flipped?: boolean;
	/** Fired with the new flipped value when the user toggles. */
	onFlipChange?: (flipped: boolean) => void;
	/** Pixel width. Default 360. */
	width?: number;
	/** Pixel height. Default 240. */
	height?: number;
	/** Flip animation duration in ms. Default 500. Set to 0 to disable the animation entirely. */
	flipDurationMs?: number;
}

function Flashcard({
	front,
	back,
	defaultFlipped = false,
	flipped: flippedProp,
	onFlipChange,
	width = 360,
	height = 240,
	flipDurationMs = 500,
	className,
	...rest
}: FlashcardProps) {
	const [internalFlipped, setInternalFlipped] = React.useState(defaultFlipped);
	const isControlled = flippedProp !== undefined;
	const flipped = isControlled ? flippedProp : internalFlipped;

	const toggle = React.useCallback(() => {
		const next = !flipped;
		if (!isControlled) setInternalFlipped(next);
		onFlipChange?.(next);
	}, [flipped, isControlled, onFlipChange]);

	const handleKey = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				toggle();
			}
		},
		[toggle],
	);

	return (
		<div
			{...rest}
			data-hex-flashcard
			data-flipped={flipped}
			role="button"
			tabIndex={0}
			aria-pressed={flipped}
			aria-label={flipped ? "Flashcard, back side. Activate to flip to front." : "Flashcard, front side. Activate to reveal back."}
			onClick={toggle}
			onKeyDown={handleKey}
			className={cn(
				"relative inline-block cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
			style={{
				width,
				height,
				perspective: 1000,
			}}
		>
			<div
				data-hex-flashcard-inner
				className="relative h-full w-full transition-transform"
				style={{
					transformStyle: "preserve-3d",
					transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
					transitionDuration: `${flipDurationMs}ms`,
				}}
			>
				<div
					data-hex-flashcard-face
					data-side="front"
					className="absolute inset-0 flex items-center justify-center rounded-lg border bg-card p-4 text-center text-card-foreground shadow-sm"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
					}}
				>
					{front}
				</div>
				<div
					data-hex-flashcard-face
					data-side="back"
					className="absolute inset-0 flex items-center justify-center rounded-lg border bg-card p-4 text-center text-card-foreground shadow-sm"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
				>
					{back}
				</div>
			</div>
		</div>
	);
}

export { Flashcard };
