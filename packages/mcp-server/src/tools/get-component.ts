import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `get-component` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 2: get_component ───

	server.registerTool(
		TOOL.GET_COMPONENT,
		{
			description:
				"Get the full Hex Core component definition including source code, props, variants, examples, and AI hints. Use this to install a component into a project.",
			inputSchema: z
				.object({
					name: z.string().describe("Component name (e.g. 'button', 'input', 'label')"),
					includeExamples: z
						.boolean()
						.optional()
						.default(true)
						.describe("Include usage examples"),
				})
				.strict(),
		},
		async ({ name, includeExamples }) => {
			const item = loadRegistryItem(name);
			if (!item) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Component "${name}" not found. Use search_components to discover available components.`,
						},
					],
				};
			}

			const result = includeExamples ? item : { ...item, examples: [] };

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		},
	);
}
