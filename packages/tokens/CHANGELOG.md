# @hex-core/tokens

## 1.3.6

### Patch Changes

- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
  - @hex-core/registry@0.5.0

## 1.3.5

### Patch Changes

- c7bb59e: fix(a11y): clear 2 WCAG AA contrast violations from the regression gate
  - Dark `--destructive` token lifted from `0 48.8% 58%` → `0 48.8% 68%` so
    `text-destructive` on the dark `--card` (L=14%) clears AA 4.5:1
    (was 4.02:1 — caught by `<Task>`'s error-step label).
  - `<ChainOfThought>` row labels drop the `/80` opacity modifier on
    `text-muted-foreground` — at 80% opacity the small uppercase labels
    measured 3.85:1 on the light card (now ~4.7:1).

## 1.3.4

### Patch Changes

- Updated dependencies [398bc7d]
  - @hex-core/registry@0.4.0

## 1.3.3

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

## 1.3.2

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

## 1.3.1

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

## 1.3.0

### Minor Changes

- 035e4ec: feat(tokens): replace shadcn-clone default theme with modern-minimalist signature

  Phase 2 of the consumer-feedback refactor. The previous `defaultTheme`
  was shadcn-canon with renamed tokens — explicitly the #1 unaddressed
  critique from `.claude/research/phase-2-feedback.md` (F2-06):
  _"there is nothing a designer can point to and say that's hex-core."_
  This swaps the values for a distinctive opinionated palette while
  keeping the token shape, names, and CSS-variable contract identical.

  ### Visual signature
  - **Restrained cool grayscale (~222 hue).** Moves off the shadcn-canon
    240 zinc family toward a slightly cooler slate. Saturation stays low
    across the palette so the brand recedes and content leads.
  - **Graphite primary** (`222 25% 18%` instead of near-black `240 5.9% 10%`).
    Primary CTAs read as intentional charcoal, not generic black —
    recognizably different from every shadcn fork.
  - **Cool-tinted background** (`210 20% 98%` instead of pure `0 0% 100%`).
    Subtle, but a designer notices the considered tint immediately.
  - **Tight 0.375rem radius** (down from `0.625rem`). Modern without
    being precious; carries shape identity even before color registers.
  - **Restrained destructive** (`0 65% 50%` saturation, down from `72%`).
    Reads as "considered alarm" rather than "loud emergency."
  - **Auto-derived dark mode** via `deriveDarkFromLight` (the H1-fixed
    helper from PR #105). Bases inverted at 50% pivot, saturation cut
    25% to avoid neon-toxic flips, every `*-foreground` re-derived
    against the inverted base for AA contrast.

  ### Authored via the dogfood path

  This theme was generated by a one-off Node script that calls the
  exported `@hex-core/tokens` helpers directly (`deriveForegroundFor`,
  `deriveSecondaryFromPrimary`, `deriveDarkFromLight`) — proving the same
  helpers `hex theme init -i` and the future Studio web UI use produce a
  shippable theme. The script is the maintainer-facing equivalent of the
  interactive flow.

  ### What didn't change
  - Token names (`background`, `foreground`, `primary`, `--radius`, etc.)
  - CSS-variable emit shape (`themeToCss` / `themeToTailwindConfig` /
    `themeToFlatJson` outputs the same keys)
  - Schema validation (`strictThemeSchema.safeParse(defaultTheme)` still
    passes)
  - `defaultSemanticTokens` resolution — every entry still resolves
    against the new default, gated by the existing 3-theme resolver test
    in `packages/tokens/test/semantic.test.ts`

  ### Migration

  None for consumers using `@hex-core/components` directly — the CSS
  variables are unchanged and components keep working. Consumers who
  **inlined** the old shadcn HSL values verbatim (e.g. copying the docs
  snippet into their own `globals.css`) will still see the old palette
  until they re-scaffold via `hex theme init` or update their snippet to
  match the new values. The docs site is updated in this PR.

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

## 1.2.2

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

## 1.2.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0

## 1.2.0

### Minor Changes

- 0188728: Adds `themeToScopedRuntimeCss(theme, { scope?, mode? })` — render a theme as a single CSS rule scoped to any selector, suitable for runtime token overrides without round-tripping through `globals.css`.

  Output emits **both** namespaces in one pass:
  - `--<key>: <value>;` (raw triplet) — preserves alpha-composition utilities like `bg-background/50` that read the bare `H S% L%` form.
  - `--color-<key>: hsl(<value>);` (full `hsl()` string) — feeds Tailwind v4's `@theme` block so generated utilities (`bg-background`, `text-primary`, etc.) resolve against the override.

  Non-color tokens (radii, durations, spacing, font sizes) only emit the raw `--<key>` form.

  ```ts
  import { defaultTheme, themeToScopedRuntimeCss } from "@hex-core/tokens";

  const css = themeToScopedRuntimeCss(defaultTheme, {
  	scope: ".studio-canvas-active",
  	mode: "light",
  });
  // → ".studio-canvas-active { --background: 0 0% 100%; --color-background: hsl(0 0% 100%); … }"
  ```

  Closes the gap previously bridged by hand in downstream studios — see the new "Runtime overrides" section in the README.

  Also exports the supporting `ScopedRuntimeCssOptions` type.

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

## 1.0.2

### Patch Changes

- fe050d0: Fix: light-theme `--secondary`, `--border`, and `--input` now meet WCAG 2.1 SC 1.4.11.

  Previously the default theme's light-mode `--secondary` (L=95.9%), `--border` (L=90%), and `--input` (L=90%) sat at ~1.10:1 / ~1.27:1 contrast against `--card` (white) — well below the 3:1 minimum required for non-text UI components. The bug was visible on hex-core.dev/docs/components/button: Outline and Secondary `<Button>` variants were nearly invisible against the white card surface, and form-control borders, Card borders, Switch tracks, Progress tracks, and Slider tracks were all undetectable as discrete UI elements.

  All three tokens now sit at L=58%, giving ~3.2:1 contrast against white — clearing WCAG 1.4.11. The full axe-core audit (`pnpm run a11y-audit`) passes zero critical/serious/moderate/minor violations across every component demo for the **default** theme in light + dark modes.

  `@hex-core/components` also gets a patch: Button (`secondary` variant) and Badge (`secondary` variant) drop their `hover:bg-secondary/80` opacity-shift hover state, because at the new L=58% fill, an 80% alpha composite over white renders the apparent contrast to ~2.44:1 — a hover-state regression below 3:1. Button substitutes shadow elevation (`shadow-sm` → `shadow-md` on hover); Badge keeps the fill at full opacity (badges don't traditionally need a hover affordance — they're not interactive controls).

  **Patch-vs-major rationale** — Theme A (the previous tokens MAJOR bump) required code-level migration: consumers using `--destructive-foreground` on non-destructive surfaces had to re-point those surfaces. This PR only shifts pixel values for a fixed set of tokens; no consumer code change is required. Defenders who want the prior off-white aesthetic can override the three tokens at `:root` (acknowledging they then fail WCAG 1.4.11). That distinction is what makes patch defensible here despite the visible visual change.

  **Audit scope honesty** — `scripts/a11y-audit.ts` only renders the default theme in light + dark, not midnight or ember. The midnight and ember _light_ variants share a similar pattern (~1.18:1 / ~1.17:1 secondary-vs-card) and have the same defect; they're tracked as a follow-up to finding #12 and not gated by this PR's audit run.

  Dark-mode values are unchanged — they already exceeded 3:1 against the dark `--card`. `--secondary-foreground` stayed at L=10% — gives 5.6:1 against the new L=58% fill (passes AA normal text). `--muted` and `--accent` also stayed at L=95.9% — they're text-background tokens, not "non-text UI elements" per 1.4.11.

## 1.0.1

### Patch Changes

- f667b88: Documented the CSS-variable namespace contract.

  `themeToCss()` emits the raw `--<key>: <H S L>` namespace (no `hsl()` wrapper, no prefix); Tailwind v4's `@theme` directive consumes a separate `--color-<key>: hsl(...)` namespace. The tokens README now explains both layers and shows the bridge pattern (`@theme { --color-x: hsl(var(--x)) }` over `:root { --x: <triplet> }`) so consumers can wire one source of truth that drives both layers.

  `themeToCss` JSDoc now cross-links to the README section.

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
