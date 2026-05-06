import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "Spec-driven",
	description:
		"Turn a brief or spec.md into a checklist-driven component build. Four MCP tools, six recipes, no runtime service.",
};

const SECTIONS = [
	{ id: "why", title: "Why spec-driven" },
	{ id: "tools", title: "The four MCP tools" },
	{ id: "recipes", title: "Recipes" },
	{ id: "cli", title: "CLI shortcut" },
	{ id: "how", title: "How an agent uses this" },
];

const RESOLVE_EXAMPLE = `// MCP tool call
{
  "name": "resolve_spec",
  "arguments": { "brief": "build me a settings page with notifications toggle" }
}

// → ranked component + recipe matches
{
  "recipes": [
    { "slug": "settings-page", "score": 20, "matchReason": ["recipe slug contains \\"settings\\""] }
  ],
  "components": [
    { "component": "switch", "score": 6, "whenToUse": "Use for settings that take effect immediately..." }
  ]
}`;

const RECIPE_CLI = `# Discover recipes
hex recipe list

# Install every component in a recipe + print its checklist
hex recipe add settings-page`;

const RECIPES = [
	{ slug: "auth-form", title: "Auth form", summary: "Login / signup with validation + error surface." },
	{ slug: "settings-page", title: "Settings page", summary: "Grouped cards + form fields + per-section save." },
	{ slug: "pricing-table", title: "Pricing table", summary: "Three-tier grid with highlighted plan." },
	{ slug: "data-table-view", title: "Data table view", summary: "Search + paginated table + row actions." },
	{ slug: "confirm-destructive", title: "Destructive confirm", summary: "Typed-name confirmation flow." },
	{ slug: "command-palette", title: "Command palette", summary: "Cmd-K dialog with grouped actions." },
];

/** Spec-driven development — positioning page explaining recipes + MCP tools. */
export default function SpecDrivenPage() {
	return (
		<DocsPage
			pathname="/docs/spec-driven"
			title="Spec-driven development"
			description="Turn a brief or a spec.md section into a checklist-driven build. Four MCP tools, six recipes, no runtime service."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/spec-driven/page.tsx"
		>
			<DocSection id="why" title="Why spec-driven">
				<p className="text-sm leading-6">
					Agents are good at writing React once they know <em>which</em> components to
					reach for. GitHub Spec-Kit, AWS Kiro, and Claude Code plan mode all produce{" "}
					<InlineCode>spec.md</InlineCode> / <InlineCode>tasks.md</InlineCode> artifacts
					— none of them know the Hex Core catalog. Hex Core closes that loop with recipes,
					a resolver, and a verifier. No server. No runtime. Same copy-the-code
					distribution.
				</p>
			</DocSection>

			<DocSection id="tools" title="The four MCP tools">
				<p className="text-sm leading-6">
					These compose with the existing 7 tools (<InlineCode>search_components</InlineCode>,{" "}
					<InlineCode>get_component</InlineCode>, …) — the agent chooses the one that
					matches its intent.
				</p>
				<ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
					<li>
						<strong>resolve_spec</strong> — deterministic keyword + tag matching against
						every component&rsquo;s schema. Give it a brief, get a ranked shortlist with{" "}
						<InlineCode>whenToUse</InlineCode> / <InlineCode>whenNotToUse</InlineCode>{" "}
						reasons. No LLM call server-side.
					</li>
					<li>
						<strong>list_recipes</strong> — catalog of every recipe: slug, title,
						component list, token budget.
					</li>
					<li>
						<strong>get_recipe</strong> — full recipe: ordered steps, union of npm
						peer deps, post-install checklist (author-written plus items auto-derived
						from each step&rsquo;s <InlineCode>commonMistakes</InlineCode> and{" "}
						<InlineCode>accessibilityNotes</InlineCode>).
					</li>
					<li>
						<strong>verify_checklist</strong> — cross-check what the agent claims it
						installed against the registry&rsquo;s internal-dependency graph. Flags
						missing deps (<InlineCode>combobox</InlineCode> without{" "}
						<InlineCode>popover</InlineCode> + <InlineCode>command</InlineCode>) and
						returns the recipe&rsquo;s checklist for the agent to walk.
					</li>
				</ul>
				<CodeBlock label="json" code={RESOLVE_EXAMPLE} />
			</DocSection>

			<DocSection id="recipes" title="Recipes">
				<p className="text-sm leading-6">
					Six recipes ship in-tree. Each is a static JSON file in{" "}
					<InlineCode>registry/recipes/</InlineCode> with ordered install steps and a
					post-install checklist. Authoring a new recipe is a single file under{" "}
					<InlineCode>packages/registry/src/recipes/&lt;slug&gt;.recipe.ts</InlineCode>;
					the build step compiles it and merges checklist items derived from each
					component&rsquo;s AI hints.
				</p>
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					{RECIPES.map((r) => (
						<li key={r.slug}>
							<strong>{r.title}</strong> (<InlineCode>{r.slug}</InlineCode>) —{" "}
							{r.summary}
						</li>
					))}
				</ul>
			</DocSection>

			<DocSection id="cli" title="CLI shortcut">
				<p className="text-sm leading-6">
					If you&rsquo;re driving Hex Core from a shell instead of an MCP client, the CLI
					exposes the same surface:
				</p>
				<CodeBlock label="bash" code={RECIPE_CLI} />
				<p className="text-sm leading-6">
					<InlineCode>hex recipe add &lt;slug&gt;</InlineCode> runs{" "}
					<InlineCode>hex add</InlineCode> for every step in order, then prints the
					checklist as plain markdown the agent can paste into a PR body.
				</p>
			</DocSection>

			<DocSection id="how" title="How an agent uses this">
				<ol className="list-decimal space-y-2 pl-6 text-sm text-muted-foreground">
					<li>
						The human writes a brief (or Spec-Kit produces a{" "}
						<InlineCode>spec.md</InlineCode>).
					</li>
					<li>
						Agent calls <InlineCode>resolve_spec</InlineCode>; sees a recipe ranks
						first.
					</li>
					<li>
						Agent calls <InlineCode>get_recipe</InlineCode> for the full step list +
						checklist.
					</li>
					<li>
						Agent installs the components (via MCP <InlineCode>get_component</InlineCode>{" "}
						or <InlineCode>hex add</InlineCode>).
					</li>
					<li>
						Agent calls <InlineCode>verify_checklist</InlineCode> to confirm nothing is
						missing, then walks the checklist.
					</li>
				</ol>
				<p className="text-sm leading-6">
					See the{" "}
					<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/mcp">
						MCP Server
					</Link>{" "}
					page for wiring into Claude Code or Cursor.
				</p>
			</DocSection>
		</DocsPage>
	);
}
