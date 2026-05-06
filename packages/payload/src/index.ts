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
	type Recipe,
	type RecipeChecklistItem,
	type RecipeIndex,
	type RecipeIndexItem,
	type RecipeStep,
} from "./loaders/recipe-loader.js";
