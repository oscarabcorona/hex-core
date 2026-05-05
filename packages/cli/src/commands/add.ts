import * as fs from "node:fs";
import * as path from "node:path";
import { internalDepToSlug, SLUG_REGEX } from "@hex-core/registry";
import pc from "picocolors";
import { z } from "zod";
import {
	formatManualInstallCommand,
	promptHeavyPeers,
	type PendingHeavyPeer,
} from "../lib/heavy-peer-prompt.js";
import { detectPackageManager } from "../lib/package-manager.js";
import { resolveAlias } from "../lib/resolve-alias.js";
import { type AliasConfig, DEFAULT_ALIASES, rewriteRegistryImports } from "../lib/rewrite-imports.js";
import { findRegistryDir } from "../lib/registry-dir.js";
import { runInstall } from "../lib/run-install.js";
import { withSpinner } from "../lib/spinner.js";

export interface AddOptions {
	yes: boolean;
	overwrite: boolean;
	/** When true (default), also install internal component dependencies recursively. */
	deps: boolean;
	/** When true (default), also auto-install npm peer deps via the consumer's package manager. */
	install: boolean;
	/** When true, plan but do not write files or run installs. Prints what would happen. */
	dryRun?: boolean;
	/** Optional path to a `hex.components.json`-style manifest. If set, the manifest's `components` array seeds the queue. */
	from?: string;
}

const ManifestSchema = z.object({
	components: z.array(z.string().regex(SLUG_REGEX, "invalid component slug")).min(1),
});

interface Context {
	registryDir: string;
	cwd: string;
	options: AddOptions;
	aliases: AliasConfig;
	/** Slugs already processed in this invocation — prevents duplicate writes and infinite loops on future cyclic data. */
	visited: Set<string>;
	/** Aggregate npm peer deps collected across every item the queue installs. Deduped + auto-installed once at the end. */
	pendingNpmDeps: Set<string>;
	/** Post-install reminder strings (e.g. "mount <Toaster /> in layout"). Deduped + printed once at the end. */
	postInstallHints: Set<string>;
	/** Heavy peer deps (xterm, mermaid, etc.) keyed by package name. `requiredBy` accumulates the slugs that asked for each. */
	pendingHeavyPeers: Map<string, PendingHeavyPeer>;
	/** Files that would be written (in dry-run) or were written. Cwd-relative for stable display. */
	plannedWrites: string[];
}

/**
 * Translate a registry-item file path (e.g. `"components/ui/button.tsx"` or
 * `"lib/utils.ts"`) into the absolute write path the consumer's project
 * actually expects, honoring `hex.config.json#aliases` and `tsconfig.json`.
 *
 * The registry stores paths with a fixed prefix convention: every component
 * file starts with `components/`, every shared util with `lib/`. We strip
 * that prefix and prepend the resolved alias root, so a Next.js `--src-dir`
 * project gets `<cwd>/src/components/ui/button.tsx` instead of the raw
 * `<cwd>/components/ui/button.tsx`.
 */
export function resolveWritePath(cwd: string, aliases: AliasConfig, filePath: string): string {
	const normalized = filePath.replace(/\\/g, "/");
	if (normalized.startsWith("components/")) {
		const rest = normalized.slice("components/".length);
		return path.join(resolveAlias(cwd, aliases.components), rest);
	}
	if (normalized.startsWith("lib/")) {
		const rest = normalized.slice("lib/".length);
		return path.join(resolveAlias(cwd, aliases.lib), rest);
	}
	return path.resolve(cwd, normalized);
}

/** Cwd-relative version for log lines — keeps output portable across machines. */
function displayPath(cwd: string, abs: string): string {
	const rel = path.relative(cwd, abs);
	return rel === "" ? "." : rel;
}

/**
 * Per-component post-install reminders. Some items can't fully wire themselves
 * into a host app from `add` alone — sonner needs a `<Toaster />` mounted in
 * the root layout, for example. These hints get aggregated across the queue
 * and printed once at the end so the user can't miss the step.
 *
 * Promote to a registry-schema field once a third item needs one — three
 * lines of inline data is cheaper than a schema migration today.
 */
const POST_INSTALL_HINTS: Record<string, string> = {
	sonner: [
		"Mount <Toaster /> once in your root layout (e.g. app/layout.tsx) so toast() calls render somewhere:",
		"",
		"  import { Toaster } from \"@/components/ui/sonner\";",
		"",
		"  export default function RootLayout({ children }) {",
		"    return (",
		"      <html><body>",
		"        {children}",
		"        <Toaster />",
		"      </body></html>",
		"    );",
		"  }",
	].join("\n"),
};

/**
 * A shared lib file is an idempotent utility that every component pulls in
 * (lib/utils.ts, lib/color.ts). On a re-`add`, we silently skip these
 * instead of nagging the user about `--overwrite` — they almost never want
 * to clobber a customized lib/utils.ts just to install another component.
 */
function isSharedLibFile(file: { path: string; type?: string }): boolean {
	if (file.type === "registry:lib") return true;
	const normalized = file.path.replace(/\\/g, "/");
	return normalized.startsWith("lib/") || normalized.startsWith("./lib/");
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
	console.log(`\nAdding ${pc.bold(item.displayName)}...`);

	const cwdPrefix = ctx.cwd.endsWith(path.sep) ? ctx.cwd : ctx.cwd + path.sep;
	for (const file of item.files) {
		const targetPath = resolveWritePath(ctx.cwd, ctx.aliases, file.path);
		// Path-traversal guard: require the resolved target to live strictly under
		// cwd. A bare `startsWith(ctx.cwd)` would accept "/Users/project-evil/x" as
		// if it lived under "/Users/project" because the prefix matches without a
		// separator. Appending the separator (or allowing equality) blocks that.
		if (targetPath !== ctx.cwd && !targetPath.startsWith(cwdPrefix)) {
			console.error(`  Skip: ${file.path} (path escapes project directory)`);
			continue;
		}
		const targetDir = path.dirname(targetPath);
		const display = displayPath(ctx.cwd, targetPath);

		if (fs.existsSync(targetPath) && !ctx.options.overwrite) {
			// Shared lib files (lib/utils.ts, lib/color.ts) are idempotent
			// utilities every component depends on. Once any component is added,
			// they're already on disk, and every subsequent `hex add` would print
			// a misleading "use --overwrite" line for them — but you almost never
			// want to clobber a customized lib/utils.ts just to add another
			// component. Silently no-op for these. Component files keep the loud
			// hint since "I want to refresh my Button source" is the common case.
			if (isSharedLibFile(file)) continue;
			console.log(`  ${pc.dim("Skip:")} ${display} ${pc.dim("(already exists, use --overwrite)")}`);
			continue;
		}

		// Registry items ship with monorepo-source-style imports
		// (e.g. `../command/command.js`). Rewrite to the consumer's alias
		// paths and drop `.js` suffixes before writing to disk.
		const rewritten =
			file.type === "registry:component" || file.type === "registry:lib" || /\.(?:tsx?|jsx?)$/.test(file.path)
				? rewriteRegistryImports(file.content, ctx.aliases)
				: file.content;
		if (!ctx.options.dryRun) {
			fs.mkdirSync(targetDir, { recursive: true });
			fs.writeFileSync(targetPath, rewritten);
		}
		ctx.plannedWrites.push(display);
		const verb = ctx.options.dryRun ? pc.cyan("Would write:") : pc.green("Write:");
		console.log(`  ${verb} ${display}`);
	}

	const deps = item.dependencies ?? {};
	if (deps.npm?.length > 0) {
		console.log(`\n  Dependencies: ${deps.npm.join(", ")}`);
		for (const npm of deps.npm) ctx.pendingNpmDeps.add(npm);
	}

	if (Array.isArray(deps.heavyPeer) && deps.heavyPeer.length > 0) {
		for (const hp of deps.heavyPeer) {
			const existing = ctx.pendingHeavyPeers.get(hp.name);
			if (existing) {
				if (!existing.requiredBy.includes(name)) existing.requiredBy.push(name);
				// Two components requesting the same peer at different
				// version ranges — first-wins, but warn so the user knows
				// they may need to bump one component to align the range.
				if (existing.version !== hp.version) {
					console.warn(
						`  Warning: heavy peer ${hp.name} requested as both ` +
							`${existing.version} (by ${existing.requiredBy.filter((r) => r !== name).join(", ")}) ` +
							`and ${hp.version} (by ${name}). Using ${existing.version}.`,
					);
				}
			} else {
				ctx.pendingHeavyPeers.set(hp.name, {
					name: hp.name,
					version: hp.version,
					bundleKbGzip: hp.bundleKbGzip,
					reason: hp.reason,
					requiredBy: [name],
				});
			}
		}
	}

	const hint = POST_INSTALL_HINTS[name];
	if (hint) ctx.postInstallHints.add(hint);

	// Return every component slug this item depends on, regardless of whether
	// it's already on disk. The caller (queue loop) uses `visited` +
	// skip-if-exists to avoid redundant work; decoupling the dep list from disk
	// state means `--no-deps` warnings stay accurate across re-runs and also
	// matches what `verify_checklist` reports.
	const internalSlugs: string[] = [];
	for (const dep of (deps.internal ?? []) as string[]) {
		const depSlug = internalDepToSlug(dep);
		if (!depSlug) {
			// `lib/utils` is the conventional ref to the shared util module, not
			// a component slug — exempt so the warning stays signal, not noise.
			if (dep && dep !== "lib/utils") {
				console.warn(
					`  Warning: ignoring unrecognized internal dep "${dep}" — expected "primitives/<slug>/<slug>", "components/<slug>/<slug>", or "blocks/<slug>/<slug>".`,
				);
			}
			continue;
		}
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

	// Resolve initial queue: positional args XOR manifest. Mixing them is
	// almost always a mistake (the user typed both by accident), so error
	// rather than guess which the user actually meant.
	if (options.from && components.length > 0) {
		console.error("Pass either positional component names or --from <manifest>, not both.");
		process.exit(1);
	}
	const queue: string[] = options.from ? readManifest(cwd, options.from) : [...components];

	const ctx: Context = {
		registryDir,
		cwd,
		options,
		aliases: loadAliases(cwd),
		visited: new Set(),
		pendingNpmDeps: new Set(),
		postInstallHints: new Set(),
		pendingHeavyPeers: new Map(),
		plannedWrites: [],
	};

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
		const componentsRoot = resolveAlias(ctx.cwd, ctx.aliases.components);
		const missingOnDisk = Array.from(new Set(pendingDeps)).filter((slug) => {
			const p = path.join(componentsRoot, "ui", `${slug}.tsx`);
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

	if (ctx.pendingNpmDeps.size > 0) {
		const all = Array.from(ctx.pendingNpmDeps);
		if (options.dryRun) {
			console.log(`\n${pc.cyan("Would install:")} ${all.join(", ")}`);
		} else if (!options.install) {
			console.log(`\nSkipping auto-install (--no-install). Run yourself:`);
			console.log(`  pnpm add ${all.join(" ")}`);
		} else {
			const result = await withSpinner(`Resolving ${all.length} peer dep${all.length === 1 ? "" : "s"}…`, () =>
				runInstall(all, { cwd }),
			);
			if (result.installed.length > 0 && result.exitCode !== 0) {
				console.log(`\nPeer-dep install via ${result.manager} exited with code ${result.exitCode}.`);
				console.log(`Run yourself: ${result.manager} ${result.manager === "npm" ? "install" : "add"} ${result.installed.join(" ")}`);
			}
		}
	}

	if (ctx.pendingHeavyPeers.size > 0) {
		const peers = Array.from(ctx.pendingHeavyPeers.values());
		if (options.dryRun) {
			console.log(`\n${pc.cyan("Would prompt for heavy peers:")}`);
			for (const peer of peers) {
				console.log(`  → ${peer.name}@${peer.version}${peer.bundleKbGzip ? `  (~${peer.bundleKbGzip} KB gzip)` : ""}`);
			}
		} else if (!options.install) {
			const manager = detectPackageManager(cwd);
			console.log(`\nThe following heavy peer dependencies were skipped (--no-install):`);
			for (const peer of peers) {
				console.log(`  → ${peer.name}@${peer.version}${peer.bundleKbGzip ? `  (~${peer.bundleKbGzip} KB gzip)` : ""}`);
			}
			console.log(`\n  Run yourself: ${formatManualInstallCommand(manager, peers)}`);
		} else {
			const accepted = await promptHeavyPeers(peers, { assumeYes: options.yes });
			if (accepted) {
				const specs = peers.map((p) => `${p.name}@${p.version}`);
				const result = await withSpinner(
					`Installing ${specs.length} heavy peer${specs.length === 1 ? "" : "s"}…`,
					() => runInstall(specs, { cwd }),
				);
				if (result.installed.length > 0 && result.exitCode !== 0) {
					console.log(`\nHeavy-peer install via ${result.manager} exited with code ${result.exitCode}.`);
					console.log(`  Run yourself: ${formatManualInstallCommand(result.manager, peers)}`);
				}
			} else {
				const manager = detectPackageManager(cwd);
				console.log(`\nSkipped. Install when you're ready:`);
				console.log(`  ${formatManualInstallCommand(manager, peers)}`);
				console.log(`  (the component source was still copied — it just won't import successfully until the peer is installed)`);
			}
		}
	}

	if (ctx.postInstallHints.size > 0) {
		const heading = options.dryRun ? `Would print next steps:` : `Next steps:`;
		console.log(`\n${heading}`);
		for (const hint of ctx.postInstallHints) {
			console.log(`\n${hint}`);
		}
	}

	if (options.dryRun) {
		console.log(`\n${pc.cyan(`Dry-run summary:`)} ${ctx.plannedWrites.length} file${ctx.plannedWrites.length === 1 ? "" : "s"} would be written, ${ctx.pendingNpmDeps.size} dep${ctx.pendingNpmDeps.size === 1 ? "" : "s"} would be installed.`);
		console.log(pc.dim(`(Re-run without --dry-run to apply.)`));
	}
}

/**
 * Read a `hex.components.json`-style manifest, validate its shape, and
 * return the list of component slugs to enqueue. Resolved relative to cwd.
 *
 * Schema: `{ "components": ["button", "card", ...] }`. Anything else
 * (extra fields, mistyped values) errors with a friendly message — the
 * file format is the user's commit-tracked source of truth, so silent
 * coercion would mask bugs they need to see.
 */
function readManifest(cwd: string, manifestPath: string): string[] {
	const abs = path.isAbsolute(manifestPath) ? manifestPath : path.resolve(cwd, manifestPath);
	if (!fs.existsSync(abs)) {
		console.error(`Manifest not found: ${manifestPath}`);
		process.exit(1);
	}
	let raw: unknown;
	try {
		raw = JSON.parse(fs.readFileSync(abs, "utf-8"));
	} catch (err) {
		console.error(`Manifest ${manifestPath} is not valid JSON: ${(err as Error).message}`);
		process.exit(1);
	}
	const result = ManifestSchema.safeParse(raw);
	if (!result.success) {
		console.error(`Manifest ${manifestPath} is malformed:`);
		for (const issue of result.error.issues) {
			console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}
	return result.data.components;
}
