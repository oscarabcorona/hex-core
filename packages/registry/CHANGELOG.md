# @hex-core/registry

## 0.4.1

### Patch Changes

- 71ba05c: feat(cli): close 6 AI-onboarding gaps from real-session feedback

  Wires Hex Core discovery into the touchpoints AI agents actually hit:
  `hex init`, `hex add`, `hex doctor`, and `hex skills`.

  **`hex add` nudges**
  - New `--pack layout` shortcut installs `container` + `stack` + `cluster` + `grid` + `spacer` + `empty` in one call.
  - "Related primitives you might want next" line — driven by each schema's `ai.relatedComponents`, validated against `registry/items/` so a schema typo can't reach the user as a `hex add stacks` recommendation. Capped at 8 with a `(+N more)` indicator when truncated.
  - "You added N primitives but no layout primitives" nudge when ≥3 interactive primitives install without any layout primitive on disk.

  **`hex doctor --layout`**

  Two new info-only scans on the consumer's source tree:
  - **Installed-but-unused** — `<Card>` is in `components/ui/` but no source file renders it, suggesting the agent rolled raw `<div>`s instead of composing. Detects both JSX usage and renamed-import paths (`Card as Surface`).
  - **Hand-rolled patterns** — `space-y-*` chains (≥3 per file), breakpoint `grid-cols-*` variants, dashed empty-state divs, hand-rolled `<ol>` timelines, `rounded-full border text-xs` badge spans. Severity `info` only — never fails the gate.

  Reuses a shared `walkSourceFiles` helper that skips heavy dirs (`node_modules`/`dist`/`build`/`out`/`coverage`/`target`) plus any dotfile dir blanket.

  **Studio discoverability**
  - `hex init` writes `studio: "https://hex-core.dev/studio"` into `hex.config.json`.
  - Post-init line: `Theme tweaking: hex-core.dev/studio — copy the payload back into your AI session.`

  **`@hex-core/mcp` wiring (opt-in)**

  `hex init --mcp` creates `.mcp.json` at the repo root (Claude Code's project-scope convention) or merges into `.cursor/mcp.json` / `.continue/config.json` when present. Read-merge-write — never clobbers existing `mcpServers` entries; reports `alreadyConfigured` when `hex-core` is already wired. Malformed JSON surfaces the file path so the user can fix it instead of being silently swallowed.

  Default OFF: `.mcp.json` is commit-tracked and auto-loaded, so the write requires explicit `--mcp` opt-in.

  **Skill discovery nudges**

  New `printSkillsHint()` helper detects `.claude/skills/hex-core-*/SKILL.md` and prints "ask your AI session to invoke the hex-core-overview skill". Wired into `add`, `init`, `recipe` (silent when no Hex Core skills present) and `skills` (always — the skills were just placed).

  **`app-shell` recipe**

  New `hex recipe add app-shell` starter bundles 12 foundation primitives (`container`, `stack`, `cluster`, `grid`, `spacer`, `empty`, `card`, `separator`, `badge`, `tag`, `timeline`, `breadcrumb`) with a checklist that nudges composition over hand-rolled utility chains. Recipe count goes from 13 to 14.

  **Tests**

  24 new unit tests across `post-install`, `mcp-config`, `walk-sources`, plus extensions to `add`, `doctor`, and `init`. CLI test suite: 265/265 pass.

## 0.4.0

### Minor Changes

- 398bc7d: feat(motion): introduce `@hex-core/motion` — UI animation primitives + deterministic timeline composer

  New top-level package inspired by Motion (motion.dev) for the React API and Hyperframes for the deterministic, agent-authorable timeline. Two layers, one package:
  1. **UI animation primitives** — `Motion.div/span/button/...` declarative factory, `<Presence>` for exit-aware unmounts, `useAnimate` imperative hook, `useMotionValue` / `useScroll` / `useInView`, `variants()`, `<MotionConfig>`. Honors `prefers-reduced-motion` automatically.
  2. **Timeline composer** — `<Timeline duration><Scene start duration><Clip target from to easing/></Scene></Timeline>`, imported from `@hex-core/motion/timeline`. Pure `composeTimeline()` resolver guarantees same JSX in → identical `ClipDescriptor[]` out. Pause / seek / resume map to WAAPI `pause()`/`currentTime=`/`play()`.
  3. **Optional Motion adapter** at `@hex-core/motion/adapters/motion`, peer-installs `motion@^11` for layout/FLIP and gestures (lazy import, friendly error if missing).

  **Engine**: zero peer-dep WAAPI core (`element.animate()`) with an injectable `Clock` for deterministic tests (`manualClock(0)`). Compositor-friendly props only (transform/opacity/color). Token-aware easings: `linear | standard | emphasized | decelerate | accelerate | bounce`.

  **Registry impact**: 11 new motion items (`motion`, `presence`, `transition`, `variants`, `use-animate`, `use-scroll`, `motion-timeline`, `scene`, `clip`, `track`, `motion-pro`). New `motion` value in `categoryEnum`. Build script (`scripts/build-registry.ts`) refactored to support schema-only roots — packages whose runtime ships from npm rather than copied source files. CLI `add motion` works without code changes; consumers get `pnpm add @hex-core/motion`.

  **MCP**: `search_components(category: "motion")` now valid. Contract tests pass unchanged.

  **Recipe**: new `intro-sequence` recipe demonstrates `motion-timeline` + `scene` + `clip` orchestrating existing primitives (`container`, `stack`, `button`).

  **Skill**: 9th SKILL.md (`hex-core-motion`) explains the decision tree (Motion vs MotionPro vs Timeline), token easings, and common mistakes.

  **Naming**: motion's timeline registry slug is `motion-timeline` (NOT `timeline`) so it doesn't collide with the existing chronological-event `timeline` component primitive.

  No breaking changes to existing packages.

## 0.3.5

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

## 0.3.4

### Patch Changes

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

## 0.3.3

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

## 0.3.2

### Patch Changes

- 8f53d79: feat(themes): 71 brand-derived theme presets (Tesla, Stripe, Linear, …)

  Imports the full
  [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md)
  catalog (MIT-licensed, distributed via `getdesign`) as ready-to-use
  theme presets. Studio's preset switcher now has 74 themes available
  out of the box (3 first-party + 71 brand-derived).

  **`@hex-core/themes`** (minor):
  - 71 new presets at `packages/themes/src/presets/<slug>.ts`, one per
    brand. Spans 9 categories: AI/LLM, dev-tools, backend, productivity,
    design, fintech, e-commerce, media, automotive.
  - Each preset carries a full WCAG-AA-validated light + dark token set,
    plus brand metadata (`brand`, `category`, `tags`, `attribution`) and
    the verbatim source markdown brief as `designBrief` — so LLM agents
    reading the `Copy for LLM` payload get typography + motion +
    composition guidance alongside the tokens.
  - `searchThemes({ category, tags, query })` filters the catalog by any
    combination of those axes.
  - `extendTheme(base, overrides)` composes a new theme from a preset
    with user-provided token overrides (deep-merged + re-validated via
    `strictThemeSchema`).
  - `presetsByCategory` and `presetSlugs` indexes for category-aware UIs.
  - Per-preset deep imports: `@hex-core/themes/presets/tesla` resolves
    to a 28KB chunk; the full barrel is 1.6MB. Tree-shake at will.

  **`@hex-core/registry`** (patch):
  - `themeSchema` gains optional `brand` / `category` / `tags` /
    `designBrief` / `attribution` fields. All-optional so existing
    themes (`default`, `midnight`, `ember`) pass unchanged.
  - New `themeCategorySchema` enum (9 categories) and
    `themeAttributionSchema` for provenance metadata.

  **`@hex-core/tokens`** (patch):
  - New `buildTokenSet(seeds, mode)` helper extracted from the CLI's
    interactive flow. Both the CLI and the new `import-voltagent`
    script share a single source of truth for "build a complete
    TokenSet from 5 seed values."

  **`@hex-core/payload`** (patch):
  - `listThemes()` / `getTheme()` / `themes` now return the merged
    catalog (OSS + voltagent presets), so Studio's `/studio/copy` LLM
    payload sees every preset.
  - `AppContextTheme` carries the new metadata; `buildAppContext`
    emits a `## Design brief` block when present, plus a `brand /
category / tags` line and an attribution footer.

  **`@hex-core/mcp`** (patch):
  - New `search_themes` tool — filter the catalog by `category`,
    `tags`, and/or free-text `query`. Returns the same shape as
    `list_themes`, filtered.
  - `list_themes` description updated to mention the 71 brand presets.

  **`@hex-core/cli`** (patch):
  - `hex theme list` lists every preset grouped by category, with
    `--category` / `--tag` / `--json` filters.
  - `hex theme init --preset <slug>` — alias for `--name` that
    reads more naturally; works against any of the 74 presets.
  - `hex theme apply <slug>` likewise accepts any preset.

  **Reproducibility** — `pnpm import:themes:fetch` vendors the briefs from
  `getdesign@latest` (or a pinned version) into `.cache/getdesign-templates/`
  via `npm pack`. `pnpm import:themes` then deterministically regenerates
  every preset (no API calls). Per-preset extraction outcomes — including
  low-confidence picks that warrant manual review — are logged to
  `.context/voltagent-import.md`.

  **Visual baselines** — refreshes 6 dark-mode snapshots (`button`,
  `data-table`, `form`, `progress`, `slider`, `tabs`). These catch up with
  the destructive-foreground darkening landed in the prior a11y PR — they
  weren't pixel-refreshed at the time. No new visual diffs introduced by
  this PR's code paths.

  **Attribution** — each generated preset file carries a header
  linking to the upstream MIT-licensed source; the full LICENSE text
  is preserved at `LICENSES/voltagent-MIT.md`. Brand presets are
  _style references inspired by publicly visible design systems_,
  not endorsements.

## 0.3.1

### Patch Changes

- 00e0344: feat(registry,tokens,mcp): intent metadata — variant useWhen, structured antiPatterns, semantic tokens

  Phase 2 of the AI-native moat. The schemas already described **shape**
  (`variant: "default" | "outline"`); now they describe **intent** —
  when each value is the right choice, what NOT to do, and which
  semantic role each token plays. LLMs picking between Button variants no
  longer fall back to whatever shadcn's docs taught their training data;
  they read hex-core's posture from the schema.

  ### `@hex-core/registry`
  - **`variantValueSchema.useWhen?: string`** — per-value intent sentence
    ("secondary actions next to a primary CTA"). Optional so existing
    schemas parse; every shipped `*.schema.ts` should populate it.
  - **`aiHintSchema.antiPatterns?: AntiPattern[]`** — structured anti-pattern
    channel:
    ```ts
    { mistake: "Using a Slider with min=0/max=1 to represent on/off",
      insteadUse: "switch",
      why: "Slider semantics are 'continuous range'..." }
    ```
    `insteadUse` MUST be a registry slug, so MCP can follow the link and
    return the suggested alternative as a real registry entry. The
    free-form `commonMistakes: string[]` stays for back-compat.
  - **`usageExampleSchema.composition?: string[]`** — tags the surrounding
    context an example demonstrates (`["dialog", "destructive", "confirm"]`
    for a delete-confirm Button, `["form", "form-action"]` for a submit
    pair). MCP search ranks by tag overlap.
  - **`semanticTokenEntrySchema` / `semanticTokenSetSchema`** — the new
    intent-layer schema for the parallel `defaultSemanticTokens` map.
  - New types exported: `AntiPattern`, `VariantValue`, `SemanticTokenEntry`,
    `SemanticTokenSet`.

  ### `@hex-core/tokens`
  - **New: `defaultSemanticTokens`** — a curated `SemanticTokenSet` over
    the raw `defaultTheme` palette, with entries like
    `button.destructive.bg → { value: "{color.destructive}", useWhen:
"irreversible actions: delete, archive, deactivate, leave, force-quit" }`.
    Each entry references the underlying token by `{name}` syntax so
    swapping the underlying theme automatically shifts every semantic
    entry. ~20 entries spanning button, surface, form, feedback, shape,
    and motion intents.

  ### `@hex-core/mcp`
  - **New tool: `describe_intent(name)`** — returns variant useWhen +
    structured antiPatterns + the slice of `defaultSemanticTokens`
    prefixed by the component name. Use BEFORE generating JSX; prevents
    the canonical LLM mistakes (picking destructive for non-destructive,
    picking Slider for booleans, etc.).
  - **New tool: `search_compositions(tags, limit)`** — returns examples
    whose `composition` tags overlap the query. `["dialog", "destructive",
"confirm"]` returns the canonical AlertDialog-with-delete-Button
    composition, not a bare `<Button variant="destructive">`. Ranked by
    overlap count.
  - Contract test extended from 9 → 11 assertions covering both new tools
    end-to-end via the MCP SDK Client.

  ### Component schemas (initial enrichment)

  `button`, `dialog`, `slider`, `switch`, `card` — all six variant arrays
  populated with `useWhen`, all five with structured `antiPatterns`, all
  five with `composition`-tagged examples. Roll-out continues per future
  PR; the schema is back-compat so unenriched components still parse.

  **Migration:** none. All new fields are optional, the runtime JS
  contract is unchanged. Consumers reading `aiHintSchema.commonMistakes`
  keep working; consumers wanting structured anti-patterns read
  `aiHintSchema.antiPatterns` instead. Existing MCP clients keep working;
  new clients can opt into `describe_intent` / `search_compositions` for
  the richer intent payload.

  **Cascade (informational, not a separate decision):** this changeset
  deliberately bundles three minors. The Changesets cascade rule then
  auto-bumps `@hex-core/cli`, `@hex-core/components`, `@hex-core/payload`,
  `@hex-core/themes`, and `docs` to patch — five additional publishes for
  a total of eight. Budget that into release timing. Each cascade bump
  ships the same source code with a new dependency-pin range; no
  behavioral change.

## 0.3.0

### Minor Changes

- b9a072d: feat(registry): per-category token schemas + typed `StrictTokenSet` (Theme B follow-up)

  Adds compile-time category guarantees on top of the runtime validation that already shipped in `strictTokenSetSchema`. Closes the ROADMAP item: _"Formal `TokenSet` Zod schema (strict typed token categories vs. current loose `z.record(string, unknown)`)."_ Unblocks the Theme B success signal — community-authored themes on npm under `@hex-theme/*`.

  **New per-category schemas + types** (12 categories — one per `tokenTypeEnum` member):

  ```ts
  import {
  	colorTokenSchema,
  	type ColorToken,
  	dimensionTokenSchema,
  	type DimensionToken,
  	radiusTokenSchema,
  	type RadiusToken,
  	spacingTokenSchema,
  	type SpacingToken,
  	fontTokenSchema,
  	type FontToken,
  	fontWeightTokenSchema,
  	type FontWeightToken,
  	durationTokenSchema,
  	type DurationToken,
  	cubicBezierTokenSchema,
  	type CubicBezierToken,
  	numberTokenSchema,
  	type NumberToken,
  	shadowTokenSchema,
  	type ShadowToken,
  	gradientTokenSchema,
  	type GradientToken,
  	opacityTokenSchema,
  	type OpacityToken,
  	tokenSchema, // discriminated union over all 12
  } from "@hex-core/registry";

  function paintBackground(c: ColorToken) {
  	/* … */
  }
  // paintBackground(theme.tokens.light.primary) ← OK at compile time
  // paintBackground(theme.tokens.light.radius)  ← compile error: RadiusToken not assignable
  ```

  **Tightened `strictTokenSetSchema`:** the previous version was a `tokenSetSchema.refine(...)` that left the inferred type as `Record<string, TokenValue>` (loose). The new version uses `z.object({...}).catchall(tokenValueSchema)` so each canonical slot (`background`, `primary`, `radius`, etc.) is pinned to its expected category at the type level, while extra slots still accept any `TokenValue`.

  ```ts
  const strict = strictTokenSetSchema.parse(input);
  strict.primary.type; // narrows to "color" (was: tokenTypeEnum)
  strict.radius.type; // narrows to "radius"
  strict["space-4"]; // TokenValue (catchall — any category)
  ```

  **New types:** `StrictTokenSet`, `StrictTheme` (already-existing `strictThemeSchema` now infers the tighter type).

  ### Behavior changes

  **Runtime contract is stricter at canonical slots.** The old refinement only validated key presence — a theme could legally place a non-color token in a color slot like `primary`. The new schema enforces category at every required slot (e.g. `primary` rejects if `type !== "color"`, `radius` rejects if `type !== "radius"`). All 3 OSS preset themes (default, midnight, ember) and any theme where canonical slots already used the conventional category parse identically under both versions; themes that miscategorized canonical slots will now reject (intended behavior).

  **Affected callers:** community theme authors validating via `strictTokenSetSchema.safeParse` may see new errors on previously-passing data if they had miscategorized any required slot. The fix is to use the correct token category — e.g. `primary` must be a `colorTokenSchema`-shaped value, not a `radiusTokenSchema`-shaped one.

  **Validation issue shape changed.** The old `.refine()` returned a single combined error message: _"Theme is missing one or more required tokens. Required colors: …"_. The new `z.object` produces N issues — one per missing or miscategorized required slot — with `path` pointing at the offending key. Consumers iterating `result.error.issues[*].path` get richer per-field info; consumers matching on the old combined string must migrate to iterate `issues`. No internal `@hex-core/*` package depended on the old string.

  **Migration:** zero for the common path. `tokenSetSchema` (loose) and `strictTokenSetSchema` (now-typed) are both still exported. Consumers using `safeParse` are unaffected unless they were depending on the lax-category behavior at canonical slots; consumers reading specific slots (`theme.primary.value`) get tighter inferred types automatically. Discriminated-union exhaustiveness checking on `token.type` works via either `tokenSchema` (preferred) or `tokenValueSchema` (existing).

## 0.2.1

### Patch Changes

- c8a4d52: Fix: published tarballs now correctly pin workspace dependencies.

  Previous releases of `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp` shipped `"@hex-core/registry": "workspace:^"` literal in the tarball's `dependencies`, breaking every consumer outside a pnpm workspace with `npm error code EUNSUPPORTEDPROTOCOL`. `@hex-core/tokens` shipped a similar literal for its registry dependency.

  Root cause: `scripts/publish-local.sh` used `npm publish`, which uploads tarballs as-is. Switched to `pnpm publish`, which rewrites `workspace:^` → pinned `^X.Y.Z` automatically.

  `@hex-core/registry` has no workspace dependencies and was not affected, but is bumped to keep the family in lockstep and simplify the release narrative.

  After this release, `npm install @hex-core/components` (and the other published packages) succeeds in any consumer project regardless of package manager.

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

## 0.1.0

### Minor Changes

- efcdb1b: Initial public release of Hex Core — AI-native component library with MCP-first distribution.
  - `@hex-core/components`: Radix UI + Tailwind components with machine-readable schemas
  - `@hex-core/registry`: Zod schemas and types for the component registry
  - `@hex-core/tokens`: Design token engine (HSL tokens, typography, themes)
  - `@hex-core/cli`: Install components and skills into your project
  - `@hex-core/mcp`: MCP server for component discovery and installation
