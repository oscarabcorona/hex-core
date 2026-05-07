import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "Skills",
	description:
		"Agent skills for Hex Core — nine SKILL.md packs that give Claude Code prose context alongside the 11 MCP tools.",
};

const SECTIONS = [
	{ id: "why", title: "Why skills" },
	{ id: "install", title: "Install" },
	{ id: "shipped", title: "The nine shipped" },
	{ id: "authoring", title: "Authoring your own" },
];

const INSTALL_CMD = `# One command, per project
npx @hex-core/cli skills install

# Or point at a custom target
npx @hex-core/cli skills install --target ./my-skills`;

const SKILLS = [
	{
		slug: "hex-core-overview",
		title: "Overview",
		summary: "Primer + mental model + when to reach for hex-core vs shadcn.",
	},
	{
		slug: "hex-core-mcp-tools",
		title: "MCP tools decision tree",
		summary: "Which of the 11 tools to call for any given intent.",
	},
	{
		slug: "hex-core-recipes-workflow",
		title: "Recipes workflow",
		summary: "End-to-end brief → resolve → get_recipe → install → verify.",
	},
	{
		slug: "hex-core-theming",
		title: "Theming",
		summary: "HSL tokens, dark mode, customize_component, adding themes.",
	},
	{
		slug: "hex-core-cli",
		title: "CLI",
		summary: "hex init / add / list / recipe add / skills install with all flags.",
	},
	{
		slug: "hex-core-accessibility",
		title: "Accessibility",
		summary: "Radix defaults, icon-only aria-label rule, keyboard maps.",
	},
	{
		slug: "hex-core-anti-patterns",
		title: "Anti-patterns",
		summary: "React 19 / Next 16 hygiene + top compositional mistakes.",
	},
	{
		slug: "hex-core-registry-authoring",
		title: "Registry authoring",
		summary: "Writing your own components, recipes, or third-party registry.",
	},
	{
		slug: "hex-core-motion",
		title: "Motion",
		summary:
			"Decision tree for @hex-core/motion — Motion vs MotionPro vs Timeline + token easings.",
	},
];

/** Skills page — what agent skills are, the 9 shipped, install + author. */
export default function SkillsPage() {
	return (
		<DocsPage
			pathname="/docs/skills"
			title="Skills"
			description="Prose context packs for Claude Code. Nine SKILL.md files that complement the 11 structured MCP tools."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/skills/page.tsx"
		>
			<DocSection id="why" title="Why skills">
				<p className="text-sm leading-6">
					The MCP server returns structured data — props, variants, ranked recipes,
					checklist items. Skills give the agent the <em>prose reasoning</em> that lives
					alongside: when to reach for a dialog vs a sheet, why{" "}
					<InlineCode>Switch</InlineCode> beats <InlineCode>Checkbox</InlineCode> for
					instant settings, what a good recipe-selection heuristic looks like. Agents
					load skills lazily based on the trigger keywords in their frontmatter, so the
					nine packs cost ~900 tokens of system prompt total, not 9 × 5k.
				</p>
				<p className="text-sm leading-6">
					Hex Core follows{" "}
					<a
						className="underline underline-offset-2 hover:text-foreground"
						href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview"
						target="_blank"
						rel="noopener noreferrer"
					>
						Anthropic&rsquo;s Agent Skills format
					</a>{" "}
					verbatim: one directory per skill, a <InlineCode>SKILL.md</InlineCode> at the
					root with YAML frontmatter, progressive disclosure via sibling files.
				</p>
			</DocSection>

			<DocSection id="install" title="Install">
				<p className="text-sm leading-6">
					The CLI copies the nine bundled skills into{" "}
					<InlineCode>.claude/skills/</InlineCode> in your project (or{" "}
					<InlineCode>--target</InlineCode> if you want a custom location).
				</p>
				<CodeBlock label="bash" code={INSTALL_CMD} />
				<p className="text-sm leading-6">
					Re-running is idempotent — existing directories are skipped unless you pass{" "}
					<InlineCode>--overwrite</InlineCode>. Commit the installed skills to your repo
					so teammates&rsquo; agents pick them up automatically.
				</p>
			</DocSection>

			<DocSection id="shipped" title="The nine shipped">
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					{SKILLS.map((s) => (
						<li key={s.slug}>
							<strong>{s.title}</strong> (<InlineCode>{s.slug}</InlineCode>) — {s.summary}
						</li>
					))}
				</ul>
				<p className="text-sm leading-6">
					Full source at{" "}
					<a
						className="underline underline-offset-2 hover:text-foreground"
						href="https://github.com/oscarabcorona/hex-core/tree/main/skills"
						target="_blank"
						rel="noopener noreferrer"
					>
						github.com/oscarabcorona/hex-core/tree/main/skills
					</a>
					.
				</p>
			</DocSection>

			<DocSection id="authoring" title="Authoring your own">
				<p className="text-sm leading-6">
					A skill is a directory with <InlineCode>SKILL.md</InlineCode>. Frontmatter has
					two fields: <InlineCode>name</InlineCode> (kebab-case) and{" "}
					<InlineCode>description</InlineCode> (one sentence, front-load trigger
					keywords). Body is markdown under ~5k tokens. Deeper files —{" "}
					<InlineCode>examples/*.md</InlineCode>, <InlineCode>scripts/</InlineCode>,{" "}
					<InlineCode>resources/</InlineCode> — load on demand via progressive
					disclosure.
				</p>
				<p className="text-sm leading-6">
					For authoring recipes, components, or an entire third-party registry, see{" "}
					<Link
						className="underline underline-offset-2 hover:text-foreground"
						href="/docs/spec-driven"
					>
						Spec-driven development
					</Link>{" "}
					and the <InlineCode>hex-core-registry-authoring</InlineCode> skill.
				</p>
			</DocSection>
		</DocsPage>
	);
}
