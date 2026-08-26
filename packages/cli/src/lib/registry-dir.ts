import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Build the ordered list of registry-directory candidates for a given install
 * shape. Exported so tests can lock down the priority — the bundled-tarball
 * path must always win over monorepo-dev or cwd-mirror fallbacks, otherwise
 * the round-tripped npx flow regresses (the original PR #88 install bug).
 *
 * @param here - The directory containing the calling module (typically `path.dirname(fileURLToPath(import.meta.url))`).
 * @param cwd - The consumer's working directory (typically `process.cwd()`).
 */
export function buildRegistryCandidates(here: string, cwd: string): string[] {
	return [
		// Bundled inside the published tarball: dist/index.js → ../registry
		path.resolve(here, "../registry"),
		// Defensive: dist/<subdir>/x.js → ../../registry
		path.resolve(here, "../../registry"),
		// Monorepo dev: packages/cli/src/lib → ../../../../registry
		path.resolve(here, "../../../../registry"),
		// Defensive: tsx run from packages/cli/src → ../../../registry
		path.resolve(here, "../../../registry"),
		// Last-resort: consumer mirrored registry/ next to their app
		path.resolve(cwd, "registry"),
	];
}

/**
 * Return the first candidate that exists on disk. Pure — exposed for tests.
 */
export function firstExistingPath(candidates: string[]): string | null {
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

/**
 * Memoized result of the candidate probe.
 *
 * `undefined` means "not yet probed"; `null` is a real, cached "not found" —
 * the distinction matters or a missing registry re-runs five `existsSync`
 * calls at every call site. Keyed on nothing because both inputs are fixed
 * for the life of a CLI process: the module's own directory, and a `cwd` no
 * command changes.
 */
let cachedRegistryDir: string | null | undefined;

/**
 * Locate the registry directory by searching known candidate paths.
 * Shared by every CLI command so they can't drift on where the registry
 * lives relative to the published CLI bundle. Memoized — five call sites
 * (`add` twice, `list` twice, `load-catalog`) each re-ran the probe.
 * @returns The absolute path to the registry directory, or null if not found
 */
export function findRegistryDir(): string | null {
	if (cachedRegistryDir !== undefined) return cachedRegistryDir;

	const here = path.dirname(fileURLToPath(import.meta.url));
	cachedRegistryDir = firstExistingPath(buildRegistryCandidates(here, process.cwd()));
	return cachedRegistryDir;
}

/**
 * Drop the memoized directory. Tests only — they mutate the filesystem
 * between cases, which is the one situation where the assumption above
 * (a registry that does not move under a running process) is false.
 * @internal
 */
export function resetRegistryDirCache(): void {
	cachedRegistryDir = undefined;
}

/**
 * Locate the registry index JSON file using `findRegistryDir`.
 * @returns The absolute path to registry.json, or null if not found
 */
export function findRegistryIndex(): string | null {
	const dir = findRegistryDir();
	return dir ? path.join(dir, "registry.json") : null;
}
