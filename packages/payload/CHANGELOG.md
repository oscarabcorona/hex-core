# @hex-core/payload

## 0.6.1

### Patch Changes

- Updated dependencies [993571d]
  - @hex-core/registry@0.9.0
  - @hex-core/themes@0.2.6
  - @hex-core/tokens@1.4.1

## 0.6.0

### Minor Changes

- c2ce968: Resolve example imports to the module that actually exports them. The catalog graph attributed every export of an item to its main module, so identifiers living in `components/_shared/*` — notably `mockAuthAdapter`, used by all six auth blocks — were imported from a path that doesn't export them. Graph nodes now carry an `exportPaths` map (identifier → module suffix) and codegen imports from it. `graphNodeSchema` gains the field, so this is additive public surface rather than a pure patch.

  Adds a POC regression guard over the composable surface: every block, plus every item whose example is import-led, is generated as a one-section route and checked for components or identifiers that are used but never imported or declared (TS2304). Items that genuinely need a client boundary are excluded explicitly, not silently — their examples require React state or pass functions, and generated pages are Server Components that also export `metadata`.

  Two known gaps this does **not** close: prop-shape drift (TS2322, e.g. the `Pagination` API above) needs a real typecheck over the generated tree; and 31 recipe-referenced items whose examples are bare JSX with no imports would still emit an unimported component if composed as a section.

- 0284051: Stop shipping whole graph nodes over the MCP wire.

  `query_graph explain button` cost 16,429 tokens — 8 % of a 200K context for
  one call — because each neighbour embedded the entire far-end graph node,
  `exports` and `exportPaths` included, plus an edge whose `source`/`target`
  merely restated the two slugs already present. Neighbours are now projected
  to the six fields a caller acts on: 3,181 tokens, and every hub drops 73–81 %.
  `neighbors` mode returns `{total, neighbors}` so a capped result says it was
  capped.

  `search_components` was unbounded. Called with no arguments — how an agent
  enumerates the catalog — it returned all 187 summaries at 24,018 tokens. It
  now pages at 20 and returns `{total, returned, results}`; pass `limit` (max 200) for more. Its matcher also treated the query as a substring, so `"and"`
  matched `command`; it now matches word prefixes, so `"butt"` still finds
  `button` and `"and"` does not.

  Both surfaces, plus `search_compositions`, `resolve_spec` and
  `map_application`, now have token ceilings in the contract test. None of them
  had one before, which is why neither cost was noticed.

  `resolveSpec` read the full item JSON for every candidate scoring above zero —
  133 of 187 items for a ten-token brief — before slicing to eight. The read
  moved past the slice; output is unchanged. `loadRecipes`, `listThemes` and the
  POC export index are memoised, and `hex add` no longer re-reads the same item
  from three call sites.

  `@hex-core/payload` gains a `wordSet` export (the matcher `search_components`
  now shares) and a named `ThemeSummary` type for `listThemes`.

- c2ce968: `hex poc` now scaffolds a demo, not just frames. A POC is the frames _demoed_ — without a way to reach the states that matter, a reviewer only ever sees one screenshot's worth of the product, and the states where a design actually fails stay invisible.

  Every generated app ships a floating demo panel (`components/demo-controls.tsx`) holding both controls in one surface:
  - **Viewing as** — re-renders every frame as `viewer`, `member` or `admin`. Frames gated on a capability say why they are unavailable instead of 404ing; `settings-page` recipes gate on `seeSettings`.
  - **Data** — flips every frame between its populated and empty state.

  Both live in cookies rather than query params, so a selection survives navigation instead of being a deep link. Generated pages became `async`, read `getDemoContext()`, and render the `empty` primitive when the panel asks for it. The vocabulary in `lib/demo.ts` is deliberately generic and meant to be extended — add roles, add capabilities, and scope real data through `can` rather than through the role name.

  `empty` and `select` join every install closure so the panel and the frames' empty states resolve even when the brief mapped neither. The scaffold also sets `devIndicators: false`, since Next's dev bubble sits on top of app chrome in exactly the screenshots a POC exists to produce.

- c2ce968: Ship every file a component actually imports.

  Thirty registry items were emitted with imports pointing at files that were
  never written beside them: `hex add auth-sign-in-split` produced a component
  importing six others that did not exist, and `markdown` was missing five.
  The file collector only followed same-directory siblings, `*-variants` and
  `_shared`, so a cross-directory import fell straight through.

  The collector now walks the import graph transitively — pulling in
  `button.tsx` also pulls in the `button-variants.tsx` it imports — and
  recognises two more shapes: cross-directory component imports
  (`../<name>/<name>`) and category-level shared modules (`../types`).
  `rewriteRegistryImports` gains the matching rule for the latter, so
  `../types.js` resolves to `@/components/ui/types` rather than pointing one
  directory above where the file lands.

  Across all 187 items, every relative import in an emitted file now resolves
  to a file that item ships. Thirty items gained 84 previously-missing files.

### Patch Changes

- Updated dependencies [c2ce968]
- Updated dependencies [c2ce968]
- Updated dependencies [c2ce968]
- Updated dependencies [c2ce968]
  - @hex-core/registry@0.8.0
  - @hex-core/themes@0.2.5
  - @hex-core/tokens@1.4.0

## 0.5.0

### Minor Changes

- 33440ea: Catalog graph engine + application map + POC builders. `parseGraph`/`loadGraph` load the new `registry/graph.json` (items + recipes + theme presets; `requires`/`composes`/`themes`/`related`/`instead-use` edges, curated communities, hub detection); pure query functions (`explainNode`, `neighbors`, `requiresClosure`, `affected`, `shortestPath`) back `hex graph` and MCP `query_graph`. `buildApplicationMap`/`mapFromRecipe` deterministically map a whole-application brief onto screens + a requires-closure install manifest (`hex.map.json`, zod `mapSchema`). `buildPocFiles`/`generatePageSource` emit the complete file tree of a standalone runnable Next.js demo app from a map, with known-good dependency pins and imports rewritten via the relocated `rewriteRegistryImports` (now exported here as the single shared implementation).

  `buildPocFiles` also repoints block-example image references at a bundled `public/placeholder.svg`, emits a `<main>` landmark on generated routes, pins first-party `@hex-core/*` dependencies (guarded by a new pin-coverage test), and writes a map whose install list matches the app it generated. `parseGraph` / `parseMap` check the format `version` before schema validation so a newer artifact produces an upgrade message rather than a bare literal error.

### Patch Changes

- Updated dependencies [0087190]
- Updated dependencies [2f7586f]
  - @hex-core/registry@0.7.0
  - @hex-core/themes@0.2.4
  - @hex-core/tokens@1.3.8

## 0.4.1

### Patch Changes

- Updated dependencies [e5d120e]
- Updated dependencies [e5d120e]
  - @hex-core/registry@0.6.0
  - @hex-core/themes@0.2.3
  - @hex-core/tokens@1.3.7

## 0.4.0

### Minor Changes

- 1264d32: Token-cost audit + calibration across every LLM-bound surface.

  **`@hex-core/payload`** — Bundled registry now resolves the page-recipe build path correctly: `scripts/build-registry.ts` branches on `recipe.kind` so the build no longer fails on `kind: "page"` recipes. The bundled `registry/items/` grew from 132 to 183 entries (51 blocks + AI elements + motion primitives that were previously stranded by the build).

  **`@hex-core/components` / `@hex-core/motion`** — Every component's `ai.tokenBudget` is now calibrated against the measured wire-shape (pretty-printed) `get_component_schema` token count — the shape MCP clients actually receive and rank by. Most primitives were under-declaring by 2–3× (`button` was 500 → 1,718; `cluster` was 250 → 938). Declared vs. measured is now within ±1 token across all 183 items. Wire output is unchanged; only the declared estimates were wrong.

  **`@hex-core/mcp`** — Added a contract-test regression gate: `get_component` ≤ 15K tokens, `get_component_schema` ≤ 2.5K, `emit_app_context` (N=20) ≤ 5K. Wire output remains pretty-printed (human-readable for debugging); ceilings reflect the actual response shape with ~20% headroom over current max.

  New maintenance script at `scripts/audit-tokens.ts` (`pnpm audit:tokens`) measures every LLM-bound surface — MCP tool responses, recipes, skills, the bundled registry — and writes `packages/mcp-server/TOKEN_AUDIT.md`. Pass `--update-budgets` to push measured numbers back into each schema's `ai.tokenBudget` literal. The audit asserts the bundled `@hex-core/payload` registry stays in sync with the repo-root `registry/` and bails loud if they drift.

  Realistic compound load (4 SKILL.md packs + `emit_app_context` at N=20 + 1 page-recipe) is ~10K tokens — 5% of Claude's 200K window. There is no context-window pressure; this PR ships measurement, calibration, and a regression gate so future surface additions don't silently bloat MCP responses.

### Patch Changes

- Updated dependencies [ee2b71d]
  - @hex-core/registry@0.5.2

## 0.3.0

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

- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
  - @hex-core/registry@0.5.0
  - @hex-core/themes@0.2.2
  - @hex-core/tokens@1.3.6

## 0.2.4

### Patch Changes

- Updated dependencies [398bc7d]
  - @hex-core/registry@0.4.0
  - @hex-core/themes@0.2.1
  - @hex-core/tokens@1.3.4

## 0.2.3

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

## 0.2.2

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
  - @hex-core/themes@0.2.0
  - @hex-core/registry@0.3.2
  - @hex-core/tokens@1.3.2

## 0.2.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.2.0

### Minor Changes

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
