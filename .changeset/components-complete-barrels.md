---
"@hex-core/components": minor
---

Generate the barrels; ship `cn` and the colour helpers as RSC-safe entries.

`@hex-core/components/schemas` now exports all 159 component schemas. The
hand-written barrel it replaces shipped 109 — every block and both hooks were
missing, and nothing caught it because the registry build reads schema files
from disk rather than through the barrel.

The runtime barrel gains six exports that were reachable via deep imports but
absent from it: `DialogContentProps`, `ScrollAreaProps`, `SliderProps`,
`closeUnterminated`, `findColumnIdForCard` and `moveCard`.

`src/lib/*` now gets its own tsup entries, so `cn` and the HSL helpers are
importable from a Server Component via `@hex-core/components/utils` — the
root barrel carries a `"use client"` directive, which made calling `cn` from
server code fail at render.

Both barrels are generated from the filesystem by `scripts/build-barrels.ts`.
Tag a declaration `@internal` to keep it out of the public API.
