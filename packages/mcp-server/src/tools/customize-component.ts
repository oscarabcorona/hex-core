import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `customize-component` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 7: customize_component ───

	server.registerTool(
		TOOL.CUSTOMIZE_COMPONENT,
		{
			description:
				"Get a component with customizations applied. Specify CSS variable overrides or additional Tailwind classes to inject.",
			inputSchema: z
				.object({
					name: z.string().describe("Component name"),
					cssOverrides: z
						.record(
							z.string(),
							z.object({
								light: z.string(),
								dark: z.string(),
							}),
						)
						.optional()
						.describe(
							"CSS variable overrides (e.g. { '--primary': { light: '220 90% 56%', dark: '220 80% 66%' } })",
						),
					additionalClasses: z
						.string()
						.optional()
						.describe("Additional Tailwind classes to add to the root element"),
				})
				.strict(),
		},
		async ({ name, cssOverrides, additionalClasses }) => {
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

			const result: Record<string, unknown> = { ...item };

			if (cssOverrides) {
				result.cssVariables = {
					...(item.cssVariables ?? {}),
					...cssOverrides,
				};
			}

			if (additionalClasses) {
				result.customization = {
					additionalClasses,
					note: `Add "${additionalClasses}" to the component's root className to apply customization.`,
				};
			}

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
