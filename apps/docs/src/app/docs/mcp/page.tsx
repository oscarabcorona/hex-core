import { MCP_CLIENTS } from "@hex-core/mcp/clients";
import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "MCP Server",
	description:
		"Wire the Hex Core MCP server into Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, or Zed for natural-language component discovery.",
};

const SECTIONS = [
	{ id: "why", title: "Why MCP?" },
	...MCP_CLIENTS.map((c) => ({ id: c.id, title: c.label })),
	{ id: "tools", title: "Available tools" },
	{ id: "prompts", title: "Example prompts" },
];

/** MCP integration guide — client configs, available tools, prompt recipes. */
export default function McpPage() {
	return (
		<DocsPage
			pathname="/docs/mcp"
			title="MCP Server"
			description="The Hex Core MCP server exposes the component registry as structured tool calls. Install once and let any MCP-capable agent — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — pick the right primitive."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/mcp/page.tsx"
		>
			<DocSection id="why" title="Why MCP?">
				<p className="text-sm leading-6">
					Traditional docs are text — the agent reads hundreds of tokens to find a
					component. MCP gives the agent a <em>structured</em> catalog: search by
					behavior, read typed schemas, and install components as a tool call. The
					<InlineCode>.schema.ts</InlineCode> metadata is the contract.
				</p>
				<p className="text-sm leading-6">
					The server speaks standard MCP over stdio — the same protocol all 6
					supported clients use. A protocol-level contract test (using the
					official <InlineCode>@modelcontextprotocol/sdk</InlineCode> Client) runs
					on every push, so the same wiring works everywhere.
				</p>
			</DocSection>

			{MCP_CLIENTS.map((client) => (
				<DocSection key={client.id} id={client.id} title={client.label}>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<span>
							Config:{" "}
							<InlineCode>{client.configPath}</InlineCode>
						</span>
						{client.schemaStability === "verified-volatile" &&
						client.verifiedOn ? (
							<span className="rounded-full border px-2 py-0.5">
								Verified {client.verifiedOn}
							</span>
						) : null}
						<a
							href={client.docsUrl}
							className="underline underline-offset-2 hover:text-foreground"
							target="_blank"
							rel="noreferrer"
						>
							Upstream docs ↗
						</a>
					</div>
					{client.configPathNote ? (
						<p className="text-sm leading-6 text-muted-foreground">
							{client.configPathNote}
						</p>
					) : null}
					<CodeBlock label={client.format} code={client.snippet} />
					{client.quirks.length > 0 ? (
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							{client.quirks.map((quirk) => (
								<li key={quirk}>{quirk}</li>
							))}
						</ul>
					) : null}
				</DocSection>
			))}

			<DocSection id="tools" title="Available tools">
				<ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
					<li>
						<strong>search_components</strong> — fuzzy search over name, description,
						tags, and AI hints
					</li>
					<li>
						<strong>get_component</strong> — full registry item (props, variants, AI
						hints, examples, source) for a slug
					</li>
					<li>
						<strong>get_component_schema</strong> — schema only, no source — for agents
						reasoning about an already-installed component
					</li>
					<li>
						<strong>list_themes</strong> — available theme presets. In hosts that support
						MCP Apps (Claude, ChatGPT, VS Code), this also renders an interactive theme
						browser with palette previews — pick a theme visually and hand the choice
						back to the conversation
					</li>
					<li>
						<strong>get_theme</strong> — full token set for a theme (css / json /
						tailwind)
					</li>
					<li>
						<strong>scaffold_project</strong> — init + starter components in one call
					</li>
					<li>
						<strong>customize_component</strong> — generate a themed variant
					</li>
					<li>
						<strong>list_recipes</strong> — catalog of spec-driven blueprints (auth
						form, settings page, …)
					</li>
					<li>
						<strong>get_recipe</strong> — ordered install steps, union of peer deps,
						post-install checklist
					</li>
					<li>
						<strong>resolve_spec</strong> — deterministic brief → ranked component +
						recipe shortlist
					</li>
					<li>
						<strong>verify_checklist</strong> — cross-check installed components
						against the registry&rsquo;s internal-dependency graph
					</li>
					<li>
						<strong>emit_app_context</strong> — synthesize a paste-into-LLM markdown
						payload describing the chosen stack
					</li>
					<li>
						<strong>search_compositions</strong> — find component examples by composition tags (destructive, confirm, form-action, …)
					</li>
					<li>
						<strong>describe_intent</strong> — intent-first payload: per-variant useWhen, structured anti-patterns, and token intents — call before generating JSX
					</li>
					<li>
						<strong>search_themes</strong> — search the theme catalog by category, tags, or free-text
					</li>
					<li>
						<strong>emit_figma_tokens</strong> — render a theme as a Figma Variables REST POST payload
					</li>
					<li>
						<strong>map_application</strong> — whole-app brief → typed screens, a requires-closure install manifest, and anti-pattern warnings
					</li>
					<li>
						<strong>query_graph</strong> — query the catalog knowledge graph — explain, neighbors, path, affected
					</li>
					<li>
						<strong>scaffold_poc</strong> — generate a standalone runnable Next.js demo app from a brief, map, or page recipe, with a panel to demo every frame by role and data state
					</li>
				</ul>
				<p className="text-sm leading-6">
					See{" "}
					<Link className="underline underline-offset-2 hover:text-foreground" href="/docs/spec-driven">
						Spec-driven development
					</Link>{" "}
					for how the last four compose.
				</p>
			</DocSection>

			<DocSection id="prompts" title="Example prompts">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					<li>&ldquo;Find a hex-core component for a confirmation dialog and add it.&rdquo;</li>
					<li>
						&ldquo;Search hex-core for a data table primitive and wire it to my users
						list.&rdquo;
					</li>
					<li>&ldquo;What hex-core components should I use for a settings page?&rdquo;</li>
				</ul>
			</DocSection>
		</DocsPage>
	);
}
