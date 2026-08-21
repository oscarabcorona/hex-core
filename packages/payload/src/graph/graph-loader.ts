import * as fs from "node:fs";
import * as path from "node:path";
import { getRegistryDir } from "../loaders/registry-loader.js";
import { type CatalogGraph, parseGraph } from "./graph-schema.js";

// The graph is bundled into the published tarball alongside the rest of
// registry/ and never changes at runtime, so a module-level memo is safe —
// same rationale as the registry-item cache in registry-loader.ts.
let cachedGraph: CatalogGraph | null = null;

/**
 * Load and validate the catalog graph from the bundled registry directory.
 * Memoized after the first read.
 * @returns The validated catalog graph
 * @throws {Error} When `graph.json` is missing (stale registry snapshot —
 * regenerate with `pnpm run build:registry`, or update `@hex-core/cli` /
 * `@hex-core/payload` to a release that ships it) or fails validation
 */
export function loadGraph(): CatalogGraph {
	if (cachedGraph) return cachedGraph;
	const graphPath = path.join(getRegistryDir(), "graph.json");
	if (!fs.existsSync(graphPath)) {
		throw new Error(
			`Catalog graph not found at ${graphPath}. ` +
				`Regenerate with \`pnpm run build:registry\` (monorepo) or update @hex-core/cli / @hex-core/payload to a version that ships registry/graph.json.`,
		);
	}
	const raw: unknown = JSON.parse(fs.readFileSync(graphPath, "utf-8"));
	cachedGraph = parseGraph(raw);
	return cachedGraph;
}
