---
"@hex-core/mcp": minor
---

feat(mcp): add emit_figma_tokens — render a theme as a Figma Variables REST POST body

Closes Theme E of the internal roadmap (Figma pipeline OS substrate). The 13th
MCP tool, `emit_figma_tokens(theme)`, walks a resolved theme's light + dark
palettes and emits a markdown document wrapping a JSON body shaped for Figma's
`POST /v1/files/:file_key/variables` endpoint:

- One variable collection (`Hex UI — <theme>`) with two modes (`Light` + `Dark`)
- One variable per token, typed `COLOR` (for color tokens) or `FLOAT` (for
  radius / spacing / dimension / duration / font tokens)
- One mode-value per (variable × mode) — light palette feeds the Light mode,
  dark palette feeds the Dark mode

HSL → RGB conversion (color tokens land in 0–1 RGBA range as Figma expects) and
unit conversion (rem→px @ 16px base, s→ms, % and bare numbers passthrough) are
inlined as ~30 LOC each. The canonical implementations still live in
`@hex-core/components/lib/color.ts` and `@hex-core/tokens/transformer.ts`; the
duplication is intentional to avoid taking React + tokens runtime deps in mcp.

Pasting the JSON into a Figma plugin or `curl` call against the Variables REST
endpoint produces a populated kit. Designers flipping between Light/Dark in
Figma now mirror the consumer app's `:root` ↔ `.dark` cascade exactly.

`tools/list` is now 13 entries; the contract test asserts the new tool is
registered AND that `tools/call emit_figma_tokens { theme: "default" }` returns
markdown containing the four canonical top-level keys (`variableCollections`,
`variableModes`, `variables`, `variableModeValues`) inside a JSON code block.
