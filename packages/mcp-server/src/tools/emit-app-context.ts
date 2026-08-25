import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	buildAppContext,
	getTheme,
	loadRecipe,
	loadRegistryItem,
	SLUG_REGEX,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * Register the `emit-app-context` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 12: emit_app_context ───

	server.registerTool(
		TOOL.EMIT_APP_CONTEXT,
		{
			description:
				"Synthesize a deterministic markdown payload describing the chosen theme, components, and recipes — formatted for paste-into-LLM workflows so a downstream agent has the full Hex Core stack in one block. Looks up each slug in the registry; unknown slugs are flagged inline rather than dropped silently. Emits ## Theme highlights, ## globals.css (full :root + .dark block with optional density vars and per-token overrides), ## tailwind.config.ts (theme.extend), ## Components, ## Recipes, ## Install, and ## Context prompt sections.",
			inputSchema: z
				.object({
					theme: z
						.string()
						.describe("Theme slug (e.g. 'default', 'midnight', 'ember')"),
					components: z
						.array(z.string())
						.min(1)
						.describe("Component slugs to include in the context"),
					recipes: z
						.array(z.string())
						.optional()
						.describe("Optional recipe slugs to include with their steps and checklists"),
					overrides: z
						.record(z.string().min(1), z.string().min(1))
						.optional()
						.describe(
							"Per-token value overrides merged onto the theme's LIGHT palette only (e.g. { primary: '230 45% 55%' }, raw HSL triplet for color tokens). Keys absent from the base palette are still injected and surface in the Tailwind config too. Dark-palette overrides are not yet supported — call the tool a second time with a dark-shaped theme, or wait for a future shape extension.",
						),
					density: z
						.enum(["compact", "comfortable", "spacious"])
						.optional()
						.describe(
							"Spacing-density preset spliced into the :root rule of globals.css. 'comfortable' matches token defaults and is omitted from the rendered block.",
						),
				})
				.strict(),
		},
		async ({ theme, components, recipes, overrides, density }) => {
			const resolvedTheme = getTheme(theme) ?? null;
			// Dedupe slugs so a payload with `["button","button"]` doesn't render
			// duplicate component cards or duplicate `cli add` arguments.
			const uniqueComponents = Array.from(new Set(components));
			const uniqueRecipes = Array.from(new Set(recipes ?? []));
			const componentSlots = uniqueComponents.map((slug) => ({
				slug,
				item: SLUG_REGEX.test(slug) ? loadRegistryItem(slug) : null,
			}));
			const recipeSlots = uniqueRecipes.map((slug) => ({
				slug,
				recipe: SLUG_REGEX.test(slug) ? loadRecipe(slug) : null,
			}));

			const markdown = buildAppContext({
				theme: { requested: theme, resolved: resolvedTheme },
				components: componentSlots,
				recipes: recipeSlots,
				overrides,
				density,
			});

			return {
				content: [{ type: "text" as const, text: markdown }],
			};
		},
	);
}
