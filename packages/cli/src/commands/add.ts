import * as fs from "node:fs";
import * as path from "node:path";
import { internalDepToSlug, SLUG_REGEX } from "@hex-core/registry";
import { type AliasConfig, DEFAULT_ALIASES, rewriteRegistryImports } from "../lib/rewrite-imports.js";
import { findRegistryDir } from "../lib/registry-dir.js";

export interface AddOptions {
	yes: boolean;
	overwrite: boolean;
	/** When true (default), also install internal component dependencies recursively. */
	deps: boolean;
}

interface Context {
	registryDir: string;
	cwd: string;
	options: AddOptions;
	aliases: AliasConfig;
	/** Slugs already processed in this invocation — prevents duplicate writes and infinite loops on future cyclic data. */
	visited: Set<string>;
}

/**
 * Load aliases from `hex.config.json` if present; fall back to the defaults
 * `hex init` would have written. Missing or partial fields are filled in.
 */
function loadAliases(cwd: string): AliasConfig {
	const configPath = path.join(cwd, "hex.config.json");
	if (!fs.existsSync(configPath)) return DEFAULT_ALIASES;
	try {
		const raw = JSON.parse(fs.readFileSync(configPath, "utf-8")) as {
			aliases?: Partial<AliasConfig>;
		};
		return { ...DEFAULT_ALIASES, ...(raw.aliases ?? {}) };
	} catch {
		return DEFAULT_ALIASES;
	}
}

/**
 * Copy a single registry item's files into the project. Writes are path-safe
 * (no escape from cwd) and skip existing files unless `--overwrite`. Returns
 * the slugs of internal component deps the item imports — the caller uses
 * this to walk the dependency graph.
 * @param name - Component slug to install
 * @param ctx - Shared registry/cwd/options/visited context
 * @returns Array of internal-dep slugs this item pulled in, or null on failure
 */
function installOne(name: string, ctx: Context): string[] | null {
	if (!SLUG_REGEX.test(name)) {
		console.error(`Invalid component name: "${name}"`);
		return null;
	}
	if (ctx.visited.has(name)) return [];
	ctx.visited.add(name);

	const itemPath = path.join(ctx.registryDir, "items", `${name}.json`);
	if (!fs.existsSync(itemPath)) {
		console.error(`Component "${name}" not found.`);
		return null;
	}

	const item = JSON.parse(fs.readFileSync(itemPath, "utf-8"));
	console.log(`\nAdding ${item.displayName}...`);

	const cwdPrefix = ctx.cwd.endsWith(path.sep) ? ctx.cwd : ctx.cwd + path.sep;
	for (const file of item.files) {
		const targetPath = path.resolve(ctx.cwd, file.path);
		// Path-traversal guard: require the resolved target to live strictly under
		// cwd. A bare `startsWith(ctx.cwd)` would accept "/Users/project-evil/x" as
		// if it lived under "/Users/project" because the prefix matches without a
		// separator. Appending the separator (or allowing equality) blocks that.
		if (targetPath !== ctx.cwd && !targetPath.startsWith(cwdPrefix)) {
			console.error(`  Skip: ${file.path} (path escapes project directory)`);
			continue;
		}
		const targetDir = path.dirname(targetPath);

		if (fs.existsSync(targetPath) && !ctx.options.overwrite) {
			console.log(`  Skip: ${file.path} (already exists, use --overwrite)`);
			continue;
		}

		fs.mkdirSync(targetDir, { recursive: true });
		// Registry items ship with monorepo-source-style imports
		// (e.g. `../command/command.js`). Rewrite to the consumer's alias
		// paths and drop `.js` suffixes before writing to disk.
		const rewritten =
			file.type === "registry:component" || file.type === "registry:lib" || /\.(?:tsx?|jsx?)$/.test(file.path)
				? rewriteRegistryImports(file.content, ctx.aliases)
				: file.content;
		fs.writeFileSync(targetPath, rewritten);
		console.log(`  Write: ${file.path}`);
	}

	const deps = item.dependencies ?? {};
	if (deps.npm?.length > 0) {
		console.log(`\n  Dependencies: ${deps.npm.join(", ")}`);
		console.log(`  Install: pnpm add ${deps.npm.join(" ")}`);
	}

	// Return every component slug this item depends on, regardless of whether
	// it's already on disk. The caller (queue loop) uses `visited` +
	// skip-if-exists to avoid redundant work; decoupling the dep list from disk
	// state means `--no-deps` warnings stay accurate across re-runs and also
	// matches what `verify_checklist` reports.
	const internalSlugs: string[] = [];
	for (const dep of (deps.internal ?? []) as string[]) {
		const depSlug = internalDepToSlug(dep);
		if (!depSlug) continue;
		internalSlugs.push(depSlug);
	}

	return internalSlugs;
}

/**
 * Add one or more components from the registry into the current project.
 * By default, also installs internal component dependencies recursively —
 * e.g. `hex add combobox` pulls in `command` and `popover` too. Pass
 * `deps: false` to skip transitive install (the CLI surfaces this as the
 * `--no-deps` flag).
 * @param components - Array of component names to add
 * @param options - Configuration flags for the add operation
 * @param options.yes - Skip confirmation prompts
 * @param options.overwrite - Overwrite existing files instead of skipping
 * @param options.deps - Install internal component dependencies recursively (default true)
 */
export async function addComponents(components: string[], options: AddOptions): Promise<void> {
	const registryDir = findRegistryDir();
	if (!registryDir) {
		console.error("Could not find registry.");
		process.exit(1);
	}

	const cwd = process.cwd();
	const ctx: Context = {
		registryDir,
		cwd,
		options,
		aliases: loadAliases(cwd),
		visited: new Set(),
	};

	const queue: string[] = [...components];
	const pendingDeps: string[] = [];

	while (queue.length > 0) {
		const name = queue.shift();
		if (!name) continue;

		const internalDeps = installOne(name, ctx);
		if (internalDeps === null) continue;

		if (options.deps) {
			// Transitive install: queue missing internal deps for the same pass.
			for (const dep of internalDeps) {
				if (!ctx.visited.has(dep)) queue.push(dep);
			}
		} else {
			pendingDeps.push(...internalDeps);
		}
	}

	if (!options.deps && pendingDeps.length > 0) {
		// Disk-aware filter at warning time: the user only wants to know about
		// deps that aren't already present in their project. installOne returned
		// the full registry list; now we narrow to actually-missing slugs.
		const missingOnDisk = Array.from(new Set(pendingDeps)).filter((slug) => {
			const p = path.resolve(ctx.cwd, "components", "ui", `${slug}.tsx`);
			return !fs.existsSync(p);
		});
		if (missingOnDisk.length > 0) {
			console.log(
				`\n  Warning: ${missingOnDisk.length} internal component(s) are not yet installed: ${missingOnDisk.join(", ")}`,
			);
			console.log(`  Install: hex add ${missingOnDisk.join(" ")}`);
			console.log(`  (or re-run without --no-deps to install them automatically)`);
		}
	}
}
