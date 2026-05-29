import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const quizSchema: ComponentSchemaDefinition = {
	name: "quiz",
	displayName: "Quiz",
	description:
		"Single-question multiple-choice quiz with submit + reveal. After submit, each option is tagged data-state=\"correct|incorrect|missed\" so consumers can theme right / wrong / unselected-but-correct independently. Pure HTML; no heavy peer.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "question",
			type: "ReactNode",
			required: true,
			description: "The question prompt — accepts any rich content.",
		},
		{
			name: "options",
			type: "object",
			required: true,
			description: "Array of { id, label, correct?, explanation? }. `correct: true` flags the right answer(s); `explanation` renders below the option after submit.",
		},
		{
			name: "selectionMode",
			type: "enum",
			required: false,
			default: "single",
			description: '"single" — radio inputs (one pick); "multi" — checkboxes (zero or more picks).',
			enumValues: ["single", "multi"],
		},
		{
			name: "submitLabel",
			type: "string",
			required: false,
			default: "Submit",
			description: "Custom Submit button text.",
		},
		{
			name: "onAnswer",
			type: "function",
			required: false,
			description: "Called with (selectedIds, allCorrect) on submit. `allCorrect` is true only when the picked set equals the correct set exactly (multi-select must include all correct AND nothing extra).",
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
	tokensUsed: ["card", "card-foreground", "background", "border", "primary", "primary-foreground", "destructive", "muted", "muted-foreground", "ring"],
	examples: [
		{
			title: "Single-answer geography",
			description: "Standard one-correct multiple choice.",
			code:
				'<Quiz\n  question="Which planet is closest to the sun?"\n  options={[\n    { id: "m", label: "Mercury", correct: true },\n    { id: "v", label: "Venus" },\n    { id: "e", label: "Earth" },\n    { id: "ma", label: "Mars" },\n  ]}\n/>',
			composition: ["quiz", "single-answer"],
		},
		{
			title: "Multi-answer with explanations",
			description: "Multiple correct options + per-option explanations after submit.",
			code:
				'<Quiz\n  question="Which planets are gas giants?"\n  selectionMode="multi"\n  options={[\n    { id: "j", label: "Jupiter", correct: true },\n    { id: "v", label: "Venus" },\n    { id: "s", label: "Saturn", correct: true, explanation: "Saturn\'s atmosphere is mostly H/He." },\n  ]}\n/>',
			composition: ["quiz", "multi-answer", "explanation"],
		},
	],
	ai: {
		whenToUse:
			"Render a single self-test question with N preset answers. Vocabulary multiple choice, fact-based questions, code-output predictions, comprehension checks. Use when answers are constrained to a finite set the consumer can author upfront.",
		whenNotToUse:
			"Don't use for free-form recall (use Flashcard or Cloze). Don't use for image regions (use ImageOcclusion). Don't use for multi-question quizzes — Quiz is a single-question primitive; consumers compose their own state to chain multiple instances. Don't use when the answer is graded server-side after submit — Quiz reveals correctness immediately on submit, no async hook.",
		commonMistakes: [
			"Forgetting `correct: true` on any option in multi-select mode — `allCorrect` will fire as `true` only if picked-set equals correct-set, so a quiz with no correct options reports allCorrect on an empty selection",
			"Putting the explanation on the wrong option — explanations are intentionally only shown for `correct` / `incorrect` / `missed` cells (not `unanswered`), so a learner sees the explanation for what they missed, what they got wrong, and what they got right",
			"Re-mounting the Quiz to reset state — that works, but it's cheaper to clear the parent's options key (or pass a controlled `selectedIds` prop in a future iteration)",
			"Long questions or labels exceeding ~60 characters — line-wrapping inside the option list shrinks the click target. Trim or break at a natural punctuation point",
		],
		relatedComponents: ["flashcard", "cloze", "image-occlusion", "deck", "spaced-repetition", "radio-group", "checkbox"],
		accessibilityNotes:
			"The options list declares role=\"radiogroup\" (single mode) or role=\"group\" (multi mode). Native <input type=\"radio|checkbox\"> handles keyboard navigation (arrow keys for radios, tab+space for checkboxes). The status line uses role=\"status\" + aria-live=\"polite\" so screen readers announce correctness after submit. Each option's data-state encodes correctness for theming AND offers a hook for screen-reader-only labels if a future iteration adds them.",
		tokenBudget: 1200,
	},
	tags: ["artifact", "study", "quiz", "multiple-choice", "active-recall"],
};
