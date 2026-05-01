---
"@hex-core/components": minor
---

feat(ai): drop streamdown wrapper, native streaming-safe Markdown with AI-aware slots

Phase 2 of the AI Kit roadmap (per `.claude/research/ROADMAP.md` Theme H).
Replaces the `streamdown` wrapper in `<Markdown>` with a native pipeline
built on `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize`,
plus a small streaming-safe pre-processor and four AI-aware slot renderers.

**Public API unchanged.** `<Markdown>{string}</Markdown>` with the same
`children: string` + optional `className`. No breaking change.

**New: AI-aware slot wiring**

| Markdown | Routes to |
|---|---|
| ` ```lang\n…\n``` ` | `<pre><code class="language-*">` (client-safe; consumers post-highlight) |
| `[1](url)` (numeric link text) | `<Citation index={1} url={url} title={hostname}>` |
| `<tool-call name="…" state="…" args="…" result="…" />` | `<ToolCall>` |
| `> [!think]\n> body` | `<Reasoning>` |

The fenced-code slot doesn't route to the in-house `<CodeBlock>` because
CodeBlock is an async Server Component and Markdown runs client-side
(streaming context). Consumers in an RSC tree can compose `<CodeBlock>`
directly when they need server-side Shiki highlighting.

**New: streaming-safe pre-processor**

`closeUnterminated()` is a pure function that pre-processes raw markdown
to append synthetic closers for tokens left open at end-of-input —
unclosed `` ``` ``, `**`, `_`, `~~`, `` ` ``, `[…](…`, `[…`, `<tag` —
so partial chunks during streaming render gracefully instead of as raw
text. ~150 lines, fully tested via a 24-case truth table.

**New: `remark-admonitions` plugin**

Detects `[!think]` blockquotes in `mdast` and tags them so the
`<blockquote>` slot renderer can route to `<Reasoning>`. Only `[!think]`
ships in Phase 2; other admonitions (`[!warn]`/`[!info]`/`[!error]`)
are obvious extensions but expand the surface without a use case yet.

**Bundle**

Removes `streamdown@2.5.0` (Shiki + Mermaid + remend, ~68 KB) from
runtime deps. Adds `react-markdown`, `remark-gfm`, `rehype-raw`,
`rehype-sanitize` (smaller combined surface, no Shiki/Mermaid by default).

**Bundled cleanup**

- **`<ToolCall>` `running` state contrast fix.** The `bg-primary/15
  text-primary` pair was 4.45:1 in dark mode (just under WCAG AA's 4.5
  threshold for ≤14pt text). Switched to `bg-muted text-primary` —
  neutral-bg + brand-text, AA-safe by design. Visual diff is minimal
  (the chip stays subtle).
- **`<SpeechRecognition>` visual baselines.** The component shipped in
  1.6.0 without `e2e/visual.spec.ts-snapshots/speech-recognition-{light,dark}.png`;
  added them so `pnpm regression` passes from a fresh checkout.

**Tests**

- 24 truth-table tests for `closeUnterminated` (pass-through, fences,
  links, brackets, backticks, strike, bold, italic, combined streams).
- 12 functional tests for `<Markdown>` covering each slot, plain-markdown
  semantics, and streaming recovery.
