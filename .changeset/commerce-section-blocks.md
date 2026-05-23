---
"@hex-core/components": minor
---

feat(blocks): ecommerce section blocks + storefront-page page-recipe

Adds five presentational, theme-driven ecommerce section blocks:
`CommerceProductGrid` (catalog of linked product cards), `CommerceProductDetail`
(PDP layout with media + options + add-to-cart slots), `CommerceReviews` (star
summary + review list), `CommerceCart` (line items + sticky order summary), and
`CommerceCheckout` (form + order-summary layout). Each ships its machine-readable
schema with `ai` guidance and a render test; images, controls, and totals are
passed as `ReactNode` so no icon set or cart logic is bundled.

A new `storefront-page` page-recipe (kind `page`, pageType `ecommerce`) composes
the storefront — reusing the marketing header/footer for chrome around the
product grid and a promo band.
