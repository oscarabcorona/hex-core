import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const citationSchema: ComponentSchemaDefinition = {
	name: "citation",
	displayName: "Citation",
	description:
		"Source attribution chip — renders a citation for a RAG hit, search result, or any external reference. Becomes a focusable link when url is provided.",
	category: "ai",
	subcategory: "rag",
	props: [
		{
			name: "title",
			type: "string",
			required: true,
			description: "Source title or filename (e.g. \"auth-overview.md\").",
		},
		{
			name: "url",
			type: "string",
			required: false,
			description: "If provided, the chip becomes an anchor opening in a new tab.",
		},
		{
			name: "page",
			type: "number",
			required: false,
			description: "Optional page number (renders \"p.3\").",
		},
		{
			name: "index",
			type: "number",
			required: false,
			description: "Optional inline footnote number (renders \"[1]\").",
		},
		{
			name: "children",
			type: "ReactNode",
			required: false,
			description: "Trailing slot — extra metadata (e.g. relevance score).",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Trailing extras — relevance score, badge, etc.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "secondary", "ring", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Footnote-style citations",
			description: "Numbered citations after an assistant turn.",
			code: '<Cluster gap="xs">\n  {sources.map((s, i) => (\n    <Citation key={s.id} title={s.title} url={s.url} index={i + 1} />\n  ))}\n</Cluster>',
			composition: ["rag", "citations"],
		},
	],
	ai: {
		whenToUse:
			"Surface RAG/search-result sources after an assistant message. Use `index` for footnote-style numbering tied to inline `[1]` markers in the answer.",
		whenNotToUse:
			"Don't use for general external links in chat (use Markdown). Don't fabricate sources — only render Citation for retrievals the model actually used.",
		commonMistakes: [
			"Showing the URL twice (in `title` AND `url`) — pick a human title separately",
			"Skipping `target=\"_blank\"` — handled automatically when url is set; don't override",
		],
		relatedComponents: ["message", "cluster"],
		accessibilityNotes:
			"With `url`, renders a real anchor (`rel=\"noreferrer noopener\"`). Without `url`, renders a static span. Add `aria-label` on the wrapper if title alone lacks context.",
		tokenBudget: 240,
	},
	tags: ["ai", "rag", "citation", "source", "footnote", "chip"],
};
