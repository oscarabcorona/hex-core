# Hex Core

[![CI](https://github.com/oscarabcorona/hex-core/actions/workflows/ci.yml/badge.svg)](https://github.com/oscarabcorona/hex-core/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@hex-core/components.svg?label=%40hex-core%2Fcomponents)](https://www.npmjs.com/package/@hex-core/components)
[![downloads](https://img.shields.io/npm/dm/@hex-core/components.svg)](https://www.npmjs.com/package/@hex-core/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/github/sponsors/oscarabcorona?label=Sponsor&logo=GitHub)](https://github.com/sponsors/oscarabcorona)

**The component layer for spec-driven UI development.**

Hex Core turns a brief (or a `spec.md` / `plan.md` section) into a ranked component checklist over MCP. No server, no runtime — just static JSON and 19 MCP tools over a catalog of 187 components, including 43 section blocks and 8 page recipes.

## Why Hex Core?

shadcn/ui is built for humans browsing docs. Hex Core is built for **AI agents** that need:

- **Machine-readable component specs** — Zod schemas with props, variants, slots, and constraints
- **AI hints** — `whenToUse`, `whenNotToUse`, `commonMistakes`, `accessibilityNotes` per component
- **Recipes** — spec-driven blueprints (auth flows, settings page, pricing table, data table, confirm-destructive, command palette, and the `layout-starter` layout-primitives bundle) with ordered install steps and post-install checklists
- **MCP server** — 19 tools for component discovery, installation, theming, scaffolding, spec resolution, and emitting paste-into-LLM app context. `list_themes` renders an interactive theme browser in MCP Apps hosts (Claude, ChatGPT, VS Code)
- **Agent surface over HTTP** — [`llms.txt`](https://hex-core.dev/llms.txt) (+ `llms-full.txt` with per-item `whenToUse`), `/registry.json`, `/recipes.json`, `/graph.json`, and `/r/{name}.json` in shadcn registry-item format, so `npx shadcn@latest add @hex/<slug>` works from the `@hex` namespace
- **Token budgets** — each component declares its token cost for efficient LLM context usage

> [!WARNING]
> **Use the scoped package names.** The npm packages are `@hex-core/cli` and `@hex-core/mcp`. An unrelated `hex-core` package is published on npm by a different author — `npx hex-core …` will fail with `npm error could not determine executable to run`. Always include the `@hex-core/` scope in install commands.

## Quick Start

### For AI (MCP)

Add to your Claude Code settings (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["@hex-core/mcp"]
    }
  }
}
```

Then ask Claude: *"Search hex-core for a button component and add it to my project"*

### For shadcn CLI users

Declare the `@hex` namespace once in `components.json`, then install any catalog slug with the tool you already run:

```json
{ "registries": { "@hex": "https://hex-core.dev/r/{name}.json" } }
```

```bash
npx shadcn@latest add @hex/button
```

Items arrive in shadcn registry-item format with the machine-readable `ai` block included — agents reading your project keep the intent metadata.

### For Humans (CLI)

```bash
npx @hex-core/cli init                    # detects Tailwind v3 vs v4, scaffolds globals.css, auto-installs peer deps
npx @hex-core/cli add button input label  # writes components, auto-installs Radix peers, rewrites imports to your @/ alias
npx @hex-core/cli doctor                  # diagnose what's missing if anything breaks
npx @hex-core/cli map "a SaaS site with landing + pricing"   # brief → screens/install/warnings map
npx @hex-core/cli poc --from hex.map.json --dir demo --yes   # scaffold a runnable Next.js demo app
npx @hex-core/cli graph affected button                      # reverse blast radius across the catalog
```

## Packages

| Package | Description |
|---------|-------------|
| `@hex-core/registry` | Zod schemas and types for the component registry |
| `@hex-core/tokens` | Design token engine with 3 themes |
| `@hex-core/components` | Component source code (React + Tailwind) |
| `@hex-core/motion` | UI animation primitives + deterministic timeline composer (zero-dep WAAPI core, optional `motion@^11` adapter) |
| `@hex-core/themes` | Theme catalog — premium presets and generated design briefs built on `@hex-core/tokens` |
| `@hex-core/payload` | Pure-function builders for paste-into-LLM payloads (App Context markdown, Figma Variables JSON) shared by the MCP server and CLI |
| `@hex-core/mcp` | MCP server for AI-native distribution |
| `@hex-core/cli` | CLI for human developers |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `search_components` | Discover components by query, category, or tags |
| `search_compositions` | Find component examples by composition tags (`destructive`, `confirm`, `form-action`, …) |
| `get_component` | Get full source code + metadata for installation |
| `get_component_schema` | Get props/variants/AI hints (token-efficient) |
| `describe_intent` | Intent-first payload: per-variant `useWhen`, structured anti-patterns, token intents — call before generating JSX |
| `get_theme` | Get theme in CSS, JSON, or Tailwind format |
| `list_themes` | List available themes — in MCP Apps hosts, also renders an interactive palette-previewing theme browser |
| `search_themes` | Search the theme catalog by category, tags, or free-text |
| `emit_figma_tokens` | Render a theme as a Figma Variables REST POST payload |
| `scaffold_project` | Generate complete project setup |
| `customize_component` | Apply CSS overrides to components |
| `list_recipes` | Catalog of spec-driven blueprints |
| `get_recipe` | Ordered install steps + post-install checklist |
| `resolve_spec` | Deterministic brief → ranked component + recipe shortlist |
| `verify_checklist` | Cross-check installed components against the internal-dep graph |
| `emit_app_context` | Synthesize a paste-into-LLM markdown payload of theme + installed components |
| `map_application` | Whole-app brief → typed screens, `requires`-closure install manifest, warnings (`hex.map.json`) |
| `query_graph` | Query the catalog knowledge graph — `explain`, `neighbors`, `path`, `affected` |
| `scaffold_poc` | Generate a standalone runnable Next.js demo app — frames plus a panel to demo them by role and data state |

See **[hex-core.dev/docs/spec-driven](https://hex-core.dev/docs/spec-driven)** for the full spec-driven workflow.

## Spec-driven example

```bash
# 1. Discover recipes
npx @hex-core/cli recipe list

# 2. Install every component in a recipe + print its checklist
npx @hex-core/cli recipe add settings-page
```

Or from an MCP client: ask *"Resolve this spec into hex-core components: build a settings page with notifications toggle"* — `resolve_spec` returns the `settings-page` recipe and a ranked component shortlist.

## Skills (for Claude Code)

Hex Core ships nine prose context packs in `SKILL.md` format — overview, MCP tools decision tree, recipes workflow, theming, CLI, a11y, anti-patterns, registry authoring, motion. Install in one command:

```bash
npx @hex-core/cli skills install
```

This copies the skills into `.claude/skills/` so any agent working in your repo loads them via trigger keywords on demand. See **[hex-core.dev/docs/skills](https://hex-core.dev/docs/skills)**.

## Themes

- **Default** — Refined, neutral. Professional and versatile.
- **Midnight** — Dark-first with deep blues. Built for developer tools.
- **Ember** — Warm terracotta and amber. For creative applications.

## Components

**187 registry items**: 27 primitives (Button, Input, Checkbox, Switch, Slider, …), 40 compounds (Combobox, DataTable, Command, Calendar, Date Picker, Kanban, DnD primitives, …), 43 section blocks (auth, pricing, settings, dashboard, …), 26 AI-native (Composer, Message, Reasoning, ToolCall, Terminal, Canvas, Diagram, AudioPlayer, AudioWaveform, SpeechRecognition, …), 23 artifact diagrams (sankey, mindmap, gantt, …), 26 motion primitives (Motion factory, Presence, Timeline composer, useAnimate, useScroll, …), and 2 hooks. DataTable rows and Tree top-level nodes also opt into drag-to-reorder via the shared DnD primitive set. Every item ships with a machine-readable `.schema.ts` containing props, variants, AI hints (`whenToUse`, `whenNotToUse`, `commonMistakes`, `accessibilityNotes`), and a token budget. `pnpm verify:schema-quality` gates the `ai` block on every push — placeholder prose, unresolvable slugs, and missing examples fail CI.

Full catalog + live demos: **[hex-core.dev/docs](https://hex-core.dev/docs)**

## Development

```bash
pnpm install
pnpm build
pnpm run build:registry
pnpm verify:schema-quality   # ai-block quality gate (also runs in CI)
```

## Architecture

```
hex-core/
├── packages/
│   ├── registry/       # Zod schemas + types
│   ├── tokens/         # Design token engine
│   ├── themes/         # Theme presets
│   ├── components/     # React component source
│   ├── motion/         # Animation primitives
│   ├── payload/        # Paste-into-LLM payload builders
│   ├── mcp-server/     # MCP server
│   └── cli/            # CLI tool
├── registry/           # Built registry JSON
└── scripts/            # Build scripts
```

Each component has two files:
- `{name}.tsx` — React component (Radix UI + Tailwind + CVA)
- `{name}.schema.ts` — Machine-readable spec with props, variants, AI hints

## Releases

Feature branch → PR → `main` → `/release` skill. CI on `main` runs `Lint` / `Build` / `Test` (~2 min). Slow regression checks (a11y axe-scan + Playwright visual diffs) run locally via `pnpm regression` as a pre-release gate; see [CONTRIBUTING.md](CONTRIBUTING.md#releasing).

## Sponsor

If hex-core saves you time, consider [sponsoring development on GitHub](https://github.com/sponsors/oscarabcorona).

## License

[MIT](LICENSE)
