---
"@hex-core/components": minor
---

feat(ai): 4 new AI Elements — Sources, InlineCitation, Task, Shimmer

Continues the AI Elements parity sweep with a chatbot-category batch
that rounds out the RAG-style chat surface. All 4 compose with
existing primitives — no orphan components, no new runtime deps.

**`<Sources>`** — bordered card listing 1–N citation chips for a RAG
response. Re-uses `<Citation>` per row inside a Radix Collapsible.
Default open so the user can scan provenance without expanding.

```tsx
<Sources sources={[{ title: "Auth research", url: "...", page: 3 }, …]} />
```

**`<InlineCitation>`** — inline `<sup>[N]</sup>` with a hover-preview
popover (Radix HoverCard). Pairs with `<Sources>` for the
bottom-of-card list. Replaces the old block `<Citation>` slot in
`<Markdown>` so footnote-style `[N](url)` shapes now route to the
inline variant — block Citation stays importable for the Sources panel.

```tsx
<InlineCitation index={1} title="Auth research" url="https://..." />
```

**`<Task>`** — multi-step task progress card. Each step's `state`
re-uses the canonical `ToolCallState` enum (`pending`/`running`/
`result`/`error`) so the vocabulary stays consistent across the AI
surface. Header tracks aggregate progress ("3 of 5 steps", or
"Done in X.Xs" once `durationMs` is set). Animated icons signal
running state; strikethrough signals completed.

```tsx
<Task
  label="Refactoring auth"
  steps={[
    { id: "read", label: "Read existing auth", state: "result" },
    { id: "apply", label: "Apply changes", state: "running" },
    { id: "test", label: "Run tests", state: "pending" },
  ]}
/>
```

**`<Shimmer>`** — single-line streaming placeholder. Used during the
dead-time between user submission and first stream token. Uses
Tailwind's `animate-pulse` (matching `<Skeleton>`) so consumers don't
need extra global CSS or keyframes.

```tsx
{isStreaming && firstTokenAt === null ? <Shimmer width="80%" /> : null}
```

**Markdown slot extensions:**

- `<sources data='[…]' />` HTML element in markdown now routes to
  `<Sources>` (sanitize schema gains `sources` tag + `data` attr).
- Footnote-style `[N](url)` links now route to `<InlineCitation>`
  (was block `<Citation>` — the block chip stays usable inside
  `<Sources>`).

**Bundled cleanups:**

- **Terminal contrast fix.** `<Terminal>` (shipped in #120) used
  `bg-background` for its outer container, which inherited the page's
  light/dark and produced 1.2:1 contrast against xterm's locked
  foreground in light mode. Locked the surface to match the inner
  xterm theme; hid the offscreen `<textarea>` and char-measurer
  helpers from axe via `text-transparent`.
- **Missing visual baselines for PR #120's heavy AI components**
  (audio-player, audio-waveform, canvas, diagram, terminal). Same
  pattern as the markdown PR's speech-recognition baselines.
- **Build-script `internalDepToSlug` fix in CLI bundle.** The CLI
  was using a stale dist that didn't recognize `components/<slug>/<slug>`
  cross-component deps; rebuilding picked up the fix and lets
  Markdown's transitive deps (Sources, InlineCitation, Reasoning,
  ToolCall) install via `npx hex add markdown`.

**Tests:** 26 new component tests (Sources 8 + InlineCitation 4 +
Task 8 + Shimmer 6) + 7 new Markdown slot tests (`<sources>` routing,
InlineCitation upgrade, JSX-escape regression, and 4 sanitize-schema
XSS tests covering `<script>`, inline event handlers, `javascript:`
hrefs, and `<iframe>` stripping). Total components-package
tests: 421 → ~452.
