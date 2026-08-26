---
"@hex-core/registry": minor
---

Make derivable schema fields optional, and add a palette tier to themes.

`componentSchemaDefinition` now defaults `props`, `variants`, `slots`,
`tokensUsed`, `examples`, `tags` and `dependencies`, so a new component's
`.schema.ts` declares only what a human actually knows — roughly fifteen
lines instead of ninety. The new `ComponentSchemaInput` type is what authors
annotate with; `ComponentSchemaDefinition` stays the post-defaults shape that
tooling consumes, so existing consumers are unaffected.

Themes gain an optional `palette` — the raw colour ramp — and `tokenValue`
gains an optional `ref` recording which ramp entry a token was drawn from.
`value` still carries the resolved literal, so contrast math and dark-mode
derivation are unchanged.
