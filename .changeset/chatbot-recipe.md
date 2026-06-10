---
"@hex-core/registry": minor
---

feat(recipes): chatbot recipe — wires Phase 3 hooks end-to-end

New `component`-kind recipe (`chatbot`) that composes the AI Kit Phase 3 hooks
with the chat primitives into a working streaming chatbot — the end-to-end proof
that `useAIChat` + `useStreamingMessage` drop into a real UI.

Steps: `use-ai-chat` (model wiring + composer slice) → `message-list` / `message`
→ `markdown` (streaming-safe assistant rendering) → `composer`, with
`use-streaming-message` for per-bubble isStreaming + retry and `loading-indicator`
for the pre-first-token typing state. Ships a full `example`: the client component
plus the Next.js `POST /api/chat` route returning
`streamText(...).toUIMessageStreamResponse()`. The brief points at the
higher-level `<Conversation>` shell as the no-frills alternative.

Recipe catalog: 23 → 24. Surfaced in the spec-driven docs showcase. No breaking
changes.
