import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildApplicationMap, neighbors } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry, toolErrorText } from "./_shared.js";

/**
 * Register the `map-application` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 17: map_application ───

	server.registerTool(
		TOOL.MAP_APPLICATION,
		{
			description:
				"Map a whole-application brief onto the catalog: segments the brief, types each segment as a page-recipe / recipe / components screen, and returns screens + a requires-closure install manifest + related-component suggestions + anti-pattern warnings + merged checklist + token budgets. Deterministic — same brief and registry always produce the same map. Use this before multi-page scaffolds; feed the result to scaffold_poc or save it as hex.map.json for `hex add --from` / `hex poc --from`.",
			inputSchema: z
				.object({
					brief: z
						.string()
						.min(3)
						.describe("Freeform description of the application to build (multiple screens welcome)"),
					limit: z
						.number()
						.int()
						.positive()
						.max(20)
						.optional()
						.describe("Per-segment component-match limit (default 8)"),
				})
				.strict(),
		},
		async ({ brief, limit }) => {
			try {
				const map = buildApplicationMap(brief, { limit });
				return {
					content: [{ type: "text" as const, text: JSON.stringify(map, null, 2) }],
				};
			} catch (err) {
				return { content: [{ type: "text" as const, text: toolErrorText(err) }], isError: true };
			}
		},
	);

	// ─── Tool 18: query_graph ───

	/** Cap on neighbors returned per query_graph call — keeps responses inside token budgets. */
	const QUERY_GRAPH_NEIGHBOR_CAP = 50;
}
