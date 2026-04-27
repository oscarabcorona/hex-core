---
"@hex-core/mcp": minor
---

feat(mcp): universal client support — six MCP clients verified, contract test in CI

Closes Theme C of the internal roadmap. The runtime was already universal (stdio-only `StdioServerTransport`, 12 client-agnostic tools, no Claude-specific code paths in `src/`) but the docs and metadata leaked Claude Code framing — only Claude Code and Cursor wiring snippets shipped, despite README copy claiming broader support.

This change replaces the duplicated snippets with a single source of truth and adds protocol-level proof that the server speaks standard MCP regardless of which downstream client opens the connection.

**New: `MCP_CLIENTS` data file**

[packages/mcp-server/src/clients.ts](packages/mcp-server/src/clients.ts) exports a typed array of 6 client wirings — Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed — each carrying `configPath`, `format` (json / jsonc / yaml), `topLevelKey`, ready-to-paste `snippet`, `schemaStability`, `verifiedOn` (for the four volatile schemas), upstream `docsUrl`, and a `quirks` list. Re-exported via `package.json` `exports["./clients"]` so the docs app imports it as `@hex-core/mcp/clients`. Both the regenerated README and the [docs page](apps/docs/src/app/docs/mcp/page.tsx) render from this single array — no duplicate snippets.

**Per-client correctness**

Every snippet uses `npx -y @hex-core/mcp` (the `-y` flag prevents the first-run npx prompt from hanging stdio MCP clients). The four volatile-schema clients (Continue, Gemini CLI, ChatGPT Desktop, Zed) carry a `Verified 2026-04-27` badge so quarterly research-cadence refreshes can spot stale entries. Zed's `context_servers` (NOT `mcpServers`) and `source: "custom"` quirks are explicitly called out in both the README and the docs page.

**Contract test**

[packages/mcp-server/src/contract.test.ts](packages/mcp-server/src/contract.test.ts) drives the built server with the official `@modelcontextprotocol/sdk` Client over stdio — the same SDK every supported client uses underneath. A green run proves five end-to-end assertions:

1. `initialize` handshake completes
2. `tools/list` returns exactly the 12 canonical names from [src/tool-names.ts](packages/mcp-server/src/tool-names.ts) (set-equal, order-insensitive)
3. `tools/call list_themes` returns content where `content[0].text` parses as a JSON array
4. `resources/list` includes an entry with `uri === "hex://catalog"`
5. `client.close()` disposes the transport without throwing

The test runs in CI via the existing `pnpm test` cascade — no workflow changes needed. Build runs first, so `dist/contract-test.js` exists by the time the test fires.

**README regeneration**

[packages/mcp-server/scripts/build-readme.mjs](packages/mcp-server/scripts/build-readme.mjs) parses `clients.ts` and splices snippets into [packages/mcp-server/README.template.md](packages/mcp-server/README.template.md) at the `<!-- @generated:client-wiring -->` marker. Wired into the package's `build` script so README and the data file can never drift.

**Metadata cleanup**

`package.json` description switched from "Ships 12 tools over the registry for Claude Code / Cursor / any MCP client" to **"Universal MCP server for Hex UI — runs on Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, and Zed. 12 tools over the component registry."** Keywords drop `claude-code` and `cursor`; add `mcp-client-agnostic`.

Theme C success signal hit: **6/6 clients verified, zero Claude-only codepaths**.
