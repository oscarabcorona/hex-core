import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	affected,
	explainNode,
	loadGraph,
	type Neighbor,
	neighbors,
	relationEnum,
	shortestPath,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { toolErrorText } from "./_shared.js";

/**
 * Cap on neighbors returned per query_graph call.
 *
 * Kept, but it is NOT what protects the payload and the old comment claiming
 * so was wrong. The largest relation group in the catalog is `button.related`
 * at 32, so this cap has never once fired. What actually cost tokens was the
 * shape of each neighbor, not the count — see {@link wireNeighbor}.
 */
const QUERY_GRAPH_NEIGHBOR_CAP = 50;

/** A neighbor as it goes over the wire: enough to act on, nothing more. */
export interface WireNeighbor {
	direction: Neighbor["direction"];
	relation: string;
	slug: string;
	label: string;
	kind: string;
	category?: string;
}

/**
 * Project a graph neighbor down to the fields an agent can act on.
 *
 * `Neighbor` embeds the entire far-end `GraphNode` — including its `exports`
 * and `exportPaths` maps — plus the entire `GraphEdge`, whose `source` and
 * `target` merely restate the two slugs already present. Measured on the
 * current catalog, `explain button` shipped 78,192 bytes / 16,429 tokens, of
 * which 39 % was embedded far-end nodes. That is 8 % of a 200K context window
 * spent on one call, most of it on fields no caller reads: `poc.ts` reads
 * `exports` off the graph directly, never through `explainNode`.
 *
 * Projecting here rather than narrowing `ExplainResult` in `@hex-core/payload`
 * is deliberate. `hex graph explain` renders the rich shape to a terminal
 * where context costs nothing and the extra fields are useful; only the MCP
 * wire pays. Fixing it at the boundary that pays keeps payload's public API
 * unbroken and the CLI's output identical.
 * @param neighbor - A neighbor from `explainNode` or `neighbors`
 * @returns The wire-shaped neighbor
 */
export function wireNeighbor(neighbor: Neighbor): WireNeighbor {
	return {
		direction: neighbor.direction,
		relation: neighbor.edge.relation,
		slug: neighbor.node.slug,
		label: neighbor.node.label,
		kind: neighbor.node.kind,
		category: neighbor.node.category,
	};
}
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
						// neighborhoods in the catalog. `total` stays so a capped
						// group still reports its real size.
						const explained = explainNode(graph, slug);
						result = explained
							? {
									...explained,
									relations: explained.relations.map((group) => ({
										relation: group.relation,
										total: group.neighbors.length,
										neighbors: group.neighbors
											.slice(0, QUERY_GRAPH_NEIGHBOR_CAP)
											.map(wireNeighbor),
									})),
								}
							: null;
						break;
					}
					case "neighbors": {
						const found = neighbors(graph, slug, relations);
						result = {
							total: found.length,
							neighbors: found.slice(0, QUERY_GRAPH_NEIGHBOR_CAP).map(wireNeighbor),
						};
						break;
					}
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
