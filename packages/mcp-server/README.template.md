# @hex-core/mcp

[![npm](https://img.shields.io/npm/v/@hex-core/mcp.svg)](https://www.npmjs.com/package/@hex-core/mcp)
[![downloads](https://img.shields.io/npm/dm/@hex-core/mcp.svg)](https://www.npmjs.com/package/@hex-core/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Universal MCP server for Hex UI. Gives any MCP-capable AI agent — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — structured access to the component registry. No prose scraping, no copy-paste.

## Install

Zero install — just run via npx:

```bash
npx -y @hex-core/mcp
```

## Wire into your client

Pick your client below. Every snippet calls the same `npx -y @hex-core/mcp`; the only thing that changes is where the config file lives and what key it uses.

<!-- @generated:client-wiring -->

## Tools exposed

Components & themes:

- `search_components(query)` — fuzzy search across name, description, tags, AI hints
- `get_component(slug)` — full RegistryItem (props, variants, examples, AI metadata)
- `get_component_schema(slug)` — props, variants, slots, AI hints without source
- `list_themes()` — available theme presets
- `get_theme(name, format)` — full token set for a theme (css / json / tailwind)
- `scaffold_project(components, theme)` — init + starter components in one call
- `customize_component(slug, overrides)` — generate a themed variant

Spec-driven build flow:

- `list_recipes()` — catalog of spec-driven blueprints (auth form, settings page, pricing table, …)
- `get_recipe(slug)` — ordered install steps, union of peer deps, post-install checklist
- `resolve_spec(brief)` — deterministic brief → ranked component + recipe shortlist (no LLM call server-side)
- `verify_checklist(components, recipe?)` — cross-check installed components against the internal-dependency graph and the recipe's checklist
- `emit_app_context(theme, components, recipes?)` — synthesize a paste-into-LLM markdown payload describing the chosen stack
- `emit_figma_tokens(theme)` — render a theme as a Figma Variables REST POST payload

AI-native intent layer (0.4.0+):

- `describe_intent(name)` — variant `useWhen` strings, structured `antiPatterns` with `insteadUse` slug, and the slice of `defaultSemanticTokens` for the component. Use BEFORE generating JSX — the per-variant intent + structured anti-patterns prevent the canonical LLM mistakes (picking destructive for non-destructive, picking Slider for booleans, nesting Cards, etc.).
- `search_compositions(tags, limit?)` — return component examples whose `composition` tags overlap the query. `["dialog", "destructive", "confirm"]` returns the canonical AlertDialog-with-delete-Button composition, not a bare `<Button variant="destructive">`. Ranked by overlap count.

## Prompts that "just work"

- "Find a hex-ui component for a confirmation dialog and add it"
- "Resolve this spec into hex-ui components: build a settings page with notifications toggle"
- "Walk me through the hex-ui auth-form recipe and install it"
- "Verify I have all the hex-ui internal deps for combobox"

## Pair with skills (Claude Code only)

The MCP server returns structured data. For prose reasoning context (when to pick recipe X, how themes compose, React 19 anti-patterns), the Hex UI skills pack adds Claude-Code-trigger-keyword docs alongside the typed tool calls:

```bash
npx @hex-core/cli skills install
```

The skills pack is Claude Code only today — its trigger system relies on Claude Code's prompt-rewriting hooks. Other clients in the list above run the MCP server unchanged but won't pull in the skills.

## Verifying the server speaks standard MCP

The package ships a contract test that handshakes with the server using the official `@modelcontextprotocol/sdk` Client — the same SDK every supported client uses underneath. Run it locally to confirm wiring works:

```bash
pnpm --filter @hex-core/mcp test:contract
```

A green run proves the server speaks standard MCP regardless of which downstream client opens the connection. CI runs this on every push.

## Upgrading from 0.3.0 → 0.4.0

The `npx @hex-core/mcp` binary works exactly as before — no config changes for users of the stdio MCP server. Two breaking changes affect direct importers (Next.js apps, generator scripts, CI fixtures): the pure-function builders moved to a new package `@hex-core/payload`, and the published tarball no longer ships `registry/` directly. See [MIGRATION.md](./MIGRATION.md) for the full guide and replacement code snippets.

## Docs

[hex-core.dev/docs/mcp](https://hex-core.dev/docs/mcp)

## License

MIT
