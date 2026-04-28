import * as fs from "node:fs";
import * as path from "node:path";
import { findRegistryDir, findRegistryIndex } from "../lib/registry-dir.js";

interface RecipeSummary {
	slug: string;
	title: string;
	summary: string;
}

/**
 * Print all available components grouped by category, then a recipes
 * section so users discover spec-driven blueprints (auth-form,
 * settings-page, ...) without hunting for a separate `hex recipe list`.
 */
export async function listComponents() {
	const indexPath = findRegistryIndex();
	if (!indexPath) {
		console.error("Could not find registry. Run from the hex-ui project root.");
		process.exit(1);
	}

	const registry = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

	console.log("\nHex UI Components\n");

	const grouped: Record<string, Array<{ name: string; description: string }>> = {};
	for (const item of registry.items) {
		const cat = item.category;
		if (!grouped[cat]) grouped[cat] = [];
		grouped[cat].push({ name: item.name, description: item.description });
	}

	for (const [category, items] of Object.entries(grouped)) {
		console.log(`  ${category.toUpperCase()}`);
		for (const item of items) {
			console.log(`    ${item.name.padEnd(20)} ${item.description}`);
		}
		console.log();
	}

	console.log(`Total: ${registry.items.length} components`);

	const recipes = loadRecipes();
	if (recipes.length > 0) {
		console.log("\nRecipes (spec-driven blueprints)\n");
		for (const r of recipes) {
			console.log(`    ${r.slug.padEnd(20)} ${r.summary || r.title}`);
		}
		console.log(`\n    Try one: hex recipe add ${recipes[0].slug}`);
	}
}

function loadRecipes(): RecipeSummary[] {
	const dir = findRegistryDir();
	if (!dir) return [];
	const recipesDir = path.join(dir, "recipes");
	if (!fs.existsSync(recipesDir)) return [];
	const files = fs.readdirSync(recipesDir).filter((f) => f.endsWith(".json"));
	const out: RecipeSummary[] = [];
	for (const f of files) {
		try {
			const raw = JSON.parse(fs.readFileSync(path.join(recipesDir, f), "utf-8"));
			out.push({
				slug: String(raw.slug ?? f.replace(/\.json$/, "")),
				title: String(raw.title ?? raw.slug ?? ""),
				summary: String(raw.summary ?? ""),
			});
		} catch {
			// Skip malformed recipe files rather than failing the whole list.
		}
	}
	return out.sort((a, b) => a.slug.localeCompare(b.slug));
}
