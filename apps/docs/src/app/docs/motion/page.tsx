import Link from "next/link";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "Motion",
	description:
		"UI animation primitives + a deterministic timeline composer. Zero-dep WAAPI core, optional motion@^11 adapter, and 11 registry items the MCP server can hand to agents.",
};

const SECTIONS = [
	{ id: "philosophy", title: "Philosophy" },
	{ id: "install", title: "Install" },
	{ id: "decision-tree", title: "Decision tree" },
	{ id: "tokens", title: "Easing + duration tokens" },
	{ id: "timeline", title: "The timeline composer" },
	{ id: "data-attr", title: "Non-React opt-in" },
	{ id: "adapter", title: "motion@^11 adapter" },
	{ id: "what-this-is-not", title: "What this is NOT" },
];

const INSTALL_CMD = `# CLI
npx @hex-core/cli add motion        # registers the npm peer + prints next-step hints

# Or directly via your package manager
pnpm add @hex-core/motion           # zero peer deps required for the core
pnpm add @hex-core/motion motion    # also installs the optional adapter`;

const DECLARATIVE_SNIPPET = `import { Motion, Presence } from "@hex-core/motion";

<Presence>
  {open && (
    <Motion.div
      key="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 200, easing: "standard" }}
    >
      Hello
    </Motion.div>
  )}
</Presence>`;

const IMPERATIVE_SNIPPET = `import { useAnimate } from "@hex-core/motion";

function Bounce() {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const onClick = async () => {
    await animate(scope.current, { x: 100 }, { duration: 200 }).finished;
    await animate(scope.current, { x: 0 },   { duration: 200, easing: "emphasized" }).finished;
  };

  return <div ref={scope} onClick={onClick}>Click me</div>;
}`;

const TIMELINE_SNIPPET = `import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

<Timeline duration={1400} autoPlay>
  <Scene start={0} duration={400}>
    <Clip target="#hero-title" from={{ opacity: 0, y: 8 }} to={{ opacity: 1, y: 0 }} />
  </Scene>
  <Scene start={500} duration={500}>
    <Clip target="#hero-cta" from={{ opacity: 0, y: 24 }} to={{ opacity: 1, y: 0 }} easing="emphasized" />
  </Scene>
</Timeline>`;

const DATA_ATTR_SNIPPET = `<div data-hex-motion="fade-in;dur:200;delay:50;easing:standard">Hello</div>
<div data-hex-motion="slide-up;dur:300;easing:emphasized">Hello</div>`;

const ADAPTER_SNIPPET = `import { loadMotionAdapter } from "@hex-core/motion/adapters/motion";

const { motion: MotionPro, AnimatePresence: PresencePro } = await loadMotionAdapter();

<MotionPro.div layout>{children}</MotionPro.div>`;

const TOKEN_TABLE: ReadonlyArray<readonly [string, string, string]> = [
	["linear", "linear", "Constant velocity. Use for sub-200ms micro-interactions only."],
	["standard", "cubic-bezier(0.2, 0, 0, 1)", "Default. Hover, mount, focus rings."],
	["emphasized", "cubic-bezier(0.3, 0, 0, 1)", "CTA reveal, primary state changes."],
	["decelerate", "cubic-bezier(0, 0, 0, 1)", "Element entering from off-screen."],
	["accelerate", "cubic-bezier(0.3, 0, 1, 1)", "Element exiting off-screen."],
	["bounce", "cubic-bezier(0.68, -0.55, 0.265, 1.55)", "Playful overshoot. Use sparingly."],
];

const DECISION_TABLE: ReadonlyArray<readonly [string, string]> = [
	["Mount/unmount fade, hover lift, tap squeeze", "Motion.div + Presence"],
	["Imperative chain from a click handler", "useAnimate (await .finished between steps)"],
	["Scroll progress bar / parallax", "useScroll + useMotionValueRender"],
	["Visibility-triggered animation", "useInView({ once: true })"],
	["Open/closed dialog with named states", "variants({ open, closed }) + Motion.div animate=\"open\""],
	["Multi-step intro (3+ moves)", "<Timeline>/<Scene>/<Clip>"],
	["Layout transition, drag, shared element", "motion-pro adapter (peer on motion@^11)"],
	["Non-React HTML opt-in", "data-hex-motion=\"…\" attribute"],
];

/**
 * Motion docs page — model, decision tree, timeline composer, adapter,
 * non-goals. Linked from the Getting Started sidebar after Skills.
 */
export default function MotionPage() {
	return (
		<DocsPage
			pathname="/docs/motion"
			title="Motion"
			description="UI animation primitives + a deterministic timeline composer. Zero-dep WAAPI core; optional motion@^11 adapter for layout/gestures."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/motion/page.tsx"
		>
			<DocSection id="philosophy" title="Philosophy">
				<p className="text-sm leading-6">
					<InlineCode>@hex-core/motion</InlineCode> is two layers in one package. The first
					is a small declarative React API — <InlineCode>Motion.div</InlineCode>,{" "}
					<InlineCode>Presence</InlineCode>, hooks — modeled after Motion (motion.dev).
					The second is a <em>deterministic timeline composer</em> inspired by
					Hyperframes/Remotion, but for UI: <InlineCode>&lt;Timeline&gt;</InlineCode>,{" "}
					<InlineCode>&lt;Scene&gt;</InlineCode>, <InlineCode>&lt;Clip&gt;</InlineCode>.
					Same JSX in → identical render at every <InlineCode>t</InlineCode>. No FFmpeg.
					No video output.
				</p>
				<p className="text-sm leading-6">
					The default driver is the Web Animations API
					(<InlineCode>element.animate()</InlineCode>). The clock is injectable so
					tests advance time deterministically. Reduced-motion is honored automatically
					(<InlineCode>MotionConfig reducedMotion=&quot;never&quot;</InlineCode> opts
					out — only for screenshot tests).
				</p>
				<CodeBlock label="tsx" code={DECLARATIVE_SNIPPET} />
			</DocSection>

			<DocSection id="install" title="Install">
				<CodeBlock label="bash" code={INSTALL_CMD} />
				<p className="text-sm leading-6">
					The CLI&rsquo;s <InlineCode>add motion</InlineCode> doesn&rsquo;t copy source
					into your project — motion ships its runtime as a published npm package, so
					the CLI just records the dependency and prints next steps. Compare with
					primitives like <InlineCode>button</InlineCode>, which still use
					shadcn-style copy-the-code distribution.
				</p>
			</DocSection>

			<DocSection id="decision-tree" title="Decision tree">
				<p className="text-sm leading-6">
					Pick the right export for your need. The same heuristic is encoded in the{" "}
					<InlineCode>hex-core-motion</InlineCode> SKILL.md so AI agents reach for the
					same answers.
				</p>
				<div className="overflow-hidden rounded-md border">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted text-xs font-medium">
							<tr>
								<th className="px-3 py-2">Need</th>
								<th className="px-3 py-2">Use</th>
							</tr>
						</thead>
						<tbody>
							{DECISION_TABLE.map(([need, use]) => (
								<tr key={need} className="border-t">
									<td className="px-3 py-2 align-top text-foreground">{need}</td>
									<td className="px-3 py-2 align-top">
										<InlineCode>{use}</InlineCode>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="text-sm leading-6">
					Imperative example using <InlineCode>useAnimate</InlineCode>:
				</p>
				<CodeBlock label="tsx" code={IMPERATIVE_SNIPPET} />
			</DocSection>

			<DocSection id="tokens" title="Easing + duration tokens">
				<p className="text-sm leading-6">
					<InlineCode>transition.easing</InlineCode> accepts a named token or any CSS
					easing string. <strong>Always prefer named tokens</strong> over inline cubic-
					beziers so a theme swap propagates to every animation.
				</p>
				<div className="overflow-hidden rounded-md border">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted text-xs font-medium">
							<tr>
								<th className="px-3 py-2">Token</th>
								<th className="px-3 py-2">Value</th>
								<th className="px-3 py-2">When to use</th>
							</tr>
						</thead>
						<tbody>
							{TOKEN_TABLE.map(([name, value, hint]) => (
								<tr key={name} className="border-t">
									<td className="px-3 py-2 align-top">
										<InlineCode>{name}</InlineCode>
									</td>
									<td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
										{value}
									</td>
									<td className="px-3 py-2 align-top">{hint}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="text-sm leading-6">
					Durations are plain millisecond numbers. The{" "}
					<InlineCode>@hex-core/tokens</InlineCode> design layer ships{" "}
					<InlineCode>--duration-fast</InlineCode> (~120ms),{" "}
					<InlineCode>--duration-normal</InlineCode> (~200ms), and{" "}
					<InlineCode>--duration-slow</InlineCode> (~300ms) so CSS-driven motion stays
					consistent with JS-driven motion.
				</p>
			</DocSection>

			<DocSection id="timeline" title="The timeline composer">
				<p className="text-sm leading-6">
					<InlineCode>&lt;Timeline&gt;</InlineCode> owns a clock and broadcasts the
					current time. <InlineCode>&lt;Scene&gt;</InlineCode> windows children into an
					absolute time slice. <InlineCode>&lt;Clip&gt;</InlineCode> targets a CSS
					selector with a <InlineCode>from</InlineCode> →{" "}
					<InlineCode>to</InlineCode> animation. The composer is{" "}
					<em>pure</em> — same JSX in → identical{" "}
					<InlineCode>ClipDescriptor[]</InlineCode> out. Pause, resume, and seek map
					to WAAPI <InlineCode>pause()</InlineCode>,{" "}
					<InlineCode>play()</InlineCode>, and <InlineCode>currentTime=</InlineCode>.
				</p>
				<CodeBlock label="tsx" code={TIMELINE_SNIPPET} />
				<p className="text-sm leading-6">
					The{" "}
					<Link href="/docs/components/motion-timeline" className="underline underline-offset-2 hover:text-foreground">
						motion-timeline component page
					</Link>{" "}
					has a live demo. The{" "}
					<Link href="/docs/spec-driven" className="underline underline-offset-2 hover:text-foreground">
						intro-sequence recipe
					</Link>{" "}
					composes Timeline + existing primitives end-to-end.
				</p>
			</DocSection>

			<DocSection id="data-attr" title="Non-React opt-in">
				<p className="text-sm leading-6">
					Hyperframes-inspired declarative attribute. Lets server-rendered HTML and
					non-React surfaces opt into a motion preset without authoring a Motion
					component. Built-in presets: <InlineCode>fade-in</InlineCode>,{" "}
					<InlineCode>fade-out</InlineCode>, <InlineCode>slide-up</InlineCode>,{" "}
					<InlineCode>slide-down</InlineCode>, <InlineCode>scale-in</InlineCode>.
				</p>
				<CodeBlock label="html" code={DATA_ATTR_SNIPPET} />
			</DocSection>

			<DocSection id="adapter" title="motion@^11 adapter">
				<p className="text-sm leading-6">
					The zero-dep core animates compositor-friendly props (transform, opacity,
					color). For <strong>layout/FLIP</strong> transitions, drag gestures, or
					shared-element morphs, install the optional adapter — peer-installs{" "}
					<InlineCode>motion@^11</InlineCode> and re-exports its React API.
				</p>
				<CodeBlock label="tsx" code={ADAPTER_SNIPPET} />
				<p className="text-sm leading-6">
					Calling any adapter export when <InlineCode>motion</InlineCode> isn&rsquo;t
					installed throws <InlineCode>MotionAdapterMissingError</InlineCode> with the
					exact install command. Don&rsquo;t mix the core{" "}
					<InlineCode>Motion.div</InlineCode> and the adapter{" "}
					<InlineCode>MotionPro.div</InlineCode> on the same element — only one driver
					should own a given target.
				</p>
			</DocSection>

			<DocSection id="what-this-is-not" title="What this is NOT">
				<ul className="list-disc space-y-2 pl-6 text-sm leading-6">
					<li>
						<strong>Not a video framework.</strong> Hyperframes and Remotion render HTML
						to MP4 via FFmpeg. <InlineCode>@hex-core/motion</InlineCode> only animates
						UI in the browser.
					</li>
					<li>
						<strong>Not a physics engine.</strong>{" "}
						<InlineCode>springToBezier</InlineCode> approximates a critically-damped
						spring as a cubic-bezier. For real physics use the{" "}
						<InlineCode>motion-pro</InlineCode> adapter.
					</li>
					<li>
						<strong>Not for layout transitions out of the box.</strong> The default
						driver only animates compositor-friendly props. Layout, FLIP, and shared
						elements live in the adapter.
					</li>
				</ul>
			</DocSection>
		</DocsPage>
	);
}
