# @hex-core/payload

[![npm version](https://img.shields.io/npm/v/@hex-core/payload.svg)](https://www.npmjs.com/package/@hex-core/payload)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Pure-function builders for Hex UI's paste-into-LLM payloads. Renders themes + components + recipes into deterministic markdown (`emit_app_context` shape) and Figma Variables REST JSON (`emit_figma_tokens` shape).

Consumed internally by [`@hex-core/mcp`](../mcp-server) for the MCP stdio server's tool handlers. **Importable directly** by Next.js apps, generator scripts, and CI fixtures that want the canonical format without the subprocess + JSON-RPC overhead of running an MCP client.

## Install

```bash
npm install @hex-core/payload
# or
pnpm add @hex-core/payload
```

## Usage

```ts
import { buildAppContext, getTheme, loadRegistryItem, loadRecipe } from "@hex-core/payload";

const theme = getTheme("default");
const components = ["button", "card"].map((slug) => ({ slug, item: loadRegistryItem(slug) }));
const recipes = ["auth-form"].map((slug) => ({ slug, recipe: loadRecipe(slug) }));

const markdown = buildAppContext({
  theme: { requested: "default", resolved: theme ?? null },
  components,
  recipes,
  overrides: { primary: "230 45% 55%" },
  density: "compact",
});

// → markdown with `## globals.css`, `## tailwind.config.ts`, `## Components`,
//   `## Recipes`, `## Install`, `## Context prompt` sections
```

For the Figma path:

```ts
import { buildFigmaTokens, getTheme } from "@hex-core/payload";

const theme = getTheme("default");
const markdown = buildFigmaTokens({
  theme: { requested: "default", resolved: theme ?? null },
});
// → markdown wrapping a JSON body shaped for Figma's POST /v1/files/:file_key/variables
```

## What's in the package

- **Builders** (`buildAppContext`, `buildFigmaTokens`, `buildFigmaPayload`) — pure functions, no I/O, snapshot-testable.
- **Resolver** (`resolveSpec`) — deterministic; reads the bundled registry on the default path. Pass `options.registry` / `options.recipes` to keep it pure.
- **Loaders** (`loadRegistry`, `loadRegistryItem`, `loadRecipes`, `loadRecipe`) — read from a registry directory bundled in the published tarball.
- **Theme accessors** (`getTheme`, `listThemes`, `themes`) — re-exports of `@hex-core/tokens`'s canonical `defaultTheme` / `midnightTheme` / `emberTheme`. **No inlining**: theme values track `@hex-core/tokens@^1.2.0` automatically.
- **Theme transformers** (`themeToCss`, `themeToFlatJson`, `themeToTailwindConfig`, `generateGlobalsCss`) — re-exported from `@hex-core/tokens`.

## Why a separate package

- The MCP server is a binary; its `package.json#exports` doesn't surface the pure-function core. Without this package, every non-MCP-client consumer (Next.js studio, CI scripts, generator CLIs) has to spawn a subprocess and speak JSON-RPC over stdio for what should be a simple function call.
- Lifting the builders out also fixes a stale-tokens drift: the prior MCP server inlined theme data and got pinned to a pre-v1.1.1 snapshot. By depending on `@hex-core/tokens` as a workspace package, this package's emitted `globals.css` always reflects the latest tokens release.

## License

MIT
