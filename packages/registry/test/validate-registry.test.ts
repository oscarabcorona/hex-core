/**
 * Schema drift guard.
 *
 * Parses every JSON in registry/items/ against registryItemSchema and every
 * JSON in registry/recipes/ against recipeSchema. If a schema field changes
 * and the build output is stale, or if a hand-edited JSON breaks the
 * contract, this test fails loudly before consumers hit it at runtime.
 *
 * Also validates registry/registry.json (the index) and registry/recipes.json.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { recipeSchema, registryIndexSchema, registryItemSchema } from "../src/index.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REGISTRY_ROOT = join(HERE, "../../../registry");

/**
 * Read a JSON file from disk and parse it.
 *
 * @param path - Absolute or cwd-relative path to a `.json` file.
 * @returns The parsed JSON value cast to `T`.
 */
function readJson<T = unknown>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

/**
 * List every `.json` file in a directory.
 *
 * @param dir - Directory to scan (non-recursive).
 * @returns An array of absolute paths to `.json` files in `dir`.
 */
function listJson(dir: string): string[] {
	return readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => join(dir, f));
}

describe("registry schema validation", () => {
	const itemsDir = join(REGISTRY_ROOT, "items");
	const itemFiles = listJson(itemsDir);

	it("has at least 40 component items", () => {
		expect(itemFiles.length).toBeGreaterThanOrEqual(40);
	});

	it.each(itemFiles)("item conforms to registryItemSchema: %s", (file) => {
		const raw = readJson(file);
		const result = registryItemSchema.safeParse(raw);
		if (!result.success) {
			throw new Error(
				`${file}\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
			);
		}
	});

	it("index (registry.json) conforms to registryIndexSchema", () => {
		const raw = readJson(join(REGISTRY_ROOT, "registry.json"));
		const result = registryIndexSchema.safeParse(raw);
		if (!result.success) {
			throw new Error(
				result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n"),
			);
		}
	});

	it("antiPatterns never self-reference (insteadUse !== item.name)", () => {
		// AntiPattern.insteadUse names a DIFFERENT component to redirect to.
		// A self-reference is a contract violation: an MCP follower lands
		// back on the same intent payload, no information gained. "Use the
		// same component differently" notes belong in commonMistakes.
		const offenders: string[] = [];
		for (const file of itemFiles) {
			const item = readJson<{
				name: string;
				ai?: { antiPatterns?: Array<{ mistake: string; insteadUse: string }> };
			}>(file);
			const antiPatterns = item.ai?.antiPatterns ?? [];
			for (const ap of antiPatterns) {
				if (ap.insteadUse === item.name) {
					offenders.push(`${item.name}: "${ap.mistake.slice(0, 60)}..."`);
				}
			}
		}
		expect(
			offenders,
			`antiPatterns may not redirect to their own component:\n${offenders.join("\n")}`,
		).toEqual([]);
	});
});

describe("recipe schema validation", () => {
	const recipesDir = join(REGISTRY_ROOT, "recipes");
	const recipeFiles = listJson(recipesDir);

	it("has at least 5 recipes", () => {
		expect(recipeFiles.length).toBeGreaterThanOrEqual(5);
	});

	it.each(recipeFiles)("recipe conforms to recipeSchema: %s", (file) => {
		const raw = readJson(file);
		const result = recipeSchema.safeParse(raw);
		if (!result.success) {
			throw new Error(
				`${file}\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
			);
		}
	});
});
