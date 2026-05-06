# @hex-core/mcp

[![npm](https://img.shields.io/npm/v/@hex-core/mcp.svg)](https://www.npmjs.com/package/@hex-core/mcp)
[![downloads](https://img.shields.io/npm/dm/@hex-core/mcp.svg)](https://www.npmjs.com/package/@hex-core/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Universal MCP server for Hex Core. Gives any MCP-capable AI agent — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — structured access to the component registry. No prose scraping, no copy-paste.

## Install

Zero install — just run via npx:

```bash
npx -y @hex-core/mcp
```

## Wire into your client

Pick your client below. Every snippet calls the same `npx -y @hex-core/mcp`; the only thing that changes is where the config file lives and what key it uses.

### Claude Code

Config: `.claude/settings.json`  
Project-scoped; for global wiring use ~/.claude/settings.json.

```json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}
```


Docs: [https://docs.anthropic.com/en/docs/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)

### Cursor

Config: `.cursor/mcp.json`  
Project-scoped; for all projects use ~/.cursor/mcp.json.

```json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}
```


Docs: [https://docs.cursor.com/context/model-context-protocol](https://docs.cursor.com/context/model-context-protocol)

### Continue _(verified 2026-04-27)_

Config: `~/.continue/config.yaml`  
Continue migrated from JSON to YAML; the legacy ~/.continue/config.json still works for older builds.

```yaml
mcpServers:
  - name: hex-core
    command: npx
    args:
      - -y
      - "@hex-core/mcp"
```

- Config is a YAML list of server objects, not a map keyed by name.
- Restart Continue after editing — it doesn't hot-reload MCP servers.

Docs: [https://docs.continue.dev/customize/deep-dives/mcp](https://docs.continue.dev/customize/deep-dives/mcp)

### Gemini CLI _(verified 2026-04-27)_

Config: `~/.gemini/settings.json`  
Global scope; project-scoped wiring goes in .gemini/settings.json at the repo root.

```json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}
```

- Each server entry also accepts `cwd` and `env` siblings to `command` and `args`.

Docs: [https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md)

### ChatGPT Desktop _(verified 2026-04-27)_

Config: `~/Library/Application Support/ChatGPT/mcp.json`  
macOS path; Windows: %APPDATA%\ChatGPT\mcp.json. MCP support requires Developer Mode in ChatGPT Desktop settings.

```json
{
  "mcpServers": {
    "hex-core": {
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}
```

- Toggle Developer Mode under Settings → Beta features before mcp.json is read.
- Stdio servers only — HTTP/SSE transports are not yet supported on Desktop.

Docs: [https://platform.openai.com/docs/mcp](https://platform.openai.com/docs/mcp)

### Zed _(verified 2026-04-27)_

Config: `~/.config/zed/settings.json`  
Open via Cmd+, in Zed; the file is plain JSONC (comments + trailing commas allowed).

```jsonc
{
  "context_servers": {
    "hex-core": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}
```

- Zed uses `context_servers`, NOT `mcpServers` — every other client uses the latter.
- `source: "custom"` is required so Zed treats the entry as a user-defined server (not an extension).

Docs: [https://zed.dev/docs/assistant/model-context-protocol](https://zed.dev/docs/assistant/model-context-protocol)


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

- "Find a hex-core component for a confirmation dialog and add it"
- "Resolve this spec into hex-core components: build a settings page with notifications toggle"
- "Walk me through the hex-core auth-form recipe and install it"
- "Verify I have all the hex-core internal deps for combobox"

## Pair with skills (Claude Code only)

The MCP server returns structured data. For prose reasoning context (when to pick recipe X, how themes compose, React 19 anti-patterns), the Hex Core skills pack adds Claude-Code-trigger-keyword docs alongside the typed tool calls:

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
