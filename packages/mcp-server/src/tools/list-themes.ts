import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listThemes } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `list-themes` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 5: list_themes ───

	server.registerTool(
		TOOL.LIST_THEMES,
		{
			description:
				"List all available Hex Core themes with names, descriptions, and (when set) category + tags + attribution. Includes 71 brand-derived voltagent presets (Tesla, Stripe, Linear, …) plus first-party themes (default, midnight, ember). Brand presets are style references inspired by publicly visible design systems — not endorsements; trademarks belong to their respective owners.",
			inputSchema: z.object({}).strict(),
		},
		async () => {
			const themeList = listThemes();
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(themeList, null, 2),
					},
				],
			};
		},
	);
}
