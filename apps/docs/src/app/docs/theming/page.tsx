import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";
import {
	COLOR_TOKENS_SNIPPET,
	DARK_SNIPPET,
	LAYOUT_TOKENS_SNIPPET,
	RAMP_SNIPPET,
} from "../../../lib/theme-snippets";

export const metadata = {
	title: "Theming",
	description:
		"HSL color tokens, spacing / layout / motion tokens, dark mode, and the hex theme CLI for one-command customization.",
};

const SECTIONS = [
	{ id: "philosophy", title: "Philosophy" },
	{ id: "cli", title: "hex theme CLI" },
	{ id: "color-tokens", title: "Color tokens" },
	{ id: "layout-tokens", title: "Layout + motion tokens" },
	{ id: "dark-mode", title: "Dark mode" },
	{ id: "custom-palette", title: "Custom palette" },
	{ id: "typography", title: "Typography scale" },
	{ id: "llm", title: "Hand tokens to an LLM" },
];

const CUSTOM_PALETTE_SNIPPET = `/* Violet-tinted primary */
:root {
  --primary: 258 90% 66%;
  --primary-foreground: 0 0% 100%;
  --ring: 258 90% 66%;
}
.dark {
  --primary: 258 90% 76%;
  --primary-foreground: 240 10% 3.9%;
}`;

const CLI_INIT_SNIPPET = `# Browse the full catalog (3 first-party + 71 brand presets, grouped by category)
pnpm dlx @hex-core/cli theme list
pnpm dlx @hex-core/cli theme list --category fintech

# Scaffold a globals.css from a preset (any of 70+ slugs)
pnpm dlx @hex-core/cli theme init --preset midnight --out app/globals.css
pnpm dlx @hex-core/cli theme init --preset tesla --out app/globals.css
pnpm dlx @hex-core/cli theme init --preset stripe --out app/globals.css

# Or get the token set as flat JSON (for tooling / LLM context)
pnpm dlx @hex-core/cli theme init --preset linear --out tokens.json --format json`;

const CLI_EDIT_SNIPPET = `# Override one token across both :root and .dark
pnpm dlx @hex-core/cli theme edit --file app/globals.css --token "primary=258 90% 66%"

# Multiple tokens at once, scoped to light mode
pnpm dlx @hex-core/cli theme edit \\
  --file app/globals.css \\
  --mode light \\
  --token "primary=258 90% 66%" \\
  --token "ring=258 90% 66%"`;

const LLM_CONTEXT_SNIPPET = `# Hex Core — your theme

## globals.css
<paste the globals.css you scaffolded with \`hex theme init\`>

## Context prompt
You are building a Next.js 16 app using @hex-core components.
Use these exact tokens above — do not deviate.
Components in scope: button, card, input, label, dialog.

Now: <your actual ask, e.g. "build me a pricing page with three tiers">.`;

/** Theming guide — tokens, CLI, dark mode, LLM handoff. */
export default function ThemingPage() {
	return (
		<DocsPage
			pathname="/docs/theming"
			title="Theming"
			description="Hex Core ships a full token surface — color, spacing, control-heights, typography, motion — exposed as CSS variables. Override one token, every component reflows. Or hand the whole block to an LLM."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/theming/page.tsx"
		>
			<DocSection id="philosophy" title="Philosophy">
				<p className="text-sm leading-6">
					Every Hex Core component reads its padding, height, gap, color, radius, and motion
					from CSS variables. The tokens are the single source of truth — override one and the
					whole library reflows. This is what makes a Hex Core app <em>not</em> look like every
					other shadcn app out of the box.
				</p>
				<p className="text-sm leading-6">
					The token surface is grouped by purpose:{" "}
					<strong>color</strong> (background, primary, destructive, …),{" "}
					<strong>layout</strong> (space-*, gap-*, control-height-*),{" "}
					<strong>typography</strong> (text-*),{" "}
					<strong>motion</strong> (duration-*), and{" "}
					<strong>radius</strong>. Fallback values on every component match Tailwind
					defaults — consumers who don&apos;t load a theme see zero visual change.
				</p>
			</DocSection>

			<DocSection id="cli" title="hex theme CLI">
				<p className="text-sm leading-6">
					The fastest path: scaffold a starter theme file from one of the{" "}
					<strong>74 presets</strong> — <InlineCode>default</InlineCode>,{" "}
					<InlineCode>midnight</InlineCode>, <InlineCode>ember</InlineCode> (first-party),{" "}
					plus 71 brand-derived presets (<InlineCode>tesla</InlineCode>,{" "}
					<InlineCode>stripe</InlineCode>, <InlineCode>linear</InlineCode>,{" "}
					<InlineCode>notion</InlineCode>, <InlineCode>apple</InlineCode>, etc.) sourced
					from{" "}
					<a
						href="https://github.com/voltagent/awesome-design-md"
						className="underline underline-offset-2"
					>
						voltagent/awesome-design-md
					</a>{" "}
					(MIT-licensed). Each brand preset can lazy-load the original markdown design
					brief via <InlineCode>loadThemeBrief(slug)</InlineCode>, so AI agents reading
					the LLM-context payload get typography + motion + composition guidance
					alongside the tokens.
				</p>
				<aside className="mt-4 rounded-md border border-border bg-muted/40 p-4 text-xs leading-5 text-muted-foreground">
					<strong className="text-foreground">Trademark notice.</strong> Brand
					presets are <em>style references inspired by publicly visible design
					systems</em>, not endorsements. Names like Tesla, Stripe, Apple, Notion,
					Linear, and every other brand referenced are trademarks of their
					respective owners. Hex Core is not affiliated with, endorsed by, or
					sponsored by any of these companies. Each preset file carries the same
					notice in its header comment, and the source MIT license is preserved
					at <InlineCode>LICENSES/voltagent-MIT.md</InlineCode> in the repo.
				</aside>
				<h4 className="text-sm font-semibold mt-4">Initialize a theme file</h4>
				<CodeBlock label="bash" code={CLI_INIT_SNIPPET} />
				<p className="text-sm leading-6 mt-4">
					<InlineCode>init</InlineCode> writes the full token block — colors + spacing +
					control-heights + typography + motion — for both <InlineCode>:root</InlineCode>{" "}
					(light) and <InlineCode>.dark</InlineCode>. Pass <InlineCode>--overwrite</InlineCode>{" "}
					to replace an existing file.
				</p>
				<h4 className="text-sm font-semibold mt-4">Override individual tokens</h4>
				<CodeBlock label="bash" code={CLI_EDIT_SNIPPET} />
				<p className="text-sm leading-6 mt-4">
					<InlineCode>edit</InlineCode> rewrites the specific CSS variable declaration and
					leaves the rest of the file untouched. By default it updates both{" "}
					<InlineCode>:root</InlineCode> and <InlineCode>.dark</InlineCode>; use{" "}
					<InlineCode>--mode light</InlineCode> or <InlineCode>--mode dark</InlineCode> to
					scope.
				</p>
			</DocSection>

			<DocSection id="color-tokens" title="Color tokens">
				<p className="text-sm leading-6">
					Colors are authored in HSL so that opacity modifiers and contrast tweaks stay
					predictable, and they come in two tiers. The <strong>ramp</strong> holds every
					literal value exactly once:
				</p>
				<CodeBlock label="css" code={RAMP_SNIPPET} />
				<p className="text-sm leading-6">
					<strong>Semantic tokens</strong> then point at a ramp entry rather than repeating
					its value. <InlineCode>--primary</InlineCode> and <InlineCode>--ring</InlineCode>{" "}
					are the same graphite, so re-tinting the theme is one edit — override{" "}
					<InlineCode>--slate-900</InlineCode> in your own stylesheet and everything drawn
					from it follows. Every semantic token has a foreground pair —{" "}
					<InlineCode>--primary</InlineCode> /{" "}
					<InlineCode>--primary-foreground</InlineCode> — so components render correct
					contrast without introspecting the value.
				</p>
				<CodeBlock label="css" code={COLOR_TOKENS_SNIPPET} />
			</DocSection>

			<DocSection id="layout-tokens" title="Layout + motion tokens">
				<p className="text-sm leading-6">
					Spacing, gap, and control-height tokens are what let an override propagate across
					components. A Button&apos;s <InlineCode>px-4</InlineCode> reads{" "}
					<InlineCode>var(--space-4)</InlineCode>; change the token, every affected component
					snaps.
				</p>
				<CodeBlock label="css" code={LAYOUT_TOKENS_SNIPPET} />
			</DocSection>

			<DocSection id="dark-mode" title="Dark mode">
				<p className="text-sm leading-6">
					Dark mode is driven by <InlineCode>next-themes</InlineCode> toggling a{" "}
					<InlineCode>.dark</InlineCode> class on <InlineCode>&lt;html&gt;</InlineCode>.
					Dark mode re-points the semantic layer at different ramp entries — it never
					introduces new token names, so a component that writes{" "}
					<InlineCode>bg-primary</InlineCode> cannot break it. Only tokens that actually
					differ between modes need re-declaring; the ramp itself and the layout / spacing /
					motion tokens are shared.
				</p>
				<CodeBlock label="css" code={DARK_SNIPPET} />
			</DocSection>

			<DocSection id="custom-palette" title="Custom palette">
				<p className="text-sm leading-6">
					Brand the library by swapping the neutral palette for your own hues. Keep the token
					names — all components read these semantics.
				</p>
				<CodeBlock label="css" code={CUSTOM_PALETTE_SNIPPET} />
			</DocSection>

			<DocSection id="typography" title="Typography scale">
				<p className="text-sm leading-6">
					The type scale flows through <InlineCode>--text-xs</InlineCode> through{" "}
					<InlineCode>--text-3xl</InlineCode> as tokens. Wire them into Tailwind&apos;s{" "}
					<InlineCode>theme.extend.fontSize</InlineCode> via{" "}
					<InlineCode>themeToTailwindConfig(theme)</InlineCode> from{" "}
					<InlineCode>@hex-core/tokens</InlineCode> and all Tailwind <InlineCode>text-*</InlineCode>{" "}
					utilities resolve to your token values automatically.
				</p>
			</DocSection>

			<DocSection id="llm" title="Hand tokens to an LLM">
				<p className="text-sm leading-6">
					Because every component reads tokens, a full theme fits in a ~1 KB block. Paste it
					at the start of a conversation with Claude Code / Cursor / ChatGPT and the LLM has
					everything it needs to build a theme-perfect app on the first try — no &ldquo;let me
					iterate on the colors&rdquo; round trips.
				</p>
				<CodeBlock label="markdown" code={LLM_CONTEXT_SNIPPET} />
				<p className="text-sm leading-6 mt-4">
					A richer payload (install commands, Tailwind config extension, context prompt
					prefix) is available via the Hex Studio &ldquo;Copy for LLM&rdquo; button in the
					premium platform. The OS MCP tool <InlineCode>emit_app_context</InlineCode>{" "}
					returns the same payload for agents that want it programmatically.
				</p>
			</DocSection>
		</DocsPage>
	);
}
