import { compareStrings } from "../lib/compare.js";
import type { CatalogGraph, GraphEdge, GraphNode, Relation } from "./graph-schema.js";

/**
 * Pure query functions over the catalog graph. Every function takes the
 * graph as an explicit argument (loaded via `loadGraph()` or injected by
 * the CLI from its own registry directory) and touches no filesystem —
 * the same functions back `hex graph`, the map builder, and MCP
 * `query_graph`.
 */

/**
 * Prefix an item slug into its graph node id.
 * @param slug - Registry item slug
 * @returns The `item:<slug>` node id
 */
export function itemId(slug: string): string {
	return `item:${slug}`;
}

/**
 * Prefix a recipe slug into its graph node id.
 * @param slug - Recipe slug
 * @returns The `recipe:<slug>` node id
 */
export function recipeId(slug: string): string {
	return `recipe:${slug}`;
}

interface GraphIndex {
	byId: Map<string, GraphNode>;
	outgoing: Map<string, GraphEdge[]>;
	incoming: Map<string, GraphEdge[]>;
}

// Adjacency indexes are derived data; key them off the graph object so
// repeat queries in a long-running MCP process stay O(edges-touched)
// without the functions losing their pure, injected-graph signature.
const indexCache = new WeakMap<CatalogGraph, GraphIndex>();

/**
 * Build (or fetch the memoized) adjacency index for a graph.
 * @param graph - The catalog graph to index
 * @returns Node and edge lookup maps
 */
function indexOf(graph: CatalogGraph): GraphIndex {
	const cached = indexCache.get(graph);
	if (cached) return cached;
	const byId = new Map<string, GraphNode>();
	const outgoing = new Map<string, GraphEdge[]>();
	const incoming = new Map<string, GraphEdge[]>();
	for (const node of graph.nodes) byId.set(node.id, node);
	for (const edge of graph.edges) {
		const out = outgoing.get(edge.source);
		if (out) out.push(edge);
		else outgoing.set(edge.source, [edge]);
		const inc = incoming.get(edge.target);
		if (inc) inc.push(edge);
		else incoming.set(edge.target, [edge]);
	}
	const index: GraphIndex = { byId, outgoing, incoming };
	indexCache.set(graph, index);
	return index;
}

/**
 * Resolve a bare slug to its graph node, preferring items over recipes
 * over themes when the same slug exists in more than one namespace.
 * @param graph - The catalog graph
 * @param slug - A registry item slug, recipe slug, or theme preset name
 * @returns The matching node, or null when the slug names nothing
 */
export function nodeBySlug(graph: CatalogGraph, slug: string): GraphNode | null {
	const { byId } = indexOf(graph);
	return byId.get(itemId(slug)) ?? byId.get(recipeId(slug)) ?? byId.get(`theme:${slug}`) ?? null;
}

/** One neighbor of a node: the connecting edge plus the far-end node. */
export interface Neighbor {
	/** `out` = the edge leaves the queried node; `in` = it points at it. */
	direction: "out" | "in";
	edge: GraphEdge;
	node: GraphNode;
}

/**
 * List a node's neighbors across both edge directions, optionally
 * filtered to a set of relations. Results keep the graph's stable edge
 * order (outgoing first).
 * @param graph - The catalog graph
 * @param slug - Slug of the node to inspect
 * @param relations - Optional allowlist of relations to include
 * @returns Neighbors with their connecting edges; empty when the slug is unknown
 */
export function neighbors(graph: CatalogGraph, slug: string, relations?: Relation[]): Neighbor[] {
	const node = nodeBySlug(graph, slug);
	if (!node) return [];
	const { byId, outgoing, incoming } = indexOf(graph);
	const allowed = relations ? new Set<Relation>(relations) : null;
	const out: Neighbor[] = [];
	for (const edge of outgoing.get(node.id) ?? []) {
		if (allowed && !allowed.has(edge.relation)) continue;
		const far = byId.get(edge.target);
		if (far) out.push({ direction: "out", edge, node: far });
	}
	for (const edge of incoming.get(node.id) ?? []) {
		if (allowed && !allowed.has(edge.relation)) continue;
		const far = byId.get(edge.source);
		if (far) out.push({ direction: "in", edge, node: far });
	}
	return out;
}

/**
 * Compute the transitive `requires` closure of a set of item slugs — the
 * full install list `hex add` would resolve. Unknown slugs are ignored
 * (callers validate membership; the closure just walks).
 * @param graph - The catalog graph
 * @param slugs - Seed item slugs
 * @returns Sorted unique item slugs including the seeds
 */
export function requiresClosure(graph: CatalogGraph, slugs: string[]): string[] {
	const { byId, outgoing } = indexOf(graph);
	const seen = new Set<string>();
	const queue: string[] = [];
	for (const slug of slugs) {
		if (byId.has(itemId(slug)) && !seen.has(slug)) {
			seen.add(slug);
			queue.push(slug);
		}
	}
	while (queue.length > 0) {
		const slug = queue.shift();
		if (!slug) continue;
		for (const edge of outgoing.get(itemId(slug)) ?? []) {
			if (edge.relation !== "requires") continue;
			const far = byId.get(edge.target);
			if (!far || seen.has(far.slug)) continue;
			seen.add(far.slug);
			queue.push(far.slug);
		}
	}
	return [...seen].sort();
}

/** An item reached by reverse `requires` traversal, with its hop distance. */
export interface AffectedItem {
	slug: string;
	depth: number;
}

/** Blast radius of changing one item: dependent items + recipes that compose them. */
export interface AffectedResult {
	/** Items that (transitively) require the queried item, nearest first. */
	items: AffectedItem[];
	/** Recipe slugs that compose the queried item or any affected item. */
	recipes: string[];
}

/**
 * Reverse-traversal blast radius: which items break and which recipes are
 * touched if the given item changes. Traverses incoming `requires` edges
 * transitively, then collects recipes with `composes` edges into the
 * queried item or any dependent.
 * @param graph - The catalog graph
 * @param slug - The item slug being changed
 * @returns Dependent items (BFS order, nearest first) and affected recipe
 * slugs (sorted); null when the slug names no item — distinguishable from
 * a leaf item that simply has no dependents
 */
export function affected(graph: CatalogGraph, slug: string): AffectedResult | null {
	const { byId, incoming } = indexOf(graph);
	if (!byId.has(itemId(slug))) return null;

	const depths = new Map<string, number>([[slug, 0]]);
	const queue: string[] = [slug];
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) continue;
		const depth = depths.get(current) ?? 0;
		for (const edge of incoming.get(itemId(current)) ?? []) {
			if (edge.relation !== "requires") continue;
			const far = byId.get(edge.source);
			if (!far || depths.has(far.slug)) continue;
			depths.set(far.slug, depth + 1);
			queue.push(far.slug);
		}
	}

	const recipes = new Set<string>();
	for (const affectedSlug of depths.keys()) {
		for (const edge of incoming.get(itemId(affectedSlug)) ?? []) {
			if (edge.relation !== "composes") continue;
			const far = byId.get(edge.source);
			if (far?.kind === "recipe") recipes.add(far.slug);
		}
	}

	const items = [...depths.entries()]
		.filter(([itemSlug]) => itemSlug !== slug)
		.map(([itemSlug, depth]) => ({ slug: itemSlug, depth }))
		.sort((a, b) => a.depth - b.depth || compareStrings(a.slug, b.slug));
	return { items, recipes: [...recipes].sort() };
}

/** `explainNode` result: the node plus its neighborhood grouped by relation. */
export interface ExplainResult {
	node: GraphNode;
	/** Neighbors grouped by relation, in the closed-vocabulary order. */
	relations: Array<{ relation: Relation; neighbors: Neighbor[] }>;
	/** Other item slugs in the same community, highest degree first (capped). */
	communityPeers: string[];
}

/** How many same-community peers `explainNode` surfaces. */
const COMMUNITY_PEER_CAP = 8;

/**
 * Explain one node: its metadata, every edge touching it grouped by
 * relation, and its top same-community peers.
 * @param graph - The catalog graph
 * @param slug - Slug of the node to explain
 * @returns The explanation, or null when the slug names nothing
 */
export function explainNode(graph: CatalogGraph, slug: string): ExplainResult | null {
	const node = nodeBySlug(graph, slug);
	if (!node) return null;
	const all = neighbors(graph, node.slug);
	const order: Relation[] = ["requires", "composes", "themes", "related", "instead-use"];
	const relations = order
		.map((relation) => ({ relation, neighbors: all.filter((n) => n.edge.relation === relation) }))
		.filter((group) => group.neighbors.length > 0);
	const communityPeers = graph.nodes
		.filter((peer) => peer.community === node.community && peer.id !== node.id)
		.sort((a, b) => b.degree - a.degree || compareStrings(a.slug, b.slug))
		.slice(0, COMMUNITY_PEER_CAP)
		.map((peer) => peer.slug);
	return { node, relations, communityPeers };
}

/** One hop along a shortest path. */
export interface PathHop {
	node: GraphNode;
	/** Edge that led here from the previous hop; undefined on the first hop. */
	via?: GraphEdge;
}

/**
 * Breadth-first shortest path between two slugs, treating edges as
 * undirected (relationships read both ways when tracing connections).
 * @param graph - The catalog graph
 * @param from - Starting slug
 * @param to - Destination slug
 * @returns The hop sequence including both endpoints, or null when unreachable/unknown
 */
export function shortestPath(graph: CatalogGraph, from: string, to: string): PathHop[] | null {
	const start = nodeBySlug(graph, from);
	const goal = nodeBySlug(graph, to);
	if (!start || !goal) return null;
	if (start.id === goal.id) return [{ node: start }];

	const { byId, outgoing, incoming } = indexOf(graph);
	const previous = new Map<string, { from: string; via: GraphEdge }>();
	const visited = new Set<string>([start.id]);
	const queue: string[] = [start.id];

	while (queue.length > 0) {
		const currentId = queue.shift();
		if (!currentId) continue;
		const hops: Array<{ nextId: string; via: GraphEdge }> = [];
		for (const edge of outgoing.get(currentId) ?? []) hops.push({ nextId: edge.target, via: edge });
		for (const edge of incoming.get(currentId) ?? []) hops.push({ nextId: edge.source, via: edge });
		for (const { nextId, via } of hops) {
			if (visited.has(nextId)) continue;
			visited.add(nextId);
			previous.set(nextId, { from: currentId, via });
			if (nextId === goal.id) {
				const path: PathHop[] = [];
				let cursor: string | undefined = goal.id;
				while (cursor) {
					const step = previous.get(cursor);
					const node = byId.get(cursor);
					if (!node) return null;
					path.unshift({ node, via: step?.via });
					cursor = step?.from;
				}
				return path;
			}
			queue.push(nextId);
		}
	}
	return null;
}
