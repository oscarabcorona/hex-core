---
"@hex-core/cli": minor
---

feat(cli): `hex migrate` — convert Next.js / Vite / CRA / CRACO + shadcn/ui projects to Hex Core in-place

Detects the host framework + shadcn footprint, replaces each `<components>/ui/*.tsx` with the matching Hex Core source at the same alias-resolved path, installs missing peer deps via the consumer's package manager (npm / pnpm / yarn / bun — auto-detected), and writes a `*.shadcn.bak` next to each converted file so the original survives for diff/restore.

**What it migrates (file-replace strategy)**

- 36 of 40 canonical shadcn slugs (button, dialog, dropdown-menu, form, …) map 1:1 by name.
- `toast` → `sonner` (rename — Hex Core ships only the Sonner wrapper). The original `toast.tsx` is backed up and removed.
- `carousel` and `chart` are skipped with a warning — no Hex Core equivalent yet.

**Framework detection**

Recognizes Next.js (App Router and Pages Router, with or without `--src-dir`), Vite + React, Create React App, and CRACO. The framework drives the Toaster mount hint in the report (e.g. `src/app/layout.tsx` for Next.js App Router, `src/main.tsx` for Vite).

**Flag set**

```
hex migrate [--dry-run] [--yes] [--no-backup] [--no-install]
            [--from <dir>] [--theme=preserve|replace]
            [--only <slugs>]
```

- `--dry-run` plans without writing or spawning.
- `--theme=replace` swaps the consumer's `globals.css` palette via the existing `theme apply` machinery (surgical — preserves custom rules).
- `--only <slugs>` restricts the migration to a comma-list of shadcn slugs.

**Doctor extension**

`hex doctor` now flags leftover shadcn artifacts (`components.json`, `toast.tsx`, `hooks/use-toast.ts`) with a `warn` and points the user at `hex migrate`. Idempotent: a re-run on a successfully-migrated project finds no signal and exits cleanly.

**Out of scope (future)**

- v2 will add npm-imported libraries (MUI, Chakra, Mantine, NextUI) via codemod + `hex add` + `npm uninstall`.
- v3 will add CSS-class libraries (Bootstrap, DaisyUI) via className rewriting.
- Heavy-modification detection (`shadcn-baselines.json` + Levenshtein heuristic) — v1 always backs up + overwrites.
