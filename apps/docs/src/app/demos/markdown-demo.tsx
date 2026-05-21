import { Markdown } from "../../components/ui";

const SAMPLE = `## Streaming markdown with AI-aware slots

This component handles **streaming-safe** markdown — the parser tolerates partial input mid-stream so unfinished tokens render gracefully.

It supports:

- **Bold** and _italic_ inline styles
- Inline code like \`useState\`
- Lists, headings, links, and GitHub-flavored extensions

### Fenced code preserves the language class

\`\`\`ts
function greet(name: string) {
	return \`Hello, \${name}\`;
}
\`\`\`

### Footnote-style links route to Citation

According to recent papers [1](https://anthropic.com/research) and [2](https://openai.com), reasoning quality scales with compute.

### \`[!think]\` admonition routes to Reasoning

> [!think]
> Working through the trade-off: native pipeline gives smaller bundle and slot wiring; streamdown gave Mermaid + Shiki out of the box.

### Tool invocations route to ToolCall

<tool-call name="searchDocs" state="result" args='{"query":"auth"}' result='{"hits":12}' />

### Plain links keep their styling

[Learn more](https://hex-core.dev) about Hex Core.
`;

export function MarkdownDemo() {
	return (
		<div className="w-full max-w-lg">
			<Markdown>{SAMPLE}</Markdown>
		</div>
	);
}
