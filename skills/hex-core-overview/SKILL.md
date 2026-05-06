---
name: hex-core-overview
description: Hex Core primer. Load when the user mentions hex-core, shadcn alternative, AI component library, MCP component distribution, or wants a React + Tailwind + Radix component.
---

# Hex Core — Overview

Hex Core is an AI-native React component library. Think shadcn/ui with machine-readable metadata baked into every component, an MCP server that exposes the catalog as structured tool calls, and recipes that map a brief to a checklist of components.

## Mental model

- **The components** are Radix UI + Tailwind CSS + CVA. 47 shipped. Copy-the-code distribution (no runtime dependency on `@hex-core/components` — the CLI or MCP writes source files into the user's project).
- **The `.schema.ts` file** next to each component is the contract. It declares props, variants, slots, and an `ai` block: `whenToUse`, `whenNotToUse`, `commonMistakes`, `relatedComponents`, `accessibilityNotes`, `tokenBudget`. All 11 MCP tools read from this.
- **Recipes** are static JSON (`registry/recipes/*.json`) that map a goal ("settings page", "auth form") to an ordered list of component slugs + a post-install checklist. Six ship with v0.1: `auth-form`, `settings-page`, `pricing-table`, `data-table-view`, `confirm-destructive`, `command-palette`.
- **The MCP server** (`@hex-core/mcp`) exposes 11 tools. 7 for components + themes (search_components, get_component, get_component_schema, list_themes, get_theme, scaffold_project, customize_component). 4 for spec-driven flow (list_recipes, get_recipe, resolve_spec, verify_checklist).
- **The CLI** (`@hex-core/cli`) is the human + scripted entry point: `hex init`, `hex add <slug>`, `hex list`, `hex recipe add <slug>`, `hex skills install`.

## When to reach for hex-core

- **A fresh React project** and the user wants production-grade UI without inventing styling conventions → yes.
- **An existing shadcn project** → hex-core is additive; you can drop individual components in without migrating the rest.
- **A non-React framework** (Vue, Svelte, Solid) → not yet.
- **A headless data layer** (hooks only, no UI) → hex-core ships UI; pair with your own hooks.

## What distinguishes it from shadcn/ui

1. `.ai` metadata on every component (shadcn/ui has docs prose; hex-core has queryable structured fields).
2. **Recipes**: no other mainstream library ships a machine-readable "here's the install order for a settings page" blueprint.
3. **MCP-first**: shadcn has an MCP server too, but hex-core's 11 tools include spec resolution and install verification; shadcn's is component browsing + install.

## When hex-core is overkill

- Throwaway prototypes where a `<button>` in raw HTML suffices.
- Email templates (Tailwind classes don't render in most email clients).
- Component libraries that need to be portable across frameworks.

## Where to go next

- Building a UI from a brief? Load `hex-core-recipes-workflow`.
- Deciding which MCP tool to call? Load `hex-core-mcp-tools`.
- Theming? Load `hex-core-theming`.
- Full catalog: https://hex-core.dev/docs
