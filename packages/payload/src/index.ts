/**
 * `@hex-core/payload` — pure-function builders for Hex Core's paste-into-LLM
 * payloads. Renders themes + components + recipes into deterministic markdown
 * (`emit_app_context` shape) and Figma Variables REST JSON (`emit_figma_tokens`
 * shape). Consumed by `@hex-core/mcp` for the stdio server's tool handlers and
 * importable directly by Next.js apps, generator scripts, and CI fixtures.
 *
 * Builders are pure functions — caller resolves slugs into theme / registry
 * item / recipe records, builders return strings. Loaders are filesystem-
 * coupled (the registry data is bundled into this package's tarball at publish
 * time; consumers don't need to mirror it).
 */

// ─── Builders (pure functions) ───
export {
	type AppContextComponentSlot,
	type AppContextDensity,
	type AppContextInput,
	type AppContextRecipeSlot,
	type AppContextTheme,
	type AppContextToken,
	buildAppContext,
} from "./builders/app-context.js";

export {
	buildFigmaPayload,
	buildFigmaTokens,
	type FigmaPayloadResult,
	type FigmaTokensInput,
	type FigmaTokensTheme,
	type FigmaVariablesPayload,
} from "./builders/figma-tokens.js";

export {
	type ComponentMatch,
	type RecipeMatch,
	resolveSpec,
	type ResolverOptions,
	type ResolveResult,
	// Exported so `search_components` matches on word boundaries with the same
	// rules the resolver already uses, rather than growing a second, subtly
	// different matcher. See its docstring for why substring matching is wrong.
	wordSet,
} from "./builders/resolver.js";

// ─── Loaders (filesystem-coupled) ───
export {
	defaultSemanticTokens,
	getTheme,
	listThemes,
	themes,
	themeToCss,
	themeToFlatJson,
	themeToTailwindConfig,
	generateGlobalsCss,
} from "./loaders/theme-loader.js";

export {
	getRegistryDir,
	internalDepToSlug,
	loadRegistry,
	loadRegistryItem,
	type RegistryIndex,
	type RegistryItem,
	SLUG_REGEX,
} from "./loaders/registry-loader.js";

export {
	loadRecipe,
	loadRecipes,
	type PageSection,
	type PageTheme,
	type PageType,
	type Recipe,
	type RecipeChecklistItem,
	type RecipeIndex,
	type RecipeIndexItem,
	type RecipeKind,
	type RecipeStep,
} from "./loaders/recipe-loader.js";

// ─── Catalog graph (schema + loader + pure queries) ───
export {
	type CatalogGraph,
	catalogGraphSchema,
	type GraphEdge,
	graphEdgeSchema,
	type GraphNode,
	graphNodeSchema,
	type NodeKind,
	GRAPH_FORMAT_VERSION,
	nodeKindEnum,
	parseGraph,
	type Relation,
	relationEnum,
} from "./graph/graph-schema.js";

export { loadGraph } from "./graph/graph-loader.js";

export {
	affected,
	type AffectedItem,
	type AffectedResult,
	explainNode,
	type ExplainResult,
	itemId,
	type Neighbor,
	neighbors,
	nodeBySlug,
	type PathHop,
	recipeId,
	requiresClosure,
	shortestPath,
} from "./graph/graph-query.js";

// ─── Application map + POC builders (pure functions) ───
export {
	type ApplicationMap,
	buildApplicationMap,
	MAP_SCHEMA_URL,
	type MapBuilderOptions,
	mapFromRecipe,
	type MapScreen,
	mapSchema,
	MAP_FORMAT_VERSION,
	mapScreenSchema,
	parseMap,
	segmentBrief,
	stableStringifyMap,
} from "./builders/map.js";

export {
	buildPocFiles,
	type GeneratedPage,
	generatePageSource,
	type PocBuilderOptions,
	type PocBuildResult,
	type PocFile,
	type PocRoute,
} from "./builders/poc.js";

export { type AliasConfig, DEFAULT_ALIASES, rewriteRegistryImports } from "./lib/rewrite-imports.js";
export { slugify, titleFromSlug } from "./lib/slug.js";
