---
"@hex-core/registry": patch
"@hex-core/components": patch
---

fix(recipes): ecommerce discoverability + page-recipe assembly guidance

Manual-QA follow-ups for the page-recipe system:

- `resolve_spec` now matches natural ecommerce phrasing — "online store", "store",
  and "shop" surface `storefront-page` and the commerce blocks (added store/shop
  synonyms to the storefront recipe and commerce block tags). Previously these
  returned nothing.
- Each page recipe's `layout` brief now states the per-block import convention
  (`@/components/ui/<section.block>`) so an agent/developer knows how to wire the
  installed section files together.
