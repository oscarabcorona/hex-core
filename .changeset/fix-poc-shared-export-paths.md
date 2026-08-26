---
"@hex-core/payload": minor
---

Resolve example imports to the module that actually exports them. The catalog graph attributed every export of an item to its main module, so identifiers living in `components/_shared/*` — notably `mockAuthAdapter`, used by all six auth blocks — were imported from a path that doesn't export them. Graph nodes now carry an `exportPaths` map (identifier → module suffix) and codegen imports from it. `graphNodeSchema` gains the field, so this is additive public surface rather than a pure patch.

Adds a POC regression guard over the composable surface: every block, plus every item whose example is import-led, is generated as a one-section route and checked for components or identifiers that are used but never imported or declared (TS2304). Items that genuinely need a client boundary are excluded explicitly, not silently — their examples require React state or pass functions, and generated pages are Server Components that also export `metadata`.

Two known gaps this does **not** close: prop-shape drift (TS2322, e.g. the `Pagination` API above) needs a real typecheck over the generated tree; and 31 recipe-referenced items whose examples are bare JSX with no imports would still emit an unimported component if composed as a section.
