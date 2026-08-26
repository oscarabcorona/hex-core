import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	buildApplicationMap,
	buildPocFiles,
	mapFromRecipe,
	parseMap,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry, toolErrorText } from "./_shared.js";

/**
 * Register the `scaffold-poc` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 19: scaffold_poc ───

	server.registerTool(
		TOOL.SCAFFOLD_POC,
		{
			description:
				"Generate the complete file tree of a standalone runnable Next.js App Router demo app (the POC / 'demo side' of a mapped application): configs, theme globals.css, copied component sources with rewritten imports, and one generated route per page-recipe screen assembled from schema examples. Pass exactly one of brief (mapped via map_application's pipeline), map (a hex.map.json object), or recipe (a page-recipe slug). Returns JSON — no files are written; write the files yourself or run `hex poc` for the CLI equivalent.",
			inputSchema: z
				.object({
					brief: z.string().min(3).optional().describe("Freeform application brief to map and scaffold"),
					map: z
						.record(z.string(), z.unknown())
						.optional()
						.describe(
							"An application map object (the parsed contents of a hex.map.json). Required top-level keys: version, brief, screens, theme, install, suggestions, warnings, checklist, tokenBudget — call map_application to produce one.",
						),
					recipe: z.string().optional().describe("A single recipe slug to scaffold (e.g. landing-page)"),
					theme: z.string().optional().describe("Theme preset override (default: the map's preset)"),
					name: z.string().optional().describe("App name for package.json (default: hex-poc)"),
				})
				.strict(),
		},
		async ({ brief, map, recipe, theme, name }) => {
			const sources = [brief, map, recipe].filter((s) => s !== undefined).length;
			if (sources !== 1) {
				return {
					content: [
						{ type: "text" as const, text: "Pass exactly one of: brief, map, or recipe." },
					],
				};
			}
			let applicationMap;
			try {
				if (map !== undefined) {
					const parsed = parseMap(map);
					if (!parsed.success) {
						return {
							content: [{ type: "text" as const, text: `Map is malformed: ${parsed.error}` }],
							isError: true,
						};
					}
					applicationMap = parsed.data;
				} else if (recipe !== undefined) {
					applicationMap = mapFromRecipe(recipe);
				} else {
					applicationMap = buildApplicationMap(brief ?? "");
				}
				if (applicationMap.screens.length === 0) {
					return {
						content: [
							{
								type: "text" as const,
								text: "The brief mapped to no screens — call map_application first to tune the mapping.",
							},
						],
					};
				}
				const result = buildPocFiles(applicationMap, { theme, appName: name });
				return {
					content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
				};
			} catch (err) {
				return { content: [{ type: "text" as const, text: toolErrorText(err) }], isError: true };
			}
		},
	);

	// ─── Resources ───

	server.resource(
		"catalog",
		"hex://catalog",
		{
			description: "Full Hex Core component catalog — lightweight index of all available components",
			mimeType: "application/json",
		},
		async () => ({
			contents: [
				{
					uri: "hex://catalog",
					mimeType: "application/json",
					text: JSON.stringify(registry, null, 2),
				},
			],
		}),
	);

	// ─── Start Server ───

	/** Initialize the MCP stdio transport and start the Hex Core server. */
}
