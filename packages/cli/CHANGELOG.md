# @hex-core/cli

## 0.10.0

### Minor Changes

- 33440ea: Agent-builder commands: `hex map` (deterministic brief → screens/install/warnings map, `--out hex.map.json`), `hex poc` (scaffold a standalone runnable Next.js demo app from a brief, map, or page recipe), and `hex graph explain|affected|neighbors|path` (query the shipped catalog knowledge graph; mirrors MCP `query_graph`'s four modes). `hex add --from` now also accepts a `hex.map.json` application map; `hex doctor` verifies the bundled catalog graph.

  Note: the CLI now depends on `@hex-core/payload`, which vendors its own copy of the registry. An `npx @hex-core/cli` install therefore carries two registry snapshots (~2x unpacked size). This is a deliberate trade for a single shared engine across CLI and MCP — the CLI injects its own snapshot into every payload entry point, so the two can never skew.

### Patch Changes

- Updated dependencies [0087190]
- Updated dependencies [2f7586f]
- Updated dependencies [33440ea]
  - @hex-core/registry@0.7.0
  - @hex-core/payload@0.5.0
  - @hex-core/themes@0.2.4
  - @hex-core/tokens@1.3.8

## 0.9.1

### Patch Changes

- Updated dependencies [e5d120e]
- Updated dependencies [e5d120e]
  - @hex-core/registry@0.6.0
  - @hex-core/themes@0.2.3
  - @hex-core/tokens@1.3.7

## 0.9.0

### Minor Changes

- b28f8ee: feat(recipes): page-recipe system foundation

  Recipes can now describe whole pages, not just component bundles. A recipe
  gains an optional `kind` (`component` — the default and every existing recipe,
  or `page`), plus page-only fields: `pageType` (`landing` | `app` | `ecommerce`),
  a recommended `theme` (token preset + whole-page token budget), an ordered
  `sections` list (each a section block with an `intent`), and a `layout` brief.
  - `build-registry` validates section blocks against the catalog and derives
    checklist items from their `ai` metadata, same as component steps.
  - MCP `get_recipe` returns the full page spec in one call; `list_recipes`
    surfaces `kind`/`pageType` so an LLM can find the page recipe for a request.
  - CLI `hex recipe add <page>` installs the section blocks in order and surfaces
    the recommended theme + layout. `hex recipe list` tags page recipes.

  Fully backward-compatible — every existing recipe still validates and installs
  unchanged.

- b28f8ee: refactor(recipes)!: rename the `app-shell` recipe to `layout-starter`

  The new `app-shell` **block** (an application layout frame) takes the canonical
  `app-shell` slug, so the legacy `app-shell` **recipe** — which is really a bundle
  of twelve layout primitives — is renamed to `layout-starter`. This keeps slug
  discovery (CLI `hex add` / `hex recipe add` and MCP `get_component` /
  `get_recipe`) unambiguous: "app shell" now resolves to the component an agent
  expects, and the primitives bundle reads as what it is.

  Breaking: `hex recipe add app-shell` is now `hex recipe add layout-starter`.

### Patch Changes

- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
- Updated dependencies [b28f8ee]
  - @hex-core/registry@0.5.0
  - @hex-core/themes@0.2.2
  - @hex-core/tokens@1.3.6

## 0.8.0

### Minor Changes

- 71ba05c: feat(cli): close 6 AI-onboarding gaps from real-session feedback

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

### Patch Changes

- Updated dependencies [71ba05c]
  - @hex-core/registry@0.4.1

## 0.7.1

### Patch Changes

- 62bcd13: feat(blocks): blocks tier + complete password-auth journey end-to-end

  Introduces **blocks** as a third tier above primitives and components — page-level compositions (sign-in pages, landing heroes, app shells) that share the registry, schema convention, and `hex add` install surface. Ships the foundation plus the **full password-auth journey** (sign-up → verify-email → sign-in → forgot → reset → sign-in, plus an OTP path for sign-in / verify-email / MFA) wired end-to-end through every layer of the pipeline.

  **`@hex-core/components` — new exports:**

  Pluggable adapter contract:
  - `AuthAdapter`, `AuthAdapterResult`, `AuthOtpIntent`, `AuthSocialProvider` — every auth block consumes the adapter via its `adapter` prop. Hex Core ships no session management; the adapter routes credential / OAuth / OTP handoffs to whatever the consumer wires up (better-auth, Clerk, NextAuth, Supabase Auth, custom server). Every method is optional so consumers can ship password-only on day one and add passkeys / OTP later without forking block source.
  - `mockAuthAdapter` — in-memory reference adapter for showcase routes and tests. Every method delays 400ms and resolves `{ ok: true }`. Never ship in production.

  Six auth blocks composing the password journey:
  - `AuthSignInSplit` — split-screen sign-in (marketing left, credential form right) with email + password, remember-me, optional social, forgot-password link.
  - `AuthSignUpCard` — centered-card sign-up with name (optional) + email + password (with confirm) + terms checkbox + optional social. Manual validation: email regex, password length, confirm-match, terms.
  - `AuthForgotPassword` — single-field form that swaps to an `Empty`-based "check your inbox" confirmation state on success.
  - `AuthResetPassword` — token-driven new-password + confirm form. Reads the opaque token from a prop (typically `?token=…` searchParam).
  - `AuthVerifyEmail` — transactional waiting page with optional resend cooldown. Resend button hides automatically when `adapter.resendMagicLink` is absent.
  - `AuthVerifyOtp` — N-digit (default 6) auto-submitting code input. Drives the heading and adapter routing from the `intent` prop (`"sign-in" | "verify-email" | "mfa"`).

  Two new optional methods on `AuthAdapter` (additive — no breaking change):
  - `resendMagicLink?(p: { email })` — distinct from `sendMagicLink` so consumers can throttle resends and surface separate analytics / error copy.
  - `resendOtp?(p: { intent })` — distinct from the initial code dispatch for the same reason.

  Every block: `.tsx` source + co-located `.schema.ts` (machine-readable AI hints, common mistakes, accessibility notes, token budget) + behavioral test (Testing Library + userEvent + warnSpy). Every block falls back to a generic user-facing error message and a structured `console.warn` when an adapter method is unimplemented.

  **`@hex-core/cli` — `rewrite-imports` fix for cross-tree block imports:**

  The legacy regex matched sibling-component imports (`../<name>/<name>`) and primitives (`../../primitives/<name>/<name>`) but not the cross-tree shape blocks need: a block at `blocks/<slug>/<slug>.tsx` reaches into `components/` two segments deep. `npx hex add auth-sign-in-split` (and any other auth block) now rewrites `../../components/alert/alert` to `@/components/ui/alert` correctly. Covered by a unit test.

  **Pipeline coverage shipped in this release:**
  - 6 block items in `registry/items/` + 6 auth recipes in `registry/recipes/` (5 new + the deprecated `auth-form` superseded by `auth-sign-in`)
  - 6 live demos + 6 showcase route pairs (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-otp`) — each pair is a server component owning `metadata` + a `"use client"` wrapper owning the adapter binding
  - Concept doc at `/docs/blocks` with embedded live preview + install commands + a "Password-auth journey" gallery linking every showcase route
  - MCP contract test asserts the journey: `search_components({ category: "block" })` returns ≥6 blocks containing every expected slug; `get_component("auth-sign-in-split")` round-trips with required `adapter` prop and bundled `components/_shared/auth-adapter.tsx` source
  - 41 new behavioral tests across the 6 blocks (form submit, error display, social click, auto-submit-when-full for OTP, resend cooldown, unimplemented-method fallback, …)
  - A11y audit clean on every showcase route in light + dark
  - Visual regression baselines committed for every block (light + dark)
  - `hex add auth-sign-up-card` smoked end-to-end against a temp project; imports rewrite to `@/`-aliased paths; `_shared/auth-adapter.tsx` ships once
  - `hex recipe add auth-sign-up` smoked: 9 ordered steps + checklist printed
  - `auth-form` recipe is deprecated in favor of `auth-sign-in` (retained for back-compat with deprecation note in title + summary)

  No breaking changes. Tree-shake-safe — consumers only pay for what they install.

- Updated dependencies [398bc7d]
  - @hex-core/registry@0.4.0
  - @hex-core/themes@0.2.1
  - @hex-core/tokens@1.3.4

## 0.7.0

### Minor Changes

- 870fbcc: chore: rebrand "Hex UI" → "Hex Core" across the published surface

  Project name aligns with the `@hex-core/*` npm scope, the `hex-core` GitHub repo, and `hex-core.dev` domain. User-facing strings, package descriptions, READMEs, MCP server name + bin, skill directory naming, payload output headers, and the registry top-level name all switch from `Hex UI` / `hex-ui` → `Hex Core` / `hex-core`.

  **Migration for existing consumers:**
  - `hex-ui-mcp` binary renamed to `hex-core-mcp`. If you have a shell alias or script that calls `hex-ui-mcp` directly, update it. The canonical `npx -y @hex-core/mcp` invocation is unchanged.
  - Bundled skill directories renamed `skills/hex-ui-*` → `skills/hex-core-*`. Re-run `npx @hex-core/cli skills install --overwrite` to migrate `.claude/skills/hex-ui-*` to the new names. The CLI's skill detector now looks for the `hex-core-` prefix only.
  - Docs site `localStorage` theme key renamed from `hex-ui-theme` to `hex-core-theme`; users will see the system-default theme on first reload after upgrade.
  - MCP server's handshake `name` is now `hex-core` (was `hex-ui`). Clients connect by stdio command, not by name lookup, so this is informational only.
  - Recommended MCP config key in docs is now `"hex-core"`. Existing configs keyed `"hex-ui"` keep working — the key is a user-chosen label.

  Output formats: `emit_app_context` headers are now `# App context — Hex Core`, `emit_figma_tokens` collection naming is `Hex Core — <theme>`. Anything snapshotting these strings should refresh.

  No public TypeScript API surface changed.

- dc54d07: feat(cli): `hex migrate` — convert Next.js / Vite / CRA / CRACO + shadcn/ui projects to Hex Core in-place

  Detects the host framework + shadcn footprint, replaces each `<components>/ui/*.tsx` with the matching Hex Core source at the same alias-resolved path, installs missing peer deps via the consumer's package manager (npm / pnpm / yarn / bun — auto-detected), and writes a `*.shadcn.bak` next to each converted file so the original survives for diff/restore.

  **What it migrates (file-replace strategy)**
  - 36 of 40 canonical shadcn slugs (button, dialog, dropdown-menu, form, …) map 1:1 by name.
  - `toast` → `sonner` (rename — Hex Core ships only the Sonner wrapper). The original `toast.tsx` is backed up and removed.
  - `carousel` and `chart` are skipped with a warning — no Hex Core equivalent yet.

  **Framework detection**

  Recognizes Next.js (App Router and Pages Router, with or without `--src-dir`), Vite + React, Create React App, and CRACO. The framework drives the Toaster mount hint in the report (e.g. `src/app/layout.tsx` for Next.js App Router, `src/main.tsx` for Vite).

  **Flag set**

  ```
  hex migrate [--dry-run] [--yes] [--no-backup] [--no-install]
              [--from <dir>] [--theme=preserve|replace]
              [--only <slugs>]
  ```

  - `--dry-run` plans without writing or spawning.
  - `--theme=replace` swaps the consumer's `globals.css` palette via the existing `theme apply` machinery (surgical — preserves custom rules).
  - `--only <slugs>` restricts the migration to a comma-list of shadcn slugs.

  **Doctor extension**

  `hex doctor` now flags leftover shadcn artifacts (`components.json`, `toast.tsx`, `hooks/use-toast.ts`) with a `warn` and points the user at `hex migrate`. Idempotent: a re-run on a successfully-migrated project finds no signal and exits cleanly.

  **Out of scope (future)**
  - v2 will add npm-imported libraries (MUI, Chakra, Mantine, NextUI) via codemod + `hex add` + `npm uninstall`.
  - v3 will add CSS-class libraries (Bootstrap, DaisyUI) via className rewriting.
  - Heavy-modification detection (`shadcn-baselines.json` + Levenshtein heuristic) — v1 always backs up + overwrites.

### Patch Changes

- Updated dependencies [870fbcc]
  - @hex-core/registry@0.3.5

## 0.6.0

### Minor Changes

- d67fa60: feat(ai): 5 new AI Elements components + CLI heavy-peer prompt

  Closes the AI Elements parity gap from 13/40 → 18/40 by adding the Code, Voice, and Workflow categories. Each component is a thin headless wrapper around an opt-in engine declared as a heavy peer dep.

  **New components (`@hex-core/components`):**
  - **`Terminal`** — xterm.js wrapper. Headless data flow: pass `output` (diffed against prior render), receive typed bytes via `onInput`. Peer: `@xterm/xterm@^5.5.0` (~150 KB gzip).
  - **`Canvas`** — reactflow node-graph canvas for agent workflows / RAG document graphs. Default Background + Controls; slot for MiniMap and Panels. Peer: `reactflow@^11.11.0` (~80 KB gzip).
  - **`AudioPlayer`** — wavesurfer.js playback control with play/pause + waveform progress + duration. Peer: `wavesurfer.js@^7.8.0` (~50 KB gzip, shared with AudioWaveform).
  - **`AudioWaveform`** — standalone non-interactive waveform display for voice-message previews and recording indicators. Peer: `wavesurfer.js@^7.8.0`.
  - **`Diagram`** — Mermaid renderer for AI-emitted flowcharts / sequence / class diagrams. Engine sanitizes SVG via `securityLevel: "strict"`. Peer: `mermaid@^11.0.0` (~700 KB gzip).

  **CLI heavy-peer flow (`@hex-core/cli`):**

  `hex add <component>` now detects heavy peer deps declared in the registry and prompts before installing. Single batched UX for multi-component installs:

  ```
  This sprint installs 2 components with heavy peer dependencies:

    → @xterm/xterm@^5.5.0  (~150 KB gzip)  for terminal
       Renders the terminal grid + handles input/output
    → mermaid@^11.0.0      (~700 KB gzip)  for diagram

    Total: ~850 KB gzip added to your bundle.

  Install now? [Y/n]:
  ```

  `--yes` skips the prompt. `--no-install` prints the manual install command. Decline keeps the component source on disk so you can install the peer later.

  **Schema (`@hex-core/registry`):**

  New `dependencies.heavyPeer` array on `dependencySchema`: `{ name, version, bundleKbGzip?, reason? }[]`. Optional — existing schema files don't need changes.

  All 5 components ship as optional peers in `@hex-core/components/package.json` (peerDependenciesMeta.optional: true), mirroring the existing pattern for vaul/sonner/cmdk.

- d09d07c: feat(cli): tsconfig-aware alias resolver, `theme add --from <studio-url>`, granular `--overwrite`, doctor drift check, `--dry-run`, manifest add

  Closes the @hex-core/cli@0.4.0 feedback (P0 alias-resolution bug + Studio integration). Single PR covers every item in the review.

  **Bug fixes:**
  - **`hex add` honors `tsconfig.json#paths` and `--src-dir` Next.js layout.** A new resolver (`packages/cli/src/lib/resolve-alias.ts`) consults `tsconfig.json#compilerOptions.paths["@/*"]` (with `extends`-chain support) first, falls back to a `src/` heuristic, and finally to cwd-relative. Components and lib utilities now land where the project's import system expects them — no more `mv components src/components` after every install.
  - **`hex doctor` warns on alias drift.** When components live at `<cwd>/components/ui` but the resolver expects `<cwd>/src/components/ui` (or vice-versa), doctor surfaces the exact `mv` command to fix it.
  - **`hex init` detects `src/` layout** and prints `Detected src/ layout — components will be written under src/components/.` so the user knows where future writes go.
  - **`hex recipe add <slug>` no longer fails typecheck** (was missing `install` on the AddOptions spread). Now passes `install: true` explicitly so peer deps are resolved end-to-end.
  - **TS export identifier sanitization** in `renderThemeAsTs`. Kebab-case slugs (`midnight-custom`) now emit `export const midnightCustomTheme` instead of the invalid `export const midnight-customTheme`.

  **New features:**
  - **`hex theme add <slug> --from <studio-url>`** — compose a custom theme from a Hex Core Studio URL and write it as TypeScript. Parses `?base=<preset>&radius=<rem>&<token>_<mode>=<HSL-triplet>` params, applies via `extendTheme`, serializes through `renderTheme(..., "ts")`, writes to `src/themes/<slug>.ts` (or `themes/<slug>.ts`).
  - **`hex add --dry-run`** — plan but do not write files or run installs. Prints `Would write:` for every file that would be created plus a per-run summary.
  - **`hex add --from <manifest>`** — install every slug from a `hex.components.json`-style file (`{ "components": ["button", "card"] }`). Errors if mixed with positional args.
  - **`hex init --overwrite=globals.css,tailwind.config.ts`** — granular file replacement. Bare `--overwrite` still means "all" for backwards compat.
  - **`hex init --check`** — runs the doctor inline and exits non-zero on drift. CI / pre-commit safe.
  - **`hex recipe list` and `hex recipe --help`** — recipe listing surfaced.

  **Polish:**
  - Resolved paths in every `Write:` log line (was the raw registry path).
  - Color output via `picocolors` (already a dep). Respects `NO_COLOR` and TTY detection.
  - TTY-aware install spinner during peer-dep resolution.

  **Migration for `--src-dir` users on 0.4.0:**

  If you ran `hex add` on 0.4.0 in a `pnpm create next-app --src-dir` project, your components are at `<cwd>/components/ui/` instead of `<cwd>/src/components/ui/`. Run `hex doctor` — the drift warning prints the exact `mv` command. After moving, future `hex add` invocations land in the correct directory automatically.

### Patch Changes

- Updated dependencies [d67fa60]
- Updated dependencies [b1b9099]
- Updated dependencies [e82f935]
  - @hex-core/registry@0.3.4
  - @hex-core/tokens@1.3.3

## 0.4.0

### Minor Changes

- d11f7b5: feat(cli): interactive `hex theme edit -i`

  Closes the UX asymmetry between `theme init` and `theme edit`: until now
  `init` had both flag-driven (`--preset`) and interactive (`-i`) modes,
  but `edit` only had flag-driven (`--token key=value`). Humans tweaking
  a single token had to memorize the HSL-triplet syntax and the contrast
  implications upfront.

  The new `-i` mode walks every token in the file:
  - **Categorize** — picks "Color" / "Radius" / "Other" with counts;
    empty categories are hidden so a file with no `--radius` block
    doesn't surface that branch.
  - **Pick a token** — shows the current value as an inline ANSI swatch
    for color tokens (24-bit truecolor, falls back to a labeled hex on
    `NO_COLOR` or unsupported terminals).
  - **Mode** — `light` / `dark` / `both`, defaulting to `both`. Skipped
    when the file has only a `:root` block.
  - **New value** — accepts hex (`#1e293b`), CSS `hsl()`, named colors,
    or raw HSL triplets for color tokens. Loops on parse failure.
  - **AA contrast gate** — for foreground-paired tokens (`primary-foreground`
    vs `primary`, etc.) re-checks contrast against the relevant background.
    Sub-AA pairs surface a warning + retry/accept prompt that mirrors the
    existing `init -i` `promptSurfaceWithContrastGate` UX.
  - **Buffered writes** — overrides are queued in memory and flushed once
    on exit, so a Ctrl-C mid-flow leaves the file untouched.

  The flag-driven `--token key=value` path is unchanged. All shared logic
  (`applyTokenOverride`, `colorInputToTokenValue`, `contrastRatio`,
  `swatch`) is reused — no duplication. New parser lives at
  `packages/cli/src/lib/parse-globals.ts` and round-trips with the
  existing edit/replace pipeline.

### Patch Changes

- 39a5c92: fix(cli): ship sibling/shared variants files, read version from package.json, surface broken internal deps

  `@hex-core/cli@0.3.1` had three issues a fresh-project user hit on day one. This patch addresses all of them and adds a verification sweep so the same class of bug stops slipping through.

  **`@hex-core/cli`** (patch):
  - **`hex add button` now compiles.** Previously the CLI wrote `button.tsx` but not its sibling `button-variants.tsx`, so consumer projects failed with `Module not found: Can't resolve './button-variants'`. The registry build now auto-discovers sibling `*-variants.{ts,tsx}` files, cross-package variants imports (e.g. `pagination → button-variants`), and `_shared/*` files referenced by component sources, and bundles them into each registry manifest. Five components were affected: `button`, `pagination`, `grid`, `cluster`, `stack`.
  - **`hex --version` now reports the real version.** The flag was hardcoded to `"0.1.0"` and had drifted across six releases. The CLI now reads `version` from its own `package.json` at runtime via `fileURLToPath(import.meta.url)`, so the printed version always matches the installed package.
  - **Broken internal deps now warn instead of silently dropping.** `internalDepToSlug` accepts only the 3-segment path form (`primitives/<slug>/<slug>`); bare slugs returned `null` and were silently skipped, leaving `loading → skeleton`, `toggle-group → toggle`, and `form → label` with unresolvable imports. Those three schemas are now corrected, and `installOne` prints a visible warning when it sees a malformed dep so future authoring drift surfaces immediately.
  - **Import rewriter** gained two rules for sibling-variants paths (`./button-variants` and `../../primitives/<dir>/<dir>-variants`), with six new unit tests covering the patterns.
  - **README**: the unscoped-`hex-core` collision warning is promoted above Quickstart and reformatted as a `> [!WARNING]` GitHub admonition so first-time readers can't miss it.

  **`@hex-core/components`** (patch):
  - `loading.schema.ts`, `toggle-group.schema.ts`, `form.schema.ts` updated to use the canonical `primitives/<slug>/<slug>` form for internal deps, matching the convention already used by `data-table`.

  **`@hex-core/registry`** (patch):
  - All 77 component manifests regenerated. New `verify-add-all.ts` script runs `hex add <slug>` against every component in an isolated temp dir and asserts each `@/...` import resolves to a written file — caught the three bare-slug regressions above and is now part of the toolkit for future releases.

- Updated dependencies [39a5c92]
  - @hex-core/registry@0.3.3

## 0.3.1

### Patch Changes

- 8f53d79: feat(themes): 71 brand-derived theme presets (Tesla, Stripe, Linear, …)

  Imports the full
  [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md)
  catalog (MIT-licensed, distributed via `getdesign`) as ready-to-use
  theme presets. Studio's preset switcher now has 74 themes available
  out of the box (3 first-party + 71 brand-derived).

  **`@hex-core/themes`** (minor):
  - 71 new presets at `packages/themes/src/presets/<slug>.ts`, one per
    brand. Spans 9 categories: AI/LLM, dev-tools, backend, productivity,
    design, fintech, e-commerce, media, automotive.
  - Each preset carries a full WCAG-AA-validated light + dark token set,
    plus brand metadata (`brand`, `category`, `tags`, `attribution`) and
    the verbatim source markdown brief as `designBrief` — so LLM agents
    reading the `Copy for LLM` payload get typography + motion +
    composition guidance alongside the tokens.
  - `searchThemes({ category, tags, query })` filters the catalog by any
    combination of those axes.
  - `extendTheme(base, overrides)` composes a new theme from a preset
    with user-provided token overrides (deep-merged + re-validated via
    `strictThemeSchema`).
  - `presetsByCategory` and `presetSlugs` indexes for category-aware UIs.
  - Per-preset deep imports: `@hex-core/themes/presets/tesla` resolves
    to a 28KB chunk; the full barrel is 1.6MB. Tree-shake at will.

  **`@hex-core/registry`** (patch):
  - `themeSchema` gains optional `brand` / `category` / `tags` /
    `designBrief` / `attribution` fields. All-optional so existing
    themes (`default`, `midnight`, `ember`) pass unchanged.
  - New `themeCategorySchema` enum (9 categories) and
    `themeAttributionSchema` for provenance metadata.

  **`@hex-core/tokens`** (patch):
  - New `buildTokenSet(seeds, mode)` helper extracted from the CLI's
    interactive flow. Both the CLI and the new `import-voltagent`
    script share a single source of truth for "build a complete
    TokenSet from 5 seed values."

  **`@hex-core/payload`** (patch):
  - `listThemes()` / `getTheme()` / `themes` now return the merged
    catalog (OSS + voltagent presets), so Studio's `/studio/copy` LLM
    payload sees every preset.
  - `AppContextTheme` carries the new metadata; `buildAppContext`
    emits a `## Design brief` block when present, plus a `brand /
category / tags` line and an attribution footer.

  **`@hex-core/mcp`** (patch):
  - New `search_themes` tool — filter the catalog by `category`,
    `tags`, and/or free-text `query`. Returns the same shape as
    `list_themes`, filtered.
  - `list_themes` description updated to mention the 71 brand presets.

  **`@hex-core/cli`** (patch):
  - `hex theme list` lists every preset grouped by category, with
    `--category` / `--tag` / `--json` filters.
  - `hex theme init --preset <slug>` — alias for `--name` that
    reads more naturally; works against any of the 74 presets.
  - `hex theme apply <slug>` likewise accepts any preset.

  **Reproducibility** — `pnpm import:themes:fetch` vendors the briefs from
  `getdesign@latest` (or a pinned version) into `.cache/getdesign-templates/`
  via `npm pack`. `pnpm import:themes` then deterministically regenerates
  every preset (no API calls). Per-preset extraction outcomes — including
  low-confidence picks that warrant manual review — are logged to
  `.context/voltagent-import.md`.

  **Visual baselines** — refreshes 6 dark-mode snapshots (`button`,
  `data-table`, `form`, `progress`, `slider`, `tabs`). These catch up with
  the destructive-foreground darkening landed in the prior a11y PR — they
  weren't pixel-refreshed at the time. No new visual diffs introduced by
  this PR's code paths.

  **Attribution** — each generated preset file carries a header
  linking to the upstream MIT-licensed source; the full LICENSE text
  is preserved at `LICENSES/voltagent-MIT.md`. Brand presets are
  _style references inspired by publicly visible design systems_,
  not endorsements.

- Updated dependencies [8f53d79]
  - @hex-core/themes@0.2.0
  - @hex-core/registry@0.3.2
  - @hex-core/tokens@1.3.2

## 0.3.0

### Minor Changes

- 2bdd746: feat(tokens,cli): interactive theme authoring + shared color-math primitives

  Phase 1 of the theme-authoring system. The CLI gains `hex theme init -i` —
  an interactive flow that walks the user through a small set of seed colors
  (primary, foreground, background, destructive, radius), derives the rest
  of the canonical token slots automatically, validates through
  `strictThemeSchema`, and writes the result as CSS, JSON, or a TS theme
  file ready to drop into `@hex-core/tokens`.

  ### `@hex-core/tokens`

  New pure-function color-math helpers exported from the package root:
  - **`deriveForegroundFor(bgValue)`** — pick near-white or near-black for
    WCAG-AA contrast against any background. Used to auto-pair every
    `*-foreground` slot with its base.
  - **`deriveDarkFromLight(tokenSet)`** — mirror a light TokenSet into a
    coherent dark TokenSet by inverting lightness around 50% while
    preserving hue and reducing saturation 25% (avoids the neon-toxic
    effect of naive HSL inversion).
  - **`deriveSecondaryFromPrimary(primary)`** — desaturate + lighten a
    primary into the muted-but-related fill that Cancel/Save-Draft buttons
    pair with.
  - **`contrastRatio(fg, bg)`** — WCAG-conformant contrast computation
    exposed for authoring-time gates.
  - **`colorInputToTokenValue(input)`** — parse anything culori accepts
    (hex, named colors, `hsl()`, `rgb()`) into the canonical
    `"<H> <S>% <L>%"` token-value string.
  - **`tokenLuminance(value)`** — the perceptual brightness of a color,
    for callers picking shimmer / overlay tints dynamically.

  These helpers live in `@hex-core/tokens` (not `@hex-core/cli`) so the
  future Hex Studio web UI in `hex-ui-platform` can reuse them in its
  React sliders without bundling commander + @inquirer/prompts. Both
  shells (terminal CLI + web Studio) wrap the same color math.

  ### `@hex-core/cli`
  - **`hex theme init -i`** — interactive flow described above. Renders
    ANSI swatches inline so authors can see what they're picking; gracefully
    falls back to bare hex strings when `NO_COLOR` is set or the terminal
    doesn't support 24-bit color.
  - **`--format ts`** — new output format that writes a TS theme file
    matching the shape of `packages/tokens/src/themes/{default,midnight,ember}.ts`.
    Used to dogfood-author a new opinionated default theme to replace the
    current shadcn-clone palette (Phase 2, follow-up).
  - **`hex theme init` (non-interactive)** — unchanged. Existing
    `--name <preset>` / `--out <path>` flags keep working for scripted
    scaffolding from the OSS preset themes.
  - **`hex theme edit`, `hex theme apply`** — unchanged.

  ### New deps
  - `culori@latest` — color manipulation (HSL parsing, WCAG contrast,
    freeform color-string parsing). Added to both `@hex-core/tokens`
    (runtime, for the derive helpers) and `@hex-core/cli` (re-uses the
    same parser for prompt input).
  - `@inquirer/prompts@latest` — terminal prompts (CLI only).
  - `picocolors@latest` — ANSI output (CLI only).

  ### Migration

  None for non-interactive consumers. The new flag is opt-in:
  `hex theme init -i` triggers the new path; bare `hex theme init`
  preserves v0.2.x behavior.

  ### What's next

  Phase 2 (separate PR): run `hex theme init -i --format ts --out
packages/tokens/src/themes/default.ts --overwrite` to author the new
  opinionated default theme that replaces the shadcn-clone palette
  flagged in `.claude/research/phase-2-feedback.md` (F2-06).

### Patch Changes

- Updated dependencies [035e4ec]
- Updated dependencies [2bdd746]
  - @hex-core/tokens@1.3.0

## 0.2.3

### Patch Changes

- 36a3a1c: fix(cli): post-POC polish — v4 bridge restores `hex theme edit`, recipes-in-list, theme apply, sonner hint

  Backfill changeset for PR #92 (commit `c967659`, merged 2026-04-28). PR #92 shipped 7 fixes after a real POC against `cli@0.2.2` but never landed a changeset, leaving the cli stuck on main without a release path. This changeset triggers `cli@0.2.3` so users hitting the actively-broken `hex theme edit` v4 path get the fix on npm.

  The seven items in PR #92:

  | Commit    | Fix                                                                                                                                                                                                                                                                                                                                                                                                                             | Why it matters                                                                                                                        |
  | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | `857aaba` | **Fix B (the real bug)** — v4 globals.css uses the bridge pattern: `:root { --primary: VALUE }` + `@theme inline { --color-primary: hsl(var(--primary)) }`. The previous shape inlined color values directly into `@theme {}`, which works for `bg-primary` utilities but eliminates the raw `--primary: VALUE` triplet that `hex theme edit`'s regex hunts for. Result: `hex theme edit` silently no-op'd on every v4 install. | Critical — `hex theme edit` is a documented command. Users hitting the v4 path on `cli@0.2.2` see no error, no diff, no token change. |
  | `2d18084` | **Fix A** — `npx hex-core` typo callout in root + cli READMEs (unscoped `hex-core` on npm is owned by an unrelated author).                                                                                                                                                                                                                                                                                                     | Prevents users from `npx`-installing the wrong package.                                                                               |
  | `6e581c9` | **Fix C** — silent skip for shared `lib/*` files on re-add; preserves customizations. No more `Skip: lib/utils.ts (use --overwrite)` nag.                                                                                                                                                                                                                                                                                       | Cleaner re-add UX; users who customized `lib/utils.ts` keep their edits.                                                              |
  | `89acbde` | **Fix D** — recipes section in `hex list` with "Try one: hex recipe add <slug>" CTA.                                                                                                                                                                                                                                                                                                                                            | Killer feature was buried behind a separate command; now discoverable in the default `hex list`.                                      |
  | `e2a6141` | **Fix E** — drop unused `hooks` alias from default `hex.config.json` (no registry item references it).                                                                                                                                                                                                                                                                                                                          | Cleaner default config; one less thing to explain.                                                                                    |
  | `9cce7aa` | **Fix F** — Toaster mount reminder after `hex add sonner` so users don't silently hit "no toast appears."                                                                                                                                                                                                                                                                                                                       | Sonner needs a mount point; surfacing the requirement saves debugging time.                                                           |
  | `424874e` | **Fix G** — `hex theme apply <preset>` for surgical theme switches; replaces only `:root` + `.dark` token bodies, preserves user customizations and the `@theme inline` bridge.                                                                                                                                                                                                                                                 | New command; complements `hex theme edit`.                                                                                            |

  **Tests:** PR #92 already shipped 96 cli tests + 39 tokens tests covering all 7 fixes. No additional test work in this changeset.

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.2.2

### Patch Changes

- d99548a: fix(cli): bundle registry into npm tarball + rewrite imports to alias paths

  Resolves the post-init install wall: `hex add` now writes import-correct files into
  the consumer's `components/ui/` directory (alias-rewritten, no `.js` suffixes). The
  registry tarball-bundled `prebuild` step lets `hex list` / `hex add` work outside
  the monorepo. `hex doctor` reports install invariants (Tailwind major, peer deps,
  hex.config.json, lib/utils, globals.css shape).

  Backfill changeset for PR #88 (`fix: collapse the post-init install wall…`,
  commit `0729f38`) — the PR shipped the fixes but no changeset, so cli has been
  sitting on main without a release path.

## 0.2.1

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
  - @hex-core/tokens@1.0.0

## 0.2.0

### Minor Changes

- 07bea53: Theme B substrate — full custom-tokens surface across the OS.

  **`@hex-core/tokens`** now ships beyond color + radius:
  - Spacing scale (`--space-1` through `--space-16`)
  - Gap presets (`--gap-sm/md/lg`)
  - Control heights (`--control-height-sm/md/lg`)
  - Typography scale (`--text-xs` through `--text-3xl`)
  - Motion duration tokens (`--duration-fast/normal/slow`)

  Shared across the 3 theme presets via `themes/shared.ts`. `themeToTailwindConfig`
  now emits `spacing`, `fontSize`, `transitionDuration`, and `height` maps in
  addition to `colors` and `borderRadius`, so consumers wire the whole token set
  into Tailwind's `theme.extend` in one call.

  **`@hex-core/components`** — all 47 components migrated to read tokens via
  CSS-variable references. Fallbacks match prior Tailwind defaults, so consumers
  without a theme loaded see zero visual change. Override `--space-6` (etc.) in
  your `globals.css` and every component reflows.

  **`@hex-core/registry`** — adds `tokenSetSchema`, `strictTokenSetSchema`,
  `strictThemeSchema`, plus `REQUIRED_COLOR_TOKENS` and `REQUIRED_RADIUS_TOKENS`
  constants. Strict variants validate that a theme defines the 19 color tokens +
  radius needed for components to render correctly. Existing `themeSchema` stays
  loose for runtime parsing.

  **`@hex-core/cli`** — adds `hex theme init` and `hex theme edit`:

  ```bash
  # scaffold globals.css from a preset (full token block, light + dark)
  pnpm dlx @hex-core/cli theme init --name midnight --out app/globals.css

  # override one or more tokens, scoped or both
  pnpm dlx @hex-core/cli theme edit \
    --file app/globals.css \
    --token "primary=240 50% 50%"
  ```

  114 unit tests cover the new surface (was 65 before).

### Patch Changes

- Updated dependencies [07bea53]
  - @hex-core/tokens@0.2.0
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
