---
"@hex-core/components": patch
"@hex-core/tokens": patch
---

fix(artifacts): unblock diagram primitives + 3 a11y violations + dark-mode card lift

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
