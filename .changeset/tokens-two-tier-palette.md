---
"@hex-core/tokens": minor
---

Two-tier colour tokens: one ramp, semantic tokens that point at it.

`defaultTheme` now declares every literal colour exactly once in a `palette`
const and draws semantic tokens from it via a type-checked `ref()` helper.
Generated CSS emits `--primary: var(--slate-900)` above
`--slate-900: 222 25% 18%`, so overriding a single ramp entry re-tints
everything drawn from it — including from a consumer's own stylesheet.

Every resolved value is byte-identical to the previous theme; this changes
the shape of the emitted CSS, not any colour.

Adds `generateThemeCssV4`, which emits just the token layer (ramp, semantic
tokens, and the Tailwind `--color-*` bridge) for consumers that already own
their `@import`s and non-colour `@theme` block.
