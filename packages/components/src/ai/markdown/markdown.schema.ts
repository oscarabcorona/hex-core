import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const markdownSchema: ComponentSchemaDefinition = {
	name: "markdown",
	displayName: "Markdown",
	description:
		"Streaming-safe markdown renderer with AI-aware element slots. Native pipeline (react-markdown + remark-gfm + rehype-raw + rehype-sanitize) with slot wiring for fenced code, footnote citations, tool-call elements, and [!think] admonitions.",
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
		npm: ["react-markdown", "remark-gfm", "rehype-raw", "rehype-sanitize", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "ai/citation", "ai/tool-call", "ai/reasoning"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "primary", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Streaming assistant turn",
			description: "Render the in-flight assistant message as it arrives.",
			code: '<Message role="assistant">\n  <Markdown>{message.content}</Markdown>\n</Message>',
			composition: ["chat", "streaming", "markdown"],
		},
		{
			title: "Fenced code preserves the language class",
			description: "Triple-backtick fences render as `<pre><code class=\"language-ts\">` so consumer-side highlighters (or Tailwind Typography styles) can target them. For server-side Shiki highlighting in an RSC tree, compose `<CodeBlock>` separately — Markdown stays client-safe so it works mid-stream.",
			code: 'const md = "```ts\\nconst x = 1;\\n```";\n<Markdown>{md}</Markdown>',
			composition: ["chat", "code"],
		},
		{
			title: "Footnote-style links route to Citation",
			description: "Link text matching `[N]` with a URL renders as a citation chip with the index preserved.",
			code: 'const md = "[1](https://anthropic.com/research) [2](https://openai.com)";\n<Markdown>{md}</Markdown>',
			composition: ["rag", "citations"],
		},
		{
			title: "[!think] admonition routes to Reasoning",
			description: "GitHub-style admonition blockquotes wrap the body in the in-house Reasoning primitive.",
			code: 'const md = "> [!think]\\n> Let me work through the steps.";\n<Markdown>{md}</Markdown>',
			composition: ["chat", "reasoning"],
		},
		{
			title: "<tool-call> element routes to ToolCall",
			description: "The custom tool-call element survives sanitize and wires to the ToolCall primitive with name/state/args/result.",
			code: 'const md = `<tool-call name="searchDocs" state="result" args=\'{"q":"x"}\' result=\'{"hits":3}\' />`;\n<Markdown>{md}</Markdown>',
			composition: ["chat", "tool-use"],
		},
	],
	ai: {
		whenToUse:
			"Render any markdown content from an LLM — assistant turns, system messages with formatting, RAG citations with inline links, tool-call placeholders, [!think] reasoning traces. Required for streaming because raw markdown parsers throw on unfinished input.",
		whenNotToUse:
			"Don't use for plain text without formatting (just render the string). Don't bypass it for streamed content — partial input WILL break a non-streaming parser. Don't compose Markdown inside Markdown.",
		commonMistakes: [
			"Passing JSX children instead of a markdown string — Markdown only accepts strings",
			"Forgetting Tailwind Typography (`prose`) classes are required to style the output",
			"Reaching for an `overrides` / `components` prop — slot wiring is built in (fenced code, footnotes, <tool-call>, [!think]); compose those primitives instead of overriding renderers",
			"Embedding JSON in <tool-call> attrs without quoting the value (use single-quoted args/result so embedded double quotes survive HTML parsing)",
		],
		relatedComponents: ["message", "code-block", "citation", "tool-call", "reasoning"],
		accessibilityNotes:
			"Renders real semantic HTML (headings, lists, links, blockquotes). Verify Tailwind Typography (`prose`) is enabled in your CSS. Slot wiring preserves a11y semantics: Reasoning ships its own collapsible disclosure, Citation ships an inline link with a labeled index, ToolCall ships a labeled status region.",
		tokenBudget: 320,
	},
	tags: ["ai", "markdown", "streaming", "content", "renderer", "slots"],
};
