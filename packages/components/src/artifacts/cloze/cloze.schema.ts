import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const clozeSchema: ComponentSchemaDefinition = {
	name: "cloze",
	displayName: "Cloze",
	description:
		"Cloze-deletion text — sentences with redacted spans the learner reveals one at a time (or all at once). Pure HTML; no heavy peer.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "parts",
			type: "object",
			required: true,
			description:
				"Mixed array of string fragments and { hidden, id? } cloze tokens. Each `hidden` value is the text the learner has to recall.",
		},
		{
			name: "revealMode",
			type: "enum",
			required: false,
			default: "click",
			description:
				'"click" — reveals one blank at a time (default). "all" — adds a "Reveal all" toggle that flips every blank in one shot.',
			enumValues: ["click", "all"],
		},
		{
			name: "onReveal",
			type: "function",
			required: false,
			description: "Called with the cumulative array of revealed blank ids whenever a blank toggles.",
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
	tokensUsed: ["primary", "muted", "foreground", "background", "border", "ring"],
	examples: [
		{
			title: "Single-blank biology fact",
			description: "Classic cloze with one redacted term.",
			code:
				'<Cloze parts={[\n  "The mitochondria is the ",\n  { hidden: "powerhouse" },\n  " of the cell.",\n]} />',
			composition: ["cloze", "study", "fill-in"],
		},
		{
			title: "Multi-blank with reveal-all",
			description: "Useful when consumers want a quick \"show me everything\" escape hatch.",
			code:
				'<Cloze\n  revealMode="all"\n  parts={[\n    "The capital of ",\n    { hidden: "France" },\n    " is ",\n    { hidden: "Paris" },\n    ".",\n  ]}\n/>',
			composition: ["cloze", "multi-blank"],
		},
	],
	ai: {
		whenToUse:
			"Render a sentence-level fill-in-the-blank where the learner can target ANY missing piece independently — vocabulary in context, formula completion, code snippets with redacted operators. Especially strong when the surrounding context is the cue.",
		whenNotToUse:
			"Don't use for question-answer pairs (use Flashcard). Don't use for multiple-choice (use Quiz). Don't use for image labels (use ImageOcclusion). Don't use when blanks should be free-typed and graded — Cloze is reveal-only.",
		commonMistakes: [
			"Putting too much text in a single hidden token — the redacted block becomes the entire sentence and there's no context left to cue recall. Keep hidden segments to 1–3 words",
			"Forgetting that string fragments matter — `parts: [{hidden:'a'},{hidden:'b'}]` produces two adjacent blanks with no surrounding text. The cue context lives in the string fragments between blanks",
			"Reusing the same explicit `id` across multiple blanks — they reveal together because revealed-state keys off id. Either omit `id` (auto-numbered with a non-collidable prefix) or give each blank a unique id",
			"Mutating `parts` between renders — the layout pass is memoized on identity",
			"Treating Cloze as anti-cheating — the hidden text always lives in the DOM (transparent + user-select:none) so screen readers can announce it after reveal. A determined sighted user can still inspect element. Cloze is a recall *aid*, not a *secret*",
		],
		relatedComponents: ["flashcard", "quiz", "image-occlusion", "deck", "spaced-repetition"],
		accessibilityNotes:
			"Each blank renders as a real <button> with type=\"button\", aria-pressed reflecting reveal state, and an aria-label that names the blank's index and total. The hidden text always lives in the DOM (transparent when unrevealed) so screen readers announce the answer once aria-pressed flips. Enter and Space activate via the native button behavior.",
		tokenBudget: 982,
	},
	tags: ["artifact", "study", "cloze", "fill-in-the-blank", "active-recall"],
};
