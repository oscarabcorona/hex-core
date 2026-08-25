import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `get-component-schema` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 3: get_component_schema ───

	server.registerTool(
		TOOL.GET_COMPONENT_SCHEMA,
		{
			description:
				"Get just the props, variants, slots, and AI hints for a component — without the full source code. Use this when you need to know HOW to use a component that's already installed.",
			inputSchema: z
				.object({
					name: z.string().describe("Component name"),
				})
				.strict(),
		},
		async ({ name }) => {
			const item = loadRegistryItem(name);
			if (!item) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Component "${name}" not found.`,
						},
					],
				};
			}

			const schema = {
				name: item.name,
				displayName: item.displayName,
				description: item.description,
				props: item.props,
				variants: item.variants,
				slots: item.slots,
				ai: item.ai,
				examples: item.examples,
			};

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(schema, null, 2),
					},
				],
			};
		},
	);
}
