---
name: hex-core-cli
description: Using the hex CLI. Load when the user runs or asks about hex init, hex add, hex map, hex poc, hex graph, hex list, hex recipe, hex doctor, hex migrate, hex skills, pnpm dlx @hex-core/cli, or npx @hex-core/cli.
---

# Hex Core — CLI

The `hex` binary is provided by `@hex-core/cli`. Install via `pnpm dlx @hex-core/cli <cmd>` or `pnpm add -g @hex-core/cli`.

## Commands

### `hex init [--theme <name>]`

Writes `hex.config.json` at the project root with sensible defaults. Run once per project. Theme default is `default`; other options: `midnight`, `ember`.

### `hex add <slug> [...slugs] [flags]`

Copies component source into `components/ui/<slug>.tsx`, writes shared `lib/utils.ts` if missing, prints the npm peer-deps command.

- `--overwrite` / `-o`: replace existing files (default: skip)
- `--yes` / `-y`: no interactive prompts
- `--no-deps`: do **not** install internal component dependencies. Default behavior is transitive: `hex add combobox` also installs `command` and `popover` (and their own deps). Use `--no-deps` when you want to review what would be installed.

### `hex list`

Prints every component in the registry grouped by category. Read-only; safe to run any time.

### `hex recipe list`

Prints every recipe (slug, title, summary, component list).

### `hex recipe add <slug> [flags]`

Installs every component in the recipe's step list (transitively), then prints the post-install checklist as plain markdown. Same `--overwrite` / `--yes` flags as `hex add`. Always installs deps.

Recipes: `auth-form`, `settings-page`, `pricing-table`, `data-table-view`, `confirm-destructive`, `command-palette`.

### `hex map "<brief>" [--spec <file>] [--out hex.map.json] [--json]`

Deterministically maps an application brief onto the catalog: screens typed as `page-recipe` / `recipe` / `components`, plus a full `requires`-closure install list, suggestions, anti-pattern warnings, checklist, and token budgets. No LLM — same brief + registry ⇒ same map. Write it with `--out hex.map.json`; that file is what `hex add --from` and `hex poc --from` consume.

### `hex poc ["<brief>" | --from hex.map.json | --recipe <page-recipe>] --dir <path> [--yes] [--dry-run]`

Scaffolds a standalone runnable Next.js App Router demo app: theme globals.css, all mapped components copied in with rewritten imports, one generated route per page-recipe screen, index page, README, and the map itself. `cd <dir> && pnpm install && pnpm dev` — no manual wiring. Pass exactly one source. Non-page screens are installed but get no generated route (listed on the index page). `--yes` is required to write (and to write into a non-empty dir).

The app also ships a demo panel over every frame: **Viewing as** (`viewer` / `member` / `admin`, with gated frames explaining themselves instead of 404ing) and **Data** (populated / empty). Both are cookie-backed, so a selection survives navigation. When the user wants a new role, capability, or gated frame, edit `lib/demo.ts` in the generated app and gate on `can.*` — never on the role name.

### `hex graph explain|affected|neighbors|path <slug…>` `[--json]`

Queries the shipped catalog knowledge graph; the four subcommands mirror MCP `query_graph`'s four modes. `explain` = edges grouped by relation (`requires`/`composes`/`themes`/`related`/`instead-use`) + community peers; `affected` = reverse blast radius (dependents + recipes); `neighbors` = adjacent nodes (`--relation` to filter); `path <from> <to>` = shortest connection. Use before inventing component relationships.

### `hex skills install [--target <path>] [--overwrite]`

Copies the nine skills that ship with hex-core into `<cwd>/.claude/skills/` by default. An agent reading the host repo will then load them into context as needed.

## Canonical flows

**Fresh project setup:**
```bash
pnpm dlx @hex-core/cli init
pnpm dlx @hex-core/cli add button input label
pnpm dlx @hex-core/cli skills install  # once per repo, for agent tooling
```

**Build a feature via recipe:**
```bash
pnpm dlx @hex-core/cli recipe add settings-page
# → installs 8 components + prints ~30-item checklist
```

**Dry-run review (no transitive install):**
```bash
pnpm dlx @hex-core/cli add combobox --no-deps
# → writes only combobox.tsx + warning about missing command/popover
```

**Map and build a whole application:**
```bash
pnpm dlx @hex-core/cli map "a SaaS site with a landing page and pricing page" --out hex.map.json
# review/edit hex.map.json, then either:
pnpm dlx @hex-core/cli add --from hex.map.json          # into an existing app
pnpm dlx @hex-core/cli poc --from hex.map.json --dir demo --yes   # instant runnable demo
```

## Common mistakes

- **Running `hex add` outside a project root.** The CLI writes into `cwd`. If you're in a parent directory, files land in the wrong place.
- **Forgetting `--overwrite` when you want to reset a customized component.** Default is skip. The CLI never clobbers by accident.
- **Running `hex recipe add` twice and wondering why nothing changed.** That's skip-if-exists at work. Add `--overwrite` or delete the files first.
- **Expecting `hex add combobox --no-deps` to just fail.** It warns, doesn't fail. Exit code is 0. Parse the stderr or follow the printed "Install: hex add ..." line.
- **Running the CLI before running `hex init`.** `hex init` is optional — `hex add` works without it. But the config file is where you'd edit the target components dir if you don't want `components/ui/`.
- **Expecting `hex map` to reason like an LLM.** It's deterministic keyword + graph scoring. Name pages and features in the catalog's vocabulary ("landing page", "pricing", "kanban board") — you supply the judgment, the map supplies reproducibility. Unmatched segments are reported, not guessed at.
- **Running `hex poc` without `--yes` and thinking it failed.** Without `--yes` it prints the plan and asks you to re-run. That's the confirmation gate, same as `hex migrate`.
