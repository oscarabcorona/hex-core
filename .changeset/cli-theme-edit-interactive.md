---
"@hex-core/cli": minor
---

feat(cli): interactive `hex theme edit -i`

Closes the UX asymmetry between `theme init` and `theme edit`: until now
`init` had both flag-driven (`--preset`) and interactive (`-i`) modes,
but `edit` only had flag-driven (`--token key=value`). Humans tweaking
a single token had to memorize the HSL-triplet syntax and the contrast
implications upfront.

The new `-i` mode walks every token in the file:

- **Categorize** — picks "Color" / "Radius" / "Other" with counts;
  empty categories are hidden so a file with no `--radius` block
  doesn't surface that branch.
- **Pick a token** — shows the current value as an inline ANSI swatch
  for color tokens (24-bit truecolor, falls back to a labeled hex on
  `NO_COLOR` or unsupported terminals).
- **Mode** — `light` / `dark` / `both`, defaulting to `both`. Skipped
  when the file has only a `:root` block.
- **New value** — accepts hex (`#1e293b`), CSS `hsl()`, named colors,
  or raw HSL triplets for color tokens. Loops on parse failure.
- **AA contrast gate** — for foreground-paired tokens (`primary-foreground`
  vs `primary`, etc.) re-checks contrast against the relevant background.
  Sub-AA pairs surface a warning + retry/accept prompt that mirrors the
  existing `init -i` `promptSurfaceWithContrastGate` UX.
- **Buffered writes** — overrides are queued in memory and flushed once
  on exit, so a Ctrl-C mid-flow leaves the file untouched.

The flag-driven `--token key=value` path is unchanged. All shared logic
(`applyTokenOverride`, `colorInputToTokenValue`, `contrastRatio`,
`swatch`) is reused — no duplication. New parser lives at
`packages/cli/src/lib/parse-globals.ts` and round-trips with the
existing edit/replace pipeline.
