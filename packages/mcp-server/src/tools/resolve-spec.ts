import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveSpec } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `resolve-spec` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 10: resolve_spec ───

	server.registerTool(
		TOOL.RESOLVE_SPEC,
		{
			description:
				"Resolve a freeform brief or spec.md fragment ('build me a settings page') into a ranked shortlist of Hex Core components and recipes. Deterministic keyword + tag matching — no LLM reasoning server-side. Use this as the first step when translating a plan document into a concrete build.",
			inputSchema: z
				.object({
					brief: z
						.string()
						.min(3)
						.describe("Freeform description of the UI to build, or a spec.md section"),
					limit: z
						.number()
						.int()
						.positive()
						.max(20)
						.optional()
						.describe("Max number of component matches to return (default 8)"),
				})
				.strict(),
		},
		async ({ brief, limit }) => {
			const result = resolveSpec(brief, { limit });
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
