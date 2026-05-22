---
"@hex-core/components": minor
---

feat(blocks): marketing section blocks + landing-page page-recipe

Adds eight presentational, theme-driven marketing section blocks that compose
into a landing page: `MarketingHeader`, `MarketingHero`, `MarketingLogoCloud`,
`MarketingFeatureGrid`, `MarketingPricing`, `MarketingTestimonial`,
`MarketingCta`, and `MarketingFooter`. Each ships its machine-readable schema
(with `ai` guidance) and a render test; content and icons are passed as
`ReactNode` so no icon set is bundled.

A new `landing-page` page-recipe (kind `page`, pageType `landing`) orders these
sections — header → hero → logo cloud → features → pricing → testimonials →
CTA → footer — so an LLM or `hex recipe add landing-page` can scaffold a full
marketing page in one call. Supersedes the older `pricing-table` recipe for new
work.
