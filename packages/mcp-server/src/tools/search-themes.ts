import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listThemes } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `search-themes` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool: search_themes ───

	server.registerTool(
		TOOL.SEARCH_THEMES,
		{
			description:
				"Search the theme catalog by category, tags, or free-text query. Useful for AI agents that want to surface 'all fintech themes' or 'every minimalist preset' without grepping the full list. Returns the same shape as list_themes, filtered.",
			inputSchema: z
				.object({
					query: z
						.string()
						.optional()
						.describe("Substring match against name / displayName / description / brand"),
					category: z
						.enum([
							"ai",
							"dev-tools",
							"backend",
							"productivity",
							"design",
							"fintech",
							"ecommerce",
							"media",
							"automotive",
						])
						.optional()
						.describe("Filter by theme category"),
					tags: z
						.array(z.string())
						.optional()
						.describe("All listed tags must be present (intersection match)"),
				})
				.strict(),
		},
		async ({ query, category, tags }) => {
			const all = listThemes();
			const q = query?.toLowerCase().trim();
			const requiredTags = tags?.map((t) => t.toLowerCase());
			const matches = all.filter((t) => {
				if (category && t.category !== category) return false;
				if (requiredTags && requiredTags.length > 0) {
					const themeTags = (t.tags ?? []).map((tag) => tag.toLowerCase());
					if (!requiredTags.every((rt) => themeTags.includes(rt))) return false;
				}
				if (q) {
					const haystack = [t.name, t.displayName, t.description, t.brand]
						.filter(Boolean)
						.join(" ")
						.toLowerCase();
					if (!haystack.includes(q)) return false;
				}
				return true;
			});
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(matches, null, 2),
					},
				],
			};
		},
	);
}
