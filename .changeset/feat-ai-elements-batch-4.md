---
"@hex-core/components": minor
---

feat(ai): 4 new AI Elements — Trace, Context, MessageDiff, Confirmation

Continues the AI Elements parity sweep with an eval-and-agent-UX batch
that covers the agent-decision audit log, the context-window meter,
the side-by-side eval comparison, and the destructive-action gate.
All 4 compose with existing primitives — no new runtime deps.

**`<Trace>`** — vertical agent-decision timeline. Each step is a
`think` / `tool-call` / `observation` / `error` with optional
duration + timestamp. Distinct from `<Task>` (in-flight progress)
and `<ChainOfThought>` (structured ReAct trace) — Trace is a
chronological audit log for post-hoc inspection.

```tsx
<Trace
  ariaLabel="Migration agent trace"
  steps={[
    { id: "1", kind: "think", title: "Plan the migration", durationMs: 450 },
    { id: "2", kind: "tool-call", title: "read users.sql", durationMs: 120 },
    { id: "3", kind: "observation", title: "12 columns, 1.2M rows" },
    { id: "4", kind: "error", title: "ALTER failed: column already exists" },
  ]}
/>
```

**`<Context>`** — context-window utilization meter. "47k of 200k
tokens · 24%" with a horizontal progress bar. Severity gates at 75%
(warning) and 90% (danger) so users get pre-overflow notice.
Composes the `Progress` primitive.

```tsx
<Context used={47_000} max={200_000} />
```

**`<MessageDiff>`** — side-by-side comparison of two assistant
turns, the canonical eval UX. Each side renders a header label + a
`<Message>` with the response. Optional `meta` slot in the header
for latency / score annotations. Wraps to a single column at narrow
widths.

```tsx
<MessageDiff
  left={{ label: "GPT-5", role: "assistant", content: <Markdown>{a}</Markdown>, meta: "1.2s" }}
  right={{ label: "Claude Sonnet 4.6", role: "assistant", content: <Markdown>{b}</Markdown>, meta: "0.9s" }}
/>
```

**`<Confirmation>`** — destructive-action gate. Wraps Radix
AlertDialog with severity-driven shape: title, description,
`info` / `warning` / `danger` variants. Async `onConfirm` keeps the
dialog open with the busy state until the promise resolves.

```tsx
<Confirmation
  trigger={<Button variant="destructive">Delete account</Button>}
  title="Delete your account?"
  description="This action cannot be undone."
  severity="danger"
  confirmLabel="Delete"
  onConfirm={() => deleteAccount()}
/>
```

**Tests:** 37 new component tests (Trace 8 + Context 11 + MessageDiff
6 + Confirmation 12). Total components-package tests: 466 → 503.
8 new visual baselines (4 components × light/dark).
