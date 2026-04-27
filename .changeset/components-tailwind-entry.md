---
"@hex-core/components": minor
---

Ship a Tailwind v4 entry point so consumers don't have to hand-wire `@source` for `node_modules`.

Tailwind v4 doesn't auto-scan installed packages. Without an explicit `@source` directive in the consumer's CSS, utility classes embedded in this package's published bundle (e.g. `inset-ring-foreground/[0.06]` introduced by the v1.2.0 flat-surface fix) appear in the rendered HTML but have no matching CSS rule, leaving Button outline / Input / Card / etc. unstyled. The gap was discovered while validating v1.2.0 in a downstream consumer.

Adds:
- `packages/components/tailwind.css` exporting an `@source "./dist/*.js"` directive
- A new `./tailwind.css` exports entry in `package.json`
- Install-section update in the README explaining the one-line consumer setup

Consumer migration (one line):

```css
@import "tailwindcss";
@import "@hex-core/components/tailwind.css";
```

No runtime API changes. Existing consumers who already added their own `@source "../../node_modules/@hex-core/components/dist/*.js"` can replace it with the `@import` line, but the manual approach continues to work.
