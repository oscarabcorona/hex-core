import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "CLI",
	description:
		"The hex CLI reference — install components, map whole applications onto the catalog, scaffold runnable POC apps, and query the knowledge graph.",
};

const SECTIONS = [
	{ id: "overview", title: "Overview" },
	{ id: "agent-workflow", title: "The agent-builder workflow" },
	{ id: "map", title: "hex map" },
	{ id: "poc", title: "hex poc" },
	{ id: "graph", title: "hex graph" },
	{ id: "everyday", title: "Everyday commands" },
	{ id: "migrate", title: "hex migrate" },
];

const WORKFLOW_SNIPPET = `# 1. Map — deterministic, reviewable
npx @hex-core/cli map "a SaaS site with a landing page and pricing page" --out hex.map.json

# 2. Review — edit hex.map.json: drop screens, act on warnings

# 3. Build — into an existing app, or as a standalone demo
npx @hex-core/cli add --from hex.map.json
npx @hex-core/cli poc --from hex.map.json --dir demo --yes

# 4. Verify
npx @hex-core/cli doctor`;

const MAP_SNIPPET = `hex map "a SaaS site with a landing page and pricing page, plus an admin dashboard with a data table"

# Hex map — 3 screens from brief
#   landing            page    landing-page     (score 26, high)
#   pricing            page    pricing-page     (score 22, high)
#   data-table-view    recipe  data-table-view  (score 30, high)
#   Install: 18 components — accordion, badge, button, data-table, ...
#   Warn: button — Using <Button> to expand/collapse a content section (instead use accordion)`;

const POC_SNIPPET = `hex poc --from hex.map.json --dir demo --yes
cd demo && pnpm install && pnpm dev
# → /            index linking every mapped screen
# → /landing     generated from the landing-page recipe
# → /pricing     generated from the pricing-page recipe`;

const GRAPH_SNIPPET = `hex graph explain marketing-hero
#   composes:  ← landing-page (section hero, primary)  ← pricing-page  ← about-page
#   related:   → badge  → button  → marketing-cta

hex graph affected button          # reverse blast radius
hex graph neighbors card --relation requires
hex graph path button card         # shortest connection`;

/** CLI reference — the agent-builder workflow plus every hex command. */
export default function CliPage() {
	return (
		<DocsPage
			pathname="/docs/cli"
			title="CLI"
			description="One binary for humans and agents: install components, map whole applications, scaffold runnable POCs, and query the catalog graph."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/cli/page.tsx"
		>
			<DocSection id="overview" title="Overview">
				<p className="text-sm leading-6">
					The <InlineCode>hex</InlineCode> binary ships with <InlineCode>@hex-core/cli</InlineCode>{" "}
					and works offline — the registry, recipes, and the catalog knowledge graph are bundled
					into the tarball. Run it via <InlineCode>npx @hex-core/cli</InlineCode> /{" "}
					<InlineCode>pnpm dlx @hex-core/cli</InlineCode>, or install globally.
				</p>
				<p className="text-sm leading-6">
					Every command is deterministic and file-based, which makes the CLI drivable by AI agents
					(Claude Code, Cursor, or any vibe-coding tool): the same inputs always produce the same
					plan, the plan lives in a diffable file, and the{" "}
					<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/mcp">
						MCP server
					</Link>{" "}
					exposes the same engine as tools (<InlineCode>map_application</InlineCode>,{" "}
					<InlineCode>query_graph</InlineCode>, <InlineCode>scaffold_poc</InlineCode>), so CLI and
					agent flows never disagree.
				</p>
			</DocSection>

			<DocSection id="agent-workflow" title="The agent-builder workflow">
				<p className="text-sm leading-6">
					The intended loop for &ldquo;build me an application&rdquo; — each step hands the next a
					reviewable artifact:
				</p>
				<CodeBlock label="bash" code={WORKFLOW_SNIPPET} />
				<p className="text-sm leading-6">
					<InlineCode>hex.map.json</InlineCode> is the hand-off artifact: it records every mapped
					screen, the full install closure, anti-pattern warnings, the merged post-install
					checklist, and token budgets. Agents edit it; both{" "}
					<InlineCode>hex add --from</InlineCode> and <InlineCode>hex poc --from</InlineCode>{" "}
					consume it.
				</p>
			</DocSection>

			<DocSection id="map" title="hex map">
				<p className="text-sm leading-6">
					Maps a freeform brief onto the catalog with no LLM involved: the brief is segmented, each
					segment is scored against components and recipes (word-boundary keyword + tag matching),
					and screens are typed as <InlineCode>page-recipe</InlineCode>,{" "}
					<InlineCode>recipe</InlineCode>, or <InlineCode>components</InlineCode>. The install list
					is the transitive <InlineCode>requires</InlineCode>-closure over the knowledge graph.
				</p>
				<CodeBlock label="bash" code={MAP_SNIPPET} />
				<p className="text-sm leading-6">
					Flags: <InlineCode>--spec &lt;file&gt;</InlineCode> reads the brief from a PRD file,{" "}
					<InlineCode>--out</InlineCode> writes <InlineCode>hex.map.json</InlineCode>,{" "}
					<InlineCode>--json</InlineCode> prints raw JSON for piping. Unmatched segments are
					reported, never guessed at.
				</p>
			</DocSection>

			<DocSection id="poc" title="hex poc">
				<p className="text-sm leading-6">
					Scaffolds a standalone runnable Next.js App Router demo — the &ldquo;demo side&rdquo; of a
					mapped application. Sources: a brief, a saved map (<InlineCode>--from</InlineCode>), or a
					single page recipe (<InlineCode>--recipe landing-page</InlineCode>). The app gets a
					theme-token <InlineCode>globals.css</InlineCode> (Tailwind v4), every mapped component
					copied in with rewritten imports and pinned dependency versions, and one generated route
					per page-recipe screen — assembled deterministically from each section block&rsquo;s
					schema example.
				</p>
				<CodeBlock label="bash" code={POC_SNIPPET} />
				<p className="text-sm leading-6">
					<InlineCode>--dry-run</InlineCode> prints the full planned file tree;{" "}
					<InlineCode>--yes</InlineCode> is required to write. Screens that aren&rsquo;t page
					recipes are installed as components and listed on the generated index page.
				</p>
			</DocSection>

			<DocSection id="graph" title="hex graph">
				<p className="text-sm leading-6">
					Queries the catalog knowledge graph shipped at <InlineCode>registry/graph.json</InlineCode>{" "}
					— items, recipes, and theme presets connected by <InlineCode>requires</InlineCode>,{" "}
					<InlineCode>composes</InlineCode>, <InlineCode>themes</InlineCode>,{" "}
					<InlineCode>related</InlineCode>, and <InlineCode>instead-use</InlineCode> edges, with
					curated communities and hub detection.
				</p>
				<CodeBlock label="bash" code={GRAPH_SNIPPET} />
				<p className="text-sm leading-6">
					Pass <InlineCode>--json</InlineCode> for the machine shape. Agents should query the graph
					instead of inventing component relationships.
				</p>
			</DocSection>

			<DocSection id="everyday" title="Everyday commands">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>
						<InlineCode>hex init</InlineCode> — scaffold <InlineCode>hex.config.json</InlineCode> +
						a Tailwind v3/v4-correct <InlineCode>globals.css</InlineCode>; <InlineCode>--mcp</InlineCode>{" "}
						wires the MCP server into your AI tool.
					</li>
					<li>
						<InlineCode>hex add &lt;slug&gt;</InlineCode> — copy components (transitive deps
						included); <InlineCode>--from</InlineCode> accepts a manifest or a{" "}
						<InlineCode>hex.map.json</InlineCode>; <InlineCode>--pack layout</InlineCode> installs
						the layout primitives.
					</li>
					<li>
						<InlineCode>hex list</InlineCode> / <InlineCode>hex recipe list</InlineCode> /{" "}
						<InlineCode>hex recipe add &lt;slug&gt;</InlineCode> — browse the catalog and install
						spec-driven recipes with their checklists.
					</li>
					<li>
						<InlineCode>hex theme …</InlineCode> — list 70+ presets, scaffold, edit, and apply token
						themes (see{" "}
						<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/theming">
							Theming
						</Link>
						).
					</li>
					<li>
						<InlineCode>hex doctor</InlineCode> — diagnose the install (config, Tailwind majors,
						peer deps, catalog graph); <InlineCode>--layout</InlineCode> scans for hand-rolled
						layout patterns.
					</li>
					<li>
						<InlineCode>hex skills install</InlineCode> — copy the bundled agent skills into{" "}
						<InlineCode>.claude/skills/</InlineCode> (see{" "}
						<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/skills">
							Skills
						</Link>
						).
					</li>
				</ul>
			</DocSection>

			<DocSection id="migrate" title="hex migrate">
				<p className="text-sm leading-6">
					Converts an existing Next.js / Vite / CRA / CRACO + shadcn/ui project to Hex Core
					in-place: detected components are replaced with their Hex equivalents (with{" "}
					<InlineCode>.shadcn.bak</InlineCode> backups), renames are mapped, unsupported slugs are
					skipped with reasons. <InlineCode>--dry-run</InlineCode> prints the full plan;{" "}
					<InlineCode>--only button,card</InlineCode> scopes it; run{" "}
					<InlineCode>hex doctor</InlineCode> afterwards to verify.
				</p>
			</DocSection>
		</DocsPage>
	);
}
