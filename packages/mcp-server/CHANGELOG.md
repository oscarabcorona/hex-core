# @hex-core/mcp

## 0.3.0

### Minor Changes

- d99548a: feat(mcp): extend emit_app_context with overrides, density, and full payload sections

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

- ed8cd1e: feat(mcp): universal client support — six MCP clients verified, contract test in CI

  Closes Theme C of the internal roadmap. The runtime was already universal (stdio-only `StdioServerTransport`, 12 client-agnostic tools, no Claude-specific code paths in `src/`) but the docs and metadata leaked Claude Code framing — only Claude Code and Cursor wiring snippets shipped, despite README copy claiming broader support.

  This change replaces the duplicated snippets with a single source of truth and adds protocol-level proof that the server speaks standard MCP regardless of which downstream client opens the connection.

  **New: `MCP_CLIENTS` data file**

  [packages/mcp-server/src/clients.ts](packages/mcp-server/src/clients.ts) exports a typed array of 6 client wirings — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — each carrying `configPath`, `format` (json / jsonc / yaml), `topLevelKey`, ready-to-paste `snippet`, `schemaStability`, `verifiedOn` (for the four volatile schemas), upstream `docsUrl`, and a `quirks` list. Re-exported via `package.json` `exports["./clients"]` so the docs app imports it as `@hex-core/mcp/clients`. Both the regenerated README and the [docs page](apps/docs/src/app/docs/mcp/page.tsx) render from this single array — no duplicate snippets.

  **Per-client correctness**

  Every snippet uses `npx -y @hex-core/mcp` (the `-y` flag prevents the first-run npx prompt from hanging stdio MCP clients). The four volatile-schema clients (Continue, Gemini CLI, ChatGPT Desktop, Zed) carry a `Verified 2026-04-27` badge so quarterly research-cadence refreshes can spot stale entries. Zed's `context_servers` (NOT `mcpServers`) and `source: "custom"` quirks are explicitly called out in both the README and the docs page.

  **Contract test**

  [packages/mcp-server/src/contract.test.ts](packages/mcp-server/src/contract.test.ts) drives the built server with the official `@modelcontextprotocol/sdk` Client over stdio — the same SDK every supported client uses underneath. A green run proves five end-to-end assertions:
  1. `initialize` handshake completes
  2. `tools/list` returns exactly the 12 canonical names from [src/tool-names.ts](packages/mcp-server/src/tool-names.ts) (set-equal, order-insensitive)
  3. `tools/call list_themes` returns content where `content[0].text` parses as a JSON array
  4. `resources/list` includes an entry with `uri === "hex://catalog"`
  5. `client.close()` disposes the transport without throwing

  The test runs in CI via the existing `pnpm test` cascade — no workflow changes needed. Build runs first, so `dist/contract-test.js` exists by the time the test fires.

  **README regeneration**

  [packages/mcp-server/scripts/build-readme.mjs](packages/mcp-server/scripts/build-readme.mjs) parses `clients.ts` and splices snippets into [packages/mcp-server/README.template.md](packages/mcp-server/README.template.md) at the `<!-- @generated:client-wiring -->` marker. Wired into the package's `build` script so README and the data file can never drift.

  **Metadata cleanup**

  `package.json` description switched from "Ships 12 tools over the registry for Claude Code / Cursor / any MCP client" to **"Universal MCP server for Hex UI — runs on Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, and Zed. 12 tools over the component registry."** Keywords drop `claude-code` and `cursor`; add `mcp-client-agnostic`.

  Theme C success signal hit: **6/6 clients verified, zero Claude-only codepaths**.

## 0.2.0

### Minor Changes

- 9b3793a: Adds the `emit_app_context` MCP tool — a 12th tool that synthesizes a deterministic markdown payload describing the user's chosen theme + components + recipes, formatted for paste-into-LLM workflows.

  Inputs: `theme` (slug), `components` (slug array, min 1), `recipes` (optional slug array). Output is a markdown document with a theme summary table, per-component cards, ordered recipe steps with their checklists, and an install snippet using `npx @hex-core/cli@latest`.

  Unknown slugs are flagged inline (`> Missing: ...`) rather than dropped silently. Pure function under the hood — `buildAppContext` in `src/tools/app-context.ts` is snapshot-tested via `pnpm -F @hex-core/mcp test:app-context` so any output-format change must update the snapshot deliberately.

## 0.1.2

### Patch Changes

- c8a4d52: Fix: published tarballs now correctly pin workspace dependencies.

  Previous releases of `@hex-core/components`, `@hex-core/cli`, and `@hex-core/mcp` shipped `"@hex-core/registry": "workspace:^"` literal in the tarball's `dependencies`, breaking every consumer outside a pnpm workspace with `npm error code EUNSUPPORTEDPROTOCOL`. `@hex-core/tokens` shipped a similar literal for its registry dependency.

  Root cause: `scripts/publish-local.sh` used `npm publish`, which uploads tarballs as-is. Switched to `pnpm publish`, which rewrites `workspace:^` → pinned `^X.Y.Z` automatically.

  `@hex-core/registry` has no workspace dependencies and was not affected, but is bumped to keep the family in lockstep and simplify the release narrative.

  After this release, `npm install @hex-core/components` (and the other published packages) succeeds in any consumer project regardless of package manager.

- 6c8c141: Theme A — WCAG 2.2 AA accessibility compliance.

  Major bump on `@hex-core/components` and `@hex-core/tokens` — there are user-observable behavior and visual changes (see Migration). Everything else is additive or covered by the audit gate.

  ### Migration
  - **Dark `--destructive` lightened, `--destructive-foreground` flipped to dark** across all three theme presets (default / midnight / ember). Required so destructive surfaces and destructive text both pass WCAG 2.2 AA in dark mode. Visual diff: previously a deep red (`hsl(0 62% 30%)`) with white text, now a coral red (`hsl(0 75% 65%)`) with dark text (`hsl(0 75% 15%)`). Consumers who painted `--destructive-foreground` on a _non-destructive_ surface in dark mode (uncommon — most use it inside destructive buttons / alerts) will see dark text instead of white and need to point those surfaces at `--foreground` instead.
  - **`ScrollArea` viewport is now keyboard-focusable by default** (`viewportTabIndex={0}`). Apps that wrap purely decorative content in ScrollArea will see a new tab stop. Pass `viewportTabIndex={-1}` to opt out — the prop is the new opt-out surface and is documented in `scroll-area.schema.ts`.
  - **`CommandSeparator` is no longer the cmdk primitive.** It now renders as `<div role="none" data-cmdk-separator="">` so it can sit inside `CommandList` (`role="listbox"`) without violating ARIA's required-children rule. The `data-cmdk-separator` attribute is preserved for selector compatibility, but anyone reading cmdk's _internal_ Separator state (rare) will need to update.
  - **`DataTable` accessible label prop renamed `ariaLabel` → `aria-label`** (kebab-case quoted prop) to match the convention used elsewhere in Hex UI. This was introduced earlier in the same PR cycle and never shipped publicly, but call it out for anyone tracking pre-release branches.
  - **`Dialog` overflow handling now uses an inner scroll container** (`scrollable={true}` is the default). Long content scrolls inside the focus trap; the close button stays anchored to the (non-scrolling) outer panel. Consumers who previously relied on DialogContent itself being the scroll container (custom `overflow-*` className overrides) should pass `scrollable={false}` and manage scroll themselves — `CommandDialog` does this internally.

  ### Additive changes

  `@hex-core/components`
  - `Combobox`: new `aria-labelledby` prop. Trigger now wires `aria-controls` to a `useId`-stable id pointing at `CommandList`, gated on `open` so it's only set when the listbox is actually mounted.
  - `DataTable`: new `caption?: ReactNode` and `aria-label?: string` props. Previously the table shipped without a caption, leaving screen-reader users without context.
  - `DialogContent`: new `scrollable?: boolean` prop (default `true`). See Migration.
  - `Slider`: new `thumbLabels?: string[]` prop for per-thumb names. Single-thumb sliders auto-mirror the Root's `aria-label`; range sliders fall back to indexed `(N of M)` names if no `thumbLabels` is provided. A dev-mode warning fires when `thumbLabels.length !== value.length`.
  - `ScrollArea`: new `viewportTabIndex?: number` prop. See Migration.
  - `CommandSeparator`: rendered as a presentational div. See Migration.
  - `TableCaption`: now sets `caption-bottom` so the `<caption>` element sits below the table visually while remaining first in document order (announced first by screen readers).

  `@hex-core/tokens`
  - Light `--muted-foreground` tightened to ≥4.5:1 across all three themes.
  - Light `--destructive` darkened so destructive button text passes 4.5:1.
  - Dark destructive flip — see Migration.

  ### Repo
  - New `pnpm run a11y-audit` boots the docs prod build and runs axe-core (`@axe-core/playwright`) against every component demo in light + dark. Fails on critical/serious violations. Wired into CI; report uploaded as a workflow artifact. Hardened against banner-string drift, port collisions, and SIGTERM cancellation.
  - `CONTRIBUTING.md` gains an Accessibility section covering form-control labelling, contrast budget, composite-widget rules, and dialog overflow guidance.

- Updated dependencies [c8a4d52]
- Updated dependencies [6c8c141]
  - @hex-core/registry@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [07bea53]
  - @hex-core/registry@0.2.0

## 0.1.0

### Minor Changes

- efcdb1b: Initial public release of Hex Core — AI-native component library with MCP-first distribution.
  - `@hex-core/components`: Radix UI + Tailwind components with machine-readable schemas
  - `@hex-core/registry`: Zod schemas and types for the component registry
  - `@hex-core/tokens`: Design token engine (HSL tokens, typography, themes)
  - `@hex-core/cli`: Install components and skills into your project
  - `@hex-core/mcp`: MCP server for component discovery and installation

### Patch Changes

- Updated dependencies [efcdb1b]
  - @hex-core/registry@0.1.0
