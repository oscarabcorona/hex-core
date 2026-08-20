import { affected, explainNode, neighbors, relationEnum, type Relation, shortestPath, type Neighbor } from "@hex-core/payload";
import pc from "picocolors";
import { loadCatalog } from "../lib/load-catalog.js";

/** Shared flags for the `hex graph` subcommands. */
export interface GraphOptions {
	/** Emit JSON instead of the human rendering. */
	json: boolean;
}

/**
 * `hex graph explain <slug>` — one node's metadata, every edge touching
 * it grouped by relation, and its top same-community peers.
 * @param slug - Item, recipe, or theme slug
 * @param options - Output flags
 */
export async function explainSlug(slug: string, options: GraphOptions): Promise<void> {
	const catalog = loadCatalog();
	const result = explainNode(catalog.graph, slug);
	if (!result) {
		console.error(`"${slug}" is not in the catalog graph. Run ${pc.bold("hex list")} for valid slugs.`);
		process.exit(1);
	}

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	const { node } = result;
	console.log(`\n${pc.bold(node.label)} ${pc.dim(`(${node.id})`)}`);
	console.log(`  ${pc.dim("Community:")} ${node.communityName}${node.hub ? `   ${pc.green("hub")}` : ""}   ${pc.dim("Degree:")} ${node.degree}${node.tokenBudget ? `   ${pc.dim("Tokens:")} ~${node.tokenBudget}` : ""}`);
	if (node.importPath) console.log(`  ${pc.dim("Runtime:")} ${node.importPath}`);

	for (const group of result.relations) {
		console.log(`\n  ${pc.bold(group.relation)}:`);
		for (const neighbor of group.neighbors) {
			console.log(`    ${renderNeighbor(group.relation, neighbor)}`);
		}
	}

	if (result.communityPeers.length > 0) {
		console.log(`\n  ${pc.dim("Community peers:")} ${result.communityPeers.join(", ")}`);
	}
}

/**
 * `hex graph affected <slug>` — reverse blast radius: which items and
 * recipes are touched if this item changes.
 * @param slug - Item slug being changed
 * @param options - Output flags
 */
export async function affectedSlug(slug: string, options: GraphOptions): Promise<void> {
	const catalog = loadCatalog();
	const result = affected(catalog.graph, slug);
	if (!result) {
		console.error(`"${slug}" is not a catalog item. Run ${pc.bold("hex list")} for valid slugs.`);
		process.exit(1);
	}

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	if (result.items.length === 0 && result.recipes.length === 0) {
		console.log(`Nothing in the catalog depends on "${slug}".`);
		return;
	}

	console.log(`\n${pc.bold(`Affected by changing ${slug}:`)}`);
	if (result.items.length > 0) {
		console.log(`  ${pc.dim("Items:")}`);
		for (const item of result.items) {
			console.log(`    ${item.slug} ${pc.dim(`(depth ${item.depth})`)}`);
		}
	}
	if (result.recipes.length > 0) {
		console.log(`  ${pc.dim("Recipes:")} ${result.recipes.join(", ")}`);
	}
}

/**
 * `hex graph neighbors <slug>` — adjacent nodes, optionally filtered to a
 * set of relations.
 * @param slug - Item, recipe, or theme slug
 * @param options - Output flags plus the optional relation filter
 */
export async function neighborsOfSlug(
	slug: string,
	options: GraphOptions & { relation?: string[] },
): Promise<void> {
	const catalog = loadCatalog();
	// Validate rather than assert: an unknown --relation should name the
	// closed vocabulary, not silently return nothing.
	const relations: Relation[] = [];
	for (const raw of options.relation ?? []) {
		const parsed = relationEnum.safeParse(raw);
		if (!parsed.success) {
			console.error(`Unknown relation "${raw}". Valid: ${relationEnum.options.join(", ")}.`);
			process.exit(1);
		}
		relations.push(parsed.data);
	}
	const result = neighbors(catalog.graph, slug, relations.length > 0 ? relations : undefined);
	if (result.length === 0) {
		console.error(`No neighbors for "${slug}". Run ${pc.bold("hex list")} for valid slugs.`);
		process.exit(1);
	}

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	console.log(`\n${pc.bold(`Neighbors of ${slug}:`)}`);
	for (const neighbor of result) {
		console.log(`  ${pc.dim(neighbor.edge.relation.padEnd(12))} ${renderNeighbor(neighbor.edge.relation, neighbor)}`);
	}
}

/**
 * `hex graph path <from> <to>` — shortest connection between two slugs.
 * @param from - Starting slug
 * @param to - Destination slug
 * @param options - Output flags
 */
export async function pathBetween(from: string, to: string, options: GraphOptions): Promise<void> {
	const catalog = loadCatalog();
	const result = shortestPath(catalog.graph, from, to);
	if (!result) {
		console.error(`No path between "${from}" and "${to}" (or one slug is unknown).`);
		process.exit(1);
	}

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	console.log(`\n${pc.bold(`${from} → ${to}`)} ${pc.dim(`(${result.length - 1} hop${result.length === 2 ? "" : "s"})`)}`);
	for (const hop of result) {
		const via = hop.via ? pc.dim(` via ${hop.via.relation}`) : "";
		console.log(`  ${hop.node.slug}${via}`);
	}
}

/**
 * Render one neighbor line for `explain`.
 * @param relation - The group's relation
 * @param neighbor - The neighbor to render
 * @returns The formatted line
 */
function renderNeighbor(relation: string, neighbor: Neighbor): string {
	const arrow = neighbor.direction === "out" ? "→" : "←";
	const extras: string[] = [];
	if (neighbor.edge.sectionId) extras.push(`section ${neighbor.edge.sectionId}`);
	if (neighbor.edge.role) extras.push(neighbor.edge.role);
	if (relation === "instead-use" && neighbor.edge.note) extras.push(neighbor.edge.note);
	const suffix = extras.length > 0 ? `  ${pc.dim(`(${extras.join(", ")})`)}` : "";
	return `${arrow} ${neighbor.node.slug}${suffix}`;
}
