---
"@hex-core/registry": minor
"@hex-core/tokens": minor
"@hex-core/mcp": minor
---

feat(registry,tokens,mcp): intent metadata — variant useWhen, structured antiPatterns, semantic tokens

Phase 2 of the AI-native moat. The schemas already described **shape**
(`variant: "default" | "outline"`); now they describe **intent** —
when each value is the right choice, what NOT to do, and which
semantic role each token plays. LLMs picking between Button variants no
longer fall back to whatever shadcn's docs taught their training data;
they read hex-core's posture from the schema.

### `@hex-core/registry`

- **`variantValueSchema.useWhen?: string`** — per-value intent sentence
  ("secondary actions next to a primary CTA"). Optional so existing
  schemas parse; every shipped `*.schema.ts` should populate it.
- **`aiHintSchema.antiPatterns?: AntiPattern[]`** — structured anti-pattern
  channel:
  ```ts
  { mistake: "Using a Slider with min=0/max=1 to represent on/off",
    insteadUse: "switch",
    why: "Slider semantics are 'continuous range'..." }
  ```
  `insteadUse` MUST be a registry slug, so MCP can follow the link and
  return the suggested alternative as a real registry entry. The
  free-form `commonMistakes: string[]` stays for back-compat.
- **`usageExampleSchema.composition?: string[]`** — tags the surrounding
  context an example demonstrates (`["dialog", "destructive", "confirm"]`
  for a delete-confirm Button, `["form", "form-action"]` for a submit
  pair). MCP search ranks by tag overlap.
- **`semanticTokenEntrySchema` / `semanticTokenSetSchema`** — the new
  intent-layer schema for the parallel `defaultSemanticTokens` map.
- New types exported: `AntiPattern`, `VariantValue`, `SemanticTokenEntry`,
  `SemanticTokenSet`.

### `@hex-core/tokens`

- **New: `defaultSemanticTokens`** — a curated `SemanticTokenSet` over
  the raw `defaultTheme` palette, with entries like
  `button.destructive.bg → { value: "{color.destructive}", useWhen:
  "irreversible actions: delete, archive, deactivate, leave, force-quit" }`.
  Each entry references the underlying token by `{name}` syntax so
  swapping the underlying theme automatically shifts every semantic
  entry. ~20 entries spanning button, surface, form, feedback, shape,
  and motion intents.

### `@hex-core/mcp`

- **New tool: `describe_intent(name)`** — returns variant useWhen +
  structured antiPatterns + the slice of `defaultSemanticTokens`
  prefixed by the component name. Use BEFORE generating JSX; prevents
  the canonical LLM mistakes (picking destructive for non-destructive,
  picking Slider for booleans, etc.).
- **New tool: `search_compositions(tags, limit)`** — returns examples
  whose `composition` tags overlap the query. `["dialog", "destructive",
  "confirm"]` returns the canonical AlertDialog-with-delete-Button
  composition, not a bare `<Button variant="destructive">`. Ranked by
  overlap count.
- Contract test extended from 9 → 11 assertions covering both new tools
  end-to-end via the MCP SDK Client.

### Component schemas (initial enrichment)

`button`, `dialog`, `slider`, `switch`, `card` — all six variant arrays
populated with `useWhen`, all five with structured `antiPatterns`, all
five with `composition`-tagged examples. Roll-out continues per future
PR; the schema is back-compat so unenriched components still parse.

**Migration:** none. All new fields are optional, the runtime JS
contract is unchanged. Consumers reading `aiHintSchema.commonMistakes`
keep working; consumers wanting structured anti-patterns read
`aiHintSchema.antiPatterns` instead. Existing MCP clients keep working;
new clients can opt into `describe_intent` / `search_compositions` for
the richer intent payload.

**Cascade (informational, not a separate decision):** this changeset
deliberately bundles three minors. The Changesets cascade rule then
auto-bumps `@hex-core/cli`, `@hex-core/components`, `@hex-core/payload`,
`@hex-core/themes`, and `docs` to patch — five additional publishes for
a total of eight. Budget that into release timing. Each cascade bump
ships the same source code with a new dependency-pin range; no
behavioral change.
