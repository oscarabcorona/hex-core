import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRecipes } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `list-recipes` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 8: list_recipes ───

	server.registerTool(
		TOOL.LIST_RECIPES,
		{
			description:
				"List all Hex Core recipes — spec-driven blueprints that map a UI goal to an ordered set of components. Each entry carries `kind` (`component` = a bundle like auth-form/settings-page, `page` = a whole-page composition) and, for pages, `pageType` (`landing` | `app` | `ecommerce`). Filter by these to find the page recipe for 'build me a landing page / app / store'. Use this to discover recipes before calling get_recipe.",
			inputSchema: z.object({}).strict(),
		},
		async () => {
			const recipes = loadRecipes();
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(recipes.items, null, 2),
					},
				],
			};
		},
	);
}
