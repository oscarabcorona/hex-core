# @hex-core/payload

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
