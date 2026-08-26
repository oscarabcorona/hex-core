import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry } from "./_shared.js";

/**
 * Register the `search-compositions` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 15: search_compositions ───

	server.registerTool(
		TOOL.SEARCH_COMPOSITIONS,
		{
			description:
				"Search component examples by composition tags (e.g. 'destructive', 'confirm', 'form-action', 'dashboard'). Returns examples whose `composition` array overlaps the query tags. Use this to retrieve a real composition (Button-inside-AlertDialog confirming a delete) rather than a bare primitive — the killer use case for LLMs assembling UI from intent.",
			inputSchema: z
				.object({
					tags: z
						.array(z.string().toLowerCase())
						.min(1)
						.describe("Composition tags to match (e.g. ['dialog', 'destructive']). Match is union — any tag overlap counts."),
					limit: z
						.number()
						.int()
						.min(1)
						.max(20)
						.optional()
						.default(5)
						.describe("Max examples to return (default 5)"),
				})
				.strict(),
		},
		async ({ tags, limit }) => {
			type Match = {
				component: string;
				displayName: string;
				title: string;
				description: string;
				composition: string[];
				code: string;
				overlap: number;
			};

			// `examples` is `unknown[]` on the loader-side type — re-narrow to the
			// schema-known shape at the boundary.
			type ExampleRow = {
				title: string;
				description: string;
				code: string;
				composition?: string[];
			};

			const matches: Match[] = [];
			for (const indexEntry of registry.items) {
				const item = loadRegistryItem(indexEntry.name);
				if (!item) continue;
				const examples = (item.examples ?? []) as ExampleRow[];
				for (const example of examples) {
					const composition = example.composition ?? [];
					const overlap = composition.filter((c) => tags.includes(c.toLowerCase())).length;
					if (overlap === 0) continue;
					matches.push({
						component: item.name,
						displayName: item.displayName,
						title: example.title,
						description: example.description,
						composition,
						code: example.code,
						overlap,
					});
				}
			}

			// Higher overlap first; ties broken by component name.
			matches.sort((a, b) => b.overlap - a.overlap || a.component.localeCompare(b.component));
			const trimmed = matches.slice(0, limit);

			if (trimmed.length === 0) {
				return {
					content: [
						{
							type: "text" as const,
							text: `No compositions found matching tags: ${tags.join(", ")}.`,
						},
					],
				};
			}

			return {
				content: [
					{ type: "text" as const, text: JSON.stringify(trimmed, null, 2) },
				],
			};
		},
	);
}
