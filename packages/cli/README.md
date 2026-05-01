# @hex-core/cli

[![npm](https://img.shields.io/npm/v/@hex-core/cli.svg)](https://www.npmjs.com/package/@hex-core/cli)
[![downloads](https://img.shields.io/npm/dm/@hex-core/cli.svg)](https://www.npmjs.com/package/@hex-core/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Copy Hex UI components into your project with one command. No runtime dependency on the library — you own the source.

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

```bash
hex init                  # default theme, auto-install peer deps
hex init --no-install     # print the install line instead of running it
hex init --overwrite      # replace existing globals.css / tailwind.config.ts
hex init --theme midnight # alternate preset (default, midnight, ember)
```

If `tailwindcss` isn't installed yet the command prints the right install line and exits — install Tailwind first, then re-run.

### `hex add <slug> [...more]`

Copies one or more components (and their internal dependencies) into `components/ui/`, rewrites the imports to your configured aliases (`@/lib/utils`, `@/components/ui/<sibling>`), drops `.js` suffixes, and auto-installs the npm peer deps each component declares (Radix primitives, etc.). Internal-component deps are walked transitively — `hex add combobox` also pulls in `popover` and `command`.

```bash
hex add button input dialog
hex add combobox --no-deps      # only the named slug; print the missing deps
hex add dialog --no-install     # write files but don't run pnpm/npm/yarn add
```

### `hex doctor`

Diagnose your install in one pass. Reports `pass` / `fail` / `warn` for: `hex.config.json`, `tailwindcss` major version, your `lib/utils` location, `globals.css` directive style matches the installed Tailwind major, every base peer dep (`clsx` / `tailwind-merge` / `class-variance-authority` / animate package), Tailwind v3-only `tailwind.config.ts`, and every `@radix-ui/*` import found in `components/ui/*.tsx`. Exits non-zero if anything fails.

```bash
hex doctor
```

### `hex list`

Prints every component in the registry grouped by category.

### `hex recipe list`

Lists every available spec-driven recipe (auth form, settings page, pricing table, data table view, destructive confirm, command palette) with summary and component list.

### `hex recipe add <slug>`

Runs `hex add` for every component in the recipe in order, then prints the post-install checklist as plain markdown — paste it into a PR body or feed it to an agent.

```bash
hex recipe add settings-page
```

### `hex skills install`

Copies the eight bundled Hex UI skills into `.claude/skills/` (or a custom `--target`). Skills are SKILL.md prose packs that Claude Code loads on demand via trigger keywords.

```bash
hex skills install                         # default target: .claude/skills/
hex skills install --target ./my-skills    # custom location
hex skills install --overwrite             # replace existing skill dirs
```

## How it works

The published `@hex-core/cli` tarball ships the registry JSON inside it, so `hex list`, `hex add`, and `hex recipe add` work offline from a fresh `npx` install — no monorepo checkout required. Component source is written into `components/ui/`, imports are rewritten to your `hex.config.json` aliases (`@/lib/utils`, `@/components/ui/<sibling>`), and the npm peer deps each item declares are installed via your detected package manager. You own the code — future CLI upgrades never overwrite your edits unless you pass `--overwrite`.

## Docs

[hex-core.dev/docs/installation](https://hex-core.dev/docs/installation)

## License

MIT
