---
"@hex-core/tokens": patch
"@hex-core/components": patch
---

fix(a11y): clear 2 WCAG AA contrast violations from the regression gate

- Dark `--destructive` token lifted from `0 48.8% 58%` → `0 48.8% 68%` so
  `text-destructive` on the dark `--card` (L=14%) clears AA 4.5:1
  (was 4.02:1 — caught by `<Task>`'s error-step label).
- `<ChainOfThought>` row labels drop the `/80` opacity modifier on
  `text-muted-foreground` — at 80% opacity the small uppercase labels
  measured 3.85:1 on the light card (now ~4.7:1).
