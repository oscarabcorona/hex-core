---
"@hex-core/components": minor
"@hex-core/registry": patch
---

feat(hooks): AI Kit Phase 3 — useAIChat + useStreamingMessage

Phase 3 of the AI Kit roadmap (Theme H). Phases 1 + 2 shipped 11 components + a
native streaming-Markdown primitive but nobody could wire them to a model — no
hook layer. This adds two SDK-agnostic hooks and makes the previously-empty
`hook` registry category load-bearing.

**`useAIChat()`** — thin adapter over AI SDK v5's `useChat`:
- Normalizes `message.role` to Hex's `Role` enum (`user` | `assistant` | `system` | `tool`)
- Concatenates `UIMessage.parts` text fragments into a `content` string for the default `<Message>` render path while preserving the raw `parts` for advanced rendering (tool calls, reasoning, citations)
- Manages local input state (AI SDK v5 no longer owns this) and exposes a `composer` slice that spreads directly onto `<Composer {...chat.composer} />`
- Maps SDK's `regenerate()` → `reload()` to match Phase 1's `MessageActions` convention
- Status enum matches the SDK: `"ready" | "submitted" | "streaming" | "error"`

**`useStreamingMessage(chat, messageId)`** — per-bubble helper. Derives "is this
message still streaming?" (true only for the last assistant message while
chat is submitted/streaming) plus convenience `abort` / `retry` wrappers.

**Catalog:** 183 → 185 items. The `hook` category now contains 2 entries
(was empty); category enum stays unchanged.

**Heavy peer:** `@ai-sdk/react` is registered as a `heavyPeer` in the schema
(bundle cost ~18KB gzipped) so the CLI shows an opt-in prompt before installing.
Externalized in tsup config — consumers who never import `useAIChat` don't pay
for it. Verified against the docs bundle: zero AI SDK content in chunks.

No breaking changes. Next: LangChain + Mastra adapters as separate hooks (same
return shape), then a chatbot recipe composing `useAIChat` + `Composer` +
`MessageList`.
