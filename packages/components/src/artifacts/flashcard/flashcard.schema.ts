import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const flashcardSchema: ComponentSchemaDefinition = {
	name: "flashcard",
	displayName: "Flashcard",
	description:
		"Front/back card with a 3D flip animation on click. Pure CSS 3D transform; no animation peer. Headless on content — front and back accept any ReactNode. Pairs with Deck for session-level paging and SpacedRepetition for confidence rating.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "front",
			type: "ReactNode",
			required: true,
			description: "Content of the front face.",
		},
		{
			name: "back",
			type: "ReactNode",
			required: true,
			description: "Content of the back face.",
		},
		{
			name: "defaultFlipped",
			type: "boolean",
			required: false,
			default: false,
			description: "Uncontrolled initial flipped state.",
		},
		{
			name: "flipped",
			type: "boolean",
			required: false,
			description: "Controlled flipped state. When set, internal state is ignored.",
		},
		{
			name: "onFlipChange",
			type: "function",
			required: false,
			description: "Called with the new flipped value when the user toggles.",
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 360,
			description: "Pixel width.",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 240,
			description: "Pixel height.",
		},
		{
			name: "flipDurationMs",
			type: "number",
			required: false,
			default: 500,
			description: "Flip animation duration in ms. Set to 0 to disable the animation entirely.",
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
			name: "front",
			description: "Front face of the card — typically the prompt / question / term.",
			required: true,
		},
		{
			name: "back",
			description: "Back face of the card — typically the answer / definition.",
			required: true,
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "ring"],
	examples: [
		{
			title: "Capital city flashcard",
			description: "Classic question-answer card with default uncontrolled state.",
			code: '<Flashcard front="What is the capital of France?" back="Paris" />',
			composition: ["flashcard", "study", "qa"],
		},
		{
			title: "Controlled flashcard inside a Deck",
			description: "Parent owns the flipped state to coordinate with progress tracking.",
			code:
				'<Flashcard\n  flipped={isFlipped}\n  onFlipChange={setFlipped}\n  front={term}\n  back={definition}\n/>',
			composition: ["flashcard", "controlled"],
		},
	],
	ai: {
		whenToUse:
			"Render a single self-test prompt where the user retrieves an answer from memory before checking. Vocabulary terms, formula reminders, anatomy labels, code snippets — anywhere the active-recall pattern (think first, then flip) fits.",
		whenNotToUse:
			"Don't use for multiple-choice questions (use Quiz). Don't use for fill-in-the-blank (use Cloze). Don't use for image regions (use ImageOcclusion). Don't use as a generic content card with no flip semantics (use the existing `Card` in components/).",
		commonMistakes: [
			"Putting the answer on the front — defeats the active-recall pattern. Front should be the prompt only",
			"Mixing controlled and uncontrolled use — pass either `flipped` (controlled) or rely on `defaultFlipped` + internal state, not both",
			"Wrapping a Flashcard in another clickable parent — Enter / Space activations bubble; the parent's onClick fires too. Stop propagation in the wrapper or move the click handler",
			"Sizing the card to 0×0 — the 3D transform requires non-zero dimensions to avoid the back face leaking through during the rotation",
		],
		relatedComponents: ["cloze", "quiz", "image-occlusion", "deck", "spaced-repetition", "card"],
		accessibilityNotes:
			"The card declares role=\"button\", tabIndex=0, aria-pressed reflecting flipped state, and an aria-label that announces the current side. Enter and Space toggle the flip; Space's default page-scroll is preventDefaulted. Screen readers see both faces in DOM at all times — that's intentional so the back face is announced after the flip without a content swap.",
		tokenBudget: 1094,
	},
	tags: ["artifact", "study", "flashcard", "active-recall", "card"],
};
