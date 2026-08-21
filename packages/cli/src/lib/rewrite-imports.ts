/**
 * Import-rewriting for registry sources. The implementation moved to
 * `@hex-core/payload` so the CLI, MCP `scaffold_poc`, and the POC builder
 * all rewrite identically; this module re-exports it to keep the CLI's
 * historical import path (`../lib/rewrite-imports.js`) stable.
 */
export { type AliasConfig, DEFAULT_ALIASES, rewriteRegistryImports } from "@hex-core/payload";
