import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Locate the registry directory by searching known candidate paths.
 * Shared by every CLI command so they can't drift on where the registry
 * lives relative to the published CLI bundle.
 * @returns The absolute path to the registry directory, or null if not found
 */
export function findRegistryDir(): string | null {
	const here = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		// Bundled inside the published tarball: dist/index.js → ../registry
		path.resolve(here, "../registry"),
		// Defensive: dist/<subdir>/x.js → ../../registry
		path.resolve(here, "../../registry"),
		// Monorepo dev: packages/cli/src/lib → ../../../../registry
		path.resolve(here, "../../../../registry"),
		// Defensive: tsx run from packages/cli/src → ../../../registry
		path.resolve(here, "../../../registry"),
		// Last-resort: consumer mirrored registry/ next to their app
		path.resolve(process.cwd(), "registry"),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

/**
 * Locate the registry index JSON file using `findRegistryDir`.
 * @returns The absolute path to registry.json, or null if not found
 */
export function findRegistryIndex(): string | null {
	const dir = findRegistryDir();
	return dir ? path.join(dir, "registry.json") : null;
}
