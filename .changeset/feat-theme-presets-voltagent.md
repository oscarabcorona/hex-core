---
"@hex-core/themes": minor
"@hex-core/registry": patch
"@hex-core/tokens": patch
"@hex-core/payload": patch
"@hex-core/mcp": patch
"@hex-core/cli": patch
---

feat(themes): 71 brand-derived theme presets (Tesla, Stripe, Linear, …)

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
*style references inspired by publicly visible design systems*,
not endorsements.
