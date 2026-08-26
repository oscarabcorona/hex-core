import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	generateGlobalsCss,
	getTheme,
	listThemes,
	themeToFlatJson,
	themeToTailwindConfig,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `get-theme` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 4: get_theme ───

	server.registerTool(
		TOOL.GET_THEME,
		{
			description:
				"Get a Hex Core theme in the specified format. Use 'css' for globals.css, 'json' for flat token map (most token-efficient for AI), 'tailwind' for Tailwind config extension.",
			inputSchema: z
				.object({
					name: z.string().describe("Theme name (e.g. 'default', 'midnight', 'ember')"),
					format: z
						.enum(["css", "json", "tailwind"])
						.optional()
						.default("css")
						.describe("Output format"),
					mode: z
						.enum(["light", "dark"])
						.optional()
						.default("light")
						.describe("Color mode (only for json format)"),
				})
				.strict(),
		},
		async ({ name, format, mode }) => {
			const theme = getTheme(name);
			if (!theme) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Theme "${name}" not found. Available: ${listThemes()
								.map((t) => t.name)
								.join(", ")}`,
						},
					],
				};
			}

			let output: string;
			switch (format) {
				case "css":
					output = generateGlobalsCss(theme);
					break;
				case "json":
					output = JSON.stringify(themeToFlatJson(theme, mode), null, 2);
					break;
				case "tailwind":
					output = JSON.stringify(themeToTailwindConfig(theme), null, 2);
					break;
				default:
					output = generateGlobalsCss(theme);
			}

			return {
				content: [
					{
						type: "text" as const,
						text: output,
					},
				],
			};
		},
	);
}
