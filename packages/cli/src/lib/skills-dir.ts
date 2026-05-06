import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Check whether a directory contains at least one hex-core skill. A skill is
 * defined as a subdirectory whose name starts with `hex-core-` and which
 * contains a `SKILL.md`. Used as a marker so `findSkillsDir` won't return
 * an unrelated `skills/` directory that happens to exist at a candidate
 * path (e.g. from an unrelated repo on the dev machine).
 * @param dir - Absolute directory to probe
 * @returns true if at least one hex-core-*\/SKILL.md exists
 */
function looksLikeHexSkillsDir(dir: string): boolean {
	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (!entry.name.startsWith("hex-core-")) continue;
		if (fs.existsSync(path.join(dir, entry.name, "SKILL.md"))) return true;
	}
	return false;
}

/**
 * Locate the bundled skills directory by searching known candidate paths.
 * Two resolution contexts, in priority order:
 *   1. Published build: the CLI tarball ships `skills/` alongside `dist/`
 *      (prebuild step copies the repo-root `skills/` into `packages/cli/skills/`).
 *      From `packages/cli/dist/<chunk>.js`, that's `../skills`.
 *   2. Dev via `tsx` from `packages/cli/src/lib/skills-dir.ts`: the repo-root
 *      `skills/` lives 4 dirs up (repo → packages → cli → src → lib).
 *   3. Fallback: cwd-relative for users running from the repo root.
 *
 * Every candidate is additionally required to contain at least one
 * `hex-core-*\/SKILL.md`, so an unrelated `skills/` directory at a parent
 * path can't masquerade as the bundled pack.
 * @returns Absolute path to the skills dir, or null if not found
 */
export function findSkillsDir(): string | null {
	const here = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		path.resolve(here, "../skills"), // published: packages/cli/dist/ → packages/cli/skills
		path.resolve(here, "../../../../skills"), // dev: packages/cli/src/lib/ → repo-root skills
		path.resolve(process.cwd(), "skills"), // repo root
	];

	for (const candidate of candidates) {
		if (looksLikeHexSkillsDir(candidate)) return candidate;
	}
	return null;
}
