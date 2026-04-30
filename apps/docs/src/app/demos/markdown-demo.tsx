import { Markdown } from "../../components/ui";

const SAMPLE = `## Markdown rendering

This component handles **streaming-safe** markdown for assistant turns.
It supports:

- **Bold** and _italic_ inline styles
- Inline code like \`useState\`
- Lists, headings, links, and code blocks

\`\`\`ts
function greet(name: string) {
	return \`Hello, \${name}\`;
}
\`\`\`

[Learn more](https://hex-core.dev)
`;

export function MarkdownDemo() {
	return (
		<div className="w-full max-w-lg">
			<Markdown>{SAMPLE}</Markdown>
		</div>
	);
}
