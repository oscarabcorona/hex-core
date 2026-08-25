import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL } from "../tool-names.js";
import { registry } from "./_shared.js";

/**
 * Register the `search-components` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 1: search_components ───

	server.registerTool(
		TOOL.SEARCH_COMPONENTS,
		{
			description:
				"Search for Hex Core components by name, description, category, or tags. Returns lightweight summaries for discovery.",
			inputSchema: z
				.object({
					query: z
						.string()
						.optional()
						.describe("Search query to match against name, description, and tags"),
					category: z
						.enum([
							"primitive",
							"component",
							"block",
							"example",
							"hook",
							"lib",
							"ai",
							"artifact",
							"motion",
						])
						.optional()
						.describe("Filter by category"),
					tags: z.array(z.string()).optional().describe("Filter by tags (matches any)"),
				})
				.strict(),
		},
		async ({ query, category, tags }) => {
			let items = registry.items;

			if (category) {
				items = items.filter((item) => item.category === category);
			}

			if (tags && tags.length > 0) {
				items = items.filter((item) => tags.some((tag) => item.tags.includes(tag)));
			}

			if (query) {
				const q = query.toLowerCase();
				items = items.filter(
					(item) =>
						item.name.includes(q) ||
						item.displayName.toLowerCase().includes(q) ||
						item.description.toLowerCase().includes(q) ||
						item.tags.some((t) => t.includes(q)),
				);
			}

			if (items.length === 0) {
				return {
					content: [
						{
							type: "text" as const,
							text: "No components found matching your query.",
						},
					],
				};
			}

			const results = items.map((item) => ({
				name: item.name,
				displayName: item.displayName,
				description: item.description,
				category: item.category,
				subcategory: item.subcategory,
				tags: item.tags,
				tokenBudget: item.tokenBudget,
			}));

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(results, null, 2),
					},
				],
			};
		},
	);
}
