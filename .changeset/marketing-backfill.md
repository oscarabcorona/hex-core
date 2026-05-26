---
"@hex-core/components": minor
"@hex-core/registry": patch
---

feat(blocks): marketing backfill — 6 sections + about-page recipe

Backfill batch from the page-system strategy. Six new presentational,
theme-driven marketing sections — each with schema + render test, content via
`ReactNode` slots (no icon set bundled):

- `MarketingStats` — big-number tiles for "by the numbers" bands (distinct
  from `app-stats`: no change deltas, larger typography)
- `MarketingFaq` — composed from Accordion (`single` or `multiple` open)
- `MarketingTeam` — team grid with avatar/name/role/bio/social slots
- `MarketingNewsletter` — heading + caller-supplied form + disclaimer, in
  centered or split layout
- `MarketingContact` — heading + optional details column + caller-supplied
  form, in split or stacked layout
- `MarketingContent` — blog/content card grid with optional href, image, meta

A new `about-page` page-recipe (kind `page`, pageType `landing`) composes
header → hero → team → stats → content → contact → footer so an LLM or
`hex recipe add about-page` scaffolds a credibility-first About page.

Brings the block catalog to **30 blocks total** (6 auth + 14 marketing + 5 app
+ 5 commerce).
