---
"@hex-core/components": minor
---

feat(ai): 4 new AI Elements — Branch, Plan, Conversation, ChainOfThought

Continues the AI Elements parity sweep with a chatbot-category batch
that ships agent-steering primitives and the off-the-shelf chat shell.
All 4 compose with existing primitives — no orphan components, no new
runtime deps.

**`<Branch>`** — headless alternate-response navigator. Renders one
active branch with a prev/next chip beneath. Stateless: consumer owns
`current` (zero-indexed) and `total`. Arrow-key navigation when
interactive; controls render disabled in read-only mode.

```tsx
<Branch current={i} total={alternatives.length} onCurrentChange={setI}>
  <Message role="assistant"><Markdown>{alternatives[i]}</Markdown></Message>
</Branch>
```

**`<Plan>`** — pre-execution multi-step plan card. Body lists the
proposed steps; an optional `onApprove` / `onCancel` footer renders
an approval gate. Distinct from `<Task>` — Task is during/post-
execution status (steps carry lifecycle state), Plan is pre-execution
intent (steps are just labels). Typical flow renders `<Plan>`, then
swaps it for `<Task>` once the user approves.

```tsx
<Plan
  label="Refactor auth"
  steps={[
    { id: "read", label: "Read existing auth" },
    { id: "apply", label: "Apply changes" },
    { id: "test", label: "Run tests" },
  ]}
  onApprove={() => execute()}
  onCancel={() => discard()}
/>
```

**`<Conversation>`** — high-level chat shell. Composes `<MessageList>`
over a messages array, an optional `<Sources>` panel beneath the
stream, an optional `<Shimmer>` placeholder for the in-flight
assistant turn, and a `<Composer>` row at the bottom. The
"compose-once" entry point that wraps the four primitives every chat
app rebuilds. Internal composer state is managed for the consumer.

```tsx
<Conversation
  messages={messages}
  onSubmit={handleSubmit}
  isStreaming={waitingForFirstToken}
  sources={lastResponse?.sources}
  placeholder="Ask anything…"
/>
```

**`<ChainOfThought>`** — structured ReAct-shape reasoning trace. Each
step has a `thought`, optional `action`, and optional `observation`.
Final answer renders below the trace. Distinct from `<Reasoning>`
(unstructured prose) — ChainOfThought enforces the per-step ReAct
shape agents emit when doing tool-augmented reasoning. Internally
composes `<Reasoning>` for the collapsible shell.

```tsx
<ChainOfThought
  steps={[
    { thought: "Need to look up the auth module", action: "read auth.ts", observation: "200 lines, uses bcrypt + jwt" },
    { thought: "The bug is on line 42." },
  ]}
  finalAnswer={<Markdown>{finalText}</Markdown>}
/>
```

**Bundled cleanups:**

- **Postbuild client classifier honors `"use client"` directives.**
  `_client-patterns.mjs` now treats an explicit author-side
  `"use client"` directive as a positive client signal, not just
  the indirect ones (Radix import, hook call, JSX handler). Caught
  via the bundle test's Radix-leak guard: `<ChainOfThought>`
  composes `<Reasoning>` (which uses Radix Collapsible) but the
  classifier missed it because the wrapper itself doesn't import
  Radix or call a hook. Honoring the directive at classification
  time fixes that and any future composition wrapper.

**Tests:** 26 new component tests (Branch 7 + Plan 7 + Conversation
8 + ChainOfThought 4). Total components-package tests: 437 → 463.
8 new visual baselines (4 components × light/dark).
