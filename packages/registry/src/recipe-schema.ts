import { z } from "zod";

/**
 * Shared slug format for every registry identifier (component names,
 * recipe slugs, internal dep translations). Single source of truth so
 * authoring, CLI, and MCP all validate against the same regex.
 */
export const SLUG_REGEX = /^[a-z][a-z0-9-]*$/;

/**
 * Translate an internal dependency path ("components/command/command",
 * "primitives/button/button") into its component slug. Returns null for
 * non-component internal deps such as "lib/utils" so callers can skip
 * them in dependency-completeness checks. Shared across MCP server and
 * CLI so both use the same translation.
 * @param dep - Internal dependency path as stored in registry items
 * @returns The component slug, or null when the path doesn't name a component
 */
export function internalDepToSlug(dep: string): string | null {
	const segments = dep.split("/");
	if (segments.length !== 3) return null;
	const [top] = segments;
	if (top !== "components" && top !== "primitives" && top !== "blocks" && top !== "artifacts") return null;
	const slug = segments[2];
	return SLUG_REGEX.test(slug) ? slug : null;
}

/**
 * One ordered step inside a recipe. Each step points at an existing component
 * slug in the registry; the resolver rejects recipes that reference unknown
 * slugs so a compiled recipe can never drift from the component catalog.
 */
export const recipeStepSchema = z.object({
	component: z.string().regex(SLUG_REGEX),
	reason: z.string().min(1),
	role: z.enum(["primary", "supporting", "optional"]).default("supporting"),
});

export type RecipeStep = z.infer<typeof recipeStepSchema>;

/**
 * A post-install checklist item. `source` distinguishes items the recipe
 * author wrote by hand from items the build step lifted out of the
 * component schemas' `commonMistakes` / `accessibilityNotes` fields, so the
 * UI and MCP responses can surface that provenance.
 */
export const recipeChecklistItemSchema = z.object({
	id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/), // allows leading digit (suffix numeric ids OK)
	check: z.string().min(1),
	severity: z.enum(["blocker", "warn", "nit"]).default("warn"),
	source: z.enum(["author", "derived-mistake", "derived-a11y"]),
});

export type RecipeChecklistItem = z.infer<typeof recipeChecklistItemSchema>;

/**
 * Authored recipe shape consumed by `.recipe.ts` files. Checklist items can
 * be omitted at authoring time and filled in by the build step; the
 * compiled recipe always has at least the derived checklist items.
 */
export const recipeSchemaDefinition = z.object({
	slug: z.string().regex(SLUG_REGEX),
	title: z.string().min(1),
	summary: z.string().min(1),
	tags: z.array(z.string()).default([]),
	brief: z.string().min(1),
	steps: z.array(recipeStepSchema).min(1),
	checklist: z.array(recipeChecklistItemSchema).default([]),
	example: z.string().optional(),
	tokenBudget: z.number().int().positive().optional(),
});

export type RecipeDefinition = z.infer<typeof recipeSchemaDefinition>;

/** Compiled recipe emitted to `registry/recipes/<slug>.json`. */
export const recipeSchema = z.object({
	$schema: z.string().default("https://hex-core.dev/schema/recipe.json"),
	slug: z.string().regex(SLUG_REGEX),
	title: z.string(),
	summary: z.string(),
	tags: z.array(z.string()),
	brief: z.string(),
	steps: z.array(recipeStepSchema),
	checklist: z.array(recipeChecklistItemSchema),
	example: z.string().optional(),
	tokenBudget: z.number().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

/** Lightweight catalog entry written to `registry/recipes.json`. */
export const recipeIndexItemSchema = z.object({
	slug: z.string(),
	title: z.string(),
	summary: z.string(),
	tags: z.array(z.string()),
	components: z.array(z.string()),
	tokenBudget: z.number().optional(),
});

export type RecipeIndexItem = z.infer<typeof recipeIndexItemSchema>;

export const recipeIndexSchema = z.object({
	$schema: z.string().default("https://hex-core.dev/schema/recipes.json"),
	name: z.string(),
	version: z.string(),
	items: z.array(recipeIndexItemSchema),
});

export type RecipeIndex = z.infer<typeof recipeIndexSchema>;
