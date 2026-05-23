---
"@hex-core/motion": patch
---

fix(motion): emit `"use client"` banner so wrappers import cleanly into Server Components

`tsup` strips per-file `"use client"` directives when bundling, so the published
`dist/index.js` had no client marker — importing any wrapper (or `Motion`,
`Presence`, the timeline) into a Next.js Server Component crashed with
"createContext is not a function". `tsup`'s `banner.js` now re-applies
`"use client"` to every emitted file, so `import { FadeIn } from "@hex-core/motion"`
works directly in an RSC page without an explicit boundary.

No source changes; surface unchanged. Fixes both Phase-1 and the new Phase-2 catalog.
