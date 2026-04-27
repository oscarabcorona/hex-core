---
"@hex-core/mcp": minor
---

Adds the `emit_app_context` MCP tool — a 12th tool that synthesizes a deterministic markdown payload describing the user's chosen theme + components + recipes, formatted for paste-into-LLM workflows.

Inputs: `theme` (slug), `components` (slug array, min 1), `recipes` (optional slug array). Output is a markdown document with a theme summary table, per-component cards, ordered recipe steps with their checklists, and an install snippet using `npx @hex-core/cli@latest`.

Unknown slugs are flagged inline (`> Missing: ...`) rather than dropped silently. Pure function under the hood — `buildAppContext` in `src/tools/app-context.ts` is snapshot-tested via `pnpm -F @hex-core/mcp test:app-context` so any output-format change must update the snapshot deliberately.
