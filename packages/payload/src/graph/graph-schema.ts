import { z } from "zod";

/**
 * Zod source of truth for `registry/graph.json` — the catalog knowledge
 * graph emitted by `scripts/build-graph.ts` at `build:registry` time.
 * The build script mirrors this shape structurally; `parseGraph` is the
 * runtime gate every consumer (CLI, MCP, direct importers) loads through,
 * so a drifted or hand-edited graph fails loudly instead of mis-mapping.
 */

/** Graph format version this build emits and understands. */
export const GRAPH_FORMAT_VERSION = 1;

/** Node kinds the catalog graph models. */
export const nodeKindEnum = z.enum(["item", "recipe", "theme"]);
export type NodeKind = z.infer<typeof nodeKindEnum>;

/**
 * Closed relation vocabulary. `requires` mirrors `hex add` install
 * semantics (hard edges); `composes` is recipe structure; `themes` links
 * page recipes to their preset; `related` / `instead-use` carry the
 * schema-authored AI hints.
 */
export const relationEnum = z.enum(["requires", "related", "instead-use", "composes", "themes"]);
export type Relation = z.infer<typeof relationEnum>;

/** One node in the catalog graph — a registry item, recipe, or theme preset. */
export const graphNodeSchema = z.object({
	id: z.string().min(1),
	slug: z.string().min(1),
	label: z.string().min(1),
	kind: nodeKindEnum,
	category: z.string().optional(),
	subcategory: z.string().optional(),
	recipeKind: z.enum(["component", "page"]).optional(),
	pageType: z.string().optional(),
	community: z.string(),
	communityName: z.string(),
	tags: z.array(z.string()),
	compositionTags: z.array(z.string()),
	tokenBudget: z.number().optional(),
	degree: z.number().int().nonnegative(),
	hub: z.literal(true).optional(),
	/** Exported identifiers, used by POC codegen to route example imports. */
	exports: z.array(z.string()).optional(),
	/**
	 * Package an npm-backed item's runtime imports from (motion primitives,
	 * AI-kit hooks). Informational: these items ship no source to copy, so
	 * codegen never resolves an identifier to them.
	 */
	importPath: z.string().optional(),
});
export type GraphNode = z.infer<typeof graphNodeSchema>;

/** One directed edge in the catalog graph. */
export const graphEdgeSchema = z.object({
	source: z.string().min(1),
	target: z.string().min(1),
	relation: relationEnum,
	confidence: z.literal("extracted"),
	weight: z.number(),
	order: z.number().int().nonnegative().optional(),
	role: z.string().optional(),
	sectionId: z.string().optional(),
	intent: z.string().optional(),
	note: z.string().optional(),
});
export type GraphEdge = z.infer<typeof graphEdgeSchema>;

/** The full catalog graph as emitted to `registry/graph.json`. */
export const catalogGraphSchema = z.object({
	$schema: z.string(),
	version: z.literal(1),
	meta: z.object({
		itemCount: z.number().int().nonnegative(),
		recipeCount: z.number().int().nonnegative(),
		edgeCount: z.number().int().nonnegative(),
		hubs: z.array(z.string()),
	}),
	nodes: z.array(graphNodeSchema),
	edges: z.array(graphEdgeSchema),
});
export type CatalogGraph = z.infer<typeof catalogGraphSchema>;

/**
 * Emit-time variant of the graph schema with unknown keys rejected.
 *
 * The read path stays permissive on purpose: an older `@hex-core/cli`
 * must not hard-fail on a newer graph that added a field. But at emit
 * time we control both sides, so a field the generator writes and the
 * schema doesn't know is drift, not forward compatibility — and zod's
 * default strip mode would silently drop it from every consumer.
 * `scripts/build-graph.ts` validates through this before writing.
 */
export const strictCatalogGraphSchema = catalogGraphSchema.extend({
	nodes: z.array(graphNodeSchema.strict()),
	edges: z.array(graphEdgeSchema.strict()),
}).strict();

/**
 * Validate an emitted graph strictly, rejecting unknown keys.
 * @param raw - The graph object about to be written to disk
 * @returns The validated graph
 * @throws {Error} Naming the offending key when the emitter has drifted
 */
export function parseGraphStrict(raw: unknown): CatalogGraph {
	const result = strictCatalogGraphSchema.safeParse(raw);
	if (!result.success) {
		const issues = result.error.issues
			.slice(0, 5)
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");
		throw new Error(`Emitted graph drifted from the schema: ${issues}`);
	}
	return result.data;
}

/**
 * Validate a raw parsed JSON value as a catalog graph.
 * @param raw - The value obtained from `JSON.parse` of a graph.json file
 * @returns The validated graph
 * @throws {Error} With the first few Zod issues when validation fails
 */
export function parseGraph(raw: unknown): CatalogGraph {
	// Check `version` first: a future format bump would otherwise surface as
	// `version: Invalid literal value, expected 1`, which tells the user
	// nothing about what to do. This is the only branch that reads it.
	if (typeof raw === "object" && raw !== null && "version" in raw) {
		const version = (raw as { version: unknown }).version;
		if (typeof version === "number" && version > GRAPH_FORMAT_VERSION) {
			throw new Error(
				`Catalog graph is format v${version}, but this build understands v${GRAPH_FORMAT_VERSION}. Update @hex-core/cli / @hex-core/payload to read it.`,
			);
		}
	}
	const result = catalogGraphSchema.safeParse(raw);
	if (!result.success) {
		const issues = result.error.issues
			.slice(0, 5)
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");
		throw new Error(`Invalid catalog graph: ${issues}`);
	}
	return result.data;
}
