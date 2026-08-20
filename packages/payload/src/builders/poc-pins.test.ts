/**
 * Pin-coverage guard. `KNOWN_NPM_VERSIONS` in `poc.ts` is a hand-maintained
 * table, and any bare npm name missing from it silently falls back to
 * `"latest"` in every generated POC's package.json — the exact failure the
 * table exists to prevent. This walks the real registry and fails when a
 * bare name is uncovered, so the table can only drift for one commit.
 *
 * Runs via `pnpm -F @hex-core/payload test:poc-pins`. Same contract as the
 * sibling tests: output on stderr, exit 0 = pass, 1 = fail.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { buildPocFiles } from "./poc.js";
import { mapFromRecipe } from "./map.js";
import { getRegistryDir } from "../loaders/registry-loader.js";
import { loadRecipes } from "../loaders/recipe-loader.js";

const failures: string[] = [];

/**
 * Record a failed assertion.
 * @param name - Case label
 * @param detail - What was expected vs observed
 */
function fail(name: string, detail: string): void {
	failures.push(`${name}: ${detail}`);
}

// ── Every bare npm name in the catalog must resolve to a real range ──
// Driven through the public builder rather than the private table so the
// assertion tracks observable output, not an implementation detail.
const itemsDir = path.join(getRegistryDir(), "items");
const bareNames = new Set<string>();
for (const file of fs.readdirSync(itemsDir).sort()) {
	if (!file.endsWith(".json")) continue;
	const item = JSON.parse(fs.readFileSync(path.join(itemsDir, file), "utf-8")) as {
		dependencies?: { npm?: string[] };
	};
	for (const dep of item.dependencies?.npm ?? []) {
		// Bare = no inline range (a leading `@` is a scope, not a separator).
		if (dep.lastIndexOf("@") <= 0) bareNames.add(dep);
	}
}
if (bareNames.size === 0) fail("coverage", "found no bare npm deps — the scan is broken");

// Scaffold across every page recipe so the assertion sees what real POCs pin.
const pinned = new Map<string, string>();
for (const recipe of loadRecipes().items) {
	if (recipe.kind !== "page") continue;
	const result = buildPocFiles(mapFromRecipe(recipe.slug), { appName: "pin-audit" });
	const pkg = result.files.find((f) => f.path === "package.json");
	if (!pkg) {
		fail(`recipe ${recipe.slug}`, "no package.json in the generated tree");
		continue;
	}
	const deps = (JSON.parse(pkg.content) as { dependencies: Record<string, string> }).dependencies;
	for (const [name, version] of Object.entries(deps)) pinned.set(name, version);
}
const unpinned = [...pinned.entries()].filter(([, version]) => version === "latest");
if (unpinned.length > 0) {
	fail(
		"page recipes",
		`generated package.json pins "latest" for: ${unpinned.map(([n]) => n).join(", ")} — add them to KNOWN_NPM_VERSIONS`,
	);
}

// The table must also cover every bare name the catalog can reach, including
// items no page recipe happens to compose (a future recipe will).
const source = fs.readFileSync(new URL("./poc.ts", import.meta.url), "utf-8");
const tableBlock = source.slice(
	source.indexOf("const KNOWN_NPM_VERSIONS"),
	source.indexOf("};", source.indexOf("const KNOWN_NPM_VERSIONS")),
);
const uncovered = [...bareNames]
	.filter((name) => !tableBlock.includes(`"${name}"`) && !tableBlock.includes(`\n\t${name}:`))
	.sort();
if (uncovered.length > 0) {
	fail("KNOWN_NPM_VERSIONS", `uncovered bare npm deps: ${uncovered.join(", ")}`);
}

if (failures.length > 0) {
	console.error(`poc-pins: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error(`poc-pins: ${bareNames.size} bare deps covered, no "latest" pins`);
