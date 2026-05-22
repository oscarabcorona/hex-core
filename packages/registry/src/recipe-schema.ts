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
 * Recipe kind. `component` recipes (the default, and every recipe shipped
 * before the page-recipe system) bundle a flat set of components via
 * `steps`. `page` recipes describe a whole page: an ordered list of section
 * blocks (`sections`), a recommended theme, and a layout brief — the unit an
 * LLM installs when a user asks for a "landing page" / "app" / "store".
 */
export const recipeKindEnum = z.enum(["component", "page"]);
export type RecipeKind = z.infer<typeof recipeKindEnum>;

/** Page archetype a `page` recipe targets — drives MCP/CLI discovery. */
export const pageTypeEnum = z.enum(["landing", "app", "ecommerce"]);
export type PageType = z.infer<typeof pageTypeEnum>;

/**
 * One ordered section inside a `page` recipe. `block` points at a section
 * block slug in the registry (validated by the build step exactly like
 * `recipeStepSchema.component`), so a page can never drift from the block
 * catalog. `intent` is the AI-facing one-liner for when to keep/drop the
 * section; `role` mirrors the step roles so optional sections are skippable.
 */
export const pageSectionSchema = z.object({
	id: z.string().regex(SLUG_REGEX),
	block: z.string().regex(SLUG_REGEX),
	intent: z.string().min(1),
	role: z.enum(["primary", "supporting", "optional"]).default("supporting"),
});

export type PageSection = z.infer<typeof pageSectionSchema>;

/**
 * Recommended theme for a `page` recipe. `preset` names a token preset the
 * page was designed against; `tokenBudget` is the whole-page estimate so an
 * LLM can size context before pulling every section. Marketing pages need
 * the rich `--chart-*` palette, not just semantic tokens — surface that here.
 */
export const pageThemeSchema = z.object({
	preset: z.string().min(1),
	tokenBudget: z.number().int().positive().optional(),
});

export type PageTheme = z.infer<typeof pageThemeSchema>;

/**
 * Authored recipe shape consumed by `.recipe.ts` files. Checklist items can
 * be omitted at authoring time and filled in by the build step; the
 * compiled recipe always has at least the derived checklist items.
 *
 * Page-recipe fields (`pageType`, `theme`, `sections`, `layout`) are optional
 * and only meaningful when `kind` is `page`. The refinement enforces the
 * invariant per kind so a `component` recipe still requires `steps` (every
 * pre-existing recipe stays valid) and a `page` recipe requires `sections`.
 */
export const recipeSchemaDefinition = z
	.object({
		slug: z.string().regex(SLUG_REGEX),
		kind: recipeKindEnum.default("component"),
		title: z.string().min(1),
		summary: z.string().min(1),
		tags: z.array(z.string()).default([]),
		brief: z.string().min(1),
		steps: z.array(recipeStepSchema).default([]),
		pageType: pageTypeEnum.optional(),
		theme: pageThemeSchema.optional(),
		sections: z.array(pageSectionSchema).default([]),
		layout: z.string().optional(),
		checklist: z.array(recipeChecklistItemSchema).default([]),
		example: z.string().optional(),
		tokenBudget: z.number().int().positive().optional(),
	})
	.superRefine((recipe, ctx) => {
		if (recipe.kind === "component" && recipe.steps.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["steps"],
				message: "component recipes require at least one step",
			});
		}
		if (recipe.kind === "page" && recipe.sections.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["sections"],
				message: "page recipes require at least one section",
			});
		}
	});

/**
 * Authoring type for `.recipe.ts` files — the schema **input**, so fields
 * with defaults (`kind`, `tags`, `steps`, `sections`, `checklist`) are
 * optional at authoring time. The build step parses to the output type
 * (defaults applied) before emitting. Using `z.input` here is what keeps
 * every pre-existing recipe valid after `kind`/`sections` were added.
 */
export type RecipeDefinition = z.input<typeof recipeSchemaDefinition>;

/** Compiled recipe emitted to `registry/recipes/<slug>.json`. */
export const recipeSchema = z.object({
	$schema: z.string().default("https://hex-core.dev/schema/recipe.json"),
	slug: z.string().regex(SLUG_REGEX),
	kind: recipeKindEnum.default("component"),
	title: z.string(),
	summary: z.string(),
	tags: z.array(z.string()),
	brief: z.string(),
	steps: z.array(recipeStepSchema),
	pageType: pageTypeEnum.optional(),
	theme: pageThemeSchema.optional(),
	sections: z.array(pageSectionSchema).default([]),
	layout: z.string().optional(),
	checklist: z.array(recipeChecklistItemSchema),
	example: z.string().optional(),
	tokenBudget: z.number().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

/**
 * Lightweight catalog entry written to `registry/recipes.json`. `kind` and
 * `pageType` let MCP/CLI filter page recipes without loading each compiled
 * recipe; `components` is the union of step components and section blocks so
 * existing consumers that only read `components` keep working.
 */
export const recipeIndexItemSchema = z.object({
	slug: z.string(),
	kind: recipeKindEnum.default("component"),
	pageType: pageTypeEnum.optional(),
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
