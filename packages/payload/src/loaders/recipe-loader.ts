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

export interface Recipe {
	slug: string;
	title: string;
	summary: string;
	tags: string[];
	brief: string;
	steps: RecipeStep[];
	checklist: RecipeChecklistItem[];
	example?: string;
	tokenBudget?: number;
}

export interface RecipeIndexItem {
	slug: string;
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
 * Load and parse the recipe index from disk. Returns an empty index when
 * the file is absent so older registry snapshots without recipes remain
 * usable (a missing recipes file is not an error).
 * @returns The parsed recipe index
 */
export function loadRecipes(): RecipeIndex {
	const dir = getRegistryDir();
	const indexPath = path.join(dir, "recipes.json");
	if (!fs.existsSync(indexPath)) {
		return { name: "hex-ui", version: "0.0.0", items: [] };
	}
	const content = fs.readFileSync(indexPath, "utf-8");
	return JSON.parse(content);
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
