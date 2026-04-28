# @hex-core/payload

## 0.2.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.2.0

### Minor Changes

- 3524173: feat: extract @hex-core/payload — pure-function builders for paste-into-LLM payloads

  Closes findings #18 (stale-tokens drift) and #19 (no programmatic builder export)
  together. The MCP server's pure-function builders (`buildAppContext`,
  `buildFigmaTokens`, `resolveSpec`) plus the registry / recipe / theme loaders
  move to a new `@hex-core/payload` workspace package, importable directly by
  Next.js apps, generator scripts, and CI fixtures — no MCP subprocess needed.

  **New `@hex-core/payload@0.1.0`:**
  - `buildAppContext`, `buildFigmaTokens`, `buildFigmaPayload`, `resolveSpec` — pure functions
  - `getTheme`, `listThemes`, `themes` + the four transformers (`themeToCss`, `themeToFlatJson`, `themeToTailwindConfig`, `generateGlobalsCss`)
  - `loadRegistry`, `loadRegistryItem`, `loadRecipes`, `loadRecipe`, `internalDepToSlug`, `SLUG_REGEX`, `getRegistryDir`
  - All public types (`AppContextInput`, `FigmaVariablesPayload`, `RegistryIndex`, `Recipe`, etc.)
  - Bundles the registry data into the published tarball (`prebuild` cp + `files: ["dist", "registry", ...]`).
  - Depends on `@hex-core/tokens@^1.2.0` for theme data — **no inlining**.

  **Closes finding #18:** the previous `mcp-server/src/tools/theme-loader.ts` inlined
  theme data per its own comment ("to avoid runtime dependency on `@hex-core/tokens`").
  That inlining had drifted: `mcp@0.3.0` shipped pre-v1.1.1 destructive (`0 84.2%
60.2%`) and muted-foreground (`240 3.8% 46.1%`) values while consumers' installed
  `@hex-core/tokens@^1.2.0` already had the corrected values (`0 72% 45%`,
  `240 4% 38%`). After this change, payload pulls themes from `@hex-core/tokens`
  directly — single source of truth, no drift. Locked at the protocol level by a
  new contract-test assertion (`emit_app_context` output now asserted to contain
  `--destructive: 0 72% 45%` and to NOT contain the stale `0 84.2% 60.2%`).

  **Closes finding #19:** the studio (and any future generator script or CI
  fixture) can now `import { buildAppContext } from "@hex-core/payload"` rather
  than spawning an MCP subprocess + speaking JSON-RPC over stdio. The MCP server's
  binary still wraps these functions for stdio-transport consumers — both surfaces
  share one implementation.

  **Public-API change to the LLM payload format:** the emitted `## globals.css`
  block now reflects `@hex-core/tokens@^1.2.0` token values, not the frozen
  mcp@0.3.0 snapshot. Notable but non-breaking — markdown structure / section
  order / interface unchanged; only token VALUES shift to the canonical current.

  **`@hex-core/mcp@0.4.0` refactor (the bump in this changeset):**
  - All `src/tools/*.ts` source files removed (moved to payload). `tools/` directory deleted.
  - `index.ts` imports from `@hex-core/payload` — tool handlers unchanged.
  - Drops `prebuild` registry-copy script (payload owns the registry bundle now).
  - Drops `registry/` from `files` (mcp tarball ~1MB lighter; consumers pick up registry from payload's installed location via node resolution).
  - `test` script reduces to `test:contract` (other test files moved to payload).
  - New 9th contract-test assertion locks the #18 fix (proves emitted globals.css contains current tokens).
