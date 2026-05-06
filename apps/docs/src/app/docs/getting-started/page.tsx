import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

const MCP_SETTINGS = `// .claude/settings.json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["@hex-core/mcp"]
    }
  }
}`;

export const metadata = {
	title: "Introduction",
	description: "Hex Core is an AI-native component library with MCP distribution.",
};

const SECTIONS = [
	{ id: "what", title: "What is Hex Core?" },
	{ id: "ai-native", title: "AI-Native" },
	{ id: "mcp", title: "MCP Server" },
	{ id: "tech", title: "Tech Stack" },
];

/** Docs intro page — overview, MCP wiring, and tech stack. */
export default function GettingStarted() {
	return (
		<DocsPage
			pathname="/docs/getting-started"
			title="Introduction"
			description="Beautifully designed components with AI-native metadata. Accessible. Customizable. Open Source."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/getting-started/page.tsx"
		>
			<p className="text-sm leading-6">
				Hex Core is a component library designed for both{" "}
				<strong>AI coding assistants</strong> and <strong>human developers</strong>. Every
				component ships with machine-readable schemas, usage hints, and accessibility
				metadata that LLMs can consume via MCP.
			</p>

			<DocSection id="what" title="What is Hex Core?">
				<p className="text-sm leading-6">
					Unlike traditional component libraries, Hex Core is <strong>not</strong> a
					package you install as a dependency. Instead, you pick the components you
					need and copy them into your project. This gives you full ownership and
					control over the code — no vendor lock-in, no version conflicts.
				</p>
			</DocSection>

			<DocSection id="ai-native" title="AI-Native">
				<p className="text-sm leading-6">
					Every component includes a <InlineCode>.schema.ts</InlineCode> file with
					structured metadata:
				</p>
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>
						<strong>Props, variants, slots</strong> — machine-readable interface
					</li>
					<li>
						<strong>AI hints</strong> — when to use, when not to use, common mistakes
					</li>
					<li>
						<strong>Accessibility notes</strong> — what ARIA attributes to include
					</li>
					<li>
						<strong>Token budget</strong> — estimated LLM token cost
					</li>
					<li>
						<strong>Examples</strong> — code snippets for common patterns
					</li>
				</ul>
			</DocSection>

			<DocSection id="mcp" title="MCP Server">
				<p className="text-sm leading-6">
					Add the Hex Core MCP server to your Claude Code settings and discover components
					with natural language:
				</p>
				<CodeBlock label="json" code={MCP_SETTINGS} />
				<p className="text-sm leading-6">
					Then ask:{" "}
					<em>
						&ldquo;Search hex-core for a button component and add it to my project.&rdquo;
					</em>
				</p>
			</DocSection>

			<DocSection id="tech" title="Tech Stack">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>
						<strong>Radix UI</strong> — accessible headless primitives
					</li>
					<li>
						<strong>Tailwind CSS</strong> — utility-first styling
					</li>
					<li>
						<strong>CVA</strong> — class-variance-authority for variant management
					</li>
					<li>
						<strong>TypeScript</strong> — strict types throughout
					</li>
				</ul>
			</DocSection>
		</DocsPage>
	);
}
