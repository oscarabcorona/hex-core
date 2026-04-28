/**
 * Theme accessors + transformers for `@hex-core/payload`.
 *
 * Re-exports the canonical surface from `@hex-core/tokens`: the three OSS
 * theme objects (`defaultTheme`, `midnightTheme`, `emberTheme`), the catalog
 * helpers (`themes`, `getTheme`, `listThemes`), and the four transformer
 * functions (`themeToCss`, `themeToFlatJson`, `themeToTailwindConfig`,
 * `generateGlobalsCss`).
 *
 * The previous incarnation of this file lived in `@hex-core/mcp` and inlined
 * theme data verbatim ("to avoid runtime dependency on the tokens package") —
 * that inlining drifted (finding #18 in HEX_CORE_FINDINGS.md): mcp@0.3.0
 * shipped pre-v1.1.1 destructive / muted-foreground values while consumers'
 * installed tokens already had the corrected values. Solved here by binding
 * to the canonical tokens package as a workspace dep and forwarding —
 * single source of truth, no parallel logic.
 */

export {
	defaultTheme,
	emberTheme,
	generateGlobalsCss,
	getTheme,
	listThemes,
	midnightTheme,
	themes,
	themeToCss,
	themeToFlatJson,
	themeToTailwindConfig,
} from "@hex-core/tokens";
