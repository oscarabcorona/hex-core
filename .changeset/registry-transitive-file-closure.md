---
"@hex-core/payload": minor
"@hex-core/cli": minor
---

Ship every file a component actually imports.

Thirty registry items were emitted with imports pointing at files that were
never written beside them: `hex add auth-sign-in-split` produced a component
importing six others that did not exist, and `markdown` was missing five.
The file collector only followed same-directory siblings, `*-variants` and
`_shared`, so a cross-directory import fell straight through.

The collector now walks the import graph transitively — pulling in
`button.tsx` also pulls in the `button-variants.tsx` it imports — and
recognises two more shapes: cross-directory component imports
(`../<name>/<name>`) and category-level shared modules (`../types`).
`rewriteRegistryImports` gains the matching rule for the latter, so
`../types.js` resolves to `@/components/ui/types` rather than pointing one
directory above where the file lands.

Across all 187 items, every relative import in an emitted file now resolves
to a file that item ships. Thirty items gained 84 previously-missing files.
