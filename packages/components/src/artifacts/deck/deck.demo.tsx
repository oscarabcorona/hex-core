import { Deck } from "@hex-core/components";

/** Deck demo: 4-card Spanish vocabulary deck with prev/next navigation + progress bar. */
export function DeckDemo() {
	return (
		<div className="w-full max-w-md">
			<Deck
				cards={[
					{ id: "1", front: "Hello", back: "Hola" },
					{ id: "2", front: "Thank you", back: "Gracias" },
					{ id: "3", front: "Goodbye", back: "Adiós" },
					{ id: "4", front: "Please", back: "Por favor" },
				]}
			/>
		</div>
	);
}
