---
"@hex-core/registry": minor
---

feat(registry): per-category token schemas + typed `StrictTokenSet` (Theme B follow-up)

Adds compile-time category guarantees on top of the runtime validation that already shipped in `strictTokenSetSchema`. Closes the ROADMAP item: *"Formal `TokenSet` Zod schema (strict typed token categories vs. current loose `z.record(string, unknown)`)."* Unblocks the Theme B success signal — community-authored themes on npm under `@hex-theme/*`.

**New per-category schemas + types** (12 categories — one per `tokenTypeEnum` member):

```ts
import {
  colorTokenSchema, type ColorToken,
  dimensionTokenSchema, type DimensionToken,
  radiusTokenSchema, type RadiusToken,
  spacingTokenSchema, type SpacingToken,
  fontTokenSchema, type FontToken,
  fontWeightTokenSchema, type FontWeightToken,
  durationTokenSchema, type DurationToken,
  cubicBezierTokenSchema, type CubicBezierToken,
  numberTokenSchema, type NumberToken,
  shadowTokenSchema, type ShadowToken,
  gradientTokenSchema, type GradientToken,
  opacityTokenSchema, type OpacityToken,
  tokenSchema, // discriminated union over all 12
} from "@hex-core/registry";

function paintBackground(c: ColorToken) { /* … */ }
// paintBackground(theme.tokens.light.primary) ← OK at compile time
// paintBackground(theme.tokens.light.radius)  ← compile error: RadiusToken not assignable
```

**Tightened `strictTokenSetSchema`:** the previous version was a `tokenSetSchema.refine(...)` that left the inferred type as `Record<string, TokenValue>` (loose). The new version uses `z.object({...}).catchall(tokenValueSchema)` so each canonical slot (`background`, `primary`, `radius`, etc.) is pinned to its expected category at the type level, while extra slots still accept any `TokenValue`.

```ts
const strict = strictTokenSetSchema.parse(input);
strict.primary.type;  // narrows to "color" (was: tokenTypeEnum)
strict.radius.type;   // narrows to "radius"
strict["space-4"];    // TokenValue (catchall — any category)
```

**New types:** `StrictTokenSet`, `StrictTheme` (already-existing `strictThemeSchema` now infers the tighter type).

### Behavior changes

**Runtime contract is stricter at canonical slots.** The old refinement only validated key presence — a theme could legally place a non-color token in a color slot like `primary`. The new schema enforces category at every required slot (e.g. `primary` rejects if `type !== "color"`, `radius` rejects if `type !== "radius"`). All 3 OSS preset themes (default, midnight, ember) and any theme where canonical slots already used the conventional category parse identically under both versions; themes that miscategorized canonical slots will now reject (intended behavior).

**Affected callers:** community theme authors validating via `strictTokenSetSchema.safeParse` may see new errors on previously-passing data if they had miscategorized any required slot. The fix is to use the correct token category — e.g. `primary` must be a `colorTokenSchema`-shaped value, not a `radiusTokenSchema`-shaped one.

**Validation issue shape changed.** The old `.refine()` returned a single combined error message: *"Theme is missing one or more required tokens. Required colors: …"*. The new `z.object` produces N issues — one per missing or miscategorized required slot — with `path` pointing at the offending key. Consumers iterating `result.error.issues[*].path` get richer per-field info; consumers matching on the old combined string must migrate to iterate `issues`. No internal `@hex-core/*` package depended on the old string.

**Migration:** zero for the common path. `tokenSetSchema` (loose) and `strictTokenSetSchema` (now-typed) are both still exported. Consumers using `safeParse` are unaffected unless they were depending on the lax-category behavior at canonical slots; consumers reading specific slots (`theme.primary.value`) get tighter inferred types automatically. Discriminated-union exhaustiveness checking on `token.type` works via either `tokenSchema` (preferred) or `tokenValueSchema` (existing).
