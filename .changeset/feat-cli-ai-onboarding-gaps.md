---
"@hex-core/cli": minor
"@hex-core/registry": patch
---

feat(cli): close 6 AI-onboarding gaps from real-session feedback

Wires Hex Core discovery into the touchpoints AI agents actually hit:
`hex init`, `hex add`, `hex doctor`, and `hex skills`.

**`hex add` nudges**

- New `--pack layout` shortcut installs `container` + `stack` + `cluster` + `grid` + `spacer` + `empty` in one call.
- "Related primitives you might want next" line — driven by each schema's `ai.relatedComponents`, validated against `registry/items/` so a schema typo can't reach the user as a `hex add stacks` recommendation. Capped at 8 with a `(+N more)` indicator when truncated.
- "You added N primitives but no layout primitives" nudge when ≥3 interactive primitives install without any layout primitive on disk.

**`hex doctor --layout`**

Two new info-only scans on the consumer's source tree:

- **Installed-but-unused** — `<Card>` is in `components/ui/` but no source file renders it, suggesting the agent rolled raw `<div>`s instead of composing. Detects both JSX usage and renamed-import paths (`Card as Surface`).
- **Hand-rolled patterns** — `space-y-*` chains (≥3 per file), breakpoint `grid-cols-*` variants, dashed empty-state divs, hand-rolled `<ol>` timelines, `rounded-full border text-xs` badge spans. Severity `info` only — never fails the gate.

Reuses a shared `walkSourceFiles` helper that skips heavy dirs (`node_modules`/`dist`/`build`/`out`/`coverage`/`target`) plus any dotfile dir blanket.

**Studio discoverability**

- `hex init` writes `studio: "https://hex-core.dev/studio"` into `hex.config.json`.
- Post-init line: `Theme tweaking: hex-core.dev/studio — copy the payload back into your AI session.`

**`@hex-core/mcp` wiring (opt-in)**

`hex init --mcp` creates `.mcp.json` at the repo root (Claude Code's project-scope convention) or merges into `.cursor/mcp.json` / `.continue/config.json` when present. Read-merge-write — never clobbers existing `mcpServers` entries; reports `alreadyConfigured` when `hex-core` is already wired. Malformed JSON surfaces the file path so the user can fix it instead of being silently swallowed.

Default OFF: `.mcp.json` is commit-tracked and auto-loaded, so the write requires explicit `--mcp` opt-in.

**Skill discovery nudges**

New `printSkillsHint()` helper detects `.claude/skills/hex-core-*/SKILL.md` and prints "ask your AI session to invoke the hex-core-overview skill". Wired into `add`, `init`, `recipe` (silent when no Hex Core skills present) and `skills` (always — the skills were just placed).

**`app-shell` recipe**

New `hex recipe add app-shell` starter bundles 12 foundation primitives (`container`, `stack`, `cluster`, `grid`, `spacer`, `empty`, `card`, `separator`, `badge`, `tag`, `timeline`, `breadcrumb`) with a checklist that nudges composition over hand-rolled utility chains. Recipe count goes from 13 to 14.

**Tests**

24 new unit tests across `post-install`, `mcp-config`, `walk-sources`, plus extensions to `add`, `doctor`, and `init`. CLI test suite: 265/265 pass.
