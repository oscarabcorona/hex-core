# @hex-core/components

## 1.15.0

### Minor Changes

- 2f7586f: feat(dnd, kanban): composable drag-and-drop primitives + Kanban + opt-in reorder for DataTable rows and Tree top-level nodes

  Adds shared DnD infrastructure that hex-core compounds opt into, plus a canonical Kanban consumer. Designed so Kanban, sortable card lists, DataTable row reorder, and Tree node reorder all share the same `@dnd-kit` foundation — no per-feature DnD code.

  **New components (`@hex-core/components`):**
  - **`<DndProvider>`** — root context with sensible sensor defaults (PointerSensor + KeyboardSensor for built-in keyboard a11y, closestCenter collision).
  - **`<SortableList items renderItem onChange>`** — turnkey single-list wrapper. Defaults to vertical strategy; accepts `"vertical" | "horizontal" | "rect"`.
  - **`useSortableItem(id)`** — headless hook returning `{ setNodeRef, attributes, listeners, style, isDragging }` for advanced consumers (DataTable rows, Tree nodes, custom layouts).
  - **`<Kanban>` + `<KanbanColumn>` + `<KanbanCard>`** — headless Kanban board. Drag cards within columns + across columns. Consumer keeps state as `{ id, title, cardIds }[]`; `onChange` fires with the new shape after every drop. Columns are static in v1.
  - Re-exports: `arrayMove`, `verticalListSortingStrategy`, `horizontalListSortingStrategy`, `rectSortingStrategy`.

  **Existing components, opt-in additions:**
  - **`<DataTable>`** gains `reorderableRows?: boolean` + `onRowReorder?: (orderedIds: string[]) => void` + `getRowId?: (row, index) => string`. When enabled, a leading drag-handle column is added; rows reorder via mouse or keyboard. Throws a clear error if `reorderableRows={true}` without `getRowId` (TanStack's default index id breaks DnD).
  - **`<Tree>`** gains `reorderable?: boolean` + `onNodeReorder?: (next: TreeNode[]) => void`. Top-level (root) nodes only — nested children are not individually reorderable in v1 (cross-parent semantics deferred to v2). Drag handle is its own focusable button so the existing tree keyboard nav (Space/Enter) is unchanged.

  **Heavy peers (~43 KB gzip, all optional):**
  - `@dnd-kit/core@^6.3.1` (~30 KB)
  - `@dnd-kit/sortable@^10.0.0` (~10 KB)
  - `@dnd-kit/utilities@^3.2.2` (~3 KB)

  CLI heavy-peer prompt (shipped in PR #120) auto-prompts on `hex add kanban` / `hex add dnd`.

  **New recipe (`@hex-core/registry`):**
  - `kanban-board` — spec-driven blueprint with persistence + a11y checklist.

  **Schema (`@hex-core/registry`):** no schema changes (reuses the `heavyPeer` field added in PR #120).

### Patch Changes

- chore(deps): refresh `@radix-ui/*` primitives (radix group) + `tailwind-merge` 3.6, `date-fns` 4.4.

  **Note:** Radix Toggle Group `v1.1.13+` now exposes a single-select group as `role="radiogroup"` (with `role="radio"` items) instead of `role="group"` — update any `getByRole("group")` assertions on single-select toggle groups.

- 33440ea: Fix `alert-dialog`'s `ai.relatedComponents` pointing at a non-existent `toast` slug — the catalog's toast item is `sonner`. Caught by the new graph build's dangling-edge validation.

## 1.14.0

### Minor Changes

- e5d120e: fix(components): normalize interaction states and size scales

  Brings 49 components to one consistency bar — the interaction-state matrix
  (canonical focus rings incl. `ring-offset-2`, `transition-all` with duration +
  ease, menu `hover:` paired with every `focus:`, `active:scale-[0.98]`, complete
  `disabled:` pairs) and the two canonical size families.

  **Size scales (the minor bit):** `loading-indicator`, `stepper`, and `timeline`
  rename their `md` size key to `default` and add an `lg`. `default` inherits the
  previous `md` rendering, so any component used without an explicit `size` looks
  identical; `lg` is purely additive. If you set it explicitly, update
  `size="md"` → `size="default"` on these three.

  The rest are pure visual/interaction fixes (no API change) across diagram
  primitives, study-card surfaces, menus/overlays, nav controls, and page blocks.
  No new dependencies.

## 1.13.0

### Minor Changes

- ee2b71d: feat(hooks): AI Kit Phase 3 — useAIChat + useStreamingMessage

  Phase 3 of the AI Kit roadmap (Theme H). Phases 1 + 2 shipped 11 components + a
  native streaming-Markdown primitive but nobody could wire them to a model — no
  hook layer. This adds two SDK-agnostic hooks and makes the previously-empty
  `hook` registry category load-bearing.

  **`useAIChat()`** — thin adapter over AI SDK v5's `useChat`:
  - Normalizes `message.role` to Hex's `Role` enum (`user` | `assistant` | `system` | `tool`)
  - Concatenates `UIMessage.parts` text fragments into a `content` string for the default `<Message>` render path while preserving the raw `parts` for advanced rendering (tool calls, reasoning, citations)
  - Manages local input state (AI SDK v5 no longer owns this) and exposes a `composer` slice that spreads directly onto `<Composer {...chat.composer} />`
  - Maps SDK's `regenerate()` → `reload()` to match Phase 1's `MessageActions` convention
  - Status enum matches the SDK: `"ready" | "submitted" | "streaming" | "error"`

  **`useStreamingMessage(chat, messageId)`** — per-bubble helper. Derives "is this
  message still streaming?" (true only for the last assistant message while
  chat is submitted/streaming) plus convenience `abort` / `retry` wrappers.

  **Catalog:** 183 → 185 items. The `hook` category now contains 2 entries
  (was empty); category enum stays unchanged.

  **Heavy peer:** `@ai-sdk/react` is registered as a `heavyPeer` in the schema
  (bundle cost ~18KB gzipped) so the CLI shows an opt-in prompt before installing.
  Externalized in tsup config — consumers who never import `useAIChat` don't pay
  for it. Verified against the docs bundle: zero AI SDK content in chunks.

  No breaking changes. Next: LangChain + Mastra adapters as separate hooks (same
  return shape), then a chatbot recipe composing `useAIChat` + `Composer` +
  `MessageList`.

### Patch Changes

- 1264d32: Token-cost audit + calibration across every LLM-bound surface.

  **`@hex-core/payload`** — Bundled registry now resolves the page-recipe build path correctly: `scripts/build-registry.ts` branches on `recipe.kind` so the build no longer fails on `kind: "page"` recipes. The bundled `registry/items/` grew from 132 to 183 entries (51 blocks + AI elements + motion primitives that were previously stranded by the build).

  **`@hex-core/components` / `@hex-core/motion`** — Every component's `ai.tokenBudget` is now calibrated against the measured wire-shape (pretty-printed) `get_component_schema` token count — the shape MCP clients actually receive and rank by. Most primitives were under-declaring by 2–3× (`button` was 500 → 1,718; `cluster` was 250 → 938). Declared vs. measured is now within ±1 token across all 183 items. Wire output is unchanged; only the declared estimates were wrong.

  **`@hex-core/mcp`** — Added a contract-test regression gate: `get_component` ≤ 15K tokens, `get_component_schema` ≤ 2.5K, `emit_app_context` (N=20) ≤ 5K. Wire output remains pretty-printed (human-readable for debugging); ceilings reflect the actual response shape with ~20% headroom over current max.

  New maintenance script at `scripts/audit-tokens.ts` (`pnpm audit:tokens`) measures every LLM-bound surface — MCP tool responses, recipes, skills, the bundled registry — and writes `packages/mcp-server/TOKEN_AUDIT.md`. Pass `--update-budgets` to push measured numbers back into each schema's `ai.tokenBudget` literal. The audit asserts the bundled `@hex-core/payload` registry stays in sync with the repo-root `registry/` and bails loud if they drift.

  Realistic compound load (4 SKILL.md packs + `emit_app_context` at N=20 + 1 page-recipe) is ~10K tokens — 5% of Claude's 200K window. There is no context-window pressure; this PR ships measurement, calibration, and a regression gate so future surface additions don't silently bloat MCP responses.

## 1.12.0

### Minor Changes

- 7a60fce: feat(blocks): catalog backfill — 13 sections + 4 page-recipes (closes strategy doc)

  Final backfill round from the page-system strategy. Thirteen new presentational,
  theme-driven section blocks — each with schema + render test, content via
  `ReactNode` slots:

  **Marketing (1)** — `MarketingBento`: asymmetric bento feature layout
  (distinct from the symmetric `marketing-feature-grid`).

  **App (3)** — closes the list family:
  - `AppStackedList` — labeled item list (members, inbox) — distinct from `app-data-table`
  - `AppGridList` — grid variant of stacked-list
  - `AppFeed` — chronological activity timeline, grouped by day

  **Commerce (9)**:
  - `CommerceCategory` — category preview cards
  - `CommerceCategoryFilters` — filter sidebar with native `<details>` collapse (no JS)
  - `CommerceStoreNav` — storefront top nav with mobile menu (`"use client"`)
  - `CommerceProductFeatures` — PDP feature spotlight (`alternating` / `grid` variants)
  - `CommerceQuickview` — quickview body composable into Dialog/Sheet
  - `CommerceIncentives` — value-prop band (free shipping, returns)
  - `CommercePromo` — featured-deal banner (`image-left` / `image-right` / `overlay`)
  - `CommerceOrderSummary` — read-only order detail card
  - `CommerceOrderHistory` — customer order history table with empty state

  Plus four new page-recipes (`kind: "page"`):
  - `order-page` (ecommerce) — order confirmation page
  - `checkout-page` (ecommerce) — checkout layout
  - `pricing-page` (landing) — dedicated pricing page (hero + tiers + faq + cta)
  - `product-page` (ecommerce) — PDP (detail + features + reviews)

  **Catalog: 30 → 43 blocks** (6 auth + 15 marketing + 8 app + 14 commerce). Page-recipes
  4 → 8. New blocks excluded from the per-component visual loop (composed page-sections —
  same business-logic rationale as the prior 18). No breaking changes.

- 09a1db3: feat(blocks): marketing backfill — 6 sections + about-page recipe

  Backfill batch from the page-system strategy. Six new presentational,
  theme-driven marketing sections — each with schema + render test, content via
  `ReactNode` slots (no icon set bundled):
  - `MarketingStats` — big-number tiles for "by the numbers" bands (distinct
    from `app-stats`: no change deltas, larger typography)
  - `MarketingFaq` — composed from Accordion (`single` or `multiple` open)
  - `MarketingTeam` — team grid with avatar/name/role/bio/social slots
  - `MarketingNewsletter` — heading + caller-supplied form + disclaimer, in
    centered or split layout
  - `MarketingContact` — heading + optional details column + caller-supplied
    form, in split or stacked layout
  - `MarketingContent` — blog/content card grid with optional href, image, meta

  A new `about-page` page-recipe (kind `page`, pageType `landing`) composes
  header → hero → team → stats → content → contact → footer so an LLM or
  `hex recipe add about-page` scaffolds a credibility-first About page.

  Brings the block catalog to **30 blocks total** (6 auth + 14 marketing + 5 app
  - 5 commerce).

## 1.11.0

### Minor Changes

- b28f8ee: feat(blocks): application section blocks + app-page page-recipe

  Adds five presentational, theme-driven application section blocks for building
  authenticated app screens: `AppShell` (responsive sidebar + sticky top bar +
  main region), `AppSidebarNav` (grouped nav with active states), `AppStats` (KPI
  cards with directional deltas), `AppSettings` (two-column settings groups), and
  `AppDataTable` (table-view frame with toolbar + pagination slots). Each ships
  its machine-readable schema with `ai` guidance and a render test; content and
  icons are passed as `ReactNode` so no icon set is bundled.

  A new `app-page` page-recipe (kind `page`, pageType `app`) composes them — shell
  wrapping the sidebar nav, with stats above a data-table view in the main region.

- b28f8ee: feat(blocks): ecommerce section blocks + storefront-page page-recipe

  Adds five presentational, theme-driven ecommerce section blocks:
  `CommerceProductGrid` (catalog of linked product cards), `CommerceProductDetail`
  (PDP layout with media + options + add-to-cart slots), `CommerceReviews` (star
  summary + review list), `CommerceCart` (line items + sticky order summary), and
  `CommerceCheckout` (form + order-summary layout). Each ships its machine-readable
  schema with `ai` guidance and a render test; images, controls, and totals are
  passed as `ReactNode` so no icon set or cart logic is bundled.

  A new `storefront-page` page-recipe (kind `page`, pageType `ecommerce`) composes
  the storefront — reusing the marketing header/footer for chrome around the
  product grid and a promo band.

- b28f8ee: feat(blocks): marketing section blocks + landing-page page-recipe

  Adds eight presentational, theme-driven marketing section blocks that compose
  into a landing page: `MarketingHeader`, `MarketingHero`, `MarketingLogoCloud`,
  `MarketingFeatureGrid`, `MarketingPricing`, `MarketingTestimonial`,
  `MarketingCta`, and `MarketingFooter`. Each ships its machine-readable schema
  (with `ai` guidance) and a render test; content and icons are passed as
  `ReactNode` so no icon set is bundled.

  A new `landing-page` page-recipe (kind `page`, pageType `landing`) orders these
  sections — header → hero → logo cloud → features → pricing → testimonials →
  CTA → footer — so an LLM or `hex recipe add landing-page` can scaffold a full
  marketing page in one call. Supersedes the older `pricing-table` recipe for new
  work.

### Patch Changes

- b28f8ee: fix(recipes): ecommerce discoverability + page-recipe assembly guidance

  Manual-QA follow-ups for the page-recipe system:
  - `resolve_spec` now matches natural ecommerce phrasing — "online store", "store",
    and "shop" surface `storefront-page` and the commerce blocks (added store/shop
    synonyms to the storefront recipe and commerce block tags). Previously these
    returned nothing.
  - Each page recipe's `layout` brief now states the per-block import convention
    (`@/components/ui/<section.block>`) so an agent/developer knows how to wire the
    installed section files together.

## 1.10.0

### Minor Changes

- dbed294: feat(ai): 4 new AI Elements — Sources, InlineCitation, Task, Shimmer

  Continues the AI Elements parity sweep with a chatbot-category batch
  that rounds out the RAG-style chat surface. All 4 compose with
  existing primitives — no orphan components, no new runtime deps.

  **`<Sources>`** — bordered card listing 1–N citation chips for a RAG
  response. Re-uses `<Citation>` per row inside a Radix Collapsible.
  Default open so the user can scan provenance without expanding.

  ```tsx
  <Sources sources={[{ title: "Auth research", url: "...", page: 3 }, …]} />
  ```

  **`<InlineCitation>`** — inline `<sup>[N]</sup>` with a hover-preview
  popover (Radix HoverCard). Pairs with `<Sources>` for the
  bottom-of-card list. Replaces the old block `<Citation>` slot in
  `<Markdown>` so footnote-style `[N](url)` shapes now route to the
  inline variant — block Citation stays importable for the Sources panel.

  ```tsx
  <InlineCitation index={1} title="Auth research" url="https://..." />
  ```

  **`<Task>`** — multi-step task progress card. Each step's `state`
  re-uses the canonical `ToolCallState` enum (`pending`/`running`/
  `result`/`error`) so the vocabulary stays consistent across the AI
  surface. Header tracks aggregate progress ("3 of 5 steps", or
  "Done in X.Xs" once `durationMs` is set). Animated icons signal
  running state; strikethrough signals completed.

  ```tsx
  <Task
  	label="Refactoring auth"
  	steps={[
  		{ id: "read", label: "Read existing auth", state: "result" },
  		{ id: "apply", label: "Apply changes", state: "running" },
  		{ id: "test", label: "Run tests", state: "pending" },
  	]}
  />
  ```

  **`<Shimmer>`** — single-line streaming placeholder. Used during the
  dead-time between user submission and first stream token. Uses
  Tailwind's `animate-pulse` (matching `<Skeleton>`) so consumers don't
  need extra global CSS or keyframes.

  ```tsx
  {
  	isStreaming && firstTokenAt === null ? <Shimmer width="80%" /> : null;
  }
  ```

  **Markdown slot extensions:**
  - `<sources data='[…]' />` HTML element in markdown now routes to
    `<Sources>` (sanitize schema gains `sources` tag + `data` attr).
  - Footnote-style `[N](url)` links now route to `<InlineCitation>`
    (was block `<Citation>` — the block chip stays usable inside
    `<Sources>`).

  **Bundled cleanups:**
  - **Terminal contrast fix.** `<Terminal>` (shipped in #120) used
    `bg-background` for its outer container, which inherited the page's
    light/dark and produced 1.2:1 contrast against xterm's locked
    foreground in light mode. Locked the surface to match the inner
    xterm theme; hid the offscreen `<textarea>` and char-measurer
    helpers from axe via `text-transparent`.
  - **Missing visual baselines for PR #120's heavy AI components**
    (audio-player, audio-waveform, canvas, diagram, terminal). Same
    pattern as the markdown PR's speech-recognition baselines.
  - **Build-script `internalDepToSlug` fix in CLI bundle.** The CLI
    was using a stale dist that didn't recognize `components/<slug>/<slug>`
    cross-component deps; rebuilding picked up the fix and lets
    Markdown's transitive deps (Sources, InlineCitation, Reasoning,
    ToolCall) install via `npx hex add markdown`.

  **Tests:** 26 new component tests (Sources 8 + InlineCitation 4 +
  Task 8 + Shimmer 6) + 7 new Markdown slot tests (`<sources>` routing,
  InlineCitation upgrade, JSX-escape regression, and 4 sanitize-schema
  XSS tests covering `<script>`, inline event handlers, `javascript:`
  hrefs, and `<iframe>` stripping). Total components-package
  tests: 421 → ~452.

- 2bc2488: feat(ai): 4 new AI Elements — Branch, Plan, Conversation, ChainOfThought

  Continues the AI Elements parity sweep with a chatbot-category batch
  that ships agent-steering primitives and the off-the-shelf chat shell.
  All 4 compose with existing primitives — no orphan components, no new
  runtime deps.

  **`<Branch>`** — headless alternate-response navigator. Renders one
  active branch with a prev/next chip beneath. Stateless: consumer owns
  `current` (zero-indexed) and `total`. Arrow-key navigation when
  interactive; controls render disabled in read-only mode.

  ```tsx
  <Branch current={i} total={alternatives.length} onCurrentChange={setI}>
  	<Message role="assistant">
  		<Markdown>{alternatives[i]}</Markdown>
  	</Message>
  </Branch>
  ```

  **`<Plan>`** — pre-execution multi-step plan card. Body lists the
  proposed steps; an optional `onApprove` / `onCancel` footer renders
  an approval gate. Distinct from `<Task>` — Task is during/post-
  execution status (steps carry lifecycle state), Plan is pre-execution
  intent (steps are just labels). Typical flow renders `<Plan>`, then
  swaps it for `<Task>` once the user approves.

  ```tsx
  <Plan
  	label="Refactor auth"
  	steps={[
  		{ id: "read", label: "Read existing auth" },
  		{ id: "apply", label: "Apply changes" },
  		{ id: "test", label: "Run tests" },
  	]}
  	onApprove={() => execute()}
  	onCancel={() => discard()}
  />
  ```

  **`<Conversation>`** — high-level chat shell. Composes `<MessageList>`
  over a messages array, an optional `<Sources>` panel beneath the
  stream, an optional `<Shimmer>` placeholder for the in-flight
  assistant turn, and a `<Composer>` row at the bottom. The
  "compose-once" entry point that wraps the four primitives every chat
  app rebuilds. Internal composer state is managed for the consumer.

  ```tsx
  <Conversation
  	messages={messages}
  	onSubmit={handleSubmit}
  	isStreaming={waitingForFirstToken}
  	sources={lastResponse?.sources}
  	placeholder="Ask anything…"
  />
  ```

  **`<ChainOfThought>`** — structured ReAct-shape reasoning trace. Each
  step has a `thought`, optional `action`, and optional `observation`.
  Final answer renders below the trace. Distinct from `<Reasoning>`
  (unstructured prose) — ChainOfThought enforces the per-step ReAct
  shape agents emit when doing tool-augmented reasoning. Internally
  composes `<Reasoning>` for the collapsible shell.

  ```tsx
  <ChainOfThought
  	steps={[
  		{
  			thought: "Need to look up the auth module",
  			action: "read auth.ts",
  			observation: "200 lines, uses bcrypt + jwt",
  		},
  		{ thought: "The bug is on line 42." },
  	]}
  	finalAnswer={<Markdown>{finalText}</Markdown>}
  />
  ```

  **Bundled cleanups:**
  - **Postbuild client classifier honors `"use client"` directives.**
    `_client-patterns.mjs` now treats an explicit author-side
    `"use client"` directive as a positive client signal, not just
    the indirect ones (Radix import, hook call, JSX handler). Caught
    via the bundle test's Radix-leak guard: `<ChainOfThought>`
    composes `<Reasoning>` (which uses Radix Collapsible) but the
    classifier missed it because the wrapper itself doesn't import
    Radix or call a hook. Honoring the directive at classification
    time fixes that and any future composition wrapper.

  **Tests:** 26 new component tests (Branch 7 + Plan 7 + Conversation
  8 + ChainOfThought 4). Total components-package tests: 437 → 463.
  8 new visual baselines (4 components × light/dark).

- 8a0d04d: feat(ai): drop streamdown wrapper, native streaming-safe Markdown with AI-aware slots

  Phase 2 of the AI Kit roadmap (per `.claude/research/ROADMAP.md` Theme H).
  Replaces the `streamdown` wrapper in `<Markdown>` with a native pipeline
  built on `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize`,
  plus a small streaming-safe pre-processor and four AI-aware slot renderers.

  **Public API unchanged.** `<Markdown>{string}</Markdown>` with the same
  `children: string` + optional `className`. No breaking change.

  **New: AI-aware slot wiring**

  | Markdown                                               | Routes to                                                                |
  | ------------------------------------------------------ | ------------------------------------------------------------------------ |
  | ` ```lang\n…\n``` `                                    | `<pre><code class="language-*">` (client-safe; consumers post-highlight) |
  | `[1](url)` (numeric link text)                         | `<Citation index={1} url={url} title={hostname}>`                        |
  | `<tool-call name="…" state="…" args="…" result="…" />` | `<ToolCall>`                                                             |
  | `> [!think]\n> body`                                   | `<Reasoning>`                                                            |

  The fenced-code slot doesn't route to the in-house `<CodeBlock>` because
  CodeBlock is an async Server Component and Markdown runs client-side
  (streaming context). Consumers in an RSC tree can compose `<CodeBlock>`
  directly when they need server-side Shiki highlighting.

  **New: streaming-safe pre-processor**

  `closeUnterminated()` is a pure function that pre-processes raw markdown
  to append synthetic closers for tokens left open at end-of-input —
  unclosed ` ``` `, `**`, `_`, `~~`, `` ` ``, `[…](…`, `[…`, `<tag` —
  so partial chunks during streaming render gracefully instead of as raw
  text. ~150 lines, fully tested via a 39-case truth table covering
  escaped delimiters, CRLF line endings, and Unicode word boundaries on
  underscore italics in addition to the canonical token shapes.

  **New: `remark-admonitions` plugin**

  Detects `[!think]` blockquotes in `mdast` and tags them so the
  `<blockquote>` slot renderer can route to `<Reasoning>`. Only `[!think]`
  ships in Phase 2; other admonitions (`[!warn]`/`[!info]`/`[!error]`)
  are obvious extensions but expand the surface without a use case yet.

  **Bundle**

  Removes `streamdown@2.5.0` (Shiki + Mermaid + remend, ~68 KB) from
  runtime deps. Adds `react-markdown`, `remark-gfm`, `rehype-raw`,
  `rehype-sanitize` (smaller combined surface, no Shiki/Mermaid by default).

  **Bundled cleanup**
  - **`<ToolCall>` `running` state contrast fix.** The `bg-primary/15
text-primary` pair was 4.45:1 in dark mode (just under WCAG AA's 4.5
    threshold for ≤14pt text). Switched to `bg-muted text-primary` —
    neutral-bg + brand-text, AA-safe by design. Visual diff is minimal
    (the chip stays subtle). Verified on the default theme; themes where
    `--muted` and `--primary` collapse to similar values need a separate
    multi-theme audit before relying on the chip's affordance.
  - **`<SpeechRecognition>` visual baselines.** The component shipped in
    1.6.0 without `e2e/visual.spec.ts-snapshots/speech-recognition-{light,dark}.png`;
    added them so `pnpm regression` passes from a fresh checkout.

  **Tests**
  - 39 truth-table tests for `closeUnterminated` (pass-through, fences,
    links, brackets, backticks, strike, bold, italic, combined streams,
    escapes, Unicode word boundaries, CRLF fences).
  - 12 functional tests for `<Markdown>` covering each slot, plain-markdown
    semantics, and streaming recovery.

### Patch Changes

- c7bb59e: fix(a11y): clear 2 WCAG AA contrast violations from the regression gate
  - Dark `--destructive` token lifted from `0 48.8% 58%` → `0 48.8% 68%` so
    `text-destructive` on the dark `--card` (L=14%) clears AA 4.5:1
    (was 4.02:1 — caught by `<Task>`'s error-step label).
  - `<ChainOfThought>` row labels drop the `/80` opacity modifier on
    `text-muted-foreground` — at 80% opacity the small uppercase labels
    measured 3.85:1 on the light card (now ~4.7:1).

## 1.9.0

### Minor Changes

- 62bcd13: feat(blocks): blocks tier + complete password-auth journey end-to-end

  Introduces **blocks** as a third tier above primitives and components — page-level compositions (sign-in pages, landing heroes, app shells) that share the registry, schema convention, and `hex add` install surface. Ships the foundation plus the **full password-auth journey** (sign-up → verify-email → sign-in → forgot → reset → sign-in, plus an OTP path for sign-in / verify-email / MFA) wired end-to-end through every layer of the pipeline.

  **`@hex-core/components` — new exports:**

  Pluggable adapter contract:
  - `AuthAdapter`, `AuthAdapterResult`, `AuthOtpIntent`, `AuthSocialProvider` — every auth block consumes the adapter via its `adapter` prop. Hex Core ships no session management; the adapter routes credential / OAuth / OTP handoffs to whatever the consumer wires up (better-auth, Clerk, NextAuth, Supabase Auth, custom server). Every method is optional so consumers can ship password-only on day one and add passkeys / OTP later without forking block source.
  - `mockAuthAdapter` — in-memory reference adapter for showcase routes and tests. Every method delays 400ms and resolves `{ ok: true }`. Never ship in production.

  Six auth blocks composing the password journey:
  - `AuthSignInSplit` — split-screen sign-in (marketing left, credential form right) with email + password, remember-me, optional social, forgot-password link.
  - `AuthSignUpCard` — centered-card sign-up with name (optional) + email + password (with confirm) + terms checkbox + optional social. Manual validation: email regex, password length, confirm-match, terms.
  - `AuthForgotPassword` — single-field form that swaps to an `Empty`-based "check your inbox" confirmation state on success.
  - `AuthResetPassword` — token-driven new-password + confirm form. Reads the opaque token from a prop (typically `?token=…` searchParam).
  - `AuthVerifyEmail` — transactional waiting page with optional resend cooldown. Resend button hides automatically when `adapter.resendMagicLink` is absent.
  - `AuthVerifyOtp` — N-digit (default 6) auto-submitting code input. Drives the heading and adapter routing from the `intent` prop (`"sign-in" | "verify-email" | "mfa"`).

  Two new optional methods on `AuthAdapter` (additive — no breaking change):
  - `resendMagicLink?(p: { email })` — distinct from `sendMagicLink` so consumers can throttle resends and surface separate analytics / error copy.
  - `resendOtp?(p: { intent })` — distinct from the initial code dispatch for the same reason.

  Every block: `.tsx` source + co-located `.schema.ts` (machine-readable AI hints, common mistakes, accessibility notes, token budget) + behavioral test (Testing Library + userEvent + warnSpy). Every block falls back to a generic user-facing error message and a structured `console.warn` when an adapter method is unimplemented.

  **`@hex-core/cli` — `rewrite-imports` fix for cross-tree block imports:**

  The legacy regex matched sibling-component imports (`../<name>/<name>`) and primitives (`../../primitives/<name>/<name>`) but not the cross-tree shape blocks need: a block at `blocks/<slug>/<slug>.tsx` reaches into `components/` two segments deep. `npx hex add auth-sign-in-split` (and any other auth block) now rewrites `../../components/alert/alert` to `@/components/ui/alert` correctly. Covered by a unit test.

  **Pipeline coverage shipped in this release:**
  - 6 block items in `registry/items/` + 6 auth recipes in `registry/recipes/` (5 new + the deprecated `auth-form` superseded by `auth-sign-in`)
  - 6 live demos + 6 showcase route pairs (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-otp`) — each pair is a server component owning `metadata` + a `"use client"` wrapper owning the adapter binding
  - Concept doc at `/docs/blocks` with embedded live preview + install commands + a "Password-auth journey" gallery linking every showcase route
  - MCP contract test asserts the journey: `search_components({ category: "block" })` returns ≥6 blocks containing every expected slug; `get_component("auth-sign-in-split")` round-trips with required `adapter` prop and bundled `components/_shared/auth-adapter.tsx` source
  - 41 new behavioral tests across the 6 blocks (form submit, error display, social click, auto-submit-when-full for OTP, resend cooldown, unimplemented-method fallback, …)
  - A11y audit clean on every showcase route in light + dark
  - Visual regression baselines committed for every block (light + dark)
  - `hex add auth-sign-up-card` smoked end-to-end against a temp project; imports rewrite to `@/`-aliased paths; `_shared/auth-adapter.tsx` ships once
  - `hex recipe add auth-sign-up` smoked: 9 ordered steps + checklist printed
  - `auth-form` recipe is deprecated in favor of `auth-sign-in` (retained for back-compat with deprecation note in title + summary)

  No breaking changes. Tree-shake-safe — consumers only pay for what they install.

## 1.8.1

### Patch Changes

- 870fbcc: chore: rebrand "Hex UI" → "Hex Core" across the published surface

  Project name aligns with the `@hex-core/*` npm scope, the `hex-core` GitHub repo, and `hex-core.dev` domain. User-facing strings, package descriptions, READMEs, MCP server name + bin, skill directory naming, payload output headers, and the registry top-level name all switch from `Hex UI` / `hex-ui` → `Hex Core` / `hex-core`.

  **Migration for existing consumers:**
  - `hex-ui-mcp` binary renamed to `hex-core-mcp`. If you have a shell alias or script that calls `hex-ui-mcp` directly, update it. The canonical `npx -y @hex-core/mcp` invocation is unchanged.
  - Bundled skill directories renamed `skills/hex-ui-*` → `skills/hex-core-*`. Re-run `npx @hex-core/cli skills install --overwrite` to migrate `.claude/skills/hex-ui-*` to the new names. The CLI's skill detector now looks for the `hex-core-` prefix only.
  - Docs site `localStorage` theme key renamed from `hex-ui-theme` to `hex-core-theme`; users will see the system-default theme on first reload after upgrade.
  - MCP server's handshake `name` is now `hex-core` (was `hex-ui`). Clients connect by stdio command, not by name lookup, so this is informational only.
  - Recommended MCP config key in docs is now `"hex-core"`. Existing configs keyed `"hex-ui"` keep working — the key is a user-chosen label.

  Output formats: `emit_app_context` headers are now `# App context — Hex Core`, `emit_figma_tokens` collection naming is `Hex Core — <theme>`. Anything snapshotting these strings should refresh.

  No public TypeScript API surface changed.

- Updated dependencies [870fbcc]
  - @hex-core/registry@0.3.5

## 1.8.0

### Minor Changes

- d67fa60: feat(ai): 5 new AI Elements components + CLI heavy-peer prompt

  Closes the AI Elements parity gap from 13/40 → 18/40 by adding the Code, Voice, and Workflow categories. Each component is a thin headless wrapper around an opt-in engine declared as a heavy peer dep.

  **New components (`@hex-core/components`):**
  - **`Terminal`** — xterm.js wrapper. Headless data flow: pass `output` (diffed against prior render), receive typed bytes via `onInput`. Peer: `@xterm/xterm@^5.5.0` (~150 KB gzip).
  - **`Canvas`** — reactflow node-graph canvas for agent workflows / RAG document graphs. Default Background + Controls; slot for MiniMap and Panels. Peer: `reactflow@^11.11.0` (~80 KB gzip).
  - **`AudioPlayer`** — wavesurfer.js playback control with play/pause + waveform progress + duration. Peer: `wavesurfer.js@^7.8.0` (~50 KB gzip, shared with AudioWaveform).
  - **`AudioWaveform`** — standalone non-interactive waveform display for voice-message previews and recording indicators. Peer: `wavesurfer.js@^7.8.0`.
  - **`Diagram`** — Mermaid renderer for AI-emitted flowcharts / sequence / class diagrams. Engine sanitizes SVG via `securityLevel: "strict"`. Peer: `mermaid@^11.0.0` (~700 KB gzip).

  **CLI heavy-peer flow (`@hex-core/cli`):**

  `hex add <component>` now detects heavy peer deps declared in the registry and prompts before installing. Single batched UX for multi-component installs:

  ```
  This sprint installs 2 components with heavy peer dependencies:

    → @xterm/xterm@^5.5.0  (~150 KB gzip)  for terminal
       Renders the terminal grid + handles input/output
    → mermaid@^11.0.0      (~700 KB gzip)  for diagram

    Total: ~850 KB gzip added to your bundle.

  Install now? [Y/n]:
  ```

  `--yes` skips the prompt. `--no-install` prints the manual install command. Decline keeps the component source on disk so you can install the peer later.

  **Schema (`@hex-core/registry`):**

  New `dependencies.heavyPeer` array on `dependencySchema`: `{ name, version, bundleKbGzip?, reason? }[]`. Optional — existing schema files don't need changes.

  All 5 components ship as optional peers in `@hex-core/components/package.json` (peerDependenciesMeta.optional: true), mirroring the existing pattern for vaul/sonner/cmdk.

- b1b9099: feat(artifacts): flow-family diagram primitives — Sankey, Funnel, Pyramid, Flowchart

  Second batch in the `artifacts/` category. The hierarchy core (MindMap / TreeMap / OrgChart / Sunburst / Dendrogram) shipped first; this batch adds the **flow family**:
  - **`Sankey`** — weighted-flow diagram via `d3-sankey` (~6 KB gzip optional peer). Nodes arrange in horizontal columns by topological depth; link thickness encodes flow value. Use for energy/material/money flows, marketing-funnel transitions, traffic referral flows.
  - **`Funnel`** — vertical stack of trapezoidal stages whose width is proportional to each stage's value. Pure SVG, no peer. Renders stage-to-stage conversion percentages by default. Use for monotonic conversion drop-off (signup, sales pipeline, ETL row counts).
  - **`Pyramid`** — ranked-tier pyramid with `widening` or `narrowing` shape. Pure SVG, no peer. **Distinct from Funnel**: Pyramid encodes RANK (each tier is a distinct level), Funnel encodes FLOW (subset + conversion ratio). Use for Maslow-style hierarchies, organizational tiers, content hierarchies.
  - **`Flowchart`** — typed React flowchart with topological-rank auto-layout. Nodes support `shape: "rect" | "round" | "diamond"` for terminal markers and decision nodes. Edges support optional `label`. Pure SVG, no peer. Distinct from `<Diagram>` (Mermaid string DSL) and `<Canvas>` (free-form ReactFlow) — Flowchart is the right choice when you have STRUCTURED data and want a polished SVG without a heavy peer.

  **Heavy peer (Sankey only):**
  - `d3-sankey@^0.12.3` (~6 KB gzip) declared as optional peer in `@hex-core/components`. CLI's `hex add sankey` prompts before installing. Funnel, Pyramid, and Flowchart need no install.

  **Patterns:**
  - Sankey follows the lazy-import + placeholder-div pattern used by the hierarchy stack
  - Funnel/Pyramid/Flowchart render synchronously since they're pure SVG
  - Every artifact emits `role="img"` + non-empty `<title>`/`<desc>` for screen readers
  - Interactive nodes/segments/stages/tiers carry `data-depth` / `data-rank` / `data-shape` attributes so consumers can theme depth bands or shape variants from CSS without re-implementing the palette

  **Schemas:**

  All four declare full `ai` blocks (`whenToUse`, `whenNotToUse`, `commonMistakes`, `relatedComponents`, `accessibilityNotes`, `tokenBudget`) and the schemas explicitly call out the Pyramid-vs-Funnel and Flowchart-vs-Diagram-vs-Canvas distinctions so an LLM picking between them can make the right call.

  Stacks on top of `feat/artifacts-hierarchy-stack` — both PRs merge into the same `artifacts/` category surface.

- b1b9099: feat(artifacts): hierarchy-family diagram primitives — MindMap, TreeMap, OrgChart, Sunburst, Dendrogram

  Introduces a new `artifacts/` top-level category for typed React diagram primitives. This batch ships the **hierarchy core** — five primitives that all share a single small optional peer (`d3-hierarchy`, ~3 KB gzip), with Sunburst additionally using `d3-shape` for arc paths.

  **New components (`@hex-core/components`):**
  - **`MindMap`** — typed React mind map with radial or horizontal layout. Pass a hierarchical `root` node; the component lays out children using d3-hierarchy's tree layout. No Mermaid string DSL required.
  - **`TreeMap`** — squarified treemap where each leaf's area is proportional to its `value`. Supports `tile: "squarify" | "binary" | "slice-dice"` and depth- or value-based coloring.
  - **`OrgChart`** — top-down organizational chart with collapsible subtrees. Each node renders as a rounded card; click any node with children to fold its subtree behind a `+N` badge. Supports `defaultExpandedDepth` for initial state.
  - **`Sunburst`** — radial hierarchy by value with click-to-zoom drill-down. Each ring is a deeper level of the tree; segment angles are proportional to summed values. Click the center to zoom back out.
  - **`Dendrogram`** — clustering tree where every leaf sits at the same depth (the visual signature of taxonomies, phylogenetic trees, hierarchical-clustering output). Supports horizontal/vertical orientation and step/diagonal links.

  All five follow the established heavy-peer pattern from `Canvas` / `Diagram`:
  - Lazy `import("d3-hierarchy")` on mount; placeholder `<div data-hex-<name>-loading />` until resolution
  - Optional peer dependency with `peerDependenciesMeta.optional: true`
  - CLI's `hex add <name>` flow prompts before installing the d3 modules
  - Typed React-prop API (no string DSL) so consumers can drive the diagram from application state
  - SVG output with `role="img"` + `<title>` + `<desc>` for screen readers

  **Schema (`@hex-core/registry`):**
  - `categoryEnum` gains a new `"artifact"` value alongside the existing `"primitive" | "component" | "block" | "ai" | …` set.
  - `internalDepToSlug` now accepts `"artifacts/…"` paths in addition to `components/`, `primitives/`, and `blocks/`.

  **MCP server (`@hex-core/mcp`):**
  - The `search_components` tool's `category` filter enum now matches the registry enum (adds `"artifact"`). Without this, `search_components({ category: "artifact" })` would reject at the Zod boundary even though the items exist in the registry.

  **Where to place them:**

  `packages/components/src/artifacts/` — a new top-level category sibling to `primitives/`, `components/`, and `ai/`. Keeps general-purpose visualizations out of the `ai/` folder (whose schemas are tuned for agent-output semantics) and gives the next batches (Flow, Relational, Time) a natural home.

- b1b9099: feat(artifacts): relational-family diagram primitives — Venn, Chord, Arc, Matrix

  Third batch in the `artifacts/` category, stacked on the flow stack. Adds the **relational family** — diagrams whose subject is the relationships _between_ entities rather than a hierarchy or directional flow.
  - **`Venn`** — set-overlap diagram for 2 or 3 sets. Pure SVG, no peer. Renders a friendly fallback for unsupported set counts (>3 / 0). Use for categorical overlap (Linux ∩ Mac ∩ Windows) — explicitly NOT for area-correct intersection cardinality (that's Euler-diagram territory).
  - **`Chord`** — circular-relationship diagram via `d3-chord` (~3 KB gzip optional peer) + `d3-shape` (already a peer). Nodes form a ring; ribbons inside encode weighted bidirectional relationships. Use for trade flows, migration corridors, citation networks. Distinct from Sankey — Sankey requires a left-to-right flow direction; Chord is direction-agnostic on a ring.
  - **`Arc`** — diagram where nodes lie on a horizontal baseline and relationships are drawn as semicircle arcs above. Pure SVG, no peer. Use when node ORDER is meaningful (sequence-aware data: chapter co-occurrence, transit transfer points, citation chronology). Distinct from Chord — Chord = ring (no order), Arc = baseline (order matters).
  - **`Matrix`** — adjacency matrix where cell (row i, col j) encodes the relationship from node i to node j by color intensity. Pure SVG, no peer. Best for dense graphs that turn into hairballs in node-link form (~100 nodes scales gracefully). Use for confusion matrices, correlation matrices, trade-flow matrices.

  **Heavy peer (Chord only):**
  - `d3-chord@^0.12.x` declared as optional peer (~3 KB gzip). The CLI's `hex add chord` flow prompts before installing. Venn, Arc, Matrix need no install.

  **Patterns shared with hierarchy + flow stacks:**
  - Lazy-import + placeholder-div for Chord (heavy peer)
  - Layout pass memoized on input identity for all four primitives
  - Every artifact emits `role="img"` + non-empty `<title>`/`<desc>`
  - Interactive nodes/cells/sets/ribbons declare `role="button"`, `tabIndex=0`, `aria-label`, and Enter/Space keyboard activation
  - `data-depth` / `data-row` / `data-col` attributes for theming and test introspection

  **Schemas:**

  All four declare full `ai` blocks and explicitly call out the disambiguating distinctions: Venn-vs-Euler (area correctness), Chord-vs-Arc (ring vs baseline order), Matrix-vs-Sankey (dense vs flow), Matrix-vs-Chord (scale vs aesthetic).

  Stacks on top of `feat/artifacts-flow-stack`. No new registry/MCP changes — the hierarchy stack already widened the `artifact` category enum across both packages; Flow and Relational reuse that surface.

- b1b9099: feat(artifacts): study stack — Flashcard, Cloze, ImageOcclusion, Quiz, CompareTable, Deck, SpacedRepetition

  Fifth `artifacts/` batch, stacked on the time stack. Adds the **study / pedagogy** family — primitives a learner or AI tutor reaches for when the content's job is to be _learned_, not just displayed. Web research consensus on best-of-2026 study formats (`reviewjane.com`, `aitooldiscovery.com`, `dev.to/anki`, `help.remnote.com`, `retain.cards`) lands on the four Anki note types as the universal floor; this batch ships those plus three popular layered helpers.

  **Components (`packages/components/src/artifacts/`):**
  - **`Flashcard`** — front/back card with a CSS 3D flip on click / Enter / Space. Controlled or uncontrolled. Pure CSS transform, no animation peer.
  - **`Cloze`** — fill-in-the-blank text with click-to-reveal blanks. Each `{ hidden }` token in the `parts` array becomes a redacted span. `revealMode: "click" | "all"` toggles a "Reveal all" escape hatch.
  - **`ImageOcclusion`** — image with rectangular regions hidden behind opaque overlays. Coordinates are 0–1 fractions so the layout stays correct at any rendered size. Dev-only console.warn when coords escape `[0, 1]` (the "passed pixels not fractions" footgun).
  - **`Quiz`** — single-question multiple-choice. `selectionMode: "single" | "multi"`. After submit, each option is tagged `data-state="correct|incorrect|missed"` so consumers can theme right / wrong / unselected-but-correct independently. Per-option `explanation` renders below the option after submit.
  - **`CompareTable`** — side-by-side comparison. Subjects as columns, attributes as rows, optional difference highlighting against the row's first non-empty cell. Dev-only console.warn when an attribute references a subjectId that isn't in the subjects array.
  - **`Deck`** — paged sequence of flashcards with optional shuffle, prev/next, progress bar, and a `ratingSlot` render-prop for SpacedRepetition composition. Order recomputes only on `cards` identity change — never re-shuffles mid-session.
  - **`SpacedRepetition`** — Anki-style four-button rating row (Again / Hard / Good / Easy). Headless on scheduling: emits `(rating, cardId)`, consumer wires SM-2 / FSRS / hand-rolled.

  **Patterns shared with prior stacks:**
  - `useMemo` over any layout pass; keyboard activation (Enter / Space with `preventDefault` on Space)
  - `data-*` attributes for theming and test introspection (`data-flipped`, `data-revealed`, `data-state`, `data-row`, `data-rating`)
  - `aria-pressed` / `aria-label` / `role="button"` / `role="status"` / `role="group"` where applicable
  - Dev-only `console.warn` for invalid-shape inputs (ImageOcclusion fractional coords, CompareTable orphaned subjectIds)

  **Composition story:** `<Deck cards={…} ratingSlot={(card) => <SpacedRepetition cardId={card.id} onRate={…} />} />` is the reference Anki-flow integration. Quiz, Cloze, and ImageOcclusion can also live inside a Deck via the `front`/`back` props since both accept `ReactNode`.

  **No registry / MCP / build-pipeline plumbing changes.** The `artifact` category enum was widened in the hierarchy stack and all five families since (hierarchy → flow → relational → time → study) reuse it. No new heavy peer dependencies — all 7 primitives are pure HTML / CSS.

  This is the fifth and final stack of the initial `artifacts/` rollout. Total artifact primitives ship at 23 across 5 sub-families: hierarchy (5) + flow (4) + relational (4) + time (3) + study (7).

- b1b9099: feat(artifacts): time-family diagram primitives — TimeAxis, Gantt, Sequence

  Fourth and final batch of the initial `artifacts/` rollout, stacked on the relational stack. Adds the **time family** — diagrams whose subject is "what happened, when, and to whom".
  - **`TimeAxis`** — events plotted along a horizontal time axis. Pure SVG, no peer. Accepts dates as `Date`, ISO string, or epoch ms. Auto-stacks colliding events into rows so labels never overlap. **Distinct from the existing event-list `<Timeline>` in `components/`** — TimeAxis encodes elapsed time as horizontal distance (the _gap_ between events is the message), Timeline keeps event order without time-scaling.
  - **`Gantt`** — tasks as horizontal bars across a time axis with optional dependency arrows and progress fills. Pure SVG, no peer. Supports the canonical `{ id, label, start, end, progress?, dependencies? }` shape. Use for project schedules, release plans, sprint boards, ETL job schedules.
  - **`Sequence`** — UML-style sequence diagram. Actors as columns with vertical lifelines; messages as horizontal arrows in declaration order. Pure SVG, no peer. Supports `type: "sync" | "async" | "return"` and self-call loopback paths. Use for API request flows, distributed-system protocols, agent tool-call sequences.

  **Naming choice:** the new time-axis primitive is `TimeAxis`, not `Timeline`, to avoid colliding with the existing event-list `<Timeline>` in `components/timeline`. Both ship side by side; the schemas explicitly call out the disambiguation in their `whenToUse` / `whenNotToUse`.

  **Patterns shared with the prior stacks:**
  - Layout pass memoized on input identity for all three primitives
  - Every artifact emits `role="img"` + non-empty `<title>`/`<desc>`
  - Interactive elements (TimeAxis events, Gantt task bars, Sequence actors + messages) declare `role="button"`, `tabIndex=0`, `aria-label`, and Enter/Space keyboard activation
  - `data-row` / `data-depth` / `data-type` attributes for theming and test introspection

  **Schemas:**

  All three declare full `ai` blocks. The schemas' `commonMistakes` capture the locale-dependent date-string footgun, dependency-cycle warnings (Gantt), missing-id silent-skip behavior (all three), the elapsed-time-vs-order distinction (TimeAxis vs Timeline), and the sync/async/return arrow-style semantics (Sequence). All are lift-into-validation-ready for an LLM consumer.

  Stacks on top of `feat/artifacts-relational-stack`. No new heavy peers and no registry/MCP changes — the `artifact` category enum was widened in the hierarchy stack and all subsequent stacks reuse that surface.

### Patch Changes

- e82f935: fix(artifacts): unblock diagram primitives + 3 a11y violations + dark-mode card lift

  **User-visible: dark-mode `--card` and `--border` are slightly lighter** so SVG-rendered surfaces are distinguishable from the page background. `--card` lifted from L=8% → L=14% and `--border` from L=14% → L=24% in `defaultTheme.tokens.dark` AND the docs CSS bridge. Every consumer's dark mode picks this up — Card/Dialog/Popover chrome reads cleaner; OrgChart/Flowchart/Sequence/Sunburst's bare-SVG cards are now visible. The regular `<Card>` component compensated with box-shadow chrome that bare SVG couldn't replicate, making the gap-of-6 invisible there but breaking SVG.

  PR #136 shipped 23 artifact components that referenced `hsl(var(--primary))` / `--accent` / `--secondary` / `--muted` for SVG fills and strokes — but those raw HSL-triplet token names were never defined in the docs CSS bridge (only the Tailwind v4 `--color-*` form existed). Result: every artifact rendered with default-black SVG fills, sankey links were entirely invisible, and the "scan failed" pages in the regression gate (sunburst, time-axis, tree-map, venn) all collapsed to monochrome blobs.

  This release wires the bridge AND introduces a perceptually distinct chart palette so categorical-data diagrams (sunburst, treemap, sankey, chord, funnel, pyramid, venn, matrix) cycle through six hues instead of one. The chart palette tokens carry a `var(--primary)` fallback so consumers on a custom theme without the chart family fall back to monochrome slate instead of black SVG.

  **`@hex-core/tokens`** — `defaultTheme`, `emberTheme`, and `midnightTheme` all now ship `chart-1` … `chart-6` HSL triplets in both `light` and `dark` token sets, hue-tuned per theme. `defaultTheme.tokens.dark` also lifts `--card` (L=8%→14%) and `--border` (L=14%→24%) per the user-visible callout above.

  **`@hex-core/components`** —
  - New shared `lib/chart-palette.ts` exports `CHART_PALETTE` + `pickChartHue(idx)`. Used by every artifact that encodes categorical data — replaces 7 in-file `CHART_PALETTE` declarations. Every entry is `hsl(var(--chart-N, var(--primary)))` so consumers without the chart family get a slate fallback instead of black.
  - **Sunburst**: replaced `--primary`/`--accent`/`--secondary`/`--muted` depth palette with `--chart-1..6` cycled by depth-1 ancestor (so all "Equity" descendants share a hue, distinct from "Fixed Income"). Added segment labels with stroke-outline contrast and depth-driven opacity falloff.
  - **TreeMap**: chart palette cycled by leaf index (single-level trees) or depth-1 ancestor (nested). Labels now show `value` below the label when the cell has room. Outlined text for legibility on any fill.
  - **Sankey**: links now use the source node's chart hue so volume flows are traceable. Nodes use chart palette. Both `stroke="hsl(var(--primary))"` and `fill="hsl(var(--primary))"` were silently invalid before — links rendered as `stroke: none` and disappeared entirely.
  - **Chord**: arcs and ribbons use chart palette (ribbons inherit source-arc hue). Replaced fixed `radius - 24` label margin with `max(40, longestLabel * 6 + 16)` so wide labels (Americas, Manufacturing) no longer clip against the SVG edge.
  - **Funnel** + **Pyramid**: chart palette per stage/tier with stroke-outlined labels (visible even when the polygon is too narrow to back the text).
  - **Venn**: 3-set palette switched from `--primary/--accent/--secondary` (all near-black in monochrome themes — Linux=dark, Windows/Mac=invisible) to `--chart-1/2/3`.
  - **Matrix**: cell intensity ramp now uses `--chart-1` (chart-coral) instead of `--primary` (slate), giving heatmaps a recognisable warm-scale gradient.
  - **Gantt** + **TimeAxis**: x-axis tick formatter now uses MM-DD up to 90 days (was 30) AND dedupes consecutive identical labels — eliminates the "2025-01"/"2025-01"/"2025-01" repeat and the "2025"/"2025"/"2025" repeat at year-scale. TimeAxis event-connector stroke switched from `--primary` 0.4 to `--muted-foreground` 0.65 for dark-mode legibility.
  - **Sequence**: lifeline opacity bumped 0.4 → 0.7 — the dashed lifelines were near-invisible against the dark page bg.
  - **Dendrogram**: link opacity bumped 0.6 → 0.8 for dark-mode legibility.
  - **MindMap**: link stroke switched from `--primary` 0.5 to `--muted-foreground` 0.7 — slate primary at 50% opacity disappeared into the dark bg.
  - **Terminal**: now reads `--background` and `--foreground` HSL triplets at mount time and converts to hex for xterm's `theme: { background, foreground }` option (xterm rejects CSS vars). Wrapper bg uses `hsl(var(--background, <fallback-triplet>))`. Consumers who theme `--background` get a terminal that follows the page; consumers mounting Terminal in isolation fall back to hand-tuned defaults. Also fixes the original a11y false positive that motivated the inline-style change (the xterm canvas was painting into pixels axe couldn't read).
  - **Quiz**: replaced the `<ul>` / `<li>` wrapping with `<div>` siblings. The component already overrode `role` to `radiogroup`, which strips the implicit `list` role from `<ul>` and triggered axe's `listitem` rule. Exposed `radiogroup` semantics for screen readers are unchanged.
  - **ImageOcclusion**: removed `aria-hidden="true"` from the overlay container. The overlay houses focusable `<button>` elements, ARIA-hiding their parent triggered `aria-hidden-focus` while also hiding the buttons' labels from assistive tech. Each button already carries full `aria-label` + `aria-pressed` state.
  - **ToolCall**: dark-mode "running" badge now uses `dark:bg-primary dark:text-primary-foreground`. The previous `bg-primary/15 text-primary` pairing put fg and bg in the same hue family at 10px font, dropping below WCAG AA (4.41:1 vs 4.5 floor). Light-mode pairing unchanged.

- Updated dependencies [d67fa60]
- Updated dependencies [b1b9099]
  - @hex-core/registry@0.3.4

## 1.7.0

### Minor Changes

- f213fe8: feat(ai): SpeechRecognition component — Web Speech API toggle for AI Elements parity

  Adds a controlled mic-toggle button that wires up the browser's `SpeechRecognition` API and emits transcript chunks via `onTranscript(text, isFinal)`. Headless on data flow — consumer keeps the text. Falls back to a disabled button when the browser lacks the API (Firefox 2026, older Safari).

  ```tsx
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  <SpeechRecognition
  	isListening={listening}
  	onListeningChange={setListening}
  	onTranscript={(chunk, isFinal) => {
  		if (isFinal) setText((t) => t + chunk);
  	}}
  	lang="en-US"
  />;
  ```

  First entry in the AI Elements parity sweep — closes the Voice category gap. No new peer deps; uses the browser-native API.

### Patch Changes

- 39a5c92: fix(cli): ship sibling/shared variants files, read version from package.json, surface broken internal deps

  `@hex-core/cli@0.3.1` had three issues a fresh-project user hit on day one. This patch addresses all of them and adds a verification sweep so the same class of bug stops slipping through.

  **`@hex-core/cli`** (patch):
  - **`hex add button` now compiles.** Previously the CLI wrote `button.tsx` but not its sibling `button-variants.tsx`, so consumer projects failed with `Module not found: Can't resolve './button-variants'`. The registry build now auto-discovers sibling `*-variants.{ts,tsx}` files, cross-package variants imports (e.g. `pagination → button-variants`), and `_shared/*` files referenced by component sources, and bundles them into each registry manifest. Five components were affected: `button`, `pagination`, `grid`, `cluster`, `stack`.
  - **`hex --version` now reports the real version.** The flag was hardcoded to `"0.1.0"` and had drifted across six releases. The CLI now reads `version` from its own `package.json` at runtime via `fileURLToPath(import.meta.url)`, so the printed version always matches the installed package.
  - **Broken internal deps now warn instead of silently dropping.** `internalDepToSlug` accepts only the 3-segment path form (`primitives/<slug>/<slug>`); bare slugs returned `null` and were silently skipped, leaving `loading → skeleton`, `toggle-group → toggle`, and `form → label` with unresolvable imports. Those three schemas are now corrected, and `installOne` prints a visible warning when it sees a malformed dep so future authoring drift surfaces immediately.
  - **Import rewriter** gained two rules for sibling-variants paths (`./button-variants` and `../../primitives/<dir>/<dir>-variants`), with six new unit tests covering the patterns.
  - **README**: the unscoped-`hex-core` collision warning is promoted above Quickstart and reformatted as a `> [!WARNING]` GitHub admonition so first-time readers can't miss it.

  **`@hex-core/components`** (patch):
  - `loading.schema.ts`, `toggle-group.schema.ts`, `form.schema.ts` updated to use the canonical `primitives/<slug>/<slug>` form for internal deps, matching the convention already used by `data-table`.

  **`@hex-core/registry`** (patch):
  - All 77 component manifests regenerated. New `verify-add-all.ts` script runs `hex add <slug>` against every component in an isolated temp dir and asserts each `@/...` import resolves to a written file — caught the three bare-slug regressions above and is now part of the toolkit for future releases.

- Updated dependencies [39a5c92]
  - @hex-core/registry@0.3.3

## 1.6.0

### Minor Changes

- b8d89dc: feat(components): tier-1 catalog gaps — 7 new components

  Audit-driven batch closing the highest-leverage gaps surfaced by
  comparing the catalog against shadcn/Radix Themes/Mantine/Park UI/Ariakit:

  **Feedback-state primitives** (F2-11 consumer-feedback trio + Tag):
  - **`Empty`** — zero-state surface for lists / dashboards / search
    results with no content. icon + title + description + action slot.
    Region landmark labeled by the title for screen readers.
  - **`Loading`** — composed loading-placeholder pattern. Skeleton is the
    atom (one shaped pulse), Loading is the molecule (canonical multi-row
    patterns: list / card / stack). `role="status"` + sr-only label.
  - **`ErrorState`** — failure surface with optional retry button.
    `role="alert"` so screen readers announce on first render. Restrained
    default tone + alarm-bias destructive variant.
  - **`Tag`** — interactive tag/chip primitive. Mirrors Badge's CVA
    variants but adds a built-in dismiss `×` when `onRemove` is provided.
    Auto-derived `aria-label` from string children.

  **Composition primitives**:
  - **`Tree`** — generic hierarchical list with roving-tabindex keyboard
    navigation (↑↓ move, → expand, ← collapse, Home/End first/last,
    Enter/Space activate). Distinct from `FileTree` — content-agnostic
    for org charts, taxonomy pickers, navigation trees.
  - **`Toolbar`** — group of controls with arrow-key roving focus.
    Wraps `@radix-ui/react-toolbar` (NEW dep). Exposes `Toolbar`,
    `ToolbarButton`, `ToolbarLink`, `ToolbarToggleGroup`,
    `ToolbarToggleItem`, `ToolbarSeparator`. Horizontal + vertical.

  **AI category extension**:
  - **`Attachment`** — file/image thumbnail with optional remove
    affordance + upload-progress overlay. Auto-detects image vs file
    variant from MIME + preview URL. Composes with `Composer` for
    multimodal message drafts.

  All seven ship with full intent metadata: variant `useWhen` per
  schema, structured `antiPatterns[]` with `insteadUse` slugs pointing to
  the right alternative for each canonical mistake, `composition` tags on
  every example so MCP `search_compositions` finds them, and the standard
  `whenToUse` / `whenNotToUse` / `accessibilityNotes` per CLAUDE.md.

  Visual signature alignment: every component reads as part of the new
  modern-minimalist palette (graphite primary, 0.375rem radius, restrained
  chroma) — no magic HSL values, all semantic tokens.

  **New dep:** `@radix-ui/react-toolbar@latest` — small Radix package,
  runtime dep matching the pattern of the 30+ other Radix peers.

  **Tests:** 56 new test cases (Empty 6, Loading 5, ErrorState 7, Tag 7,
  Toolbar 5, Tree 6, Attachment 8).

### Patch Changes

- 27ba21d: fix(a11y): resolve critical label + serious contrast/nested-interactive violations

  Dropzone (components): add `aria-label` + `tabIndex={-1}` to the
  hidden file input. Fixes axe `label` (critical — unlabeled input) and
  `nested-interactive` (serious — focusable descendant inside
  `role="button"`). The input remains in the AT tree for NVDA/JAWS
  forms-mode discovery; `tabIndex={-1}` removes it from the sequential
  tab order so the outer `role="button"` is the sole keyboard surface.

  Default theme (tokens): tighten destructive contrast to meet WCAG AA
  4.5:1 on both modes. Light: L 50% → 43% (#c0282a, ~5.7:1 on
  destructive/5 bg). Dark: L 50% → 58% (#c96363, ~5.3:1 on dark card
  bg). Fixes `text-destructive` contrast in Alert, Input error messages,
  Stepper, and Textarea validation in dark mode.

## 1.5.0

### Minor Changes

- feat(components): add ai primitive category — 11 components

  New top-level `ai/` category with SDK-agnostic primitives that map
  cleanly to AI SDK v5 UIMessage parts, LangChain BaseMessage, and
  Mastra agent outputs.

  Components: Message, MessageList, Composer, ToolCall, LoadingIndicator,
  Suggestion, MessageActions, Reasoning, Citation, Markdown, CodeBlock.

  New deps: `shiki` (CodeBlock syntax highlighting via async RSC),
  `streamdown` (streaming-safe Markdown rendering).

## 1.4.0

### Minor Changes

- 4449147: feat(components): per-component bundle split + RSC-safe deep imports

  Refactor `@hex-core/components` from a single 365 KB client-only bundle into
  per-component ESM files. New deep-import path (`@hex-core/components/<name>`)
  ships the bare minimum for each component and preserves the file's
  `"use client"` directive (or its absence) so consumers can render visual
  primitives in Server Components.

  **RSC-safe (no `"use client"`):** `Alert`, `Badge`, `Card`, `Cluster`, `Grid`,
  `Input`, `Pagination`, `Skeleton`, `Spacer`, `Stack`, `Table`, `Textarea`,
  `Timeline` — render directly in Next.js Server Components without forcing
  the subtree client-side.

  **Client-only (preserves `"use client"`):** Everything that touches a Radix
  primitive, a hook, `react-hook-form`, `cmdk`, `vaul`, `sonner`,
  `react-day-picker`, `input-otp`, or `react-resizable-panels`.

  ```ts
  // RSC-safe — page can stay a Server Component
  import { Badge } from "@hex-core/components/badge";
  import { Card, CardContent } from "@hex-core/components/card";

  // Client-only — module declares "use client"
  import { Dialog } from "@hex-core/components/dialog";
  import { Form } from "@hex-core/components/form";
  ```

  The barrel `import { Button } from "@hex-core/components"` keeps working but
  is now marked client (it inlines stateful re-exports), so prefer deep
  imports when targeting RSC.

  **Tree-shake unblocked.** `"sideEffects": false` + per-component output
  means using 9 components no longer pulls in the other 38.

  **Optional peers (was: dependencies).** `cmdk`, `vaul`, `sonner`,
  `input-otp`, `react-day-picker`, `react-resizable-panels`, `date-fns`,
  `react-hook-form`, `@tanstack/react-table` are now optional peers — install
  only the ones backing the components you use. See README "Peer dependency
  matrix" for the full table.

  **Why minor, not major:** the barrel import API is unchanged and
  shape-compatible. Consumers using only deep imports see no breakage.

  **⚠ Runtime-crash risk for transitive consumers:** if you previously used
  `<Calendar>`, `<DatePicker>`, `<Toaster>`, `<Combobox>`, `<Drawer>`,
  `<InputOTP>`, `<Resizable*>`, `<Form>`, or `<DataTable>` WITHOUT
  explicitly adding the backing peer to your `package.json`, those
  components will throw `Cannot find module 'react-day-picker'` (or
  `'sonner'`, `'cmdk'`, etc.) at first render after upgrading. Install the
  listed peer per the README "Peer dependency matrix" before upgrading. We
  considered shipping this as `2.0.0` for strict semver, but landed on
  minor because the contract that's changing was implicit (transitive)
  rather than declared.

  **Schema re-exports moved.** `buttonSchema`, `cardSchema`, etc. are no
  longer on the runtime barrel — they live at
  `@hex-core/components/schemas` so the barrel's TypeScript surface no
  longer references `@hex-core/registry`. Tooling (MCP, CLI, docs prop
  tables) imports schemas from the new entry; `@hex-core/registry` becomes
  a dev-time install for those consumers only.

  **Migration:** none required for component imports. If you imported
  `buttonSchema` (or any other `*Schema`) from `@hex-core/components`,
  switch to `@hex-core/components/schemas`. To unlock RSC + tree-shake,
  switch barrel component imports to deep imports
  (`@hex-core/components/<name>`). To silence peer warnings, install the
  optional peers backing the components you use (see README table).

### Patch Changes

- Updated dependencies [00e0344]
  - @hex-core/registry@0.3.1

## 1.3.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0

## 1.3.0

### Minor Changes

- 062bec3: Adds `ColorPicker` — an HSL-native color editor that round-trips losslessly through the `@hex-core/tokens` HSL triplet format (`"<H> <S>% <L>%"`).

  The picker edits an HSL triplet directly via three labeled sliders (Hue / Saturation / Lightness). A hex input sits beside them as a display adapter — sliders are the source of truth, so the value never loses precision when round-tripping triplet → hex → triplet during slider drags. Invalid hex input is held in a local buffer and not committed until it parses cleanly. The buffer also resists clobbering while the input is focused, so users can type intermediate states without parent re-renders snapping the caret.

  Each `<ColorPicker>` instance generates a stable internal `id` via `React.useId()`, so multiple pickers can render on the same page (e.g. one per token in a theme editor) without label-collision.

  API:

  ```tsx
  const [color, setColor] = React.useState("240 5.9% 10%");
  <ColorPicker value={color} onChange={setColor} aria-label="Primary color" />;
  ```

  Composition: `Popover` (trigger + body) + three `Slider` rows + an `Input` for hex + a swatch preview. Per-axis `aria-label`s (Hue / Saturation / Lightness) on the sliders; the trigger requires an explicit `aria-label` describing the role of the color being edited.

  Also exports the underlying color utilities — `parseHslTriplet`, `formatHslTriplet`, `hslToRgb`, `rgbToHsl`, `hslTripletToHex`, `hexToHslTriplet` plus `HslTriplet` and `RgbColor` types — under `@hex-core/components`. These are pure, testable functions for any consumer that needs to bridge between hex and triplet formats outside the picker UI.

  Registry rebuilt: 52 → 53 component items.

- 6eca0c1: feat(components): forward `captionLayout`, `startMonth`, `endMonth` on `DatePicker` for year-dropdown navigation

  The DatePicker trigger previously gave consumers no way to opt into the native year `<select>` that `react-day-picker` v9 supports. For birth-date and other far-out-year inputs that meant chevron-clicking through dozens of months — long enough that the [shadcn issue](https://github.com/shadcn-ui/ui/issues) about it (P-032) has stayed open as a top request.

  This change adds three pass-through props that map directly onto the underlying `Calendar` (which already forwards them to `react-day-picker`):

  ```tsx
  <DatePicker
  	value={dob}
  	onChange={setDob}
  	placeholder="Date of birth"
  	captionLayout="dropdown"
  	startMonth={new Date(1925, 0)}
  	endMonth={new Date(new Date().getFullYear(), 11)}
  	aria-label="Date of birth"
  />
  ```

  `captionLayout` accepts `"label"` (default — chevron buttons only), `"dropdown"`, `"dropdown-months"`, or `"dropdown-years"`. The schema's `commonMistakes` and a new `Birth-date picker with year dropdown` example call out that `captionLayout="dropdown"` should always be paired with explicit `startMonth`/`endMonth` — RDP's default ±100-year window produces an unwieldy 200-option dropdown.

  A new `date-picker.test.tsx` covers four cases: default has no native `<select>`, `dropdown` mode mounts year + month selects, changing the year select updates the visible grid, and date selection still fires `onChange` after using the dropdown.

  Theme D pain-point P-032 closed.

- 6eca0c1: feat(components): add `Dropzone` — drag-and-drop file input with full keyboard a11y

  `Dropzone` is the upload primitive that's been a top-5 [shadcn feature request](https://github.com/shadcn-ui/ui/issues) for years (pain-point P-033). Built on the **native HTML5 drag-drop API** plus a visually-hidden `<input type="file">` so it ships with **zero new dependencies** — no `react-dropzone`, no custom polyfills.

  The visible body is a `role="button"` div with `tabIndex=0` and the required `aria-label`. Click, Enter, or Space opens the file dialog through the hidden input — every interaction path is covered for sighted, keyboard, and screen-reader users alike. The hidden input is the focusable element so assistive-tech file pickers work.

  ```tsx
  <Dropzone
  	accept="image/*"
  	maxSize={5 * 1024 * 1024}
  	onFilesSelected={(picked) => setFiles((f) => [...f, ...picked])}
  	aria-label="Upload images"
  />
  ```

  Filtering happens before `onFilesSelected` fires:
  - `accept` — supports MIME types (`"image/png"`), wildcards (`"image/*"`), and extensions (`".csv"`)
  - `maxSize` — files over the byte cap are dropped silently
  - `maxFiles` — total cap (after filtering); excess are sliced off
  - `multiple` — defaults to `true`; set `false` for single-file UX

  Drag state is exposed via `data-drag-over` (CSS-only state styling) **and** through a render-prop API:

  ```tsx
  <Dropzone aria-label="Upload">
  	{({ isDragOver }) => <span>{isDragOver ? "Release" : "Drop a file"}</span>}
  </Dropzone>
  ```

  The hidden input's `value` is reset after every emit so picking the same file twice still fires `onFilesSelected`. Dragenter/dragleave use a counter to handle nested children correctly (the typical "flicker on hover over icons" bug).

  Eight tests cover the role/tabindex/aria-label wiring, Enter + Space keyboard activation, drop event emission, `accept` filtering by MIME prefix, `maxSize` enforcement, the disabled state's tab-removal + drop-ignore, and the `data-drag-over` lifecycle.

  Registry rebuilt: 55 → 56 components. Theme D pain-point P-033 closed.

- 6eca0c1: feat(components): add `FileTree` — WAI-ARIA tree with full keyboard navigation

  `FileTree` is the hierarchical-navigation primitive [shadcn has skipped](https://github.com/shadcn-ui/ui/issues) despite growing IDE/Cursor-era demand (pain-point P-035). Built on the **WAI-ARIA tree pattern** — `role="tree"` on the root, `role="treeitem"` per node, `role="group"` per child container, with `aria-level`, `aria-expanded` (folders), `aria-selected`, and `aria-disabled` reflecting state.

  ```tsx
  const nodes = [
  	{
  		id: "src",
  		name: "src",
  		children: [
  			{ id: "src/index.tsx", name: "index.tsx" },
  			{
  				id: "src/components",
  				name: "components",
  				children: [{ id: "src/components/Button.tsx", name: "Button.tsx" }],
  			},
  		],
  	},
  	{ id: "package.json", name: "package.json" },
  ];

  <FileTree
  	aria-label="Project files"
  	nodes={nodes}
  	defaultExpanded={["src"]}
  	selected={selected}
  	onSelect={setSelected}
  />;
  ```

  Full **keyboard navigation** matching the [WAI-ARIA APG tree pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/):
  - **ArrowDown / ArrowUp** — move between visible items (focus follows, but `onSelect` does NOT fire — selection is independent of focus)
  - **ArrowRight** — expand a closed folder, or move to first child if open
  - **ArrowLeft** — collapse an open folder, or move to parent
  - **Home / End** — jump to the first / last visible item
  - **Enter / Space** — activate (toggles expand on folders, fires `onSelect` for everyone)

  **Roving tabindex** — only the active node has `tabIndex=0`, the rest have `tabIndex=-1`, so Tab in/out skips the tree as a whole and arrow keys handle internal navigation. `requestAnimationFrame` defers focus moves so the new tabbable element is in the DOM before `.focus()` runs.

  Expanded state is **uncontrolled by default** (`defaultExpanded={["src"]}`); pass `expanded` + `onExpandedChange` for controlled mode. Selected is purely controlled via `selected` + `onSelect`.

  Each node has `id`, `name`, optional `children`, optional `icon` override, and optional `disabled`. Default icons are folder (open/closed variants) and file SVGs; pass `icon` per-node to use Lucide or any other set. Disabled nodes carry `aria-disabled="true"` and ignore clicks/keyboard activation.

  Eight tests cover the tree role + label, default-collapsed state, `defaultExpanded` reveal + correct `aria-level` propagation, click-to-toggle vs click-to-select branching, ArrowRight/ArrowLeft expand/collapse, Enter activation on leaves, disabled node click suppression, and the roving-tabindex single-tabbable invariant.

  Registry rebuilt: 57 → 58 components. Theme D pain-point P-035 closed — Theme D **success signal hit (7/7)**.

- 6eca0c1: feat(components): add `MultiCombobox` — searchable multi-select on Popover + Command

  shadcn's maintainers have explicitly declined to ship a multi-select primitive — long-standing pain-point P-031. Hex Core now ships one.

  `MultiCombobox` is a sibling to the existing `Combobox`: same `Popover` + `cmdk` Command list, same trigger token surface, but `value` is `string[]` and selecting an option toggles membership instead of replacing the value. The trigger reads `"{n} selected"` once any option is picked (chosen over chip-stack to keep the `role="combobox"` button at a stable height); the comma-joined label list is mirrored on the trigger's `title` attribute as a pointer/screen-reader fallback. A visually-hidden `aria-live="polite"` region announces selection-count changes.

  ```tsx
  const [picks, setPicks] = useState<string[]>([]);

  <MultiCombobox
  	options={[
  		{ value: "bug", label: "Bug" },
  		{ value: "feature", label: "Feature" },
  	]}
  	value={picks}
  	onChange={setPicks}
  	aria-label="Tags"
  />;
  ```

  A `maxSelected` cap is supported as a UX hint — once reached, unselected options carry `aria-disabled="true"` and clicks are ignored. `closeOnSelect` defaults to `false` to match the Linear/Notion multi-select pattern; set it `true` for one-shot pickers.

  ARIA wiring matches the existing `Combobox`: trigger is `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, and `aria-controls` only set while the popover is open (the listbox is portal-mounted, so a permanent `aria-controls` would point at a non-existent id). Each list item carries `aria-selected` reflecting the controlled `value` set.

  Six tests cover trigger a11y wiring, picking + toggling-off, the `maxSelected` cap, per-option `aria-selected`, and the trigger's `"{n} selected"` + `title` mirror.

  Registry rebuilt: 53 → 54 components. Theme D pain-point P-031 closed.

- 6eca0c1: feat(components): add `Stepper` — linear progress for multi-step flows with per-step error state

  `Stepper` is a semantic-HTML primitive for form wizards, onboarding, checkout, and any sequenced flow where the user needs to know where they are and what's next. shadcn has had two long-running discussions (#1422, #4276 — pain-point P-036) about adding one and never has.

  The component renders an `<ol>` with the required `aria-label`, one `<li>` per step, and per-step status derived from the controlled `current` index — except when the consumer pins a step's `status` explicitly. The status union is `"complete" | "current" | "upcoming" | "error"`; `"error"` lets a wizard surface a validation failure on the current or a prior step without lying about its index.

  ```tsx
  <Stepper
  	aria-label="Checkout"
  	current={2}
  	steps={[
  		{ id: "cart", label: "Cart" },
  		{ id: "shipping", label: "Shipping", status: "error" },
  		{ id: "payment", label: "Payment" },
  	]}
  />
  ```

  The current step's interactive child carries `aria-current="step"`. Completed steps prefix the label with a visually-hidden `"Completed: "`; error steps prefix `"Error: "` and set `aria-invalid="true"` on the indicator. When `onStepClick` is omitted the steps are non-interactive `<span>`s — no fake button roles. When provided, each step renders as a real `<button>` with focus-ring tokens; `step.disabled` no-ops the click.

  `size="sm" | "md"` and `orientation="horizontal" | "vertical"` are CVA variants — the vertical layout flips the connector to a 1px column rather than a row. All theming hooks token-based (`--control-height-sm`, `--gap-md`, `--space-3`, `--space-1`, `--duration-normal` plus `primary`, `destructive`, `input`, `muted-foreground`, `ring` semantic tokens).

  Six tests cover the `<ol>` + `aria-label` shape, `aria-current` on the current step + `Completed:` prefix on prior ones, the non-interactive `<span>` path, the interactive `<button>` path with disabled steps, the `status="error"` override + `aria-invalid`, and the vertical orientation root class.

  Registry rebuilt: 53 → 54 components. Theme D pain-point P-036 closed.

- 6eca0c1: feat(components): add `TimePicker` — token-styled native time input

  `TimePicker` ships the #1 most-reacted [shadcn feature request](https://github.com/shadcn-ui/ui/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc) (pain-point P-030). It's a **styled wrapper around the native `<input type="time">`** — the browser handles 12/24-hour locale based on user system settings, keyboard arrow spinning across hour/minute (and seconds) segments, and screen-reader announcement of each segment. The wire format is always 24-hour `"HH:MM"` (or `"HH:MM:SS"` when `step={1}`), so values round-trip cleanly through forms.

  ```tsx
  const [time, setTime] = useState<string>();

  <TimePicker
  	value={time}
  	onChange={setTime}
  	step={300} // 5-minute step
  	min="09:00"
  	max="17:00"
  	aria-label="Working hours start"
  />;
  ```

  Why native: the alternative (Popover with hour/minute scroll columns) needs a substantial custom interaction layer with locale-specific 12/24-hour toggling, screen-reader-friendly announcements, and arrow-key spinning of each segment. The native input gives all of that for free with full a11y; the only cost is the browser's default calendar-picker indicator styling, which is tuned via `[&::-webkit-calendar-picker-indicator]` so it picks up the design system's hover state.

  Forwards `ref` so it integrates with `react-hook-form` (`{...register("time")}`) and any other controlled form library. `step` accepts standard time-input values: `60` (default, HH:MM), `1` (HH:MM:SS), `300` (5-min steps), `900` (15-min), `1800` (30-min).

  Five tests cover input type + value rendering, onChange wire format, step/min/max forwarding, disabled state, and ref forwarding.

  Registry rebuilt: 56 → 57 components. Theme D pain-point P-030 closed.

- 6eca0c1: feat(components): add `Timeline` — vertical chronological event feed

  A vertical activity-log primitive for audit trails, release notes, notification streams, and any chronological event surface — the request that's lived in [shadcn issues](https://github.com/shadcn-ui/ui/issues) for years (pain-point P-034) without ever shipping.

  Pure semantic HTML — `<ol>` of `<li>` with the required `aria-label` on the list. Each event has a status-colored indicator (`default | success | warning | error | info`), an optional icon override, and three text slots: title, timestamp, description.

  ```tsx
  <Timeline
  	aria-label="Activity"
  	events={[
  		{ id: "1", title: "Pull request opened", timestamp: "2h ago", status: "info" },
  		{ id: "2", title: "CI passed", timestamp: "1h ago", status: "success" },
  		{
  			id: "3",
  			title: "Merged to main",
  			timestamp: "12m ago",
  			description: "Squash + merge by @oscar",
  			status: "success",
  		},
  	]}
  />
  ```

  The connector line and indicator are `aria-hidden` so meaning travels entirely in the title/timestamp/description text. No `aria-current` — events are historical, not navigational. `size="sm" | "md"` controls the indicator size.

  Five tests cover the `<ol>` + `aria-label` shape, surfaced text content, custom icon override, last-event has-no-connector layout, and the `aria-hidden` discipline on the visual rail.

  Registry rebuilt: 54 → 55 components. Theme D pain-point P-034 closed.

## 1.2.1

### Patch Changes

- f21896a: Ship a Tailwind v4 entry point so consumers don't have to hand-wire `@source` for `node_modules`.

  Tailwind v4 doesn't auto-scan installed packages. Without an explicit `@source` directive in the consumer's CSS, utility classes embedded in this package's published bundle (e.g. `inset-ring-foreground/[0.06]` introduced by the v1.2.0 flat-surface fix) appear in the rendered HTML but have no matching CSS rule, leaving Button outline / Input / Card / etc. unstyled. The gap was discovered while validating v1.2.0 in a downstream consumer.

  Adds:
  - `packages/components/tailwind.css` exporting an `@source "./dist/*.js"` directive
  - A new `./tailwind.css` exports entry in `package.json`
  - Install-section update in the README explaining the one-line consumer setup

  Consumer migration (one line):

  ```css
  @import "tailwindcss";
  @import "@hex-core/components/tailwind.css";
  ```

  No runtime API changes. Existing consumers who already added their own `@source "../../node_modules/@hex-core/components/dist/*.js"` can replace it with the `@import` line, but the manual approach continues to work.

## 1.2.0

### Minor Changes

- 22d9416: Fix systemic flat-surface visibility regression across 30 components.

  On flat-white surfaces (any consumer page without a Card-elevated wrapper around the demo), components rendered with ~invisible boundaries because token borders (`border-input`, `border-border`) sit at L=90% — 1.27:1 contrast vs `--color-background`. The v1.0.2→v1.1.1 token rollback (#73) intentionally kept borders subtle and relied on shadow elevation from surrounding Card/Popover/Dialog, but that contract only holds when the surrounding surface IS elevated.

  This release adds a self-borne shape cue to every affected component using Tailwind v4 `inset-ring` / explicit `-foreground/[opacity]` borders. Token contracts are preserved (`border-input` still applies); the inset ring is additive so components remain subtle on already-elevated surfaces and become visible on flat ones.

  Affected:
  - Form controls (Type A): Button outline+secondary, Badge secondary+outline, Input, Switch unchecked, Checkbox, RadioGroupItem, Textarea, SelectTrigger, Toggle outline, InputOTPSlot, Combobox trigger, DatePicker trigger, AlertDialogCancel.
  - Surface containers (Type B): Card, Dialog, Sheet, Drawer, Popover, DropdownMenu, ContextMenu, Menubar, NavigationMenuViewport, AlertDialog, HoverCard, DataTable wrapper, Alert default, Calendar nav, SelectContent.
  - Single-edge dividers (Type C): Accordion, Table (header/row/footer), Tabs (TabsList border), Sidebar, Command (CommandInput border-b).
  - Tracks/separators (Type D): Progress, Slider, Separator, ScrollBar thumb, Skeleton, Resizable handle, NavigationMenu indicator, plus dropdown/menubar/context/command/select separator divs.

## 1.1.1

### Patch Changes

- 0029977: Fix: full rollback of the v1.0.2 light-theme contrast bumps. Restore canonical Button/Badge hover.

  The v1.0.2 release pushed `--secondary`, `--border`, and `--input` to L=58% to satisfy strict WCAG 2.1 SC 1.4.11 (3:1 against the white `--card`). On the live docs site this rendered:
  - Secondary buttons as heavy mid-gray pills (finding #14)
  - Card frames, Tabs, Input borders, and surrounding chrome with a clearly-visible mid-gray that made every framed surface look heavier than the components inside

  The strict reading was correct on paper but produced a layout that real users described as "awful." This PR reverts all three light-theme tokens to their original values:
  - `--secondary` light: 58% → **95.9%**
  - `--border` light: 58% → **90%**
  - `--input` light: 58% → **90%**

  It also restores the canonical `hover:bg-secondary/80` on Button and Badge `secondary` variants — at the lighter fill, the 80%-alpha-over-white composite is the gentle subtle-darken hover (vs the L=58% version which would composite below 3:1).

  **WCAG trade-off**

  `--border` and `--input` at L=90% give ~1.27:1 against the white `--card`, failing strict SC 1.4.11. The team accepts this trade-off because:
  - **Filled controls (Secondary button, Badge):** the near-black `--secondary-foreground` text gives ~16:1 contrast against the L=95.9% fill — that perceivable cue carries the boundary identification.
  - **Framed surfaces (Card, Popover, Dialog):** shadow elevation provides perceivable affordance independent of border color.
  - **Form-control borders (Input, Switch off-state):** these remain the legitimate residual concern; consumers who need strict 1.4.11 compliance can override the three tokens at `:root`. Tracked as a longer-term design decision rather than a hidden bug.

  `--muted-foreground` (L=38%) and the dark-mode values are unchanged. Finding #12 (the original Outline-button-invisible report) is intentionally re-opened in the findings tracker as a known trade-off rather than a closed bug.

  **Other changes carried along:**
  - Three inline copies of the default light theme (mcp-server theme-loader, docs theming snippet, docs installation snippet) sync to the rolled-back values.
  - `Spacer` JSDoc — removed `h-[var(...)]` and `w-[var(...)]` literal examples from the comment block; Tailwind v4's content scanner was attempting to compile them as actual CSS classes and failing PostCSS with `Unexpected token Delim('.')`. No runtime/API change.
  - Registry items for `button` and `badge` regenerate to reflect the restored `hover:bg-secondary/80` source.

## 1.1.0

### Minor Changes

- ec3095b: Adds five headless layout primitives to `@hex-core/components` and four matching tokens to `@hex-core/tokens`.

  **`@hex-core/components`**
  - **`Container`** — centered max-width wrapper with `size` (sm/md/lg/xl/full → bound to `--container-{sm,md,lg,xl}`) and `padding` (none/sm/md/lg → bound to `--space-*`). Supports `asChild` for polymorphic rendering as `<main>`, `<section>`, etc.
  - **`Stack`** — vertical flex flow with `gap`, `align`, `justify` bound to `--gap-*`. Headless equivalent of `<div className="flex flex-col gap-X">`.
  - **`Cluster`** — horizontal flex flow with wrap. Same `gap`/`align`/`justify` surface as Stack but wraps when out of horizontal space; `align` includes `baseline` (for mixed-size siblings) and `stretch` (for equal-height card rows).
  - **`Grid`** — CSS grid with column-count presets (1/2/3/4/6) plus `cols="auto-fit"` + `minColWidth` for responsive grids without media queries.
  - **`Spacer`** — declarative `aria-hidden` whitespace block with `size` (xs–xl, bound to `--space-*`) and `axis` (vertical/horizontal/both). Use when sibling spacing can't come from a parent's `gap`.

  All five are React 19-style components (no `forwardRef`), token-driven (no hardcoded colors or spacings), and ship under `primitives/` with `subcategory: "layout"` so the registry surfaces them as a coherent group. Each schema includes the mandatory `ai` field (whenToUse / whenNotToUse / commonMistakes / relatedComponents / accessibilityNotes / tokenBudget).

  `gap`, `justify`, and `align` variant maps are factored into a shared `_shared/layout-variants.ts` so all three flow primitives stay in lockstep when the gap scale changes.

  Schemas are exported from the package barrel (`containerSchema`, `stackSchema`, `clusterSchema`, `gridSchema`, `spacerSchema`).

  **`@hex-core/tokens`**

  Adds `--gap-xs` (0.25rem), `--gap-xl` (2rem), and `--container-sm/md/lg/xl` (33/40/50/66rem) to `sharedTokens`. The new layout primitives consume these directly; pre-existing components are unaffected.

  Registry rebuilt: 47 → 52 component items.

## 1.0.1

### Patch Changes

- fe050d0: Fix: light-theme `--secondary`, `--border`, and `--input` now meet WCAG 2.1 SC 1.4.11.

  Previously the default theme's light-mode `--secondary` (L=95.9%), `--border` (L=90%), and `--input` (L=90%) sat at ~1.10:1 / ~1.27:1 contrast against `--card` (white) — well below the 3:1 minimum required for non-text UI components. The bug was visible on hex-core.dev/docs/components/button: Outline and Secondary `<Button>` variants were nearly invisible against the white card surface, and form-control borders, Card borders, Switch tracks, Progress tracks, and Slider tracks were all undetectable as discrete UI elements.

  All three tokens now sit at L=58%, giving ~3.2:1 contrast against white — clearing WCAG 1.4.11. The full axe-core audit (`pnpm run a11y-audit`) passes zero critical/serious/moderate/minor violations across every component demo for the **default** theme in light + dark modes.

  `@hex-core/components` also gets a patch: Button (`secondary` variant) and Badge (`secondary` variant) drop their `hover:bg-secondary/80` opacity-shift hover state, because at the new L=58% fill, an 80% alpha composite over white renders the apparent contrast to ~2.44:1 — a hover-state regression below 3:1. Button substitutes shadow elevation (`shadow-sm` → `shadow-md` on hover); Badge keeps the fill at full opacity (badges don't traditionally need a hover affordance — they're not interactive controls).

  **Patch-vs-major rationale** — Theme A (the previous tokens MAJOR bump) required code-level migration: consumers using `--destructive-foreground` on non-destructive surfaces had to re-point those surfaces. This PR only shifts pixel values for a fixed set of tokens; no consumer code change is required. Defenders who want the prior off-white aesthetic can override the three tokens at `:root` (acknowledging they then fail WCAG 1.4.11). That distinction is what makes patch defensible here despite the visible visual change.

  **Audit scope honesty** — `scripts/a11y-audit.ts` only renders the default theme in light + dark, not midnight or ember. The midnight and ember _light_ variants share a similar pattern (~1.18:1 / ~1.17:1 secondary-vs-card) and have the same defect; they're tracked as a follow-up to finding #12 and not gated by this PR's audit run.

  Dark-mode values are unchanged — they already exceeded 3:1 against the dark `--card`. `--secondary-foreground` stayed at L=10% — gives 5.6:1 against the new L=58% fill (passes AA normal text). `--muted` and `--accent` also stayed at L=95.9% — they're text-background tokens, not "non-text UI elements" per 1.4.11.

## 1.0.0

### Major Changes

- 6c8c141: Theme A — WCAG 2.2 AA accessibility compliance.

  Major bump on `@hex-core/components` and `@hex-core/tokens` — there are user-observable behavior and visual changes (see Migration). Everything else is additive or covered by the audit gate.

  ### Migration
  - **Dark `--destructive` lightened, `--destructive-foreground` flipped to dark** across all three theme presets (default / midnight / ember). Required so destructive surfaces and destructive text both pass WCAG 2.2 AA in dark mode. Visual diff: previously a deep red (`hsl(0 62% 30%)`) with white text, now a coral red (`hsl(0 75% 65%)`) with dark text (`hsl(0 75% 15%)`). Consumers who painted `--destructive-foreground` on a _non-destructive_ surface in dark mode (uncommon — most use it inside destructive buttons / alerts) will see dark text instead of white and need to point those surfaces at `--foreground` instead.
  - **`ScrollArea` viewport is now keyboard-focusable by default** (`viewportTabIndex={0}`). Apps that wrap purely decorative content in ScrollArea will see a new tab stop. Pass `viewportTabIndex={-1}` to opt out — the prop is the new opt-out surface and is documented in `scroll-area.schema.ts`.
  - **`CommandSeparator` is no longer the cmdk primitive.** It now renders as `<div role="none" data-cmdk-separator="">` so it can sit inside `CommandList` (`role="listbox"`) without violating ARIA's required-children rule. The `data-cmdk-separator` attribute is preserved for selector compatibility, but anyone reading cmdk's _internal_ Separator state (rare) will need to update.
  - **`DataTable` accessible label prop renamed `ariaLabel` → `aria-label`** (kebab-case quoted prop) to match the convention used elsewhere in Hex UI. This was introduced earlier in the same PR cycle and never shipped publicly, but call it out for anyone tracking pre-release branches.
  - **`Dialog` overflow handling now uses an inner scroll container** (`scrollable={true}` is the default). Long content scrolls inside the focus trap; the close button stays anchored to the (non-scrolling) outer panel. Consumers who previously relied on DialogContent itself being the scroll container (custom `overflow-*` className overrides) should pass `scrollable={false}` and manage scroll themselves — `CommandDialog` does this internally.

  ### Additive changes

  `@hex-core/components`
  - `Combobox`: new `aria-labelledby` prop. Trigger now wires `aria-controls` to a `useId`-stable id pointing at `CommandList`, gated on `open` so it's only set when the listbox is actually mounted.
  - `DataTable`: new `caption?: ReactNode` and `aria-label?: string` props. Previously the table shipped without a caption, leaving screen-reader users without context.
  - `DialogContent`: new `scrollable?: boolean` prop (default `true`). See Migration.
  - `Slider`: new `thumbLabels?: string[]` prop for per-thumb names. Single-thumb sliders auto-mirror the Root's `aria-label`; range sliders fall back to indexed `(N of M)` names if no `thumbLabels` is provided. A dev-mode warning fires when `thumbLabels.length !== value.length`.
  - `ScrollArea`: new `viewportTabIndex?: number` prop. See Migration.
  - `CommandSeparator`: rendered as a presentational div. See Migration.
  - `TableCaption`: now sets `caption-bottom` so the `<caption>` element sits below the table visually while remaining first in document order (announced first by screen readers).

  `@hex-core/tokens`
  - Light `--muted-foreground` tightened to ≥4.5:1 across all three themes.
  - Light `--destructive` darkened so destructive button text passes 4.5:1.
  - Dark destructive flip — see Migration.

  ### Repo
  - New `pnpm run a11y-audit` boots the docs prod build and runs axe-core (`@axe-core/playwright`) against every component demo in light + dark. Fails on critical/serious violations. Wired into CI; report uploaded as a workflow artifact. Hardened against banner-string drift, port collisions, and SIGTERM cancellation.
  - `CONTRIBUTING.md` gains an Accessibility section covering form-control labelling, contrast budget, composite-widget rules, and dialog overflow guidance.

### Patch Changes

- c8a4d52: Fix: published tarballs now correctly pin workspace dependencies.

  Previous releases of `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp` shipped `"@hex-core/registry": "workspace:^"` literal in the tarball's `dependencies`, breaking every consumer outside a pnpm workspace with `npm error code EUNSUPPORTEDPROTOCOL`. `@hex-core/tokens` shipped a similar literal for its registry dependency.

  Root cause: `scripts/publish-local.sh` used `npm publish`, which uploads tarballs as-is. Switched to `pnpm publish`, which rewrites `workspace:^` → pinned `^X.Y.Z` automatically.

  `@hex-core/registry` has no workspace dependencies and was not affected, but is bumped to keep the family in lockstep and simplify the release narrative.

  After this release, `npm install @hex-core/components` (and the other published packages) succeeds in any consumer project regardless of package manager.

- Updated dependencies [c8a4d52]
- Updated dependencies [6c8c141]
  - @hex-core/registry@0.2.1

## 0.2.0

### Minor Changes

- 07bea53: Theme B substrate — full custom-tokens surface across the OS.

  **`@hex-core/tokens`** now ships beyond color + radius:
  - Spacing scale (`--space-1` through `--space-16`)
  - Gap presets (`--gap-sm/md/lg`)
  - Control heights (`--control-height-sm/md/lg`)
  - Typography scale (`--text-xs` through `--text-3xl`)
  - Motion duration tokens (`--duration-fast/normal/slow`)

  Shared across the 3 theme presets via `themes/shared.ts`. `themeToTailwindConfig`
  now emits `spacing`, `fontSize`, `transitionDuration`, and `height` maps in
  addition to `colors` and `borderRadius`, so consumers wire the whole token set
  into Tailwind's `theme.extend` in one call.

  **`@hex-core/components`** — all 47 components migrated to read tokens via
  CSS-variable references. Fallbacks match prior Tailwind defaults, so consumers
  without a theme loaded see zero visual change. Override `--space-6` (etc.) in
  your `globals.css` and every component reflows.

  **`@hex-core/registry`** — adds `tokenSetSchema`, `strictTokenSetSchema`,
  `strictThemeSchema`, plus `REQUIRED_COLOR_TOKENS` and `REQUIRED_RADIUS_TOKENS`
  constants. Strict variants validate that a theme defines the 19 color tokens +
  radius needed for components to render correctly. Existing `themeSchema` stays
  loose for runtime parsing.

  **`@hex-core/cli`** — adds `hex theme init` and `hex theme edit`:

  ```bash
  # scaffold globals.css from a preset (full token block, light + dark)
  pnpm dlx @hex-core/cli theme init --name midnight --out app/globals.css

  # override one or more tokens, scoped or both
  pnpm dlx @hex-core/cli theme edit \
    --file app/globals.css \
    --token "primary=240 50% 50%"
  ```

  114 unit tests cover the new surface (was 65 before).

### Patch Changes

- Updated dependencies [07bea53]
  - @hex-core/registry@0.2.0

## 0.1.0

### Minor Changes

- efcdb1b: Initial public release of Hex Core — AI-native component library with MCP-first distribution.
  - `@hex-core/components`: Radix UI + Tailwind components with machine-readable schemas
  - `@hex-core/registry`: Zod schemas and types for the component registry
  - `@hex-core/tokens`: Design token engine (HSL tokens, typography, themes)
  - `@hex-core/cli`: Install components and skills into your project
  - `@hex-core/mcp`: MCP server for component discovery and installation

### Patch Changes

- Updated dependencies [efcdb1b]
  - @hex-core/registry@0.1.0
