---
name: hex-core-overview
description: Hex Core primer. Load when the user mentions hex-core, shadcn alternative, AI component library, MCP component distribution, or wants a React + Tailwind + Radix component.
---

# Hex Core — Overview

Hex Core is an AI-native React component library. Think shadcn/ui with machine-readable metadata baked into every component, an MCP server that exposes the catalog as structured tool calls, and recipes that map a brief to a checklist of components.

## Mental model

- **The components** are Radix UI + Tailwind CSS + CVA. 187 registry items ship: 27 primitives, 40 compounds, 43 section blocks, 26 AI-native, 23 artifact diagrams, 26 motion primitives, 2 hooks. Copy-the-code distribution (no runtime dependency on `@hex-core/components` — the CLI or MCP writes source files into the user's project).
- **The `.schema.ts` file** next to each component is the contract. It declares props, variants, slots, and an `ai` block: `whenToUse`, `whenNotToUse`, `commonMistakes`, `relatedComponents`, `accessibilityNotes`, `tokenBudget`. All 19 MCP tools read from this.
- **Recipes** are static JSON (`registry/recipes/*.json`) that map a goal ("settings page", "auth form") to an ordered list of component slugs + a post-install checklist. 25 ship — 17 component recipes (`auth-form`, `settings-page`, `pricing-table`, `data-table-view`, `confirm-destructive`, `command-palette`, the `layout-starter` layout-primitives bundle, …) and 8 page recipes.
- **The MCP server** (`@hex-core/mcp`) exposes 19 tools. 11 for components + themes (search_components, get_component, get_component_schema, describe_intent, search_compositions, list_themes, get_theme, search_themes, emit_figma_tokens, scaffold_project, customize_component). 5 for spec-driven flow (list_recipes, get_recipe, resolve_spec, verify_checklist, emit_app_context). 3 for agent-building (map_application, query_graph, scaffold_poc). In MCP Apps hosts, `list_themes` also renders an interactive theme browser.
- **The HTTP agent surface** on hex-core.dev needs no MCP server: `llms.txt` / `llms-full.txt`, `/registry.json`, `/recipes.json`, `/graph.json`, and `/r/{name}.json` in shadcn registry-item format — `npx shadcn@latest add @hex/button` works after one `components.json` line.
- **The CLI** (`@hex-core/cli`) is the human + scripted entry point: `hex init`, `hex add <slug>`, `hex list`, `hex recipe add <slug>`, `hex map <brief>`, `hex poc --from hex.map.json`, `hex graph affected <slug>`, `hex doctor`, `hex skills install`.

## When to reach for hex-core

- **A fresh React project** and the user wants production-grade UI without inventing styling conventions → yes.
- **An existing shadcn project** → hex-core is additive; you can drop individual components in without migrating the rest.
- **A non-React framework** (Vue, Svelte, Solid) → not yet.
- **A headless data layer** (hooks only, no UI) → hex-core ships UI; pair with your own hooks.

## What distinguishes it from shadcn/ui

1. `.ai` metadata on every component (shadcn/ui has docs prose; hex-core has queryable structured fields).
2. **Recipes**: no other mainstream library ships a machine-readable "here's the install order for a settings page" blueprint.
3. **MCP-first**: shadcn has an MCP server too, but hex-core's 19 tools include spec resolution, install verification, whole-app mapping, and graph queries; shadcn's is component browsing + install. Hex also serves its catalog *as* a shadcn namespaced registry, so the two are additive rather than exclusive.

## When hex-core is overkill

- Throwaway prototypes where a `<button>` in raw HTML suffices.
- Email templates (Tailwind classes don't render in most email clients).
- Component libraries that need to be portable across frameworks.

## Where to go next

- Building a UI from a brief? Load `hex-core-recipes-workflow`.
- Deciding which MCP tool to call? Load `hex-core-mcp-tools`.
- Theming? Load `hex-core-theming`.
- Full catalog: https://hex-core.dev/docs
