import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { variantSchema } from "@hex-core/registry";
import { defaultSemanticTokens, loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `describe-intent` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 14: describe_intent ───

	server.registerTool(
		TOOL.DESCRIBE_INTENT,
		{
			description:
				"Return the AI-native intent payload for a component: per-variant `useWhen` strings, structured `antiPatterns` (with the suggested `insteadUse` slug), `commonMistakes` notes, and the slice of `defaultSemanticTokens` that names the component's tokens by intent. Call this BEFORE generating JSX — the per-variant intent + structured anti-patterns prevent the canonical LLM failure modes (picking destructive for recoverable actions, picking Slider for booleans, nesting Cards). Pair with `get_component_schema` when you need props/types for an already-installed component; `describe_intent` is the intent-first surface for assembly.",
			inputSchema: z
				.object({
					name: z.string().describe("Component slug (e.g. 'button', 'dialog', 'switch')"),
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
							text: `Component "${name}" not found. Use search_components to discover available components.`,
						},
					],
				};
			}

			const semanticPrefix = `${item.name}.`;
			const relevantSemantic = Object.fromEntries(
				Object.entries(defaultSemanticTokens).filter(([key]) =>
					key.startsWith(semanticPrefix),
				),
			);

			// Validate variants + examples through the canonical Zod schemas
			// rather than casting `unknown[]` blind. A future component that
			// emits a non-conformant row gets a structured error instead of a
			// runtime TypeError inside the .map() loops.
			const variantsParse = z.array(variantSchema).safeParse(item.variants);
			if (!variantsParse.success) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Component "${name}" has malformed variants: ${variantsParse.error.message}`,
						},
					],
				};
			}

			const intent = {
				name: item.name,
				displayName: item.displayName,
				whenToUse: item.ai.whenToUse,
				whenNotToUse: item.ai.whenNotToUse,
				variants: variantsParse.data.map((v) => ({
					name: v.name,
					default: v.default,
					values: v.values.map((value) => ({
						value: value.value,
						useWhen: value.useWhen ?? null,
					})),
				})),
				antiPatterns: (item.ai as { antiPatterns?: unknown[] }).antiPatterns ?? [],
				commonMistakes: item.ai.commonMistakes ?? [],
				semanticTokens: relevantSemantic,
				relatedComponents: item.ai.relatedComponents,
				coverage: {
					// Surfaces the intent-rollout state so callers know whether
					// to trust the absence of antiPatterns ("intentionally none")
					// vs treat it as a TODO ("schema not yet enriched").
					// 12 of 187 items today; rolls up as future PRs enrich more
					// schemas. (Was recorded as "5/47 at 0.4.0" — the ratio moved
					// in both directions since, so the old figure implied roughly
					// four times the coverage that actually exists.)
					hasAntiPatterns:
						Array.isArray((item.ai as { antiPatterns?: unknown[] }).antiPatterns) &&
						((item.ai as { antiPatterns?: unknown[] }).antiPatterns?.length ?? 0) > 0,
					hasVariantUseWhen: variantsParse.data.some((v) =>
						v.values.some((vv) => typeof vv.useWhen === "string"),
					),
					hasSemanticTokens: Object.keys(relevantSemantic).length > 0,
				},
			};

			return {
				content: [
					{ type: "text" as const, text: JSON.stringify(intent, null, 2) },
				],
			};
		},
	);
}
