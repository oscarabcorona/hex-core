# @hex-core/mcp

## 0.7.0

### Minor Changes

- 33440ea: Three agent-builder tools: `map_application` (whole-application brief → typed screens + install closure + warnings + checklist + budgets), `query_graph` (explain / neighbors / path / affected over the catalog knowledge graph), and `scaffold_poc` (complete runnable Next.js demo-app file tree from a brief, map, or recipe — returned as JSON, no disk writes). 19 tools total.

### Patch Changes

- Updated dependencies [0087190]
- Updated dependencies [2f7586f]
- Updated dependencies [33440ea]
  - @hex-core/registry@0.7.0
  - @hex-core/payload@0.5.0

## 0.6.2

### Patch Changes

- Updated dependencies [e5d120e]
- Updated dependencies [e5d120e]
  - @hex-core/registry@0.6.0
  - @hex-core/payload@0.4.1

## 0.6.1

### Patch Changes

- 1264d32: Token-cost audit + calibration across every LLM-bound surface.

  **`@hex-core/payload`** — Bundled registry now resolves the page-recipe build path correctly: `scripts/build-registry.ts` branches on `recipe.kind` so the build no longer fails on `kind: "page"` recipes. The bundled `registry/items/` grew from 132 to 183 entries (51 blocks + AI elements + motion primitives that were previously stranded by the build).

  **`@hex-core/components` / `@hex-core/motion`** — Every component's `ai.tokenBudget` is now calibrated against the measured wire-shape (pretty-printed) `get_component_schema` token count — the shape MCP clients actually receive and rank by. Most primitives were under-declaring by 2–3× (`button` was 500 → 1,718; `cluster` was 250 → 938). Declared vs. measured is now within ±1 token across all 183 items. Wire output is unchanged; only the declared estimates were wrong.

  **`@hex-core/mcp`** — Added a contract-test regression gate: `get_component` ≤ 15K tokens, `get_component_schema` ≤ 2.5K, `emit_app_context` (N=20) ≤ 5K. Wire output remains pretty-printed (human-readable for debugging); ceilings reflect the actual response shape with ~20% headroom over current max.

  New maintenance script at `scripts/audit-tokens.ts` (`pnpm audit:tokens`) measures every LLM-bound surface — MCP tool responses, recipes, skills, the bundled registry — and writes `packages/mcp-server/TOKEN_AUDIT.md`. Pass `--update-budgets` to push measured numbers back into each schema's `ai.tokenBudget` literal. The audit asserts the bundled `@hex-core/payload` registry stays in sync with the repo-root `registry/` and bails loud if they drift.

  Realistic compound load (4 SKILL.md packs + `emit_app_context` at N=20 + 1 page-recipe) is ~10K tokens — 5% of Claude's 200K window. There is no context-window pressure; this PR ships measurement, calibration, and a regression gate so future surface additions don't silently bloat MCP responses.

- Updated dependencies [ee2b71d]
- Updated dependencies [1264d32]
  - @hex-core/registry@0.5.2
  - @hex-core/payload@0.4.0

## 0.6.0

### Minor Changes

- b28f8ee: feat(recipes): page-recipe system foundation

  Recipes can now describe whole pages, not just component bundles. A recipe
  gains an optional `kind` (`component` — the default and every existing recipe,
  or `page`), plus page-only fields: `pageType` (`landing` | `app` | `ecommerce`),
  a recommended `theme` (token preset + whole-page token budget), an ordered
  `sections` list (each a section block with an `intent`), and a `layout` brief.
  - `build-registry` validates section blocks against the catalog and derives
    checklist items from their `ai` metadata, same as component steps.
  - MCP `get_recipe` returns the full page spec in one call; `list_recipes`
    surfaces `kind`/`pageType` so an LLM can find the page recipe for a request.
  - CLI `hex recipe add <page>` installs the section blocks in order and surfaces
    the recommended theme + layout. `hex recipe list` tags page recipes.

  Fully backward-compatible — every existing recipe still validates and installs
  unchanged.

### Patch Changes

- b28f8ee: feat(motion): Phase 2 popular-animation catalog — 15 wrappers + landing-hero recipe

  Adds 15 opinionated wrapper components to `@hex-core/motion`, all built on the Phase 1 engine. Every wrapper is a registry item; consumers reach them via `npx @hex-core/cli add <slug>` (which records the npm peer) or by importing the named export directly.

  **Wrappers**
  - Entry/exit (5): `FadeIn`, `SlideIn`, `ScaleIn`, `BlurIn`, `Pulse`
  - Composing (4): `Bounce`, `Shine`, `Stagger`, `RevealOnScroll`
  - Clock-driven (3): `CountUp`, `Typewriter`, `Marquee`
  - State-aware (3): `Shake`, `Parallax`, `PageTransition`

  The skeleton-sweep wrapper is named `Shine` (slug `shine`) to avoid colliding with the
  existing AI `shimmer` streaming-text component — both keep their own registry slug.

  **Engine extensions**
  - `AnimateProps.filter` for blur (and any other CSS filter) animations
  - New `useTween(from, to, transition)` hook — numeric interpolator driven by the active `MotionConfig` clock; powers `<CountUp>` and is exported for consumers
  - Wrappers ship through the package barrel — `import { FadeIn } from "@hex-core/motion"`

  **Registry / MCP / CLI**
  - 26 motion items total (11 Phase 1 + 15 Phase 2). MCP `search_components(category:"motion")` now lists all of them.
  - Contract test pins every motion slug; renames or removals fail loudly in CI.
  - CLI `add <slug>` works unchanged — schema-only items install the npm peer and print next-step hints.

  **Recipe**
  - `landing-hero` — composes FadeIn / SlideIn / ScaleIn / Stagger / CountUp around `<Container>` / `<Stack>` / `<Button>`. Demonstrates the catalog without any custom Motion JSX.

  **Docs**
  - New `Catalog` section on `/docs/motion` linking each wrapper to its component page.
  - 15 live demos under `/docs/components/<slug>` — registered in `apps/docs/src/lib/demos.tsx`.
  - `hex-core-motion` SKILL.md gains a Catalog table for AI agent decision making.

  No breaking changes; Phase 1 surface (`Motion`, `Presence`, `<Timeline>`, `useAnimate`, etc.) is untouched.

- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
  - @hex-core/registry@0.5.0
  - @hex-core/payload@0.3.0

## 0.5.1

### Patch Changes

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

- Updated dependencies [398bc7d]
  - @hex-core/registry@0.4.0
  - @hex-core/payload@0.2.4

## 0.5.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [870fbcc]
  - @hex-core/payload@0.2.3
  - @hex-core/registry@0.3.5

## 0.4.4

### Patch Changes

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

- Updated dependencies [d67fa60]
- Updated dependencies [b1b9099]
  - @hex-core/registry@0.3.4

## 0.4.3

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

- Updated dependencies [8f53d79]
  - @hex-core/registry@0.3.2
  - @hex-core/payload@0.2.2

## 0.4.2

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

- Updated dependencies [00e0344]
  - @hex-core/registry@0.3.1

## 0.4.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/payload@0.2.1

## 0.4.0

### Minor Changes

- 0362e9b: feat(mcp): add emit_figma_tokens — render a theme as a Figma Variables REST POST body

  Closes Theme E of the internal roadmap (Figma pipeline OS substrate). The 13th
  MCP tool, `emit_figma_tokens(theme)`, walks a resolved theme's light + dark
  palettes and emits a markdown document wrapping a JSON body shaped for Figma's
  `POST /v1/files/:file_key/variables` endpoint:
  - One variable collection (`Hex UI — <theme>`) with two modes (`Light` + `Dark`)
  - One variable per token, typed `COLOR` (for color tokens) or `FLOAT` (for
    radius / spacing / dimension / duration / font tokens)
  - One mode-value per (variable × mode) — light palette feeds the Light mode,
    dark palette feeds the Dark mode

  HSL → RGB conversion (color tokens land in 0–1 RGBA range as Figma expects) and
  unit conversion (rem→px @ 16px base, s→ms, % and bare numbers passthrough) are
  inlined as ~30 LOC each. The canonical implementations still live in
  `@hex-core/components/lib/color.ts` and `@hex-core/tokens/transformer.ts`; the
  duplication is intentional to avoid taking React + tokens runtime deps in mcp.

  Pasting the JSON into a Figma plugin or `curl` call against the Variables REST
  endpoint produces a populated kit. Designers flipping between Light/Dark in
  Figma now mirror the consumer app's `:root` ↔ `.dark` cascade exactly.

  `tools/list` is now 13 entries; the contract test asserts the new tool is
  registered AND that `tools/call emit_figma_tokens { theme: "default" }` returns
  markdown containing the four canonical top-level keys (`variableCollections`,
  `variableModes`, `variables`, `variableModeValues`) inside a JSON code block.

- 3524173: feat: extract @hex-core/payload — pure-function builders for paste-into-LLM payloads

  Closes findings #18 (stale-tokens drift) and #19 (no programmatic builder export)
  together. The MCP server's pure-function builders (`buildAppContext`,
  `buildFigmaTokens`, `resolveSpec`) plus the registry / recipe / theme loaders
  move to a new `@hex-core/payload` workspace package, importable directly by
  Next.js apps, generator scripts, and CI fixtures — no MCP subprocess needed.

  **New `@hex-core/payload@0.1.0`:**
  - `buildAppContext`, `buildFigmaTokens`, `buildFigmaPayload`, `resolveSpec` — pure functions
  - `getTheme`, `listThemes`, `themes` + the four transformers (`themeToCss`, `themeToFlatJson`, `themeToTailwindConfig`, `generateGlobalsCss`)
  - `loadRegistry`, `loadRegistryItem`, `loadRecipes`, `loadRecipe`, `internalDepToSlug`, `SLUG_REGEX`, `getRegistryDir`
  - All public types (`AppContextInput`, `FigmaVariablesPayload`, `RegistryIndex`, `Recipe`, etc.)
  - Bundles the registry data into the published tarball (`prebuild` cp + `files: ["dist", "registry", ...]`).
  - Depends on `@hex-core/tokens@^1.2.0` for theme data — **no inlining**.

  **Closes finding #18:** the previous `mcp-server/src/tools/theme-loader.ts` inlined
  theme data per its own comment ("to avoid runtime dependency on `@hex-core/tokens`").
  That inlining had drifted: `mcp@0.3.0` shipped pre-v1.1.1 destructive (`0 84.2%
60.2%`) and muted-foreground (`240 3.8% 46.1%`) values while consumers' installed
  `@hex-core/tokens@^1.2.0` already had the corrected values (`0 72% 45%`,
  `240 4% 38%`). After this change, payload pulls themes from `@hex-core/tokens`
  directly — single source of truth, no drift. Locked at the protocol level by a
  new contract-test assertion (`emit_app_context` output now asserted to contain
  `--destructive: 0 72% 45%` and to NOT contain the stale `0 84.2% 60.2%`).

  **Closes finding #19:** the studio (and any future generator script or CI
  fixture) can now `import { buildAppContext } from "@hex-core/payload"` rather
  than spawning an MCP subprocess + speaking JSON-RPC over stdio. The MCP server's
  binary still wraps these functions for stdio-transport consumers — both surfaces
  share one implementation.

  **Public-API change to the LLM payload format:** the emitted `## globals.css`
  block now reflects `@hex-core/tokens@^1.2.0` token values, not the frozen
  mcp@0.3.0 snapshot. Notable but non-breaking — markdown structure / section
  order / interface unchanged; only token VALUES shift to the canonical current.

  **`@hex-core/mcp@0.4.0` refactor (the bump in this changeset):**
  - All `src/tools/*.ts` source files removed (moved to payload). `tools/` directory deleted.
  - `index.ts` imports from `@hex-core/payload` — tool handlers unchanged.
  - Drops `prebuild` registry-copy script (payload owns the registry bundle now).
  - Drops `registry/` from `files` (mcp tarball ~1MB lighter; consumers pick up registry from payload's installed location via node resolution).
  - `test` script reduces to `test:contract` (other test files moved to payload).
  - New 9th contract-test assertion locks the #18 fix (proves emitted globals.css contains current tokens).

### Patch Changes

- Updated dependencies [3524173]
  - @hex-core/payload@0.2.0

## 0.3.0

### Minor Changes

- d99548a: feat(mcp): extend emit_app_context with overrides, density, and full payload sections

  `emit_app_context` now accepts two new optional inputs and emits three new sections,
  locking the OS canonical to the Hex Studio "Copy for LLM" payload format documented
  in `hex-ui-platform/docs/studio/copy-for-llm.md`.

  **New inputs:**
  - `overrides?: Record<string, string>` — per-token value overrides merged onto
    the resolved theme's **light palette only** (dark + radius are out of scope
    for v0.3.0; if you need them, call the tool a second time with a dark-shaped
    theme). Keys absent from the base palette are still injected and flow into the
    Tailwind config too. The highlight table marks overridden tokens with
    `*(override)*`. Empty-string keys/values are rejected by the strict zod schema.
  - `density?: "compact" | "comfortable" | "spacious"` — spacing-density preset
    folded into the light palette before `globals.css` is rendered. Density
    values WIN on key conflicts (e.g. a theme with `--space-4: 1rem` plus
    `density: "compact"` emits `--space-4: 0.75rem` once, never both). `comfortable`
    matches token defaults and is treated as a no-op. Density intentionally does
    not apply to `.dark` — apps using class-based dark mode keep the same spacing
    scale across light/dark, matching Studio's runtime canvas.

  **New output sections** (theme-resolved cases only):
  - `## globals.css` — full `@layer base { :root {} .dark {} }` block with all color
    tokens, optional density vars, and overrides applied to light. Drop-in replacement
    for a consumer's `app/globals.css`.
  - `## tailwind.config.ts` — `theme.extend` block grouping six token buckets
    (color, borderRadius, spacing, fontSize, transitionDuration, height) into
    the right Tailwind fields so utility classes resolve. Empty buckets are
    omitted. The same overridden + density-folded palette feeds both globals.css
    and the Tailwind config, so brand-new override keys (e.g. `accent`) appear
    in both surfaces consistently.
  - `## Context prompt` — six LLM rules + scoped components-in-scope list + user-ask
    placeholder. The "killer demo" section that lets a downstream model build
    theme-perfect output on first try.

  **Schema strictness:** the input schema's `.strict()` is exercised by a new
  contract-test assertion — passing an unknown field now reliably surfaces as
  InvalidParams from the SDK so consumers can trust `additionalProperties: false`
  in the published JSON Schema.

  Closes finding #5. Studio's `_lib/payload.ts` can drop its client-side template
  in a follow-up `hex-ui-platform` PR and call `emit_app_context` directly via MCP.

- ed8cd1e: feat(mcp): universal client support — six MCP clients verified, contract test in CI

  Closes Theme C of the internal roadmap. The runtime was already universal (stdio-only `StdioServerTransport`, 12 client-agnostic tools, no Claude-specific code paths in `src/`) but the docs and metadata leaked Claude Code framing — only Claude Code and Cursor wiring snippets shipped, despite README copy claiming broader support.

  This change replaces the duplicated snippets with a single source of truth and adds protocol-level proof that the server speaks standard MCP regardless of which downstream client opens the connection.

  **New: `MCP_CLIENTS` data file**

  [packages/mcp-server/src/clients.ts](packages/mcp-server/src/clients.ts) exports a typed array of 6 client wirings — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — each carrying `configPath`, `format` (json / jsonc / yaml), `topLevelKey`, ready-to-paste `snippet`, `schemaStability`, `verifiedOn` (for the four volatile schemas), upstream `docsUrl`, and a `quirks` list. Re-exported via `package.json` `exports["./clients"]` so the docs app imports it as `@hex-core/mcp/clients`. Both the regenerated README and the [docs page](apps/docs/src/app/docs/mcp/page.tsx) render from this single array — no duplicate snippets.

  **Per-client correctness**

  Every snippet uses `npx -y @hex-core/mcp` (the `-y` flag prevents the first-run npx prompt from hanging stdio MCP clients). The four volatile-schema clients (Continue, Gemini CLI, ChatGPT Desktop, Zed) carry a `Verified 2026-04-27` badge so quarterly research-cadence refreshes can spot stale entries. Zed's `context_servers` (NOT `mcpServers`) and `source: "custom"` quirks are explicitly called out in both the README and the docs page.

  **Contract test**

  [packages/mcp-server/src/contract.test.ts](packages/mcp-server/src/contract.test.ts) drives the built server with the official `@modelcontextprotocol/sdk` Client over stdio — the same SDK every supported client uses underneath. A green run proves five end-to-end assertions:
  1. `initialize` handshake completes
  2. `tools/list` returns exactly the 12 canonical names from [src/tool-names.ts](packages/mcp-server/src/tool-names.ts) (set-equal, order-insensitive)
  3. `tools/call list_themes` returns content where `content[0].text` parses as a JSON array
  4. `resources/list` includes an entry with `uri === "hex://catalog"`
  5. `client.close()` disposes the transport without throwing

  The test runs in CI via the existing `pnpm test` cascade — no workflow changes needed. Build runs first, so `dist/contract-test.js` exists by the time the test fires.

  **README regeneration**

  [packages/mcp-server/scripts/build-readme.mjs](packages/mcp-server/scripts/build-readme.mjs) parses `clients.ts` and splices snippets into [packages/mcp-server/README.template.md](packages/mcp-server/README.template.md) at the `<!-- @generated:client-wiring -->` marker. Wired into the package's `build` script so README and the data file can never drift.

  **Metadata cleanup**

  `package.json` description switched from "Ships 12 tools over the registry for Claude Code / Cursor / any MCP client" to **"Universal MCP server for Hex UI — runs on Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, and Zed. 12 tools over the component registry."** Keywords drop `claude-code` and `cursor`; add `mcp-client-agnostic`.

  Theme C success signal hit: **6/6 clients verified, zero Claude-only codepaths**.

## 0.2.0

### Minor Changes

- 9b3793a: Adds the `emit_app_context` MCP tool — a 12th tool that synthesizes a deterministic markdown payload describing the user's chosen theme + components + recipes, formatted for paste-into-LLM workflows.

  Inputs: `theme` (slug), `components` (slug array, min 1), `recipes` (optional slug array). Output is a markdown document with a theme summary table, per-component cards, ordered recipe steps with their checklists, and an install snippet using `npx @hex-core/cli@latest`.

  Unknown slugs are flagged inline (`> Missing: ...`) rather than dropped silently. Pure function under the hood — `buildAppContext` in `src/tools/app-context.ts` is snapshot-tested via `pnpm -F @hex-core/mcp test:app-context` so any output-format change must update the snapshot deliberately.

## 0.1.2

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

- Updated dependencies [c8a4d52]
- Updated dependencies [6c8c141]
  - @hex-core/registry@0.2.1

## 0.1.1

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
