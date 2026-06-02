import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const inlineCitationSchema: ComponentSchemaDefinition = {
	name: "inline-citation",
	displayName: "InlineCitation",
	description:
		"Inline footnote-style reference with a hover-preview popover. Pairs with Sources for the bottom-of-card list; fills the inline-text gap that the block Citation chip can't.",
	category: "ai",
	subcategory: "rag",
	props: [
		{
			name: "index",
			type: "number",
			required: true,
			description: "Footnote number (1-based). Renders inside the visible <sup>.",
		},
		{
			name: "title",
			type: "string",
			required: true,
			description: "Source title shown in the hover preview.",
		},
		{
			name: "url",
			type: "string",
			required: false,
			description: "Optional URL — when set, the trigger becomes a focusable anchor.",
		},
		{
			name: "excerpt",
			type: "string",
			required: false,
			description: "Optional excerpt or context shown under the title in the preview.",
		},
		{
			name: "openDelay",
			type: "number",
			required: false,
			default: 200,
			description: "Hover open delay in ms.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the trigger.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-hover-card", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "popover", "popover-foreground", "border", "muted-foreground", "foreground", "ring"],
	examples: [
		{
			title: "Inline reference in a sentence",
			description: "Drop a citation in the middle of an assistant turn.",
			code: '<p>\n  The frontier models all publish reasoning evals\n  <InlineCitation\n    index={1}\n    title="Anthropic — Claude Sonnet 4.5"\n    url="https://anthropic.com/claude"\n  />.\n</p>',
			composition: ["chat", "rag", "inline"],
		},
		{
			title: "Pair with Sources for the bottom-of-card list",
			description: "Same source surfaces inline AND in the sources panel — same index in both places.",
			code: 'const refs = [\n  { title: "Auth research", url: "https://example.com/auth", page: 3 },\n];\n<>\n  <p>Studies on this <InlineCitation index={1} title={refs[0].title} url={refs[0].url} /> agree.</p>\n  <Sources sources={refs} />\n</>',
			composition: ["rag", "citations", "sources"],
		},
		{
			title: "Streamed via Markdown [N](url) shape",
			description: "Markdown's footnote-style link slot routes [1](url) to InlineCitation automatically.",
			code: 'const md = "Reasoning quality scales [1](https://anthropic.com/research) with compute.";\n<Markdown>{md}</Markdown>',
			composition: ["chat", "streaming", "markdown"],
		},
	],
	ai: {
		whenToUse:
			"In the body of an assistant message when you want to reference a source mid-sentence without breaking flow. Pair with Sources at the end of the message to give the user a scannable list.",
		whenNotToUse:
			"Don't use as a primary navigation element (it's a reference, not a link). Don't use for a single source attribution at the end of a message — just use Citation instead.",
		commonMistakes: [
			"Using `<Citation index={...}>` for inline references — that's the block-level chip; use InlineCitation for inline-text refs",
			"Mismatched `index` between the inline ref and the corresponding row in the Sources panel — keep them aligned",
			"Setting `openDelay={0}` — the hover popover triggers on accidental mouseover and feels noisy; the 200ms default keeps a calm hover cadence",
			"Missing `url` AND missing `excerpt` — leaves the popover with just a title; provide one of the two for context",
		],
		relatedComponents: ["citation", "sources", "markdown", "message"],
		accessibilityNotes:
			"Wraps Radix HoverCard. The trigger is a real anchor (with `url`) or button; both carry an `aria-label` exposing the index + title to screen readers and are in the keyboard tab order. HoverCard content opens on focus AND hover so keyboard users get the same preview.",
		tokenBudget: 1016,
	},
	tags: ["ai", "rag", "citations", "inline", "popover", "footnote"],
};
