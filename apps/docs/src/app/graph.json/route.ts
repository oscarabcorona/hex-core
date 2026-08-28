import graph from "../../../../../registry/graph.json";

/** Prerendered — build-time import of the committed knowledge graph. */
export const dynamic = "force-static";

/**
 * The catalog knowledge graph — items, recipes, and themes as nodes with
 * `related` / `composes` / `requires` / `instead-use` / `themes` edges.
 * Agents traverse it interactively via the MCP `query_graph` tool or
 * `hex graph`; this route serves the raw graph for everything else.
 * @returns The committed `registry/graph.json`, verbatim
 */
export function GET(): Response {
	return Response.json(graph);
}
