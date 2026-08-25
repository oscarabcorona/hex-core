import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { internalDepToSlug, loadRecipe, loadRegistryItem } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry } from "./_shared.js";

/**
 * Register the `get-recipe` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 9: get_recipe ───

	server.registerTool(
		TOOL.GET_RECIPE,
		{
			description:
				"Get the full Hex Core recipe in one call. Component recipes return ordered install `steps`; page recipes (`kind: \"page\"`) additionally return `pageType`, a recommended `theme` (token preset + whole-page tokenBudget), an ordered `sections` list (each a section block with an `intent` for when to keep/drop it), and a `layout` brief describing the shell + responsive order — everything an LLM needs to assemble the page. Both kinds return the union of npm/peer/internal dependencies, install commands, and a post-install checklist (author-written plus items derived from each component's commonMistakes / accessibilityNotes). Use this after list_recipes or resolve_spec to execute a blueprint.",
			inputSchema: z
				.object({
					slug: z.string().describe("Recipe slug (e.g. 'settings-page', 'auth-form')"),
				})
				.strict(),
		},
		async ({ slug }) => {
			const recipe = loadRecipe(slug);
			if (!recipe) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Recipe "${slug}" not found. Use list_recipes to discover available recipes.`,
						},
					],
				};
			}

			// Slugs the recipe installs: flat `steps` for component recipes,
			// ordered section `block`s for page recipes. Dependency union and the
			// install command derive from this combined set so a page recipe
			// resolves its section blocks' deps exactly like a component recipe.
			const recipeSlugList = [
				...recipe.steps.map((s) => s.component),
				// `?? []` guards a pre-page-system registry snapshot whose recipe
				// JSON has no `sections` key (component recipes that predate it).
				...(recipe.sections ?? []).map((s) => s.block),
			];
			const npmDeps = new Set<string>();
			const peerDeps = new Set<string>();
			const internalDeps = new Set<string>();
			const missingComponents: string[] = [];
			const recipeSlugs = new Set(recipeSlugList);

			for (const slug of recipeSlugList) {
				const item = loadRegistryItem(slug);
				if (!item) {
					missingComponents.push(slug);
					continue;
				}
				for (const dep of item.dependencies?.npm ?? []) npmDeps.add(dep);
				for (const dep of item.dependencies?.peer ?? []) peerDeps.add(dep);
				for (const dep of item.dependencies?.internal ?? []) {
					const depSlug = internalDepToSlug(dep);
					if (depSlug && !recipeSlugs.has(depSlug)) internalDeps.add(depSlug);
				}
			}

			const response = {
				slug: recipe.slug,
				kind: recipe.kind,
				title: recipe.title,
				summary: recipe.summary,
				brief: recipe.brief,
				tags: recipe.tags,
				steps: recipe.steps,
				// Page-recipe fields — present only for `kind: "page"`. `sections`
				// is the ordered composition an LLM assembles; `theme`/`layout`
				// give it the page-wide token preset and shell structure in one call.
				pageType: recipe.pageType,
				theme: recipe.theme,
				sections: recipe.sections,
				layout: recipe.layout,
				checklist: recipe.checklist,
				example: recipe.example,
				tokenBudget: recipe.tokenBudget,
				install: {
					// Page recipes install via `hex recipe add` (theme + ordered
					// sections + transitive deps); component recipes can use either.
					recipeCommand: `hex recipe add ${recipe.slug}`,
					componentCommand: `hex add ${recipeSlugList.join(" ")}`,
					npmDependencies: Array.from(npmDeps).sort(),
					peerDependencies: Array.from(peerDeps).sort(),
					internalDependencies: Array.from(internalDeps).sort(),
				},
				warnings:
					missingComponents.length > 0
						? [`Recipe references unknown components: ${missingComponents.join(", ")}`]
						: [],
			};

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(response, null, 2),
					},
				],
			};
		},
	);
}
