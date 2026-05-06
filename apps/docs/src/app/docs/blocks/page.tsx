import Link from "next/link";
import { AuthSignInSplitDemo } from "../../demos/auth-sign-in-split-demo";
import { CodeBlock } from "../../../components/code-block";
import { DocSection, InlineCode } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";
import { listBlocks } from "../../../lib/registry";

export const metadata = {
	title: "Blocks",
	description:
		"Page-level compositions — landing heroes, auth flows, app shells — installed and described like every other Hex Core entry.",
};

const SECTIONS = [
	{ id: "what", title: "What is a block" },
	{ id: "preview", title: "Live preview" },
	{ id: "shape", title: "Shape" },
	{ id: "auth-adapter", title: "AuthAdapter" },
	{ id: "install", title: "Install" },
	{ id: "roadmap", title: "Roadmap" },
];

const INSTALL_CMD = `pnpm dlx @hex-core/cli add auth-sign-in-split`;

const RECIPE_CMD = `# Or scaffold every component the recipe lists, plus the block itself,
# then print the post-install checklist.
pnpm dlx @hex-core/cli recipe add auth-sign-in`;

const ADAPTER_EXAMPLE = `import type { AuthAdapter } from "@hex-core/components";

/** Wire better-auth as a Hex Core AuthAdapter. */
export const authAdapter: AuthAdapter = {
  async signInWithPassword({ email, password, remember }) {
    const res = await authClient.signIn.email({ email, password, rememberMe: remember });
    if (res.error) return { ok: false, error: { code: res.error.code, message: res.error.message } };
    return { ok: true, redirect: "/app" };
  },
  async signInWithSocial({ provider }) {
    await authClient.signIn.social({ provider });
    return { ok: true };
  },
  // Implement only what your flows need; unused methods can be omitted.
};`;

const MOCK_EXAMPLE = `import { mockAuthAdapter } from "@hex-core/components";

// Showcase routes + tests pass the mock — every method delays 400ms and
// resolves { ok: true }. Never ship in production.
<SignInBlock adapter={mockAuthAdapter} />`;

const ROADMAP = [
	{ category: "Auth", count: 8, status: "Phase 2 (sign-up, forgot, reset, verify-email, OTP, MFA, passkey, social)" },
	{ category: "Landing", count: 8, status: "Phase 3" },
	{ category: "App shell + dashboard", count: 5, status: "Phase 4" },
	{ category: "Errors + utility", count: 5, status: "Phase 5" },
];

/** Concept page introducing blocks as the third tier above primitives + components. */
export default function BlocksDocPage() {
	const shipped = listBlocks();

	return (
		<DocsPage
			pathname="/docs/blocks"
			title="Blocks"
			description="Page-level compositions installed and described like every other Hex Core entry."
			sections={SECTIONS}
			editPath="apps/docs/src/app/docs/blocks/page.tsx"
		>
			<DocSection id="what" title="What is a block">
				<p className="text-sm leading-6">
					A block is a full page-level composition — a sign-in page, a landing hero, a
					settings shell — assembled from existing primitives and components. Blocks live
					in the same registry, install via the same{" "}
					<InlineCode>hex add</InlineCode> command, and ship the same machine-readable{" "}
					<InlineCode>.schema.ts</InlineCode> with{" "}
					<InlineCode>whenToUse</InlineCode>, common mistakes, and accessibility notes that
					primitives and components do.
				</p>
				<p className="text-sm leading-6">
					Blocks sit one layer above recipes. A recipe is a checklist of components an
					agent assembles into UI; a block is the assembled UI itself, ready to drop in.
					Use a block when you want a starting point you can edit; reach for a recipe when
					you want to compose from scratch with full control.
				</p>
			</DocSection>

			<DocSection id="preview" title="Live preview">
				<p className="text-sm leading-6">
					This is the <InlineCode>auth-sign-in-split</InlineCode> block rendering inside
					a constrained viewport. The full-bleed showcase route lives at{" "}
					<Link
						className="underline underline-offset-2 hover:text-foreground"
						href="/sign-in"
					>
						/sign-in
					</Link>
					. Both are wired to <InlineCode>mockAuthAdapter</InlineCode> — every submit
					resolves <InlineCode>{"{ ok: true }"}</InlineCode> after 400ms.
				</p>
				<AuthSignInSplitDemo />
			</DocSection>

			<DocSection id="shape" title="Shape">
				<p className="text-sm leading-6">
					A block is just a registry entry with{" "}
					<InlineCode>category: &quot;block&quot;</InlineCode>. Every block lives at{" "}
					<InlineCode>packages/components/src/blocks/&lt;family&gt;/&lt;slug&gt;.tsx</InlineCode>{" "}
					alongside a co-located{" "}
					<InlineCode>&lt;slug&gt;.schema.ts</InlineCode>. The build step picks them up
					automatically — no separate registry, no separate CLI surface.
				</p>
				<p className="text-sm leading-6">
					Discover blocks via the existing MCP tools:{" "}
					<InlineCode>search_components</InlineCode> with{" "}
					<InlineCode>category: &quot;block&quot;</InlineCode>, or filter the catalog
					on the <Link className="underline underline-offset-2 hover:text-foreground" href="/docs">Components</Link> index by the
					Blocks group.
				</p>
				<p className="text-sm leading-6">
					Currently shipped: <strong>{shipped.length}</strong>{" "}
					{shipped.length === 1 ? "block" : "blocks"}. This release ships the
					foundation plus the first vertical slice (
					<InlineCode>auth-sign-in-split</InlineCode>) end-to-end — block component,
					schema, recipe, demo, and showcase route at{" "}
					<Link
						className="underline underline-offset-2 hover:text-foreground"
						href="/sign-in"
					>
						/sign-in
					</Link>
					.
				</p>
			</DocSection>

			<DocSection id="auth-adapter" title="AuthAdapter">
				<p className="text-sm leading-6">
					Hex Core does not own session management. Auth blocks are presentation-only
					and accept an <InlineCode>AuthAdapter</InlineCode> prop — the single seam that
					connects a block to whatever the consumer wires up: better-auth, Clerk,
					NextAuth, Supabase Auth, or a custom server.
				</p>
				<p className="text-sm leading-6">
					Every method on <InlineCode>AuthAdapter</InlineCode> is optional. Ship
					password-only on day one and add passkeys later without forking the block
					source.
				</p>
				<CodeBlock label="ts" code={ADAPTER_EXAMPLE} />
				<p className="text-sm leading-6">
					For showcase routes and unit tests, the package exports a{" "}
					<InlineCode>mockAuthAdapter</InlineCode> — every method delays 400ms and
					resolves <InlineCode>{"{ ok: true }"}</InlineCode>. Never ship it in
					production.
				</p>
				<CodeBlock label="tsx" code={MOCK_EXAMPLE} />
			</DocSection>

			<DocSection id="install" title="Install">
				<p className="text-sm leading-6">
					Blocks install through the same CLI as every other registry entry. The
					command resolves the block&rsquo;s internal dependencies (form, input, button,
					alert, &hellip;) and writes the AuthAdapter to{" "}
					<InlineCode>components/_shared/auth-adapter.tsx</InlineCode> alongside the
					block source.
				</p>
				<CodeBlock label="bash" code={INSTALL_CMD} />
				<p className="text-sm leading-6">
					Or use the recipe to install every component plus the block in one shot, then
					see the post-install checklist:
				</p>
				<CodeBlock label="bash" code={RECIPE_CMD} />
			</DocSection>

			<DocSection id="roadmap" title="Roadmap">
				<p className="text-sm leading-6">
					Phase 1 (this release) ships only the <InlineCode>AuthAdapter</InlineCode>{" "}
					contract and the directory scaffold. Concrete blocks land per category in
					subsequent phases:
				</p>
				<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
					{ROADMAP.map((r) => (
						<li key={r.category}>
							<strong>{r.category}</strong> — {r.count} blocks ({r.status})
						</li>
					))}
				</ul>
			</DocSection>
		</DocsPage>
	);
}
