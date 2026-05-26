---
"@hex-core/components": minor
"@hex-core/registry": patch
---

feat(blocks): catalog backfill — 13 sections + 4 page-recipes (closes strategy doc)

Final backfill round from the page-system strategy. Thirteen new presentational,
theme-driven section blocks — each with schema + render test, content via
`ReactNode` slots:

**Marketing (1)** — `MarketingBento`: asymmetric bento feature layout
(distinct from the symmetric `marketing-feature-grid`).

**App (3)** — closes the list family:
- `AppStackedList` — labeled item list (members, inbox) — distinct from `app-data-table`
- `AppGridList` — grid variant of stacked-list
- `AppFeed` — chronological activity timeline, grouped by day

**Commerce (9)**:
- `CommerceCategory` — category preview cards
- `CommerceCategoryFilters` — filter sidebar with native `<details>` collapse (no JS)
- `CommerceStoreNav` — storefront top nav with mobile menu (`"use client"`)
- `CommerceProductFeatures` — PDP feature spotlight (`alternating` / `grid` variants)
- `CommerceQuickview` — quickview body composable into Dialog/Sheet
- `CommerceIncentives` — value-prop band (free shipping, returns)
- `CommercePromo` — featured-deal banner (`image-left` / `image-right` / `overlay`)
- `CommerceOrderSummary` — read-only order detail card
- `CommerceOrderHistory` — customer order history table with empty state

Plus four new page-recipes (`kind: "page"`):
- `order-page` (ecommerce) — order confirmation page
- `checkout-page` (ecommerce) — checkout layout
- `pricing-page` (landing) — dedicated pricing page (hero + tiers + faq + cta)
- `product-page` (ecommerce) — PDP (detail + features + reviews)

**Catalog: 30 → 43 blocks** (6 auth + 15 marketing + 8 app + 14 commerce). Page-recipes
4 → 8. New blocks excluded from the per-component visual loop (composed page-sections —
same business-logic rationale as the prior 18). No breaking changes.
