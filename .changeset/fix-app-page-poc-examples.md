---
"@hex-core/components": patch
---

Fix six block/component examples that made `hex poc` emit code that doesn't compile, or that couldn't be composed as a page section at all.

- `app-data-table` referenced an undefined `DataTable` with free `columns`/`rows` fixtures, and passed a `page`/`pageCount` props API that `Pagination` has never had (it is a compound component). This broke `app-page` — the only app-shaped page recipe — so `hex poc --recipe app-page` failed `next build` with `TS2304`.
- `canvas` rendered `<Canvas>` without importing it (only a side-effect CSS import).
- `timeline`, `data-table`, `input-otp` and `stepper` used the `export function Example()` shape the POC generator rejects, so any screen composing them was silently skipped.

Examples now import from the `@hex-core/components` barrel consistently.
