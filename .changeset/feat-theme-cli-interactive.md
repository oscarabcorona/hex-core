---
"@hex-core/tokens": minor
"@hex-core/cli": minor
---

feat(tokens,cli): interactive theme authoring + shared color-math primitives

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
