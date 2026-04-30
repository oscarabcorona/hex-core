import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const codeBlockSchema: ComponentSchemaDefinition = {
	name: "code-block",
	displayName: "CodeBlock",
	description:
		"Server-rendered, syntax-highlighted code block with a language-label header and a copy button. Dual-theme via Shiki — same HTML for light + dark.",
	category: "ai",
	subcategory: "content",
	props: [
		{
			name: "code",
			type: "string",
			required: true,
			description: "The code to display. Plain text — no markdown fences.",
		},
		{
			name: "label",
			type: "string",
			required: false,
			description: 'Header label (e.g. "pnpm", "tsx"). Inferred from `language` if omitted.',
		},
		{
			name: "language",
			type: "enum",
			required: false,
			description: "Shiki grammar key. Overrides inference from `label`.",
			enumValues: ["bash", "ts", "tsx", "js", "jsx", "json", "css", "html", "md", "py", "text"],
		},
		{
			name: "themes",
			type: "object",
			required: false,
			default: { light: "github-light-high-contrast", dark: "github-dark" },
			description: "Override the default theme pair. Keys: `light`, `dark` — values are Shiki theme IDs.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the outer card.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["shiki", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "ai/code-block-copy"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Install command",
			description: "Header label drives both the visible chip and Shiki grammar inference.",
			code: '<CodeBlock label="pnpm" code="pnpm add @hex-core/components" />',
			composition: ["docs", "install"],
		},
		{
			title: "Inline TS sample",
			description: "Explicit language overrides label inference.",
			code: '<CodeBlock language="tsx" code={`<Button>Click</Button>`} />',
			composition: ["docs", "code"],
		},
	],
	ai: {
		whenToUse:
			"Render any code snippet in docs, copy-to-clipboard install commands, or static AI chat output where server rendering is acceptable. Pair with Markdown's `components.pre` override to take over markdown code fences.",
		whenNotToUse:
			"Don't use for streaming chat where the code grows mid-render — async Server Components can't update token-by-token. Use Streamdown's built-in client CodeBlock for that.",
		commonMistakes: [
			"Passing markdown-fenced code (with ```) — strip the fences first",
			"Forgetting that this is async — must be awaited or rendered as RSC",
			"Using a Shiki theme that isn't bundled — fails with a runtime fetch error",
		],
		relatedComponents: ["markdown", "message"],
		accessibilityNotes:
			"Highlighted output is plain text inside a `<pre>` — screen readers read it normally. The copy button has its own `aria-label`. Add a meaningful `aria-label` on the wrapper if the label alone isn't descriptive.",
		tokenBudget: 320,
	},
	tags: ["ai", "code", "shiki", "highlight", "copy", "rsc"],
};
