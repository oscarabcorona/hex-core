import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const spacedRepetitionSchema: ComponentSchemaDefinition = {
	name: "spaced-repetition",
	displayName: "SpacedRepetition",
	description:
		"Anki-style confidence rating row — four buttons (Again / Hard / Good / Easy) that emit a rating signal. Headless on scheduling: consumers wire SM-2, FSRS, or any other algorithm; this primitive just captures the learner's signal.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "cardId",
			type: "string",
			required: true,
			description: "Identifier of the card being rated. Passed back as the second argument to onRate.",
		},
		{
			name: "onRate",
			type: "function",
			required: true,
			description: "Called with (rating, cardId) when the learner picks a button. Rating is one of \"again\" | \"hard\" | \"good\" | \"easy\".",
		},
		{
			name: "labels",
			type: "object",
			required: false,
			description: "Override the default button labels. Defaults: \"Again\" / \"Hard\" / \"Good\" / \"Easy\". Pass a partial object — unspecified ratings keep the defaults.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the outer container.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["destructive", "secondary", "secondary-foreground", "primary", "accent", "accent-foreground", "foreground", "ring"],
	examples: [
		{
			title: "Anki-default labels with a hand-rolled scheduler",
			description: "Forward the rating to a consumer-owned interval calculator.",
			code:
				'<SpacedRepetition\n  cardId={card.id}\n  onRate={(rating, id) => scheduler.update(id, rating)}\n/>',
			composition: ["spaced-repetition", "srs"],
		},
		{
			title: "Inside a Deck via ratingSlot",
			description: "Each card surfaces a rating row beneath it.",
			code:
				'<Deck\n  cards={cards}\n  ratingSlot={(card) => (\n    <SpacedRepetition cardId={card.id} onRate={onRate} />\n  )}\n/>',
			composition: ["spaced-repetition", "deck", "srs"],
		},
	],
	ai: {
		whenToUse:
			"After a Flashcard / Cloze / ImageOcclusion has been revealed, surface a four-button row so the learner self-reports recall quality. Pair with a scheduler (Anki SM-2, FSRS, custom) on the consumer side. Best place: inside Deck's ratingSlot prop.",
		whenNotToUse:
			"Don't use as a generic rating widget — this is study-specific, with semantic Anki labels (Again / Hard / Good / Easy). Don't use when the rating is a continuous value or a star count (use a slider or a star-rating component). Don't use without a scheduler — the rating is meaningless without something that consumes it to schedule the next review.",
		commonMistakes: [
			"Forgetting to wire `onRate` — the buttons fire but nothing happens. There's no internal scheduler",
			"Calling SpacedRepetition before the card is revealed — the user hasn't seen the answer yet, so any rating is a guess. Render after Flashcard's flip event, after Cloze's reveal event, or after Quiz's submit",
			"Reusing the same cardId across multiple cards in a session — the consumer's scheduler will misroute interval updates. Pass each card's unique id",
			"Overriding labels with non-Anki semantics — \"Again / Hard / Good / Easy\" map to standard SM-2/FSRS difficulty grades 1–4. Custom labels are fine, but the four buckets should still mean roughly forgot / barely / fluent / instant",
		],
		relatedComponents: ["flashcard", "cloze", "image-occlusion", "quiz", "deck"],
		accessibilityNotes:
			"Outer container has role=\"group\" with aria-label=\"Confidence rating\". Each button is a real <button> with an aria-label that includes the rating label AND a hint about its effect on the next review (\"Again: Couldn't recall — show this card again soon.\"). Native button focus + Enter/Space activation handle keyboard interaction.",
		tokenBudget: 956,
	},
	tags: ["artifact", "study", "spaced-repetition", "srs", "anki", "rating"],
};
