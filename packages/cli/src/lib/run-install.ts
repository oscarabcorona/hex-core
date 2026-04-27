import { spawn, type SpawnOptions } from "node:child_process";
import { detectPackageManager, filterMissingDeps, installArgv, type PackageManager } from "./package-manager.js";

export interface RunInstallOptions {
	cwd?: string;
	/** When true, skip the actual spawn and only return the planned command. */
	dryRun?: boolean;
	/** Inject for unit testing — defaults to node:child_process spawn. */
	spawnImpl?: typeof spawn;
}

export interface RunInstallResult {
	/** The package manager we resolved (or would have used in --dry-run). */
	manager: PackageManager;
	/** Specs that were already present and got skipped. */
	skipped: string[];
	/** Specs that the install command was invoked with. */
	installed: string[];
	/** Exit code from the install spawn — 0 means success, undefined when no install was needed. */
	exitCode?: number;
}

/**
 * Auto-install npm peer deps that registry items declared. Detects the
 * consumer's package manager from lockfiles, filters out anything already
 * declared in their `package.json`, and runs `<pm> add <pkgs>` with stdio
 * inherited so progress is visible.
 *
 * Resolves with a result describing what happened — never throws on a
 * non-zero exit since the caller wants to print a fallback hint, not
 * crash the whole `add` flow over a transient install failure.
 */
export async function runInstall(packages: string[], options: RunInstallOptions = {}): Promise<RunInstallResult> {
	const cwd = options.cwd ?? process.cwd();
	const manager = detectPackageManager(cwd);
	const missing = filterMissingDeps(cwd, packages);
	const skipped = packages.filter((p) => !missing.includes(p));

	if (missing.length === 0) {
		return { manager, skipped, installed: [] };
	}
	if (options.dryRun) {
		return { manager, skipped, installed: missing };
	}

	const args = installArgv(manager, missing);
	const spawnFn = options.spawnImpl ?? spawn;
	const spawnOptions: SpawnOptions = { cwd, stdio: "inherit", shell: false };

	console.log(`\n> ${manager} ${args.join(" ")}`);
	const exitCode = await new Promise<number>((resolve) => {
		const child = spawnFn(manager, args, spawnOptions);
		child.on("close", (code) => resolve(code ?? 1));
		child.on("error", () => resolve(1));
	});

	return { manager, skipped, installed: missing, exitCode };
}
