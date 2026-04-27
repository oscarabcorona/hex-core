---
"@hex-core/tokens": patch
"@hex-core/components": patch
---

Fix: light-theme `--secondary`, `--border`, and `--input` now meet WCAG 2.1 SC 1.4.11.

Previously the default theme's light-mode `--secondary` (L=95.9%), `--border` (L=90%), and `--input` (L=90%) sat at ~1.10:1 / ~1.27:1 contrast against `--card` (white) — well below the 3:1 minimum required for non-text UI components. The bug was visible on hex-core.dev/docs/components/button: Outline and Secondary `<Button>` variants were nearly invisible against the white card surface, and form-control borders, Card borders, Switch tracks, Progress tracks, and Slider tracks were all undetectable as discrete UI elements.

All three tokens now sit at L=58%, giving ~3.2:1 contrast against white — clearing WCAG 1.4.11. The full axe-core audit (`pnpm run a11y-audit`) passes zero critical/serious/moderate/minor violations across every component demo for the **default** theme in light + dark modes.

`@hex-core/components` also gets a patch: Button (`secondary` variant) and Badge (`secondary` variant) drop their `hover:bg-secondary/80` opacity-shift hover state, because at the new L=58% fill, an 80% alpha composite over white renders the apparent contrast to ~2.44:1 — a hover-state regression below 3:1. Button substitutes shadow elevation (`shadow-sm` → `shadow-md` on hover); Badge keeps the fill at full opacity (badges don't traditionally need a hover affordance — they're not interactive controls).

**Patch-vs-major rationale** — Theme A (the previous tokens MAJOR bump) required code-level migration: consumers using `--destructive-foreground` on non-destructive surfaces had to re-point those surfaces. This PR only shifts pixel values for a fixed set of tokens; no consumer code change is required. Defenders who want the prior off-white aesthetic can override the three tokens at `:root` (acknowledging they then fail WCAG 1.4.11). That distinction is what makes patch defensible here despite the visible visual change.

**Audit scope honesty** — `scripts/a11y-audit.ts` only renders the default theme in light + dark, not midnight or ember. The midnight and ember _light_ variants share a similar pattern (~1.18:1 / ~1.17:1 secondary-vs-card) and have the same defect; they're tracked as a follow-up to finding #12 and not gated by this PR's audit run.

Dark-mode values are unchanged — they already exceeded 3:1 against the dark `--card`. `--secondary-foreground` stayed at L=10% — gives 5.6:1 against the new L=58% fill (passes AA normal text). `--muted` and `--accent` also stayed at L=95.9% — they're text-background tokens, not "non-text UI elements" per 1.4.11.
