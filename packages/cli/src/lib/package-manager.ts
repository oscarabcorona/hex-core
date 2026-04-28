import * as fs from "node:fs";
import * as path from "node:path";

export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

/**
 * Detect which package manager the consumer's project uses by looking for
 * its lockfile in `cwd`. Order matches the conventional precedence — if
 * multiple lockfiles exist (rare, usually a migration in progress) the
 * earliest match wins. Falls back to npm when no lockfile is present.
 */
export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
	if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
	if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
	if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) return "bun";
	if (fs.existsSync(path.join(cwd, "package-lock.json"))) return "npm";
	return "npm";
}

/**
 * Return only the npm specifiers that are NOT already declared in the
 * consumer's `package.json` (in either `dependencies` or `devDependencies`).
 * Avoids re-running the install command when nothing actually needs to land.
 */
export function filterMissingDeps(cwd: string, candidates: string[]): string[] {
	const pkgPath = path.join(cwd, "package.json");
	if (!fs.existsSync(pkgPath)) return [...candidates];
	let pkg: PackageJson;
	try {
		pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PackageJson;
	} catch {
		return [...candidates];
	}
	const known = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
	// Registry items list unversioned specs (e.g. "clsx", "@radix-ui/react-dialog"),
	// so a literal set lookup is correct. If a versioned spec ever creeps in, the
	// worst case is a redundant install, which the package manager handles as a no-op.
	return candidates.filter((spec) => !known.has(spec));
}

/**
 * Build the install argv for a given package manager. Caller invokes
 * `spawn(pm, args)` — kept separate from the spawn so it's trivially
 * mockable in tests.
 */
export function installArgv(pm: PackageManager, packages: string[]): string[] {
	switch (pm) {
		case "pnpm":
			return ["add", ...packages];
		case "yarn":
			return ["add", ...packages];
		case "bun":
			return ["add", ...packages];
		case "npm":
			return ["install", ...packages];
	}
}
