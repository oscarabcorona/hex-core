---
"@hex-core/components": minor
---

feat(blocks): application section blocks + app-page page-recipe

Adds five presentational, theme-driven application section blocks for building
authenticated app screens: `AppShell` (responsive sidebar + sticky top bar +
main region), `AppSidebarNav` (grouped nav with active states), `AppStats` (KPI
cards with directional deltas), `AppSettings` (two-column settings groups), and
`AppDataTable` (table-view frame with toolbar + pagination slots). Each ships
its machine-readable schema with `ai` guidance and a render test; content and
icons are passed as `ReactNode` so no icon set is bundled.

A new `app-page` page-recipe (kind `page`, pageType `app`) composes them — shell
wrapping the sidebar nav, with stats above a data-table view in the main region.
