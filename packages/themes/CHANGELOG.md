# @hex-core/themes

## 0.2.5

### Patch Changes

- c2ce968: Generate the brief-loader map instead of hand-writing 71 `switch` arms.

  `loadThemeBrief` is unchanged for callers. Imports stay static so esbuild
  keeps code-splitting each brief out of the main chunk.

- Updated dependencies [c2ce968]
- Updated dependencies [c2ce968]
- Updated dependencies [c2ce968]
  - @hex-core/registry@0.8.0
  - @hex-core/tokens@1.4.0

## 0.2.4

### Patch Changes

- Updated dependencies [0087190]
- Updated dependencies [2f7586f]
  - @hex-core/registry@0.7.0
  - @hex-core/tokens@1.3.8

## 0.2.3

### Patch Changes

- Updated dependencies [e5d120e]
- Updated dependencies [e5d120e]
  - @hex-core/registry@0.6.0
  - @hex-core/tokens@1.3.7

## 0.2.2

### Patch Changes

- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
  - @hex-core/registry@0.5.0
  - @hex-core/tokens@1.3.6

## 0.2.1

### Patch Changes

- Updated dependencies [398bc7d]
  - @hex-core/registry@0.4.0
  - @hex-core/tokens@1.3.4

## 0.2.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [8f53d79]
  - @hex-core/registry@0.3.2
  - @hex-core/tokens@1.3.2

## 0.1.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.1.0

### Minor Changes

- 76752d4: Initial release. Establishes a separate publish/version surface for theme presets so the bundled `@hex-core/tokens` package can stay focused on the canonical default theme + the transformer functions.

  Today: re-exports `midnightTheme` and `emberTheme` from `@hex-core/tokens` and adds catalog helpers (`premiumThemes`, `getPremiumTheme(name)`, `listPremiumThemes()`) shaped to mirror `listThemes()` from `@hex-core/tokens`. Future premium presets (`fintech-dark`, `editorial-warm`, `data-dense`, `pastel-soft`, `monochrome-strict`) will land here directly without bumping `tokens`.

  ```ts
  import { midnightTheme, listPremiumThemes } from "@hex-core/themes";
  import { themeToScopedRuntimeCss } from "@hex-core/tokens";

  const css = themeToScopedRuntimeCss(midnightTheme, { mode: "dark" });
  const catalog = listPremiumThemes(); // [{ name, displayName, description }, …]
  ```

  Non-breaking — `@hex-core/tokens` continues to export `midnightTheme` / `emberTheme` directly, so existing consumers don't need to migrate. The new package just gives studios and theme switchers a single import surface for "premium catalog" that grows independently.
