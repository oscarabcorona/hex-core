---
name: hex-core-mcp-tools
description: Decision tree for the 11 hex-core MCP tools. Load when picking between search_components, get_component, get_component_schema, resolve_spec, get_recipe, verify_checklist, or any other hex-core tool call.
---

# Hex Core MCP Tools — Decision Tree

The server exposes 11 tools. Picking the right one first saves 3–5 unnecessary calls.

## Step 1 — What am I trying to do?

| Intent | Call |
|---|---|
| "User gave me a brief / spec / goal — what should I build?" | `resolve_spec({ brief })` |
| "I already know the feature shape — is there a recipe for it?" | `list_recipes()` |
| "I have a recipe slug, give me the full step list" | `get_recipe({ slug })` |
| "I need a component by name" | `get_component({ name })` |
| "I know the component exists, just need props + hints" | `get_component_schema({ name })` |
| "User said 'something like a dropdown'" | `search_components({ query })` |
| "I installed these, did I miss any internal deps?" | `verify_checklist({ components })` |
| "Spin up a fresh project setup" | `scaffold_project({ components, theme })` |
| "Get theme tokens in format X" | `get_theme({ name, format })` |
| "What themes exist?" | `list_themes()` |
| "Apply a CSS override to a component" | `customize_component({ name, cssOverrides })` |

## Step 2 — The canonical flow for a feature brief

```
resolve_spec(brief)
  → top recipe? yes → get_recipe(slug) → install steps → verify_checklist
  → top recipe? no  → top components → get_component(name) for each → verify_checklist
```

## Step 3 — Common mistakes

- **Using `get_component` when `get_component_schema` would do.** `get_component` returns the full file source (often >5KB); `get_component_schema` returns just props + variants + AI hints (<1KB). Use the schema for reasoning about usage. Use the full component only when you're about to write the file.
- **Skipping `resolve_spec` and going straight to `search_components`.** `resolve_spec` considers recipes *and* components ranked together; `search_components` only returns components. For anything that looks like a multi-component feature, start with `resolve_spec`.
- **Skipping `verify_checklist` after install.** The `hex add` CLI handles transitive deps, but if an agent installed via MCP `get_component` + Write, it's easy to forget `combobox` needs `command` + `popover`. `verify_checklist` catches this in one call.
- **Calling `get_theme({ format: "css" })` when the user just wanted the HSL values.** Use `format: "json"` for the flat token map — it's the most token-efficient for reasoning.
- **Passing `includeExamples: false` to `get_component` by default.** Examples are the fastest way to grok API shape. Keep them on unless you're token-budgeting hard.

## Step 4 — Input schema strictness

All 11 tools use `z.object().strict()` — passing an unrecognized key returns a validation error. Don't attempt to sneak in "hint" fields. If a tool doesn't accept a flag, the flag doesn't exist.

## Step 5 — Response shape

Every tool returns `content: [{ type: "text", text: "<stringified JSON>" }]`. Parse the JSON before acting on it. Error cases for `get_component`, `get_recipe` return a text message like `Recipe "foo" not found.` — check for this before JSON.parse.

## Where to go next

- Full spec-driven flow walkthrough: `hex-core-recipes-workflow`
- Theme tokens in depth: `hex-core-theming`
