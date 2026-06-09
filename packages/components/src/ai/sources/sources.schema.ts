import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sourcesSchema: ComponentSchemaDefinition = {
	name: "sources",
	displayName: "Sources",
	description:
		"Bordered card listing 1–N citation chips for a RAG response. Re-uses Citation per row inside a Radix Collapsible so consumers can collapse the list when the response references many sources.",
	category: "ai",
	subcategory: "rag",
	props: [
		{
			name: "sources",
			type: "object",
			required: true,
			description: "Array of `SourceRef` objects ({ title: string; url?: string; page?: number }). Each becomes a Citation chip.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: true,
			description: "Whether the list is expanded by default.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "components/citation/citation"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "muted-foreground", "foreground", "ring"],
	examples: [
		{
			title: "RAG response sources",
			description: "Three retrieved sources for a question about auth.",
			code: 'const refs = [\n  { title: "Auth research", url: "https://example.com/auth", page: 3 },\n  { title: "OAuth 2.1 spec", url: "https://oauth.net/2.1" },\n  { title: "Internal RFC #42", url: "https://example.com/rfc-42" },\n];\n<Sources sources={refs} />',
			composition: ["rag", "citations", "sources"],
		},
		{
			title: "Streamed via <sources> markdown element",
			description: "Render an LLM response that emits <sources data='[…]' /> via the Markdown slot wiring.",
			code: 'const md = `<sources data=\'[{"title":"Auth research","url":"https://example.com/auth","page":3}]\' />`;\n<Markdown>{md}</Markdown>',
			composition: ["chat", "rag", "streaming"],
		},
	],
	ai: {
		whenToUse:
			"At the bottom of a RAG-style assistant response, listing every source the model cited. Pair with InlineCitation in the body text so the inline refs and the bottom-of-card list reference the same sources by index.",
		whenNotToUse:
			"Don't use for a single-source attribution (drop in a plain Citation). Don't use as navigation — Sources is reference-only; for query history use a sidebar or breadcrumb.",
		commonMistakes: [
			"Passing strings instead of `{ title, url? }` objects in the `sources` array",
			"Composing inline citations with `Citation` (block-level) when `InlineCitation` (inline + hover popover) is the right choice",
			"Setting `defaultOpen={false}` on a chat surface — users miss provenance information by default",
			"Embedding raw URLs as titles (use the source's display name; URL hostname is a fallback Citation already provides)",
		],
		relatedComponents: ["citation", "inline-citation", "markdown", "message"],
		accessibilityNotes:
			"Wraps Radix Collapsible — the trigger is a real <button> with aria-expanded; content gets aria-hidden when closed. Each Citation chip is keyboard-focusable when its url is set.",
		tokenBudget: 763,
	},
	tags: ["ai", "rag", "citations", "sources", "collapsible"],
};
