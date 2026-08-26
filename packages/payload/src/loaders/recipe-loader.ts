import * as fs from "node:fs";
import * as path from "node:path";
import { getRegistryDir, SLUG_REGEX } from "./registry-loader.js";

export interface RecipeStep {
	component: string;
	reason: string;
	role: "primary" | "supporting" | "optional";
}

export interface RecipeChecklistItem {
	id: string;
	check: string;
	severity: "blocker" | "warn" | "nit";
	source: "author" | "derived-mistake" | "derived-a11y";
}

export type RecipeKind = "component" | "page";
export type PageType = "landing" | "app" | "ecommerce";

/** One ordered section inside a `page` recipe. */
export interface PageSection {
	id: string;
	block: string;
	intent: string;
	role: "primary" | "supporting" | "optional";
}

/** Recommended theme for a `page` recipe. */
export interface PageTheme {
	preset: string;
	tokenBudget?: number;
}

export interface Recipe {
	slug: string;
	/** `component` (default) bundles `steps`; `page` composes `sections`. */
	kind: RecipeKind;
	title: string;
	summary: string;
	tags: string[];
	brief: string;
	steps: RecipeStep[];
	pageType?: PageType;
	theme?: PageTheme;
	sections: PageSection[];
	layout?: string;
	checklist: RecipeChecklistItem[];
	example?: string;
	tokenBudget?: number;
}

export interface RecipeIndexItem {
	slug: string;
	kind: RecipeKind;
	pageType?: PageType;
	title: string;
	summary: string;
	tags: string[];
	components: string[];
	tokenBudget?: number;
}

export interface RecipeIndex {
	name: string;
	version: string;
	items: RecipeIndexItem[];
}

/**
 * Memoized recipe index.
 *
 * `loadRecipes` re-read and re-parsed `recipes.json` on every call, and it is
 * on a per-query path: `list_recipes` calls it, and so does every
 * `resolveSpec`, which `map_application` runs once per brief segment — up to
 * twelve times for one map. Same reasoning as `cachedGraph` in
 * `graph-loader.ts`: the registry directory is bundled into the published
 * tarball and does not change under a running process.
 */
let cachedRecipes: RecipeIndex | null = null;

/**
 * Load and parse the recipe index from disk. Returns an empty index when
 * the file is absent so older registry snapshots without recipes remain
 * usable (a missing recipes file is not an error). Memoized after first read.
 * @returns The parsed recipe index
 */
export function loadRecipes(): RecipeIndex {
	if (cachedRecipes) return cachedRecipes;

	const dir = getRegistryDir();
	const indexPath = path.join(dir, "recipes.json");
	if (!fs.existsSync(indexPath)) {
		const empty: RecipeIndex = { name: "hex-core", version: "0.0.0", items: [] };
		cachedRecipes = empty;
		return empty;
	}
	const content = fs.readFileSync(indexPath, "utf-8");
	const parsed: RecipeIndex = JSON.parse(content);
	cachedRecipes = parsed;
	return parsed;
}

/**
 * Load a single compiled recipe by slug. Returns null for unknown slugs
 * or unsafe input; callers receive a typed "not found" signal rather
 * than an exception.
 * @param slug - Recipe slug (must match `SLUG_REGEX`)
 * @returns The parsed recipe, or null when the slug is invalid or missing
 */
export function loadRecipe(slug: string): Recipe | null {
	if (!SLUG_REGEX.test(slug)) return null;

	const dir = getRegistryDir();
	const recipePath = path.join(dir, "recipes", `${slug}.json`);
	if (!fs.existsSync(recipePath)) return null;

	const content = fs.readFileSync(recipePath, "utf-8");
	return JSON.parse(content);
}
