import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const markdownSchema: ComponentSchemaDefinition = {
	name: "markdown",
	displayName: "Markdown",
	description:
		"Streaming-safe markdown renderer wrapping Vercel's streamdown. Handles partial input mid-stream without throwing.",
	category: "ai",
	subcategory: "content",
	props: [
		{
			name: "children",
			type: "string",
			required: true,
			description: "Raw markdown. May be a partial chunk during streaming.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root element.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Markdown source as a string.",
			required: true,
			acceptedTypes: ["string"],
		},
	],
	dependencies: {
		npm: ["streamdown", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "primary"],
	examples: [
		{
			title: "Streaming assistant turn",
			description: "Render the in-flight assistant message as it arrives.",
			code: '<Message role="assistant">\n  <Markdown>{message.content}</Markdown>\n</Message>',
			composition: ["chat", "streaming", "markdown"],
		},
		{
			title: "Custom rendering: drop down to Streamdown",
			description: "For per-element overrides, use streamdown directly with our CodeBlock primitive.",
			code: 'import { Streamdown } from "streamdown";\nimport { CodeBlock } from "@hex-core/components";\n\n<Streamdown components={{ pre: ({ children }) => <CodeBlock code={extractCode(children)} /> }}>\n  {markdown}\n</Streamdown>',
			composition: ["chat", "code", "override"],
		},
	],
	ai: {
		whenToUse:
			"Render any markdown content from an LLM — assistant turns, system messages with formatting, RAG citations with inline links. Required for streaming because raw markdown parsers throw on unfinished input.",
		whenNotToUse:
			"Don't use for plain text without formatting (just render the string). Don't bypass it for streamed content — partial input WILL break a non-streaming parser.",
		commonMistakes: [
			"Passing JSX children instead of a markdown string — Markdown only accepts strings",
			"Trying to override per-element renderers via Markdown — drop down to `Streamdown` directly for that (we keep our public surface minimal so the DTS bundle doesn't drag in shiki's giant language union)",
			"Forgetting Tailwind Typography (`prose`) classes are required to style the output",
		],
		relatedComponents: ["message", "code-block", "citation"],
		accessibilityNotes:
			"Inherits semantics from streamdown: real headings, lists, links. Verify Tailwind Typography (prose) is enabled in your CSS — without it, output renders unstyled.",
		tokenBudget: 280,
	},
	tags: ["ai", "markdown", "streaming", "content", "renderer"],
};
