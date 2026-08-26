import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { wordSet } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry } from "./_shared.js";

/**
 * Default page size.
 *
 * The tool was unbounded. Called with no arguments — which is exactly how an
 * agent enumerates the catalog, and how the contract test drives it — it
 * returned all 187 summaries: 94,655 bytes / 24,018 tokens, or 12 % of a 200K
 * context window for one discovery call. `search_compositions` already
 * paginates (default 5, max 20); this follows that convention instead of
 * inventing a second one.
 */
const DEFAULT_LIMIT = 20;

/**
 * Ceiling on `limit`.
 *
 * Set above the catalog size on purpose: full enumeration stays POSSIBLE, it
 * just stops being what you get by accident. The defect was never that 187
 * rows can be asked for — the contract test legitimately needs them for its
 * all-items sweep — it was that not passing an argument returned them. An
 * explicit `limit: 200` is a caller deciding to spend the tokens.
 */
const MAX_LIMIT = 200;

/**
 * Does any word in `haystack` match this query token?
 *
 * PREFIX match on word boundaries, which is the combination discovery needs.
 * Plain substring — what this tool did — matches `"and"` against `command`
 * and `"board"` against `keyboard`, so a two-word brief drags in unrelated
 * components. Exact word equality would fix that but break partial typing,
 * and `"butt"` no longer finding `button` is a worse tool. A prefix test on
 * whole words keeps `"butt"` → `button` while dropping `"and"` → `command`,
 * because `command` does not start with `and`.
 * @param words - Word set of the field being searched
 * @param token - One lowercase query token
 * @returns True when some word starts with the token
 */
function matchesToken(words: Set<string>, token: string): boolean {
	for (const word of words) {
		if (word.startsWith(token)) return true;
	}
	return false;
}

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
				"Search for Hex Core components by name, description, category, or tags. Returns lightweight summaries for discovery, paginated: {total, returned, results}. Query words match on word-prefix boundaries, so 'butt' finds button but 'and' does not find command.",
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
					limit: z
						.number()
						.int()
						.min(1)
						.max(MAX_LIMIT)
						.optional()
						.describe(`Max results to return (default ${String(DEFAULT_LIMIT)})`),
				})
				.strict(),
		},
		async ({ query, category, tags, limit }) => {
			let items = registry.items;

			if (category) {
				items = items.filter((item) => item.category === category);
			}

			if (tags && tags.length > 0) {
				items = items.filter((item) => tags.some((tag) => item.tags.includes(tag)));
			}

			if (query) {
				// Every query token must match somewhere on the item (AND), so
				// "data table" narrows rather than widening to everything with
				// either word.
				const tokens = [...wordSet(query)];
				items = items.filter((item) => {
					const haystack = wordSet(
						`${item.name} ${item.displayName} ${item.description} ${item.tags.join(" ")}`,
					);
					return tokens.every((token) => matchesToken(haystack, token));
				});
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

			const take = limit ?? DEFAULT_LIMIT;
			const results = items.slice(0, take).map((item) => ({
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
						// `total` alongside the page: a truncated list that does not
						// say it was truncated reads as "this is everything", which
						// is how an agent concludes a component does not exist.
						text: JSON.stringify({ total: items.length, returned: results.length, results }, null, 2),
					},
				],
			};
		},
	);
}
