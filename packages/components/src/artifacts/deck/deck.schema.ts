import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const deckSchema: ComponentSchemaDefinition = {
	name: "deck",
	displayName: "Deck",
	description:
		"Paged sequence of flashcards with optional shuffle, prev/next navigation, a progress bar, and a render slot for per-card SRS rating. Composes Flashcard internally.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "cards",
			type: "object",
			required: true,
			description: "Array of { id, front, back }. Display order matches array order unless `shuffle` is set.",
		},
		{
			name: "shuffle",
			type: "boolean",
			required: false,
			default: false,
			description: "Initial shuffle. Order recomputes only when `cards` identity changes — not on every prev/next, so the user never gets re-shuffled mid-session.",
		},
		{
			name: "ratingSlot",
			type: "function",
			required: false,
			description: "Optional render function called with the current card; renders below the deck. Used to compose SpacedRepetition under each card.",
		},
		{
			name: "onCardChange",
			type: "function",
			required: false,
			description: "Called with (index, card) whenever the active card changes (after prev / next).",
		},
		{
			name: "cardWidth",
			type: "number",
			required: false,
			default: 360,
			description: "Pixel width of the inner Flashcard.",
		},
		{
			name: "cardHeight",
			type: "number",
			required: false,
			default: 240,
			description: "Pixel height of the inner Flashcard.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the outer container.",
		},
	],
	variants: [],
	slots: [
		{
			name: "ratingSlot",
			description: "Render-prop slot called with the current card; ideal for SpacedRepetition's onRate emission.",
			required: false,
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils", "artifacts/flashcard/flashcard"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "background", "muted", "muted-foreground", "primary", "border", "ring"],
	examples: [
		{
			title: "Vocabulary deck with shuffle",
			description: "Three cards, shuffled on first render.",
			code:
				'<Deck\n  shuffle\n  cards={[\n    { id: "1", front: "Hello", back: "Hola" },\n    { id: "2", front: "Thank you", back: "Gracias" },\n    { id: "3", front: "Goodbye", back: "Adiós" },\n  ]}\n/>',
			composition: ["deck", "vocabulary"],
		},
		{
			title: "Deck composed with SpacedRepetition rating",
			description: "Each card surfaces an Anki-style rating row after flip.",
			code:
				'<Deck\n  cards={cards}\n  ratingSlot={(card) => (\n    <SpacedRepetition cardId={card.id} onRate={(r) => save(r, card.id)} />\n  )}\n/>',
			composition: ["deck", "srs"],
		},
	],
	ai: {
		whenToUse:
			"Render an ordered (or shuffled) study session of N flashcards with prev/next navigation and progress feedback. Use when the user is grinding through a deck end-to-end. Pair with SpacedRepetition via `ratingSlot` for Anki-style review sessions.",
		whenNotToUse:
			"Don't use for a single card (just render Flashcard directly). Don't use when navigation is non-linear (skip-around, jump-to-id) — Deck is strictly sequential. Don't use for grading multiple-question quizzes (use Quiz directly + your own state). Don't use when shuffle should be reproducible across sessions — `Math.random()` is non-seeded; pre-shuffle in your data layer and pass `shuffle={false}`.",
		commonMistakes: [
			"Toggling `shuffle` mid-session — the deck recomputes order and resets to card 1. Set `shuffle` once at mount or pre-shuffle in the consumer's data layer",
			"Mutating the cards array in place — internal layout treats `cards` as immutable; spread or rebuild from source on each change",
			"Card ids that aren't unique — React's reconciliation depends on the unique id key for Flashcard. Duplicate ids cause stale flip state to leak between cards",
			"Putting interactive content inside `front` / `back` that's also clickable — those click events bubble to Flashcard's flip handler. Stop propagation in the inner click handler",
		],
		relatedComponents: ["flashcard", "spaced-repetition", "cloze", "quiz", "progress"],
		accessibilityNotes:
			"Prev / Next buttons declare aria-label including current and total positions (\"Next card. Currently 3 of 12.\"). The progress bar is aria-hidden because the same information is in the visible '3 / 12' label and in the button labels. The inner Flashcard owns its own ARIA semantics; flipping it via Enter/Space works while the deck nav buttons remain accessible via tab order.",
		tokenBudget: 1154,
	},
	tags: ["artifact", "study", "deck", "flashcard", "session"],
};
