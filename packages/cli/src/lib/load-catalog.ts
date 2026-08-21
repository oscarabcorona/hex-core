import * as fs from "node:fs";
import * as path from "node:path";
import {
	type CatalogGraph,
	parseGraph,
	type Recipe,
	type RecipeIndex,
	type RegistryIndex,
	type RegistryItem,
} from "@hex-core/payload";
import { SLUG_REGEX } from "@hex-core/registry";
import { z } from "zod";
import { findRegistryDir } from "./registry-dir.js";

/**
 * Everything the map / poc / graph commands need from the registry
 * directory, loaded once through the CLI's own candidate resolution so
 * the bundled-tarball path stays authoritative (payload's fallback
 * loaders would resolve relative to payload's install location instead).
 */
export interface Catalog {
	/** Absolute path of the registry directory that won the candidate probe. */
	registryDir: string;
	registry: RegistryIndex;
	recipes: RecipeIndex;
	graph: CatalogGraph;
	/** Compiled-recipe loader bound to `registryDir`. */
	loadRecipe: (slug: string) => Recipe | null;
	/** Full-item loader bound to `registryDir`. */
	loadItem: (slug: string) => RegistryItem | null;
}

/**
 * Load the registry index, recipe index, and catalog graph from the CLI's
 * registry directory, plus per-slug loaders bound to that directory.
 * Exits with an actionable message when the registry or graph is missing
 * (a graph-less registry means a stale CLI tarball).
 * @returns The loaded catalog
 */
export function loadCatalog(): Catalog {
	const registryDir = findRegistryDir();
	if (!registryDir) {
		console.error("Could not find registry. Reinstall @hex-core/cli.");
		process.exit(1);
	}

	const graphPath = path.join(registryDir, "graph.json");
	if (!fs.existsSync(graphPath)) {
		console.error(`Registry at ${registryDir} has no graph.json.`);
		console.error(
			"Update @hex-core/cli to a version that ships the catalog graph, or run `pnpm run build:registry` in the monorepo.",
		);
		process.exit(1);
	}

	const readJson = <T>(file: string): T =>
		JSON.parse(fs.readFileSync(path.join(registryDir, file), "utf-8")) as T;

	// Both indexes cross the same trust boundary as graph.json (a file on
	// disk, possibly cwd-relative), so validate the fields every consumer
	// dereferences rather than asserting the type.
	const registryIndexShape = z
		.object({
			items: z.array(
				z
					.object({ name: z.string(), tags: z.array(z.string()).default([]) })
					.loose(),
			),
		})
		.loose();
	const recipeIndexShape = z
		.object({ items: z.array(z.object({ slug: z.string() }).loose()) })
		.loose();

	const rawRegistry = readJson<unknown>("registry.json");
	if (!registryIndexShape.safeParse(rawRegistry).success) {
		console.error(`Registry index at ${registryDir}/registry.json is malformed — reinstall @hex-core/cli.`);
		process.exit(1);
	}
	const registry = rawRegistry as RegistryIndex;

	const recipesPath = path.join(registryDir, "recipes.json");
	let recipes: RecipeIndex = { name: "hex-core", version: "0.0.0", items: [] };
	if (fs.existsSync(recipesPath)) {
		const rawRecipes = readJson<unknown>("recipes.json");
		if (!recipeIndexShape.safeParse(rawRecipes).success) {
			console.error(`Recipe index at ${recipesPath} is malformed — reinstall @hex-core/cli.`);
			process.exit(1);
		}
		recipes = rawRecipes as RecipeIndex;
	}

	let graph: CatalogGraph;
	try {
		graph = parseGraph(readJson<unknown>("graph.json"));
	} catch (err) {
		console.error(`Registry graph at ${graphPath} is invalid: ${(err as Error).message}`);
		process.exit(1);
	}

	/**
	 * Read one JSON file under the registry dir, null when absent/invalid slug.
	 * @param subdir - `items` or `recipes`
	 * @param slug - The slug to load
	 * @returns The parsed value, or null
	 */
	const loadFrom = <T>(subdir: string, slug: string): T | null => {
		if (!SLUG_REGEX.test(slug)) return null;
		const file = path.join(registryDir, subdir, `${slug}.json`);
		if (!fs.existsSync(file)) return null;
		return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
	};

	/**
	 * Minimal shape the POC codegen dereferences on every item. Validated
	 * here — the trust boundary is a file on disk, and the candidate probe
	 * can resolve a cwd-relative registry — so a truncated item surfaces as
	 * a named error rather than `item.files is not iterable` from deep
	 * inside the builder.
	 */
	const itemShape = z
		.object({
			name: z.string(),
			files: z.array(z.object({ path: z.string(), content: z.string(), type: z.string() })),
			examples: z.array(z.object({ code: z.string() }).loose()).default([]),
			dependencies: z.object({}).loose().default({}),
		})
		.loose();

	return {
		registryDir,
		registry,
		recipes,
		graph,
		loadRecipe: (slug) => loadFrom<Recipe>("recipes", slug),
		loadItem: (slug) => {
			const raw = loadFrom<unknown>("items", slug);
			if (raw === null) return null;
			const parsed = itemShape.safeParse(raw);
			if (!parsed.success) {
				console.error(
					`Registry item "${slug}" is malformed (${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}). Reinstall @hex-core/cli or re-run \`pnpm run build:registry\`.`,
				);
				return null;
			}
			return raw as RegistryItem;
		},
	};
}
