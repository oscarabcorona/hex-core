import registryIndex from "../../../../../registry/registry.json";

/**
 * Prerendered — the index is a build-time import of the committed registry;
 * without this the handler would run (identically) on every request.
 */
export const dynamic = "force-static";

/**
 * The machine-readable catalog index — every item with name, description,
 * category, tags, and token budget. This is the entry point for agents that
 * reach Hex over HTTP instead of the MCP server; per-item payloads live at
 * `/r/{name}.json`.
 * @returns The committed `registry/registry.json`, verbatim
 */
export function GET(): Response {
	return Response.json(registryIndex);
}
