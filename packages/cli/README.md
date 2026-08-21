# @hex-core/cli

[![npm](https://img.shields.io/npm/v/@hex-core/cli.svg)](https://www.npmjs.com/package/@hex-core/cli)
[![downloads](https://img.shields.io/npm/dm/@hex-core/cli.svg)](https://www.npmjs.com/package/@hex-core/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Copy Hex Core components into your project with one command. No runtime dependency on the library — you own the source.

> [!WARNING]
> **Use the scoped package name.** This package is `@hex-core/cli` (with the `@hex-core/` scope). An unrelated `hex-core` package is published on npm by a different author — `npx hex-core …` will fail with `npm error could not determine executable to run`. Always include the scope in `npx` / `pnpm dlx` commands.

## Install & run

No install required:

```bash
pnpm dlx @hex-core/cli add button
# or
npx @hex-core/cli add button
```

Or install globally — the binary is named `hex`:

```bash
pnpm add -g @hex-core/cli
hex add button
```

## Commands

### `hex init`

Detects whether your project uses Tailwind **v3** or **v4** by reading `package.json`, then scaffolds the right shape:

- Writes `hex.config.json`
- Writes `app/globals.css` (or `src/app/globals.css`) — `@import "tailwindcss"` + `@theme` for v4, `@tailwind base/components/utilities` + `@layer base` for v3
- For v3 only: writes `tailwind.config.ts` with the `tailwindcss-animate` plugin and the design-token bindings
- Auto-installs the version-correct peer deps via your detected package manager (pnpm, yarn, bun, or npm)
- Records a `studio` link (`hex-core.dev/studio`) in `hex.config.json` and prints it — tweak theme tokens against a live preview, then paste the payload back into your AI session

```bash
hex init                  # default theme, auto-install peer deps
hex init --no-install     # print the install line instead of running it
hex init --overwrite      # replace existing globals.css / tailwind.config.ts
hex init --theme midnight # alternate preset (default, midnight, ember)
hex init --mcp            # also wire @hex-core/mcp into your AI tool
```

If `tailwindcss` isn't installed yet the command prints the right install line and exits — install Tailwind first, then re-run.

**`--mcp` (opt-in):** wires the `@hex-core/mcp` server into your AI tool so it can call `list_themes` / `get_theme` / `customize_component` directly. Creates `.mcp.json` at the repo root (Claude Code's project-scope convention) or merges into an existing `.cursor/mcp.json` / `.continue/config.json`. Read–merge–write — never clobbers your other MCP servers. Off by default because `.mcp.json` is commit-tracked and auto-loaded.

### `hex add <slug> [...more]`

Copies one or more components (and their internal dependencies) into `components/ui/`, rewrites the imports to your configured aliases (`@/lib/utils`, `@/components/ui/<sibling>`), drops `.js` suffixes, and auto-installs the npm peer deps each component declares (Radix primitives, etc.). Internal-component deps are walked transitively — `hex add combobox` also pulls in `popover` and `command`.

```bash
hex add button input dialog
hex add combobox --no-deps      # only the named slug; print the missing deps
hex add dialog --no-install     # write files but don't run pnpm/npm/yarn add
hex add --pack layout           # install the layout primitives in one shot
hex add --from hex.map.json     # install everything a `hex map` run planned
```

`--from` accepts either a `hex.components.json` manifest (`{ "components": ["button", …] }`) or a `hex.map.json` application map written by `hex map --out` — the map's full `requires`-closure install list seeds the queue.

After an install, `hex add` prints a **"Related primitives you might want next"** line (driven by each component's schema metadata) and — if you added several interactive primitives without any layout primitive — nudges you toward `hex add --pack layout` (`container`, `stack`, `cluster`, `grid`, `spacer`, `empty`). It also points you at the bundled `hex-core-*` skills when they're installed.

### `hex doctor`

Diagnose your install in one pass. Reports `pass` / `fail` / `warn` for: `hex.config.json`, `tailwindcss` major version, your `lib/utils` location, `globals.css` directive style matches the installed Tailwind major, every base peer dep (`clsx` / `tailwind-merge` / `class-variance-authority` / animate package), Tailwind v3-only `tailwind.config.ts`, and every `@radix-ui/*` import found in `components/ui/*.tsx`. Exits non-zero if anything fails.

```bash
hex doctor
hex doctor --layout   # also scan source for composition opportunities
```

**`--layout`:** adds two `info`-only scans over your source tree — components you installed but never imported (you wrote raw `<div>`s instead of composing), and hand-rolled layout patterns a primitive would replace (`space-y-*` chains → `<Stack>`, breakpoint `grid-cols-*` → `<Grid>`, dashed empty divs → `<Empty>`, ad-hoc timelines/badges). These never fail the gate.

### `hex list`

Prints every component in the registry grouped by category.

### `hex recipe list`

Lists every available spec-driven recipe (auth flows, settings page, pricing table, data table view, destructive confirm, command palette, the `layout-starter` primitives bundle, and the eight page recipes: `landing-page`, `app-page`, `storefront-page`, `about-page`, `order-page`, `checkout-page`, `pricing-page`, `product-page`) with summary and component list. `hex recipe add layout-starter` drops in the 12 foundation primitives most apps compose from.

### `hex recipe add <slug>`

Runs `hex add` for every component in the recipe in order, then prints the post-install checklist as plain markdown — paste it into a PR body or feed it to an agent.

```bash
hex recipe add settings-page
```

### `hex map "<brief>"`

Deterministically map a whole-application brief onto the catalog. The brief is segmented, each segment is scored against components and recipes, and every screen is typed as a **page-recipe** (generates a full page), **recipe** (a component bundle), or **components** screen. The result carries the full `requires`-closure install list, related-component suggestions, anti-pattern warnings, the merged post-install checklist, and per-screen token budgets. No LLM server-side — same brief + same registry always produce the same map, so agents can cite it.

```bash
hex map "a SaaS site with a landing page and pricing page, plus an admin dashboard with a data table"
hex map --spec ./PRD.md --out hex.map.json   # read the brief from a file, save the map
hex map "landing page" --json | jq .install  # raw JSON on stdout for piping
```

The saved `hex.map.json` is the hand-off artifact between planning and building: `hex add --from hex.map.json` installs it, `hex poc --from hex.map.json` scaffolds a runnable demo from it.

### `hex poc`

Scaffold a **standalone runnable Next.js App Router demo app** from a brief, a saved map, or a single page recipe. The app ships a theme-token `globals.css` (Tailwind v4), every mapped component copied in with rewritten imports, one generated route per page-recipe screen (assembled deterministically from each section block's schema example), an index page linking every screen, and the `hex.map.json` it was built from. Generated apps `pnpm install && pnpm dev` with zero manual wiring.

```bash
hex poc "landing page with pricing" --dir demo --yes
hex poc --from hex.map.json --dir demo --yes   # from a reviewed map
hex poc --recipe landing-page --dry-run        # one page recipe; plan only
```

Screens that aren't page recipes are installed as components and listed on the index page instead of getting a generated route.

### `hex graph explain|affected|neighbors|path`

Query the catalog knowledge graph (`registry/graph.json`, generated from the registry at build time: 187 items + 25 recipes + theme presets, with `requires` / `composes` / `themes` / `related` / `instead-use` edges). These four subcommands mirror the four modes of the MCP `query_graph` tool exactly.

```bash
hex graph explain marketing-hero            # edges grouped by relation + community peers
hex graph affected button                   # reverse blast radius: dependents + recipes
hex graph neighbors card --relation requires  # adjacent nodes, optionally filtered
hex graph path button card                  # shortest connection between two slugs
hex graph explain card --json               # machine shape for agents
```

### `hex migrate`

Convert an existing Next.js / Vite / CRA / CRACO + shadcn/ui project to Hex Core in-place: detected shadcn components are replaced with their Hex equivalents (with `.shadcn.bak` backups), renamed slugs are mapped, unsupported ones are skipped with reasons, and peer deps are installed.

```bash
hex migrate --dry-run   # full plan, no writes
hex migrate --yes       # apply
hex migrate --only button,card --theme replace
```

### `hex theme …`

Author and edit token themes: `hex theme list` (70+ presets), `hex theme init` (scaffold from a preset, or `-i` interactively from seed colors), `hex theme edit` (override tokens in an existing globals.css, `-i` for swatches + contrast warnings), `hex theme apply <preset>` (swap presets without clobbering custom rules), and `hex theme add <slug> --from <studio-url>` (import a Studio-composed theme).

### `hex skills install`

Copies the nine bundled Hex Core skills into `.claude/skills/` (or a custom `--target`), then points you at `hex-core-overview` for next steps. Skills are SKILL.md prose packs that Claude Code loads on demand via trigger keywords.

```bash
hex skills install                         # default target: .claude/skills/
hex skills install --target ./my-skills    # custom location
hex skills install --overwrite             # replace existing skill dirs
```

## The agent-builder workflow

The CLI is built to be driven by AI agents (Claude Code, Cursor, or any vibe-coding tool) as much as by humans. The intended loop for "build me an application":

1. **Map** — `hex map "<brief>" --out hex.map.json` (or the MCP `map_application` tool). Deterministic, citable, reviewable.
2. **Review** — the agent (or you) edits `hex.map.json`: drop screens, add suggested components, act on warnings.
3. **Build** — `hex add --from hex.map.json` into an existing app, or `hex poc --from hex.map.json` for an instant runnable demo.
4. **Verify** — `hex doctor` (the MCP `verify_checklist` tool covers the same ground), then walk the map's checklist.

Every step is deterministic and file-based, so agents can diff, retry, and hand off between tools. The same engine backs the `@hex-core/mcp` tools (`map_application`, `query_graph`, `scaffold_poc`), and `hex graph`'s four subcommands mirror `query_graph`'s four modes — CLI and MCP never disagree.

## How it works

The published `@hex-core/cli` tarball ships the registry JSON inside it, so `hex list`, `hex add`, and `hex recipe add` work offline from a fresh `npx` install — no monorepo checkout required. Component source is written into `components/ui/`, imports are rewritten to your `hex.config.json` aliases (`@/lib/utils`, `@/components/ui/<sibling>`), and the npm peer deps each item declares are installed via your detected package manager. You own the code — future CLI upgrades never overwrite your edits unless you pass `--overwrite`.

## Docs

[hex-core.dev/docs/installation](https://hex-core.dev/docs/installation)

## License

MIT
