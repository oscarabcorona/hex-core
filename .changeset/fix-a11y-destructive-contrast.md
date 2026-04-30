---
"@hex-core/tokens": patch
"@hex-core/components": patch
---

fix(a11y): resolve critical label + serious contrast/nested-interactive violations

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
