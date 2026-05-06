# Migrating to `@hex-core/mcp@0.4.0`

## TL;DR

- **The `npx @hex-core/mcp` binary works exactly as before.** No config changes for users who only use the stdio MCP server (Claude Code, Cursor, Continue, Gemini CLI, ChatGPT Desktop, Zed).
- **Pure-function builders moved.** `buildAppContext`, `buildFigmaTokens`, `buildFigmaPayload`, `resolveSpec`, the registry / recipe / theme loaders, and the theme transformers are now exported from a new package: `@hex-core/payload`.
- **Two breaking changes for direct importers** (Next.js apps, generator scripts, CI fixtures that imported builders from this package):
  - `@hex-core/mcp` no longer exports `buildAppContext` / `buildFigmaTokens` / etc. Switch to `@hex-core/payload`.
  - The published tarball no longer ships the `registry/` directory. The bundled registry now lives in `node_modules/@hex-core/payload/registry/`.

## What changed in 0.4.0

`@hex-core/mcp` is now a thin transport shell around the new `@hex-core/payload` package. The pure-function builders were extracted because:

1. **Studio + Next.js apps were trapped behind subprocess + JSON-RPC** to call functions that have no business needing stdio. The new `@hex-core/payload` exposes them as ordinary ESM imports.
2. **The mcp tarball was bundling stale theme data** (an inlined snapshot of `@hex-core/tokens` that drifted from the published version). `@hex-core/payload` depends on `@hex-core/tokens` as a workspace dep — emitted theme values now track the latest published tokens automatically.

See [HEX_CORE_FINDINGS.md](https://github.com/oscarabcorona/hex-core/blob/main/.claude/findings/hex-core-followups.md) findings #18 + #19 for the full backstory.

## Migration paths

### Path A — You only run the MCP binary (no code change)

If your `.claude/settings.json` / `.cursor/mcp.json` / etc. just calls:

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

Nothing to do. Bump the version pin if you have one, or let `npx` resolve `latest`. All 13 tools still work; the 9-assertion stdio contract test in CI verifies the protocol surface is unchanged.

### Path B — You imported builders from `@hex-core/mcp`

If your code looked like:

```ts
import { buildAppContext } from "@hex-core/mcp/dist/tools/app-context.js"; // BREAKS in 0.4.0
import { loadRegistry } from "@hex-core/mcp/dist/tools/registry-loader.js"; // BREAKS in 0.4.0
```

Replace with the new package:

```bash
npm install @hex-core/payload
```

```ts
import { buildAppContext, loadRegistry, getTheme } from "@hex-core/payload";
```

`@hex-core/payload@0.2.0` exports 7 public functions + all related types:

- **Builders:** `buildAppContext`, `buildFigmaTokens`, `buildFigmaPayload`, `resolveSpec`
- **Loaders:** `loadRegistry`, `loadRegistryItem`, `loadRecipes`, `loadRecipe`, `getRegistryDir`, `internalDepToSlug`, `SLUG_REGEX`
- **Themes:** `getTheme`, `listThemes`, `themes`, `defaultTheme`, `midnightTheme`, `emberTheme` (re-exported from `@hex-core/tokens`)
- **Theme transformers:** `themeToCss`, `themeToFlatJson`, `themeToTailwindConfig`, `generateGlobalsCss` (re-exported from `@hex-core/tokens`)

All function signatures and output shapes are identical to what `@hex-core/mcp@0.3.0` exposed internally.

### Path C — You reached into `node_modules/@hex-core/mcp/registry/`

If your build scripts / scraper code did:

```ts
import * as fs from "node:fs";
import * as path from "node:path";
const registryDir = path.join(process.cwd(), "node_modules/@hex-core/mcp/registry");
const items = fs.readdirSync(path.join(registryDir, "items")); // ENOENT in 0.4.0
```

The registry data lives one path over now:

```ts
const registryDir = path.join(process.cwd(), "node_modules/@hex-core/payload/registry");
```

Better: use `loadRegistry()` from the public API and let the package own the path resolution:

```ts
import { loadRegistry } from "@hex-core/payload";
const index = loadRegistry();
console.log(index.items.length); // 59
```

## What did NOT change

- **The 13 MCP tools** (`search_components`, `get_component`, `get_component_schema`, `get_theme`, `list_themes`, `scaffold_project`, `customize_component`, `list_recipes`, `get_recipe`, `resolve_spec`, `verify_checklist`, `emit_app_context`, `emit_figma_tokens`) — all present, all input schemas + output shapes byte-identical to 0.3.0.
- **Stdio handshake** — `npx @hex-core/mcp@0.4.0` boots and answers `tools/list` exactly as 0.3.0 did.
- **Universal client wiring** — same snippets for Claude Code / Cursor / Continue / Gemini CLI / ChatGPT Desktop / Zed; see [`@hex-core/mcp/clients`](./src/clients.ts).
- **`@hex-core/mcp/clients` re-export** — still ships the typed `MCP_CLIENTS` array for downstream docs apps.

## Verification

If your code path matches Path A above, run the standard MCP health check from your client (e.g. `/mcp` in Claude Code) — `hex-core` should report 13 tools + the `hex://catalog` resource.

If your code path matches Path B or C, run your own integration tests after the dep bump. The 19/19-check `verify-direct.mjs` + `verify-mcp.mjs` smoke harnesses in `/tmp/hex-core-payload-verify/` (see `.claude/findings/finding-5-verification.md` "2026-04-28 closing run #2") cover both consumption modes against the public-npm tarballs.

## Questions

File against [the issue tracker](https://github.com/oscarabcorona/hex-core/issues). Tag the issue with `mcp` + `migration-0.4` so the maintainers see it in the right queue.
