import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";
import { INSTALL_COMMAND_LABEL, installCommand } from "../../../lib/registry";
import { HEX_REGISTRY_NAMESPACE, HEX_REGISTRY_TEMPLATE } from "../../../lib/site";

export const metadata = {
	title: "Installation",
	description: "How to add Hex Core to an existing Next.js or Vite project.",
};

const SECTIONS = [
	{ id: "requirements", title: "Requirements" },
	{ id: "cli", title: "CLI install" },
	{ id: "shadcn", title: "shadcn CLI" },
	{ id: "manual", title: "Manual copy" },
	{ id: "tailwind", title: "Tailwind setup" },
	{ id: "whats-next", title: "What’s next" },
];

const SHADCN_REGISTRIES_SNIPPET = `{
  "registries": {
    "${HEX_REGISTRY_NAMESPACE}": "${HEX_REGISTRY_TEMPLATE}"
  }
}`;

const TAILWIND_SNIPPET = `@theme {
  --color-background: hsl(210 20% 98%);
  --color-foreground: hsl(222 30% 11%);
  --color-primary: hsl(222 25% 18%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-border: hsl(222 8% 90%);
  --color-ring: hsl(222 25% 18%);
}`;

/** Installation guide — requirements, CLI, manual, Tailwind config. */
export default function InstallationPage() {
	return (
		<DocsPage
			pathname="/docs/installation"
			title="Installation"
			description="How to add Hex Core components to your project in under a minute."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/installation/page.tsx"
		>
			<DocSection id="requirements" title="Requirements">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>Node.js 20.9 or newer</li>
					<li>React 19</li>
					<li>Tailwind CSS v4</li>
					<li>pnpm / npm / bun — any package manager works</li>
				</ul>
			</DocSection>

			<DocSection id="cli" title="CLI install">
				<p className="text-sm leading-6">
					The <InlineCode>@hex-core/cli</InlineCode> package copies a component and its
					dependencies into your project. No npm runtime dependency is added.
				</p>
				<CodeBlock label={INSTALL_COMMAND_LABEL} code={installCommand("button")} />
				<p className="text-sm leading-6">
					Replace <InlineCode>button</InlineCode> with any slug from the{" "}
					<Link className="underline underline-offset-2 hover:text-foreground" href="/docs">
						components index
					</Link>
					. The CLI resolves inter-component dependencies automatically (e.g. adding{" "}
					<InlineCode>combobox</InlineCode> also pulls in <InlineCode>popover</InlineCode>{" "}
					and <InlineCode>command</InlineCode>).
				</p>
			</DocSection>

			<DocSection id="shadcn" title="shadcn CLI">
				<p className="text-sm leading-6">
					Already using the shadcn CLI? Hex is a namespaced registry — declare it once in
					your <InlineCode>components.json</InlineCode>:
				</p>
				<CodeBlock label="components.json" code={SHADCN_REGISTRIES_SNIPPET} />
				<p className="text-sm leading-6">
					then install any catalog slug through the tool you already run:
				</p>
				<CodeBlock label="shadcn" code={`npx shadcn@latest add ${HEX_REGISTRY_NAMESPACE}/button`} />
				<p className="text-sm leading-6">
					Items are served in shadcn registry-item format with the machine-readable{" "}
					<InlineCode>ai</InlineCode> block included, so agents reading your project keep the
					intent metadata. The catalog index is at <InlineCode>/registry.json</InlineCode>.
				</p>
			</DocSection>

			<DocSection id="manual" title="Manual copy">
				<p className="text-sm leading-6">
					Prefer to copy code by hand? Open any component page, click the{" "}
					<strong>Code</strong> tab, and paste the contents into{" "}
					<InlineCode>src/components/ui/&lt;slug&gt;.tsx</InlineCode>. Install the listed
					peer dependencies (Radix primitives, CVA) once per project.
				</p>
			</DocSection>

			<DocSection id="tailwind" title="Tailwind setup">
				<p className="text-sm leading-6">
					Hex Core uses HSL design tokens defined as Tailwind theme vars. Add this block to
					your <InlineCode>globals.css</InlineCode> — you can freely override any token.
				</p>
				<CodeBlock label="css" code={TAILWIND_SNIPPET} />
				<p className="text-sm leading-6">
					See{" "}
					<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/theming">
						Theming
					</Link>{" "}
					for the full token list and dark-mode palette.
				</p>
			</DocSection>

			<DocSection id="whats-next" title="What’s next">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>
						<Link
							className="underline underline-offset-2 hover:text-foreground"
							href="/docs/components/button"
						>
							Add your first component
						</Link>
					</li>
					<li>
						<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/mcp">
							Wire the MCP server
						</Link>{" "}
						for Claude Code integration
					</li>
					<li>
						<Link
							className="underline underline-offset-2 hover:text-foreground"
							href="/docs/theming"
						>
							Customize the theme
						</Link>
					</li>
				</ul>
			</DocSection>
		</DocsPage>
	);
}
