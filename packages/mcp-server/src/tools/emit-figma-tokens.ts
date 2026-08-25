import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildFigmaTokens, getTheme } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `emit-figma-tokens` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 13: emit_figma_tokens ───

	server.registerTool(
		TOOL.EMIT_FIGMA_TOKENS,
		{
			description:
				"Render a Hex Core theme as a Figma Variables REST POST payload. Output is markdown wrapping a JSON body shaped for `POST /v1/files/:file_key/variables` — one collection (Hex Core — <theme>), two modes (Light + Dark), one variable per token (typed COLOR for color tokens, FLOAT for radius/spacing/dimension/duration/font), and one mode-value per (variable × mode). Paste into a Figma plugin or curl call to get a populated Variables kit. Unknown theme slugs are flagged inline rather than dropped silently.",
			inputSchema: z
				.object({
					theme: z
						.string()
						.describe("Theme slug (e.g. 'default', 'midnight', 'ember')"),
				})
				.strict(),
		},
		async ({ theme }) => {
			const resolvedTheme = getTheme(theme) ?? null;
			const markdown = buildFigmaTokens({
				theme: { requested: theme, resolved: resolvedTheme },
			});
			return {
				content: [{ type: "text" as const, text: markdown }],
			};
		},
	);
}
