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
			name: "components",
			type: "object",
			required: false,
			description: "Per-element overrides (e.g. plug in CodeBlock for `pre`/`code`).",
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
			title: "Plug in CodeBlock for fenced code",
			description: "Override the default `pre` renderer to use Hex Core CodeBlock.",
			code: '<Markdown\n  components={{\n    pre: ({ children }) => {\n      const child = React.Children.only(children) as ReactElement<{ className?: string; children?: string }>;\n      const lang = child.props.className?.replace(/^language-/, "") ?? "text";\n      return <CodeBlock code={String(child.props.children).trim()} language={lang as SupportedLang} />;\n    },\n  }}\n>{markdown}</Markdown>',
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
			"Disabling `parseIncompleteMarkdown` during streaming — that defeats the streaming-safe guarantee",
			"Forgetting Tailwind Typography (`prose`) classes are required to style the output",
		],
		relatedComponents: ["message", "code-block", "citation"],
		accessibilityNotes:
			"Inherits semantics from streamdown: real headings, lists, links. Verify Tailwind Typography (prose) is enabled in your CSS — without it, output renders unstyled.",
		tokenBudget: 280,
	},
	tags: ["ai", "markdown", "streaming", "content", "renderer"],
};
