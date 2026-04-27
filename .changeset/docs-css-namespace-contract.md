---
"@hex-core/tokens": patch
---

Documented the CSS-variable namespace contract.

`themeToCss()` emits the raw `--<key>: <H S L>` namespace (no `hsl()` wrapper, no prefix); Tailwind v4's `@theme` directive consumes a separate `--color-<key>: hsl(...)` namespace. The tokens README now explains both layers and shows the bridge pattern (`@theme { --color-x: hsl(var(--x)) }` over `:root { --x: <triplet> }`) so consumers can wire one source of truth that drives both layers.

`themeToCss` JSDoc now cross-links to the README section.
