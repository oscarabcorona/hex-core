---
"@hex-core/components": minor
"@hex-core/tokens": minor
---

Adds five headless layout primitives to `@hex-core/components` and four matching tokens to `@hex-core/tokens`.

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
