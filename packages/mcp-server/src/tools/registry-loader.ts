import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { internalDepToSlug, SLUG_REGEX } from "@hex-core/registry";

export { internalDepToSlug, SLUG_REGEX };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Locate the registry directory by searching known candidate paths.
 * @returns The absolute path to the registry directory
 * @throws {Error} If no candidate directory exists
 */
function findRegistryDir(): string {
	const candidates = [
		// Bundled inside the published tarball: dist/index.js → ../registry
		path.resolve(__dirname, "../registry"),
		// Defensive: dist/<subdir>/x.js → ../../registry
		path.resolve(__dirname, "../../registry"),
		// Monorepo dev: packages/mcp-server/src/tools → ../../../../registry
		path.resolve(__dirname, "../../../../registry"),
		// Defensive: tsx run from packages/mcp-server/src → ../../../registry
		path.resolve(__dirname, "../../../registry"),
		// Last-resort: consumer-mirrored registry/ next to their cwd
		path.resolve(process.cwd(), "registry"),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			return candidate;
		}
	}

	throw new Error(`Could not find registry directory. Searched: ${candidates.join(", ")}`);
}

let cachedRegistryDir: string | null = null;
/**
 * Get the cached registry directory path, resolving it on first call.
 * Shared by registry-loader and recipe-loader so both stay in sync.
 * @returns The absolute path to the registry directory
 */
export function getRegistryDir(): string {
	if (!cachedRegistryDir) {
		cachedRegistryDir = findRegistryDir();
	}
	return cachedRegistryDir;
}

export interface RegistryIndex {
	name: string;
	version: string;
	description: string;
	homepage: string;
	items: Array<{
		name: string;
		displayName: string;
		description: string;
		category: string;
		subcategory?: string;
		tags: string[];
		internalDeps: string[];
		tokenBudget?: number;
	}>;
}

export interface RegistryItem {
	name: string;
	displayName: string;
	description: string;
	category: string;
	subcategory?: string;
	version: string;
	framework: string;
	props: unknown[];
	variants: unknown[];
	slots: unknown[];
	files: Array<{ path: string; content: string; type: string }>;
	dependencies: { npm?: string[]; internal?: string[]; peer?: string[] };
	tokensUsed: string[];
	cssVariables?: Record<string, { light: string; dark: string }>;
	examples: Array<{ title: string; description: string; code: string }>;
	ai: Record<string, unknown>;
	tags: string[];
}

/**
 * Load and parse the registry index from disk.
 * @returns The parsed registry index containing all component summaries
 */
export function loadRegistry(): RegistryIndex {
	const dir = getRegistryDir();
	const indexPath = path.join(dir, "registry.json");
	const content = fs.readFileSync(indexPath, "utf-8");
	return JSON.parse(content);
}

/**
 * Load a single registry item by name.
 * @param name - The component name (must match `SLUG_REGEX`)
 * @returns The parsed registry item, or null if the name is invalid or not found
 */
export function loadRegistryItem(name: string): RegistryItem | null {
	if (!SLUG_REGEX.test(name)) return null;

	const dir = getRegistryDir();
	const itemPath = path.join(dir, "items", `${name}.json`);
	if (!fs.existsSync(itemPath)) return null;

	const content = fs.readFileSync(itemPath, "utf-8");
	return JSON.parse(content);
}

