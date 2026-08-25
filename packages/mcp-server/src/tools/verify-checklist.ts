import * as path from "node:path";
import * as fs from "node:fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	internalDepToSlug,
	loadRecipe,
	loadRegistryItem,
	SLUG_REGEX,
} from "@hex-core/payload";
import { TOOL } from "../tool-names.js";
import { registry } from "./_shared.js";

/**
 * Register the `verify-checklist` tool.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 11: verify_checklist ───

	server.registerTool(
		TOOL.VERIFY_CHECKLIST,
		{
			description:
				"Cross-check an installed component list against the registry. Reports missing internal dependencies (e.g. combobox without popover + command) and, when a recipe slug is supplied, returns the recipe's checklist items for the agent to walk. When projectRoot is supplied, also reports which component files exist under <projectRoot>/components/ui/ (opt-in; projectRoot is canonicalized with realpath and each checked path is verified to stay under it).",
			inputSchema: z
				.object({
					components: z
						.array(z.string())
						.min(1)
						.describe("Component slugs the agent claims it has installed"),
					recipe: z.string().optional().describe("Optional recipe slug for checklist lookup"),
					projectRoot: z
						.string()
						.optional()
						.describe("Absolute project root to scan for component files under components/ui/"),
				})
				.strict(),
		},
		async ({ components, recipe, projectRoot }) => {
			const installed = new Set<string>();
			const unknownComponents: string[] = [];
			const missingInternalDeps: Array<{ component: string; missing: string[] }> = [];

			for (const slug of components) {
				if (!SLUG_REGEX.test(slug)) {
					unknownComponents.push(slug);
					continue;
				}
				const item = loadRegistryItem(slug);
				if (!item) {
					unknownComponents.push(slug);
					continue;
				}
				installed.add(slug);
			}

			for (const slug of installed) {
				const item = loadRegistryItem(slug);
				if (!item) continue;
				const deps = item.dependencies?.internal ?? [];
				const missingSlugs: string[] = [];
				for (const dep of deps) {
					const depSlug = internalDepToSlug(dep);
					if (!depSlug) continue;
					if (!installed.has(depSlug)) missingSlugs.push(depSlug);
				}
				if (missingSlugs.length > 0) {
					missingInternalDeps.push({ component: slug, missing: missingSlugs });
				}
			}

			let checklist: unknown[] = [];
			let resolvedRecipe: string | null = null;
			let recipeError: "not-found" | null = null;
			if (recipe) {
				const r = loadRecipe(recipe);
				if (!r) {
					recipeError = "not-found";
				} else {
					resolvedRecipe = r.slug;
					checklist = r.checklist;
				}
			}

			// Files scan: only attempted when an absolute projectRoot is supplied.
			// Canonicalize via realpath so a symlinked root is resolved to its real
			// path before we build candidate paths. The realpath + startsWith pair
			// defends against a caller passing a root that symlinks into someone
			// else's tree — the candidate must literally live under the real root.
			const filesPresent: string[] = [];
			const filesMissing: string[] = [];
			let filesError: string | null = null;
			if (projectRoot) {
				if (!path.isAbsolute(projectRoot)) {
					filesError = "projectRoot must be absolute";
				} else {
					let resolvedRoot: string | null = null;
					try {
						resolvedRoot = fs.realpathSync(path.resolve(projectRoot));
					} catch {
						filesError = "projectRoot does not exist";
					}
					if (resolvedRoot) {
						for (const slug of installed) {
							const candidate = path.resolve(resolvedRoot, "components", "ui", `${slug}.tsx`);
							if (!candidate.startsWith(`${resolvedRoot}${path.sep}`)) continue;
							if (fs.existsSync(candidate)) {
								filesPresent.push(path.relative(resolvedRoot, candidate));
							} else {
								filesMissing.push(path.relative(resolvedRoot, candidate));
							}
						}
					}
				}
			}

			const response = {
				ok:
					unknownComponents.length === 0 &&
					missingInternalDeps.length === 0 &&
					recipeError === null &&
					filesError === null,
				installed: Array.from(installed).sort(),
				unknownComponents,
				missingInternalDeps,
				recipe: resolvedRecipe,
				recipeError,
				checklist,
				files:
					projectRoot === undefined
						? null
						: filesError
							? { error: filesError }
							: { present: filesPresent, missing: filesMissing },
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
