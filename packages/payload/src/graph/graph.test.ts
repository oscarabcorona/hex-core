/**
 * Catalog-graph regression assertions. Runs as a standalone node script
 * via `pnpm -F @hex-core/payload test:graph` against the monorepo's
 * `registry/graph.json` (regenerate with `pnpm run build:registry` if the
 * registry changed). No test-runner dependency, same contract as
 * resolver.test.ts: all output on stderr, exit 0 = pass, 1 = fail.
 */
import { loadGraph } from "./graph-loader.js";
import {
	affected,
	explainNode,
	neighbors,
	requiresClosure,
	shortestPath,
} from "./graph-query.js";
import { parseGraph } from "./graph-schema.js";

const failures: string[] = [];

/**
 * Record a failed assertion.
 * @param name - Case label
 * @param detail - What was expected vs observed
 */
function fail(name: string, detail: string): void {
	failures.push(`${name}: ${detail}`);
}

const graph = loadGraph();

// Meta consistency — counts in meta must describe the actual arrays.
const itemNodes = graph.nodes.filter((n) => n.kind === "item");
const recipeNodes = graph.nodes.filter((n) => n.kind === "recipe");
if (itemNodes.length !== graph.meta.itemCount) {
	fail("meta.itemCount", `meta says ${graph.meta.itemCount}, nodes have ${itemNodes.length}`);
}
if (recipeNodes.length !== graph.meta.recipeCount) {
	fail("meta.recipeCount", `meta says ${graph.meta.recipeCount}, nodes have ${recipeNodes.length}`);
}
if (graph.edges.length !== graph.meta.edgeCount) {
	fail("meta.edgeCount", `meta says ${graph.meta.edgeCount}, edges have ${graph.edges.length}`);
}
if (graph.meta.hubs.length === 0) {
	fail("meta.hubs", "expected at least one hub item");
}

// Every edge endpoint resolves — the build script enforces this at emit
// time; re-assert here so a hand-edited graph can't slip through parse.
const ids = new Set(graph.nodes.map((n) => n.id));
for (const edge of graph.edges) {
	if (!ids.has(edge.source) || !ids.has(edge.target)) {
		fail("edge endpoints", `${edge.source} -[${edge.relation}]-> ${edge.target} dangles`);
		break;
	}
}

// A known hard dependency: combobox requires command + popover.
const closure = requiresClosure(graph, ["combobox"]);
for (const expected of ["combobox", "command", "popover"]) {
	if (!closure.includes(expected)) {
		fail("requiresClosure(combobox)", `missing ${expected} in [${closure.join(", ")}]`);
	}
}

// Recipe composition surfaces in explainNode: landing-page composes marketing-hero.
const hero = explainNode(graph, "marketing-hero");
if (!hero) {
	fail("explainNode(marketing-hero)", "returned null");
} else {
	const composes = hero.relations.find((r) => r.relation === "composes");
	const fromLanding = composes?.neighbors.some(
		(n) => n.direction === "in" && n.node.id === "recipe:landing-page",
	);
	if (!fromLanding) {
		fail("explainNode(marketing-hero)", "expected incoming composes edge from recipe:landing-page");
	}
	if (hero.node.community !== "block/marketing") {
		fail("explainNode(marketing-hero)", `community ${hero.node.community} !== block/marketing`);
	}
}

// button is a hub — plenty of dependents and recipes in its blast radius.
const blast = affected(graph, "button");
if (!blast) {
	fail("affected(button)", "expected a result for a real item");
} else {
	if (blast.items.length === 0) fail("affected(button)", "expected dependent items");
	if (blast.recipes.length === 0) fail("affected(button)", "expected affected recipes");
}

// neighbors relation filter only returns the requested relation.
const onlyRequires = neighbors(graph, "combobox", ["requires"]);
if (onlyRequires.length === 0 || onlyRequires.some((n) => n.edge.relation !== "requires")) {
	fail("neighbors(combobox, requires)", "expected non-empty, requires-only neighbor list");
}

// Path between two well-connected primitives exists and starts/ends correctly.
const path = shortestPath(graph, "button", "card");
if (!path || path.length < 2) {
	fail("shortestPath(button, card)", `expected a path, got ${path ? path.length : "null"}`);
} else if (path[0].node.slug !== "button" || path[path.length - 1].node.slug !== "card") {
	fail("shortestPath(button, card)", "endpoints wrong");
}

// Unknown slugs return null (distinguishable from a leaf with no dependents).
if (explainNode(graph, "not-a-real-slug") !== null) {
	fail("explainNode(unknown)", "expected null");
}
if (affected(graph, "not-a-real-slug") !== null) {
	fail("affected(unknown)", "expected null");
}
const leaf = affected(graph, "aspect-ratio");
if (!leaf || leaf.items.length !== 0 || leaf.recipes.length !== 0) {
	fail("affected(leaf)", "expected an empty (non-null) result for a dependent-free item");
}

// parse → serialize → parse is lossless.
const reparsed = parseGraph(JSON.parse(JSON.stringify(graph)));
if (JSON.stringify(reparsed) !== JSON.stringify(graph)) {
	fail("parseGraph roundtrip", "reparsed graph differs from original");
}

if (failures.length > 0) {
	console.error(`graph: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error("graph: all cases passed");
