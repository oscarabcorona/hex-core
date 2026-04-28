---
"@hex-core/mcp": minor
---

feat(mcp): extend emit_app_context with overrides, density, and full payload sections

`emit_app_context` now accepts two new optional inputs and emits three new sections,
locking the OS canonical to the Hex Studio "Copy for LLM" payload format documented
in `hex-ui-platform/docs/studio/copy-for-llm.md`.

**New inputs:**

- `overrides?: Record<string, string>` — per-token value overrides merged onto
  the resolved theme's **light palette only** (dark + radius are out of scope
  for v0.3.0; if you need them, call the tool a second time with a dark-shaped
  theme). Keys absent from the base palette are still injected and flow into the
  Tailwind config too. The highlight table marks overridden tokens with
  `*(override)*`. Empty-string keys/values are rejected by the strict zod schema.
- `density?: "compact" | "comfortable" | "spacious"` — spacing-density preset
  folded into the light palette before `globals.css` is rendered. Density
  values WIN on key conflicts (e.g. a theme with `--space-4: 1rem` plus
  `density: "compact"` emits `--space-4: 0.75rem` once, never both). `comfortable`
  matches token defaults and is treated as a no-op. Density intentionally does
  not apply to `.dark` — apps using class-based dark mode keep the same spacing
  scale across light/dark, matching Studio's runtime canvas.

**New output sections** (theme-resolved cases only):

- `## globals.css` — full `@layer base { :root {} .dark {} }` block with all color
  tokens, optional density vars, and overrides applied to light. Drop-in replacement
  for a consumer's `app/globals.css`.
- `## tailwind.config.ts` — `theme.extend` block grouping six token buckets
  (color, borderRadius, spacing, fontSize, transitionDuration, height) into
  the right Tailwind fields so utility classes resolve. Empty buckets are
  omitted. The same overridden + density-folded palette feeds both globals.css
  and the Tailwind config, so brand-new override keys (e.g. `accent`) appear
  in both surfaces consistently.
- `## Context prompt` — six LLM rules + scoped components-in-scope list + user-ask
  placeholder. The "killer demo" section that lets a downstream model build
  theme-perfect output on first try.

**Schema strictness:** the input schema's `.strict()` is exercised by a new
contract-test assertion — passing an unknown field now reliably surfaces as
InvalidParams from the SDK so consumers can trust `additionalProperties: false`
in the published JSON Schema.

Closes finding #5. Studio's `_lib/payload.ts` can drop its client-side template
in a follow-up `hex-ui-platform` PR and call `emit_app_context` directly via MCP.
