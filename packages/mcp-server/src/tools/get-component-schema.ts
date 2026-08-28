import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadRegistryItem, type RegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * The subset of a registry item that `get_component_schema` puts on the wire.
 * Everything an agent needs to USE an installed component — and nothing it
 * doesn't (no source files). Exported so measurement and quality tooling
 * (`scripts/audit-tokens.ts`, `scripts/verify-schema-quality.ts`) report
 * against the exact shape this tool serves instead of re-deriving a copy
 * that would drift.
 * @param item - The full registry item
 * @returns The wire-shape object the tool serializes
 */
export function schemaWireShape(
	item: Pick<
		RegistryItem,
		"name" | "displayName" | "description" | "props" | "variants" | "slots" | "ai" | "examples"
	>,
): Record<string, unknown> {
	return {
		name: item.name,
		displayName: item.displayName,
		description: item.description,
		props: item.props,
		variants: item.variants,
		slots: item.slots,
		ai: item.ai,
		examples: item.examples,
	};
}

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

			const schema = schemaWireShape(item);

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
