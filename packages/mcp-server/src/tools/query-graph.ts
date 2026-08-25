import * as path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	affected,
	explainNode,
	loadGraph,
	neighbors,
	relationEnum,
	shortestPath,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { toolErrorText } from "./_shared.js";


/** Cap on neighbors returned per query_graph call — keeps responses inside token budgets. */
const QUERY_GRAPH_NEIGHBOR_CAP = 50;
/**
 * Register the `query-graph` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	server.registerTool(
		TOOL.QUERY_GRAPH,
		{
			description:
				"Query the catalog knowledge graph (items, recipes, theme presets; relations: requires, composes, themes, related, instead-use). Modes: explain (one node + edges grouped by relation + community peers), neighbors (adjacent nodes, optionally filtered by relation), path (shortest connection between two slugs), affected (reverse blast radius: what depends on an item). Use this instead of guessing component relationships.",
			inputSchema: z
				.object({
					mode: z
						.enum(["explain", "neighbors", "path", "affected"])
						.describe("Query mode"),
					slug: z.string().describe("Item, recipe, or theme slug to query"),
					to: z.string().optional().describe("Destination slug (path mode only)"),
					relations: z
						.array(relationEnum)
						.optional()
						.describe("Relation filter (neighbors mode only)"),
				})
				.strict(),
		},
		async ({ mode, slug, to, relations }) => {
			try {
				const graph = loadGraph();
				let result: unknown;
				switch (mode) {
					case "explain": {
						// Hub items (button, input, card…) carry the largest
						// neighborhoods in the catalog — cap per relation group so
						// one explain call can't blow an agent's context window.
						const explained = explainNode(graph, slug);
						result = explained
							? {
									...explained,
									relations: explained.relations.map((group) => ({
										relation: group.relation,
										total: group.neighbors.length,
										neighbors: group.neighbors.slice(0, QUERY_GRAPH_NEIGHBOR_CAP),
									})),
								}
							: null;
						break;
					}
					case "neighbors":
						result = neighbors(graph, slug, relations).slice(0, QUERY_GRAPH_NEIGHBOR_CAP);
						break;
					case "path": {
						if (!to) {
							return {
								content: [{ type: "text" as const, text: 'path mode requires "to".' }],
								isError: true,
							};
						}
						result = shortestPath(graph, slug, to);
						break;
					}
					case "affected":
						result = affected(graph, slug);
						break;
				}
				if (result === null) {
					return {
						content: [
							{
								type: "text" as const,
								text: `"${slug}" is not in the catalog graph. Use search_components for valid slugs.`,
							},
						],
					};
				}
				return {
					content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
				};
			} catch (err) {
				return { content: [{ type: "text" as const, text: toolErrorText(err) }], isError: true };
			}
		},
	);
}
