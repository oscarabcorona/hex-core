import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const compareTableSchema: ComponentSchemaDefinition = {
	name: "compare-table",
	displayName: "CompareTable",
	description:
		"Side-by-side comparison table. Subjects are columns; attributes are rows; cells render the per-subject value for each attribute. Optional difference highlighting flags cells that diverge from the row's reference. Pure HTML; no heavy peer.",
	category: "artifact",
	subcategory: "study",
	props: [
		{
			name: "subjects",
			type: "object",
			required: true,
			description: "Array of { id, label }. Renders as columns; display order matches array order.",
		},
		{
			name: "attributes",
			type: "object",
			required: true,
			description: "Array of { id, label, values }. Renders as rows; `values` is a subjectId → ReactNode map. Missing keys render as \"—\".",
		},
		{
			name: "highlightDifferences",
			type: "boolean",
			required: false,
			default: false,
			description: "When true, cells whose value differs from the row's first non-empty cell get a subtle accent.",
		},
		{
			name: "onCellClick",
			type: "function",
			required: false,
			description: "Called with (subjectId, attributeId) when a body cell is clicked.",
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
	tokensUsed: ["card", "border", "muted", "muted-foreground", "accent", "accent-foreground"],
	examples: [
		{
			title: "Operating system comparison",
			description: "Three subjects, two attributes, with difference highlighting.",
			code:
				'<CompareTable\n  highlightDifferences\n  subjects={[\n    { id: "linux", label: "Linux" },\n    { id: "mac", label: "Mac" },\n    { id: "win", label: "Windows" },\n  ]}\n  attributes={[\n    { id: "kernel", label: "Kernel", values: { linux: "Linux", mac: "Darwin", win: "NT" } },\n    { id: "fs", label: "Default FS", values: { linux: "ext4", mac: "APFS", win: "NTFS" } },\n  ]}\n/>',
			composition: ["compare-table", "comparison", "feature-matrix"],
		},
		{
			title: "Vocabulary pairs",
			description: "Two-column term ↔ translation table.",
			code:
				'<CompareTable\n  subjects={[\n    { id: "en", label: "English" },\n    { id: "es", label: "Spanish" },\n  ]}\n  attributes={[\n    { id: "1", label: "Hello", values: { en: "Hello", es: "Hola" } },\n    { id: "2", label: "Thank you", values: { en: "Thank you", es: "Gracias" } },\n  ]}\n/>',
			composition: ["compare-table", "vocabulary"],
		},
	],
	ai: {
		whenToUse:
			"Compare 2–6 subjects across 2–20 attributes when the user wants to see same-row differences at a glance. Vocab translations, OS feature matrices, framework comparisons, before/after, drug-vs-drug. Use `highlightDifferences` whenever the row's *divergence* is the message.",
		whenNotToUse:
			"Don't use for 1 subject (use a regular description list). Don't use for >6 subjects — columns shrink past readability; use a card grid instead. Don't use when cells contain rich nested layouts (consider DataTable). Don't use for a single learner-recall task — use Flashcard, Cloze, or Quiz instead.",
		commonMistakes: [
			"Including a value with a subjectId that isn't in the subjects array — the cell silently doesn't render. The component warns in dev when this happens",
			"Expecting `highlightDifferences` to compare ReactElement cells — diff is skipped automatically when either the raw value or the row's reference is non-primitive (object). Cells render but never flag as `data-differs=\"true\"`. Stringify upstream if you need diffing on rich content",
			"Mutating subjects / attributes between renders — React re-renders fine, but downstream memoization in consumer code may cache stale references. Rebuild the arrays from immutable sources",
			"Long labels in subject headers (>20 chars) — they wrap and inflate the row height across the whole table. Use abbreviations + tooltips when needed",
		],
		relatedComponents: ["flashcard", "quiz", "cloze", "data-table", "table"],
		accessibilityNotes:
			"Renders a real <table> with semantic <thead>/<tbody>/<th scope=\"col|row\">/<td>. The first column is sticky so attribute labels stay visible during horizontal scroll on narrow viewports. Each cell carries data-subject-id and data-attribute-id for any consumer-driven aria-label or selection behavior. The diff-highlighted cells rely on color alone today — pair with a per-row screen-reader-only summary for AA-strict consumers.",
		tokenBudget: 1170,
	},
	tags: ["artifact", "study", "compare-table", "comparison", "matrix"],
};
