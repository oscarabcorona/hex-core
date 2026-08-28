import recipesIndex from "../../../../../registry/recipes.json";

/** Prerendered — build-time import of the committed recipes index. */
export const dynamic = "force-static";

/**
 * The recipes index — component- and page-recipes with slugs, summaries,
 * and component lists. Full blueprints ship with `@hex-core/cli` and the MCP
 * server's `get_recipe`.
 * @returns The committed `registry/recipes.json`, verbatim
 */
export function GET(): Response {
	return Response.json(recipesIndex);
}
