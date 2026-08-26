---
"@hex-core/tokens": minor
---

`generateGlobalsCss` gains a `sources` option for Tailwind v4. When set, the import becomes `@import "tailwindcss" source(none)` followed by one `@source` rule per glob, turning off automatic content detection.

This fixes a real failure for any app generated *inside* an existing repository — the normal case for a POC. Tailwind's automatic scan walks up past the app to the enclosing git root and reads whatever it finds, binary files included; their bytes become class candidates and emit utilities that cannot be parsed. In a dogfood run against this monorepo that meant 424 PNG baselines were read as classes, producing rules like `.w-[var(--O\e…)]` and 500ing every route.

Default behaviour is unchanged: omit `sources` for an app at the root of its own repository, where automatic detection is correct.
