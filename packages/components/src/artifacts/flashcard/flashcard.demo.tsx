import { Flashcard } from "@hex-core/components";

/** Flashcard demo: classic geography flip with click/tap/keyboard activation hint. */
export function FlashcardDemo() {
	return (
		<div className="w-full max-w-sm">
			<Flashcard front="What is the capital of France?" back="Paris" />
			<p className="mt-2 text-xs text-muted-foreground">
				Click, tap, or press Enter / Space to flip.
			</p>
		</div>
	);
}
