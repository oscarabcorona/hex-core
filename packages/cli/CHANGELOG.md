# @hex-core/cli

## 0.3.1

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

## 0.3.0

### Minor Changes

- 2bdd746: feat(tokens,cli): interactive theme authoring + shared color-math primitives

  Phase 1 of the theme-authoring system. The CLI gains `hex theme init -i` —
  an interactive flow that walks the user through a small set of seed colors
  (primary, foreground, background, destructive, radius), derives the rest
  of the canonical token slots automatically, validates through
  `strictThemeSchema`, and writes the result as CSS, JSON, or a TS theme
  file ready to drop into `@hex-core/tokens`.

  ### `@hex-core/tokens`

  New pure-function color-math helpers exported from the package root:
  - **`deriveForegroundFor(bgValue)`** — pick near-white or near-black for
    WCAG-AA contrast against any background. Used to auto-pair every
    `*-foreground` slot with its base.
  - **`deriveDarkFromLight(tokenSet)`** — mirror a light TokenSet into a
    coherent dark TokenSet by inverting lightness around 50% while
    preserving hue and reducing saturation 25% (avoids the neon-toxic
    effect of naive HSL inversion).
  - **`deriveSecondaryFromPrimary(primary)`** — desaturate + lighten a
    primary into the muted-but-related fill that Cancel/Save-Draft buttons
    pair with.
  - **`contrastRatio(fg, bg)`** — WCAG-conformant contrast computation
    exposed for authoring-time gates.
  - **`colorInputToTokenValue(input)`** — parse anything culori accepts
    (hex, named colors, `hsl()`, `rgb()`) into the canonical
    `"<H> <S>% <L>%"` token-value string.
  - **`tokenLuminance(value)`** — the perceptual brightness of a color,
    for callers picking shimmer / overlay tints dynamically.

  These helpers live in `@hex-core/tokens` (not `@hex-core/cli`) so the
  future Hex Studio web UI in `hex-ui-platform` can reuse them in its
  React sliders without bundling commander + @inquirer/prompts. Both
  shells (terminal CLI + web Studio) wrap the same color math.

  ### `@hex-core/cli`
  - **`hex theme init -i`** — interactive flow described above. Renders
    ANSI swatches inline so authors can see what they're picking; gracefully
    falls back to bare hex strings when `NO_COLOR` is set or the terminal
    doesn't support 24-bit color.
  - **`--format ts`** — new output format that writes a TS theme file
    matching the shape of `packages/tokens/src/themes/{default,midnight,ember}.ts`.
    Used to dogfood-author a new opinionated default theme to replace the
    current shadcn-clone palette (Phase 2, follow-up).
  - **`hex theme init` (non-interactive)** — unchanged. Existing
    `--name <preset>` / `--out <path>` flags keep working for scripted
    scaffolding from the OSS preset themes.
  - **`hex theme edit`, `hex theme apply`** — unchanged.

  ### New deps
  - `culori@latest` — color manipulation (HSL parsing, WCAG contrast,
    freeform color-string parsing). Added to both `@hex-core/tokens`
    (runtime, for the derive helpers) and `@hex-core/cli` (re-uses the
    same parser for prompt input).
  - `@inquirer/prompts@latest` — terminal prompts (CLI only).
  - `picocolors@latest` — ANSI output (CLI only).

  ### Migration

  None for non-interactive consumers. The new flag is opt-in:
  `hex theme init -i` triggers the new path; bare `hex theme init`
  preserves v0.2.x behavior.

  ### What's next

  Phase 2 (separate PR): run `hex theme init -i --format ts --out
packages/tokens/src/themes/default.ts --overwrite` to author the new
  opinionated default theme that replaces the shadcn-clone palette
  flagged in `.claude/research/phase-2-feedback.md` (F2-06).

### Patch Changes

- Updated dependencies [035e4ec]
- Updated dependencies [2bdd746]
  - @hex-core/tokens@1.3.0

## 0.2.3

### Patch Changes

- 36a3a1c: fix(cli): post-POC polish — v4 bridge restores `hex theme edit`, recipes-in-list, theme apply, sonner hint

  Backfill changeset for PR #92 (commit `c967659`, merged 2026-04-28). PR #92 shipped 7 fixes after a real POC against `cli@0.2.2` but never landed a changeset, leaving the cli stuck on main without a release path. This changeset triggers `cli@0.2.3` so users hitting the actively-broken `hex theme edit` v4 path get the fix on npm.

  The seven items in PR #92:

  | Commit    | Fix                                                                                                                                                                                                                                                                                                                                                                                                                             | Why it matters                                                                                                                        |
  | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | `857aaba` | **Fix B (the real bug)** — v4 globals.css uses the bridge pattern: `:root { --primary: VALUE }` + `@theme inline { --color-primary: hsl(var(--primary)) }`. The previous shape inlined color values directly into `@theme {}`, which works for `bg-primary` utilities but eliminates the raw `--primary: VALUE` triplet that `hex theme edit`'s regex hunts for. Result: `hex theme edit` silently no-op'd on every v4 install. | Critical — `hex theme edit` is a documented command. Users hitting the v4 path on `cli@0.2.2` see no error, no diff, no token change. |
  | `2d18084` | **Fix A** — `npx hex-core` typo callout in root + cli READMEs (unscoped `hex-core` on npm is owned by an unrelated author).                                                                                                                                                                                                                                                                                                     | Prevents users from `npx`-installing the wrong package.                                                                               |
  | `6e581c9` | **Fix C** — silent skip for shared `lib/*` files on re-add; preserves customizations. No more `Skip: lib/utils.ts (use --overwrite)` nag.                                                                                                                                                                                                                                                                                       | Cleaner re-add UX; users who customized `lib/utils.ts` keep their edits.                                                              |
  | `89acbde` | **Fix D** — recipes section in `hex list` with "Try one: hex recipe add <slug>" CTA.                                                                                                                                                                                                                                                                                                                                            | Killer feature was buried behind a separate command; now discoverable in the default `hex list`.                                      |
  | `e2a6141` | **Fix E** — drop unused `hooks` alias from default `hex.config.json` (no registry item references it).                                                                                                                                                                                                                                                                                                                          | Cleaner default config; one less thing to explain.                                                                                    |
  | `9cce7aa` | **Fix F** — Toaster mount reminder after `hex add sonner` so users don't silently hit "no toast appears."                                                                                                                                                                                                                                                                                                                       | Sonner needs a mount point; surfacing the requirement saves debugging time.                                                           |
  | `424874e` | **Fix G** — `hex theme apply <preset>` for surgical theme switches; replaces only `:root` + `.dark` token bodies, preserves user customizations and the `@theme inline` bridge.                                                                                                                                                                                                                                                 | New command; complements `hex theme edit`.                                                                                            |

  **Tests:** PR #92 already shipped 96 cli tests + 39 tokens tests covering all 7 fixes. No additional test work in this changeset.

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.2.2

### Patch Changes

- d99548a: fix(cli): bundle registry into npm tarball + rewrite imports to alias paths

  Resolves the post-init install wall: `hex add` now writes import-correct files into
  the consumer's `components/ui/` directory (alias-rewritten, no `.js` suffixes). The
  registry tarball-bundled `prebuild` step lets `hex list` / `hex add` work outside
  the monorepo. `hex doctor` reports install invariants (Tailwind major, peer deps,
  hex.config.json, lib/utils, globals.css shape).

  Backfill changeset for PR #88 (`fix: collapse the post-init install wall…`,
  commit `0729f38`) — the PR shipped the fixes but no changeset, so cli has been
  sitting on main without a release path.

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

- Updated dependencies [c8a4d52]
- Updated dependencies [6c8c141]
  - @hex-core/registry@0.2.1
  - @hex-core/tokens@1.0.0

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
  - @hex-core/tokens@0.2.0
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
