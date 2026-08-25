import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { internalDepToSlug } from "@hex-core/registry";
import { compareStrings } from "../packages/payload/src/lib/compare.js";
import { titleFromSlug } from "../packages/payload/src/lib/slug.js";
import {
	type CatalogGraph,
	type GraphEdge,
	type GraphNode,
	parseGraphStrict,
	type Relation,
} from "../packages/payload/src/graph/graph-schema.js";

/**
 * Emit `registry/graph.json` — the catalog knowledge graph consumed by
 * `hex map` / `hex poc` / MCP `query_graph`. Runs after
 * `scripts/build-registry.ts` and reads the *emitted* registry JSON
 * (never the `.schema.ts` sources) so the graph can only describe what
 * the registry actually ships.
 *
 * Output is deterministic: no timestamps, nodes sorted by id, edges
 * sorted by (source, relation, target, order) — same registry snapshot
 * always produces the same bytes. The structural shape mirrors the Zod
 * source of truth in `packages/payload/src/graph/graph-schema.ts`; keep
 * both in lockstep (payload's `parseGraph` validates this file at load).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(ROOT, "registry");
const ITEMS_DIR = path.join(REGISTRY_DIR, "items");
const RECIPES_INDEX = path.join(REGISTRY_DIR, "recipes.json");
const OUT_PATH = path.join(REGISTRY_DIR, "graph.json");

// ─── Raw registry shapes (only the fields the graph reads) ───

interface IndexItem {
	name: string;
	displayName: string;
	category: string;
	subcategory?: string;
	tags: string[];
	internalDeps: string[];
	tokenBudget?: number;
}

interface RawItemFile {
	path: string;
	content: string;
	type: string;
}

interface RawItem {
	name: string;
	files: RawItemFile[];
	dependencies?: { npm?: string[] };
	examples?: Array<{ composition?: string[] }>;
	ai?: {
		relatedComponents?: string[];
		antiPatterns?: Array<{ mistake: string; insteadUse: string }>;
	};
}

interface RawRecipeIndexItem {
	slug: string;
	kind: "component" | "page";
	pageType?: string;
	title: string;
	tags: string[];
	tokenBudget?: number;
}

interface RawRecipe {
	slug: string;
	kind: "component" | "page";
	steps: Array<{ component: string; role: string }>;
	sections: Array<{ id: string; block: string; intent: string; role: string }>;
	theme?: { preset: string };
}

// Graph node/edge/relation types are imported from the payload zod schema
// above — the single source of truth. `satisfies CatalogGraph` on the
// emitted object plus a `parseGraph` re-parse before write means the
// emitter cannot drift from what consumers validate.

/** Per-relation edge weight — hard install edges outrank soft suggestions. */
const RELATION_WEIGHT: Record<Relation, number> = {
	requires: 1.0,
	composes: 0.9,
	themes: 0.8,
	related: 0.6,
	"instead-use": 0.5,
};

/** Human-readable plural per item category, used in community names. */
const CATEGORY_PLURAL: Record<string, string> = {
	primitive: "primitives",
	component: "components",
	block: "blocks",
	ai: "AI components",
	motion: "motion",
	artifact: "artifacts",
	hook: "hooks",
};

/** Top-N degree-ranked items flagged as hubs, gated by a minimum degree. */
const HUB_COUNT = 5;
const HUB_MIN_DEGREE = 8;

/** Max characters of anti-pattern prose carried on an `instead-use` edge. */
const NOTE_MAX_LENGTH = 200;


/**
 * Derive the community id + display name for an item from its curated
 * taxonomy (`category`/`subcategory`). Deterministic on purpose — the
 * catalog's authored taxonomy beats algorithmic clustering here because
 * ids stay stable across registry changes.
 * @param category - Registry category key (e.g. `"block"`)
 * @param subcategory - Optional registry subcategory (e.g. `"marketing"`)
 * @returns The community id (`"block/marketing"`) and name (`"Marketing blocks"`)
 */
function communityFor(category: string, subcategory?: string): { community: string; communityName: string } {
	const plural = CATEGORY_PLURAL[category] ?? category;
	if (!subcategory) {
		return { community: category, communityName: titleFromSlug(plural) };
	}
	return {
		community: `${category}/${subcategory}`,
		communityName: `${titleFromSlug(subcategory)} ${plural}`,
	};
}

/**
 * Scan an item's shipped source files for exported value identifiers
 * (functions, consts, classes, and `export { … }` lists). These feed the
 * POC page generator's identifier→slug resolution, so only component-ish
 * files count — shared `lib/` files are excluded because their exports
 * (`cn`, color helpers) are not JSX symbols an example would import.
 * @param files - The item's registry `files` array
 * @returns Sorted unique exported identifier names
 */
function scanExports(files: RawItemFile[]): { names: string[]; paths: Record<string, string> } {
	// Prototype-free: `"constructor" in {}` is true, which would silently
	// drop an export named `constructor` / `toString` / `valueOf`.
	const paths: Record<string, string> = Object.create(null);
	for (const file of files) {
		if (!file.path.startsWith("components/")) continue;
		if (!/\.(?:ts|tsx)$/.test(file.path)) continue;
		// Module suffix relative to `components/`, extension dropped — this is
		// what a generated page imports as `@/components/<suffix>`. Files under
		// `_shared/` are their own module: attributing their exports to the
		// item's main module emitted an import that does not resolve (every
		// auth block's `mockAuthAdapter` did exactly that).
		const suffix = file.path.replace(/^components\//, "").replace(/\.(?:ts|tsx)$/, "");
		const names = new Set<string>();
		for (const m of file.content.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
			names.add(m[1]);
		}
		for (const m of file.content.matchAll(/export\s*\{([^}]+)\}/g)) {
			for (const piece of m[1].split(",")) {
				const token = piece.trim();
				if (token.length === 0 || token.startsWith("type ")) continue;
				const name = token.includes(" as ") ? token.split(" as ")[1].trim() : token;
				if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) names.add(name);
			}
		}
		// First file wins so the item's main module keeps precedence. That
		// ordering is produced by build-registry.ts (main component, then
		// discovered deps, then libs) — asserted below rather than assumed.
		for (const name of names) if (!(name in paths)) paths[name] = suffix;
	}
	// Sort keys so the emitted artifact stays diff-stable if file order shifts.
	const sorted: Record<string, string> = Object.create(null);
	for (const name of Object.keys(paths).sort()) sorted[name] = paths[name];
	return { names: Object.keys(sorted), paths: sorted };
}

/**
 * Resolve an `internalDeps` entry to an item slug. Mirrors the CLI's
 * install semantics (`internalDepToSlug` handles the 3-segment
 * `category/<slug>/<slug>` form) and additionally accepts flat entries
 * that name a registry item directly (`"motion"`, `"dnd"`) — those are
 * real runtime requirements for npm-backed items even though the CLI
 * copies no files for them.
 * @param dep - Raw internal dependency path from the registry index
 * @param itemNames - Set of every item slug in the registry
 * @returns The target item slug, or null when the entry names no item
 */
function resolveInternalDep(dep: string, itemNames: Set<string>): string | null {
	const viaPath = internalDepToSlug(dep);
	if (viaPath && itemNames.has(viaPath)) return viaPath;
	if (itemNames.has(dep)) return dep;
	return null;
}

/**
 * Read and parse a JSON file, typed by the caller.
 * @param filePath - Absolute path to the JSON file
 * @returns The parsed value
 */
function readJson<T>(filePath: string): T {
	return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

// ─── Main ───

console.log("Building Hex Core catalog graph...\n");

const registryIndex = readJson<{ items: IndexItem[] }>(path.join(REGISTRY_DIR, "registry.json"));
const recipesIndex = fs.existsSync(RECIPES_INDEX)
	? readJson<{ items: RawRecipeIndexItem[] }>(RECIPES_INDEX)
	: { items: [] };

const itemNames = new Set(registryIndex.items.map((i) => i.name));
const errors: string[] = [];

const nodes = new Map<string, GraphNode>();
const edges: GraphEdge[] = [];
const edgeKeys = new Set<string>();

/**
 * Append an edge unless an identical one exists or an endpoint is
 * missing/self-referencing. Missing endpoints are hard errors — the graph
 * must never describe a component the registry doesn't ship.
 * @param edge - The fully-populated edge to add
 * @param context - Human-readable origin used in error messages
 */
function addEdge(edge: GraphEdge, context: string): void {
	if (!nodes.has(edge.source) || !nodes.has(edge.target)) {
		errors.push(`${context}: edge ${edge.source} -[${edge.relation}]-> ${edge.target} has a missing endpoint`);
		return;
	}
	if (edge.source === edge.target) {
		console.warn(`  Warning: skipping self-loop ${edge.source} -[${edge.relation}]-> ${edge.target} (${context})`);
		return;
	}
	const key = [edge.source, edge.relation, edge.target, edge.order ?? "", edge.sectionId ?? ""].join("|");
	if (edgeKeys.has(key)) return;
	edgeKeys.add(key);
	edges.push(edge);
}

// Item nodes.
const rawItems = new Map<string, RawItem>();
for (const item of registryIndex.items) {
	const raw = readJson<RawItem>(path.join(ITEMS_DIR, `${item.name}.json`));
	rawItems.set(item.name, raw);

	const compositionTags = new Set<string>();
	for (const example of raw.examples ?? []) {
		for (const tag of example.composition ?? []) compositionTags.add(tag);
	}

	// scanExports resolves collisions by file order, so the item's own module
	// must come first; build-registry.ts guarantees it and this catches a
	// regression there instead of silently mis-routing an import.
	const mainFile = `components/ui/${item.name}.tsx`;
	const mainIndex = raw.files.findIndex((f) => f.path === mainFile);
	// `findIndex` returns -1 when the main module is absent, and `-1 > 0` is
	// false — which would silently retire this whole invariant.
	const hasComponentFiles = raw.files.some((f) => f.path.startsWith("components/"));
	if (hasComponentFiles && mainIndex !== 0) {
		errors.push(`item ${item.name}: main module ${mainFile} must be first in files[] (index ${mainIndex})`);
	}
	const { names: exportedNames, paths: exportPaths } = scanExports(raw.files);
	// npm-backed items (motion, hooks) copy no source; record where their
	// runtime actually imports from so codegen can route identifiers.
	// Strip any inline version range so `importPath` stays a resolvable
	// import specifier (`@hex-core/motion`, never `@hex-core/motion@^1.2.0`).
	const firstParty =
		raw.files.length === 0 ? (raw.dependencies?.npm ?? []).find((dep) => dep.startsWith("@hex-core/")) : undefined;
	const importPath = firstParty
		? firstParty.slice(0, firstParty.lastIndexOf("@") > 0 ? firstParty.lastIndexOf("@") : undefined)
		: undefined;

	const { community, communityName } = communityFor(item.category, item.subcategory);
	const node: GraphNode = {
		id: `item:${item.name}`,
		slug: item.name,
		label: item.displayName,
		kind: "item",
		category: item.category,
		subcategory: item.subcategory,
		community,
		communityName,
		tags: [...item.tags].sort(),
		compositionTags: [...compositionTags].sort(),
		tokenBudget: item.tokenBudget,
		degree: 0,
	};
	if (exportedNames.length > 0) {
		node.exports = exportedNames;
		node.exportPaths = exportPaths;
	}
	if (importPath) node.importPath = importPath;
	nodes.set(node.id, node);
}

// Recipe nodes.
const recipeMeta = new Map<string, RawRecipeIndexItem>();
for (const recipe of recipesIndex.items) {
	recipeMeta.set(recipe.slug, recipe);
	const { community, communityName } =
		recipe.kind === "page"
			? { community: "recipe/page", communityName: "Page recipes" }
			: { community: "recipe/component", communityName: "Component recipes" };
	nodes.set(`recipe:${recipe.slug}`, {
		id: `recipe:${recipe.slug}`,
		slug: recipe.slug,
		label: recipe.title,
		kind: "recipe",
		recipeKind: recipe.kind,
		pageType: recipe.pageType,
		community,
		communityName,
		tags: [...recipe.tags].sort(),
		compositionTags: [],
		tokenBudget: recipe.tokenBudget,
		degree: 0,
	});
}

// Theme nodes — one per preset referenced by a page recipe.
const compiledRecipes: RawRecipe[] = recipesIndex.items.map((r) =>
	readJson<RawRecipe>(path.join(REGISTRY_DIR, "recipes", `${r.slug}.json`)),
);
for (const recipe of compiledRecipes) {
	const preset = recipe.theme?.preset;
	if (!preset || nodes.has(`theme:${preset}`)) continue;
	nodes.set(`theme:${preset}`, {
		id: `theme:${preset}`,
		slug: preset,
		label: titleFromSlug(preset),
		kind: "theme",
		community: "theme",
		communityName: "Themes",
		tags: [],
		compositionTags: [],
		degree: 0,
	});
}

// `requires` — hard install edges from internal deps (mirrors `hex add` semantics).
for (const item of registryIndex.items) {
	for (const dep of item.internalDeps) {
		const target = resolveInternalDep(dep, itemNames);
		if (!target) continue; // lib/utils and friends — utilities, not items
		addEdge(
			{
				source: `item:${item.name}`,
				target: `item:${target}`,
				relation: "requires",
				confidence: "extracted",
				weight: RELATION_WEIGHT.requires,
			},
			`item ${item.name} internalDeps`,
		);
	}
}

// `related` + `instead-use` — soft edges from AI hints.
for (const [name, raw] of rawItems) {
	for (const target of raw.ai?.relatedComponents ?? []) {
		addEdge(
			{
				source: `item:${name}`,
				target: `item:${target}`,
				relation: "related",
				confidence: "extracted",
				weight: RELATION_WEIGHT.related,
			},
			`item ${name} ai.relatedComponents`,
		);
	}
	for (const anti of raw.ai?.antiPatterns ?? []) {
		addEdge(
			{
				source: `item:${name}`,
				target: `item:${anti.insteadUse}`,
				relation: "instead-use",
				confidence: "extracted",
				weight: RELATION_WEIGHT["instead-use"],
				note: anti.mistake.slice(0, NOTE_MAX_LENGTH),
			},
			`item ${name} ai.antiPatterns`,
		);
	}
}

// `composes` + `themes` — recipe structure.
for (const recipe of compiledRecipes) {
	const source = `recipe:${recipe.slug}`;
	if (recipe.kind === "page") {
		recipe.sections.forEach((section, index) => {
			addEdge(
				{
					source,
					target: `item:${section.block}`,
					relation: "composes",
					confidence: "extracted",
					weight: RELATION_WEIGHT.composes,
					order: index,
					role: section.role,
					sectionId: section.id,
					intent: section.intent,
				},
				`recipe ${recipe.slug} sections`,
			);
		});
		if (recipe.theme?.preset) {
			addEdge(
				{
					source,
					target: `theme:${recipe.theme.preset}`,
					relation: "themes",
					confidence: "extracted",
					weight: RELATION_WEIGHT.themes,
				},
				`recipe ${recipe.slug} theme`,
			);
		}
	} else {
		recipe.steps.forEach((step, index) => {
			addEdge(
				{
					source,
					target: `item:${step.component}`,
					relation: "composes",
					confidence: "extracted",
					weight: RELATION_WEIGHT.composes,
					order: index,
					role: step.role,
				},
				`recipe ${recipe.slug} steps`,
			);
		});
	}
}

if (errors.length > 0) {
	console.error(`\n✗ Graph build failed with ${errors.length} error(s):`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

// Degree + hubs.
for (const edge of edges) {
	const source = nodes.get(edge.source);
	const target = nodes.get(edge.target);
	if (source) source.degree += 1;
	if (target) target.degree += 1;
}
const hubs = [...nodes.values()]
	.filter((node) => node.kind === "item" && node.degree >= HUB_MIN_DEGREE)
	.sort((a, b) => b.degree - a.degree || compareStrings(a.slug, b.slug))
	.slice(0, HUB_COUNT);
for (const hub of hubs) hub.hub = true;

// Stable ordering — same registry snapshot ⇒ same bytes.
const sortedNodes = [...nodes.values()].sort((a, b) => compareStrings(a.id, b.id));
const sortedEdges = [...edges].sort(
	(a, b) =>
		compareStrings(a.source, b.source) ||
		compareStrings(a.relation, b.relation) ||
		compareStrings(a.target, b.target) ||
		(a.order ?? -1) - (b.order ?? -1),
);

const graph = {
	$schema: "https://hex-core.dev/schema/graph.json",
	version: 1 as const,
	meta: {
		itemCount: registryIndex.items.length,
		recipeCount: recipesIndex.items.length,
		edgeCount: sortedEdges.length,
		hubs: hubs.map((h) => h.slug),
	},
	nodes: sortedNodes,
	edges: sortedEdges,
} satisfies CatalogGraph;

// Re-parse strictly before writing. The read path is permissive so an
// older CLI can load a newer graph, but at emit time both sides are ours:
// a field the emitter adds that the schema doesn't know is drift, and
// zod's default strip mode would silently delete it from every consumer.
try {
	parseGraphStrict(JSON.parse(JSON.stringify(graph)));
} catch (err) {
	console.error(`\n✗ Emitted graph does not satisfy the payload schema:`);
	console.error(`  ${(err as Error).message}`);
	console.error(`  Update packages/payload/src/graph/graph-schema.ts to match, or fix the emitter.`);
	process.exit(1);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(graph, null, 2));

console.log(`✓ Graph built: ${sortedNodes.length} nodes, ${sortedEdges.length} edges`);
console.log(`  Hubs: ${graph.meta.hubs.join(", ")}`);
console.log(`  Out: ${path.relative(ROOT, OUT_PATH)}`);
