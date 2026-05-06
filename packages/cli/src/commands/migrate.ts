import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { detectFramework, type FrameworkDetection } from "../lib/detect-framework.js";
import { detectShadcn, type ShadcnDetection, type ShadcnFile } from "../lib/detect-shadcn.js";
import { detectTailwind } from "../lib/detect-tailwind.js";
import { SKIP_REASONS } from "../lib/migrate-mapping.js";
import { detectPackageManager, type PackageManager } from "../lib/package-manager.js";
import { findRegistryDir } from "../lib/registry-dir.js";
import { type AliasConfig, DEFAULT_ALIASES, rewriteRegistryImports } from "../lib/rewrite-imports.js";
import { resolveWritePath } from "./add.js";
import { runInstall } from "../lib/run-install.js";

export interface MigrateOptions {
	/** Skip the confirmation prompt before writing. */
	yes: boolean;
	/** Plan + print but don't write or spawn. */
	dryRun: boolean;
	/** Default true — write `*.shadcn.bak` next to each replaced file. */
	backup: boolean;
	/** Default true — auto-install peer deps via the consumer's package manager. */
	install: boolean;
	/** Override `cwd` for monorepo escape hatches. */
	from?: string;
	/** `preserve` (default): leave globals.css alone. `replace`: swap to Hex Core's default theme. */
	theme: "preserve" | "replace";
	/** Comma-listed slugs to restrict the migration to. Empty = all detected. */
	only: string[];
}

interface MigratedFile {
	abs: string;
	shadcnSlug: string;
	hexSlug: string;
	display: string;
	backup: string | null;
}

interface SkippedFile {
	abs: string;
	shadcnSlug: string;
	display: string;
	reason: string;
}

interface MigrateContext {
	cwd: string;
	registryDir: string;
	options: MigrateOptions;
	framework: FrameworkDetection;
	shadcn: ShadcnDetection;
	aliases: AliasConfig;
	pm: PackageManager;
	tailwind: ReturnType<typeof detectTailwind>;
	migrated: MigratedFile[];
	renamed: MigratedFile[];
	skipped: SkippedFile[];
	pendingNpmDeps: Set<string>;
	plannedWrites: string[];
	plannedBackups: string[];
}

/**
 * Read + parse a JSON file. Returns null on missing file or invalid JSON so
 * callers don't have to wrap every read in their own try/catch.
 * @param file - Absolute path to the JSON file.
 * @returns Parsed value cast to `T`, or null on any read/parse error.
 */
function readJson<T>(file: string): T | null {
	try {
		return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
	} catch {
		return null;
	}
}

/**
 * Cwd-relative version for log lines — keeps output portable across machines.
 * @param cwd - Project root.
 * @param abs - Absolute path on disk.
 * @returns The path relative to `cwd`, or `"."` when they point at the same dir.
 */
function displayPath(cwd: string, abs: string): string {
	const rel = path.relative(cwd, abs);
	return rel === "" ? "." : rel;
}

/**
 * Load aliases from `hex.config.json` if present; otherwise derive from the
 * shadcn `components.json` so the migrator writes to the same paths the
 * consumer's existing JSX already imports from. Falls back to defaults.
 * @param cwd - Project root.
 * @param shadcn - Detection result (used for the `components.json` fallback).
 * @returns Resolved alias config to use for every write in this run.
 */
function loadAliases(cwd: string, shadcn: ShadcnDetection): AliasConfig {
	const hexConfigPath = path.join(cwd, "hex.config.json");
	if (fs.existsSync(hexConfigPath)) {
		const raw = readJson<{ aliases?: Partial<AliasConfig> }>(hexConfigPath);
		if (raw?.aliases) return { ...DEFAULT_ALIASES, ...raw.aliases };
	}
	if (shadcn.componentsJsonPath) {
		const raw = readJson<{ aliases?: { components?: string; utils?: string } }>(shadcn.componentsJsonPath);
		if (raw?.aliases) {
			return {
				components: raw.aliases.components ?? DEFAULT_ALIASES.components,
				// shadcn calls it `utils` (one path); Hex Core's `lib` alias maps to the
				// same dir. Strip a trailing `/utils` if shadcn's value pointed at the
				// file rather than the directory.
				lib:
					raw.aliases.utils?.replace(/\/utils$/, "") ??
					DEFAULT_ALIASES.lib,
			};
		}
	}
	return DEFAULT_ALIASES;
}

/**
 * Build the absolute backup path for a shadcn file. Appends a timestamp on
 * EEXIST so re-runs don't clobber prior `.bak` files.
 * @param abs - Absolute path of the file to back up.
 * @returns Absolute path to write the backup to.
 */
function backupPath(abs: string): string {
	const dir = path.dirname(abs);
	const base = path.basename(abs);
	const candidate = path.join(dir, `${base}.shadcn.bak`);
	if (!fs.existsSync(candidate)) return candidate;
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	return path.join(dir, `${base}.shadcn.${stamp}.bak`);
}

/**
 * Backup, then overwrite a single shadcn file with the matching Hex Core
 * registry item content. Records the outcome on the context.
 * @param file - Shadcn file detected in the consumer's UI dir, with its
 *               resolved Hex Core slug + status (match | rename | no-mapping).
 * @param ctx - Migration context (cwd, registry, options, report buckets).
 */
function migrateOneFile(file: ShadcnFile, ctx: MigrateContext): void {
	if (file.hexSlug === null) {
		ctx.skipped.push({
			abs: file.abs,
			shadcnSlug: file.shadcnSlug,
			display: displayPath(ctx.cwd, file.abs),
			reason: SKIP_REASONS[file.shadcnSlug] ?? "no Hex Core equivalent",
		});
		return;
	}

	if (ctx.options.only.length > 0 && !ctx.options.only.includes(file.shadcnSlug)) {
		// Filtered out by --only — silently skip without recording.
		return;
	}

	const itemPath = path.join(ctx.registryDir, "items", `${file.hexSlug}.json`);
	const item = readJson<{ files: Array<{ path: string; content: string; type?: string }>; dependencies?: { npm?: string[] } }>(itemPath);
	if (!item) {
		ctx.skipped.push({
			abs: file.abs,
			shadcnSlug: file.shadcnSlug,
			display: displayPath(ctx.cwd, file.abs),
			reason: `Hex Core item file missing at ${displayPath(ctx.cwd, itemPath)} — skipping`,
		});
		return;
	}

	// shadcn writes one .tsx per slug at <ui-dir>/<slug>.tsx. The Hex Core
	// item may ship multiple files (component + variants + lib helpers). On
	// rename (toast → sonner), the primary file lands at the NEW slug's path
	// (sonner.tsx), and we delete the consumer's original toast.tsx after
	// taking a backup. On a same-slug match (button → button), we overwrite
	// in place.
	const uiDir = path.dirname(file.abs);
	const isRename = file.status === "rename";
	const display = displayPath(ctx.cwd, file.abs);

	// Backup the consumer's original file once, before any writes touch it.
	if (ctx.options.backup && !ctx.options.dryRun) {
		const bakAbs = backupPath(file.abs);
		try {
			fs.copyFileSync(file.abs, bakAbs, fs.constants.COPYFILE_EXCL);
			ctx.plannedBackups.push(displayPath(ctx.cwd, bakAbs));
		} catch (err) {
			console.warn(`  ${pc.yellow("Warning:")} backup failed for ${display}: ${(err as Error).message}`);
		}
	}

	const cwdPrefix = ctx.cwd.endsWith(path.sep) ? ctx.cwd : ctx.cwd + path.sep;

	for (const f of item.files) {
		const normalized = f.path.replace(/\\/g, "/");
		const isPrimaryComponent = normalized === `components/ui/${file.hexSlug}.tsx`;
		// Primary file lands at the consumer's actual ui dir + the new slug
		// name (handles renames). Sibling files (variants, lib helpers) go
		// through resolveWritePath so they honor `hex.config.json` aliases
		// and tsconfig — same machinery `hex add` uses.
		const writeAbs = isPrimaryComponent
			? path.join(uiDir, `${file.hexSlug}.tsx`)
			: resolveWritePath(ctx.cwd, ctx.aliases, normalized);

		// Path-traversal guard. A malicious or malformed registry item with a
		// `../../../` file path would otherwise escape the project root. Mirrors
		// the same defense in `add.ts:installOne`.
		if (writeAbs !== ctx.cwd && !writeAbs.startsWith(cwdPrefix)) {
			console.error(`  ${pc.red("Skip:")} ${f.path} (path escapes project directory)`);
			continue;
		}

		const writeDisplay = displayPath(ctx.cwd, writeAbs);

		const rewritten =
			f.type === "registry:component" || f.type === "registry:lib" || /\.(?:tsx?|jsx?)$/.test(f.path)
				? rewriteRegistryImports(f.content, ctx.aliases)
				: f.content;

		if (ctx.options.dryRun) {
			ctx.plannedWrites.push(writeDisplay);
			console.log(`  ${pc.cyan("Would write:")} ${writeDisplay}`);
			continue;
		}

		fs.mkdirSync(path.dirname(writeAbs), { recursive: true });
		try {
			// Primary component file: always overwrite (it's the whole point).
			// Sibling files (variants, lib helpers): exclusive create — never
			// clobber an existing lib helper.
			fs.writeFileSync(writeAbs, rewritten, { flag: isPrimaryComponent ? "w" : "wx" });
			ctx.plannedWrites.push(writeDisplay);
			console.log(`  ${pc.green("Write:")} ${writeDisplay}`);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === "EEXIST") {
				// Sibling lib file already present — silently skip (idempotent).
				continue;
			}
			throw err;
		}
	}

	// Rename case: the consumer's original file (e.g. toast.tsx) is now obsolete
	// — its replacement landed at a new path (sonner.tsx). Delete the original
	// after the new file has been successfully written. Backup already taken above.
	if (isRename && !ctx.options.dryRun) {
		try {
			fs.rmSync(file.abs);
		} catch {
			// Original missing or unreadable — non-fatal; the migration result
			// (new file written + backup taken) still represents user intent.
		}
	}

	for (const npm of item.dependencies?.npm ?? []) ctx.pendingNpmDeps.add(npm);

	const record: MigratedFile = {
		abs: file.abs,
		shadcnSlug: file.shadcnSlug,
		hexSlug: file.hexSlug,
		display,
		backup: ctx.options.backup && !ctx.options.dryRun ? backupPath(file.abs) : null,
	};
	if (file.status === "rename") ctx.renamed.push(record);
	else ctx.migrated.push(record);
}

/**
 * Rename `components.json` to `components.json.shadcn.bak` so `hex doctor`
 * can flag any leftover shadcn artifacts after the migration. Skipped under
 * `--dry-run` and `--no-backup`.
 * @param ctx - Migration context.
 */
function archiveComponentsJson(ctx: MigrateContext): void {
	const src = ctx.shadcn.componentsJsonPath;
	if (!src || ctx.options.dryRun) return;
	const dst = `${src}.shadcn.bak`;
	if (fs.existsSync(dst)) return;
	try {
		fs.renameSync(src, dst);
		console.log(`  ${pc.dim("Renamed:")} ${displayPath(ctx.cwd, src)} → ${path.basename(dst)}`);
	} catch (err) {
		console.warn(`  ${pc.yellow("Warning:")} could not rename components.json: ${(err as Error).message}`);
	}
}

/**
 * Locate the consumer's `globals.css` — Next.js convention puts it at
 * `app/globals.css` (with or without the `src/` prefix). Returns null when
 * neither candidate exists, in which case `--theme=replace` is a no-op.
 * @param cwd - Project root.
 * @returns Absolute path to globals.css, or null when none of the
 *          conventional locations holds the file.
 */
function findGlobalsCss(cwd: string): string | null {
	const candidates = [
		path.join(cwd, "src/app/globals.css"),
		path.join(cwd, "app/globals.css"),
		path.join(cwd, "src/globals.css"),
		path.join(cwd, "globals.css"),
	];
	for (const c of candidates) {
		if (fs.existsSync(c)) return c;
	}
	return null;
}

/**
 * Replace the `:root` and `.dark` blocks in the consumer's globals.css with
 * Hex Core's default palette. Reuses the existing `themeApply` machinery so
 * surgical replacement (no clobbered custom CSS rules) stays consistent
 * across `hex theme apply` and `hex migrate --theme=replace`.
 * @param ctx - Migration context (carries cwd + report state).
 */
async function applyDefaultTheme(ctx: MigrateContext): Promise<void> {
	const cssPath = findGlobalsCss(ctx.cwd);
	if (!cssPath) {
		console.log(`  ${pc.yellow("Note:")} --theme=replace requested but no globals.css found — skipping.`);
		return;
	}
	const { themeApply } = await import("./theme.js");
	const original = process.cwd();
	process.chdir(ctx.cwd);
	try {
		await themeApply({ name: "default", file: path.relative(ctx.cwd, cssPath) });
	} finally {
		process.chdir(original);
	}
}

/**
 * Write `hex.config.json` mirroring the resolved aliases so subsequent
 * `hex add` invocations land in the same place. Skipped if one already
 * exists.
 * @param ctx - Migration context.
 */
function writeHexConfig(ctx: MigrateContext): void {
	const dst = path.join(ctx.cwd, "hex.config.json");
	if (fs.existsSync(dst) || ctx.options.dryRun) return;
	const config = {
		$schema: "https://hex-core.dev/schema/config.json",
		framework: "react",
		styling: "tailwind",
		typescript: true,
		theme: "default",
		aliases: ctx.aliases,
	};
	fs.writeFileSync(dst, `${JSON.stringify(config, null, 2)}\n`);
	console.log(`  ${pc.green("Wrote:")} hex.config.json`);
}

/**
 * Print the migration header — framework label, detected paths, PM, aliases.
 * Runs once at the start of `migrateProject` to anchor the report layout.
 * @param ctx - Migration context.
 */
function renderHeader(ctx: MigrateContext): void {
	console.log(`\n${pc.bold("Hex migrate")} — ${ctx.framework.label} → Hex Core\n`);
	const detectedBits: string[] = [];
	if (ctx.shadcn.componentsJsonPath) detectedBits.push("components.json");
	if (ctx.shadcn.signals.uiDir) detectedBits.push(displayPath(ctx.cwd, ctx.shadcn.signals.uiDir));
	detectedBits.push(ctx.pm);
	console.log(`  ${pc.dim("Detected:")} ${detectedBits.join(", ")}`);
	console.log(`  ${pc.dim("Tailwind:")} ${ctx.tailwind.version}`);
	console.log(`  ${pc.dim("Aliases:")}  ${ctx.aliases.components}, ${ctx.aliases.lib}`);
	if (ctx.shadcn.conflicts.hasHexConfig) {
		console.log(`  ${pc.yellow("Note:")} hex.config.json already present — re-run scenario`);
	}
	console.log("");
}

/**
 * Print the migration summary — counts per outcome bucket, peer install
 * result, theme strategy, and follow-up checklist (Toaster mount, manual
 * carousel/chart replacements, doctor verification).
 * @param ctx - Migration context.
 * @param installed - Specs the package manager actually installed.
 * @param installSkipped - Specs already declared in the consumer's package.json.
 */
function renderReport(ctx: MigrateContext, installed: string[], installSkipped: string[]): void {
	console.log(`\n${pc.bold("Summary")}`);
	if (ctx.migrated.length > 0) {
		console.log(`  ${pc.green(`Migrated (${ctx.migrated.length}):`)} ${ctx.migrated.map((m) => m.shadcnSlug).join(", ")}`);
	}
	if (ctx.renamed.length > 0) {
		const renames = ctx.renamed.map((r) => `${r.shadcnSlug} → ${r.hexSlug}`).join(", ");
		console.log(`  ${pc.cyan(`Renamed (${ctx.renamed.length}):`)} ${renames}`);
	}
	if (ctx.skipped.length > 0) {
		console.log(`  ${pc.yellow(`Skipped (${ctx.skipped.length}):`)}`);
		for (const s of ctx.skipped) {
			console.log(`    ${s.shadcnSlug} — ${s.reason}`);
		}
	}
	if (!ctx.options.dryRun && ctx.options.backup && ctx.plannedBackups.length > 0) {
		console.log(`  ${pc.dim(`Backups: ${ctx.plannedBackups.length} .shadcn.bak files written`)}`);
	}
	if (installed.length > 0) {
		console.log(`  ${pc.dim("Peers:")}    ${ctx.pm} added ${installed.length} new (${installed.join(", ")})`);
	} else if (installSkipped.length > 0 && ctx.pendingNpmDeps.size > 0) {
		console.log(`  ${pc.dim("Peers:")}    all ${ctx.pendingNpmDeps.size} already declared`);
	}
	const themeMsg =
		ctx.options.theme === "replace"
			? "globals.css updated to Hex Core default palette"
			: "preserved your globals.css (run `hex theme apply default` to switch palette)";
	console.log(`  ${pc.dim("Theme:")}    ${themeMsg}`);

	const followUps: string[] = [];
	if (ctx.renamed.some((r) => r.hexSlug === "sonner")) {
		followUps.push(`Mount <Toaster /> in ${ctx.framework.entryHint} (replaces shadcn's toast)`);
	}
	const carouselHit = ctx.skipped.some((s) => s.shadcnSlug === "carousel");
	const chartHit = ctx.skipped.some((s) => s.shadcnSlug === "chart");
	if (carouselHit) followUps.push("Replace <Carousel /> usages — Hex Core has no equivalent yet");
	if (chartHit) followUps.push("Replace <Chart /> usages — try the artifacts/* family for richer alternatives");
	followUps.push("Run `hex doctor` to verify");

	console.log(`\n${pc.bold("Follow-ups:")}`);
	for (let i = 0; i < followUps.length; i++) {
		console.log(`  ${i + 1}. ${followUps[i]}`);
	}
}

/**
 * Convert a Next.js / Vite / CRA / CRACO project from shadcn/ui to Hex Core.
 * Walks `<components>/ui/*.tsx`, intersects each filename with the shadcn
 * mapping table, backs up + replaces matched files in place, then installs
 * any missing Radix peers via the consumer's package manager.
 *
 * Idempotent — a re-run on a successfully-migrated project finds no shadcn
 * signal and exits cleanly.
 */
export async function migrateProject(options: MigrateOptions): Promise<void> {
	const cwd = options.from ? path.resolve(options.from) : process.cwd();

	const registryDir = findRegistryDir();
	if (!registryDir) {
		console.error("Could not find Hex Core registry. Are you running from inside the published CLI?");
		process.exit(1);
	}

	if (!fs.existsSync(path.join(cwd, "package.json"))) {
		console.error(`No package.json at ${cwd} — pass --from <dir> if your project lives elsewhere.`);
		process.exit(1);
	}

	const tailwind = detectTailwind(cwd);
	if (tailwind.version === "missing") {
		console.error("Tailwind CSS is not installed in this project.");
		console.error("Install Tailwind first, then re-run hex migrate:");
		console.error("  pnpm add -D tailwindcss@^4 @tailwindcss/postcss   # for Tailwind v4");
		console.error("  pnpm add -D tailwindcss@^3 postcss autoprefixer  # for Tailwind v3");
		process.exit(1);
	}

	const framework = detectFramework(cwd);
	const shadcn = detectShadcn(cwd, framework);
	const pm = detectPackageManager(cwd);

	if (!shadcn.isShadcn) {
		console.log(
			`No shadcn-style footprint detected at ${cwd}. ` +
				"Looking for `components.json` or `components/ui/*.tsx` matching shadcn slugs alongside @radix-ui/* deps.",
		);
		console.log("If your shadcn project lives in a subdirectory, pass --from <dir>.");
		return;
	}

	const aliases = loadAliases(cwd, shadcn);

	const ctx: MigrateContext = {
		cwd,
		registryDir,
		options,
		framework,
		shadcn,
		aliases,
		pm,
		tailwind,
		migrated: [],
		renamed: [],
		skipped: [],
		pendingNpmDeps: new Set(),
		plannedWrites: [],
		plannedBackups: [],
	};

	renderHeader(ctx);

	if (!options.yes && !options.dryRun) {
		console.log(
			`This will rewrite ${shadcn.uiFiles.length} file${shadcn.uiFiles.length === 1 ? "" : "s"} ` +
				`in ${displayPath(cwd, shadcn.signals.uiDir ?? cwd)} (with .shadcn.bak backups${options.backup ? "" : " — disabled via --no-backup"}).`,
		);
		console.log(`Re-run with ${pc.bold("--yes")} to proceed, or ${pc.bold("--dry-run")} for a plan.`);
		return;
	}

	for (const file of shadcn.uiFiles) {
		migrateOneFile(file, ctx);
	}

	if (!options.dryRun) {
		archiveComponentsJson(ctx);
		writeHexConfig(ctx);
		if (options.theme === "replace") {
			await applyDefaultTheme(ctx);
		}
	}

	let installed: string[] = [];
	let installSkipped: string[] = [];
	if (ctx.pendingNpmDeps.size > 0) {
		const all = Array.from(ctx.pendingNpmDeps);
		if (options.dryRun) {
			console.log(`\n${pc.cyan("Would install:")} ${all.join(", ")}`);
		} else if (!options.install) {
			const cmd = ctx.pm === "npm" ? "install" : "add";
			console.log(`\nSkipping auto-install (--no-install). Run yourself:`);
			console.log(`  ${ctx.pm} ${cmd} ${all.join(" ")}`);
		} else {
			const result = await runInstall(all, { cwd });
			installed = result.installed;
			installSkipped = result.skipped;
			if (installed.length > 0 && result.exitCode !== 0) {
				console.log(`\nPeer-dep install via ${result.manager} exited with code ${result.exitCode}.`);
				const cmd = result.manager === "npm" ? "install" : "add";
				console.log(`Run yourself: ${result.manager} ${cmd} ${installed.join(" ")}`);
			}
		}
	}

	renderReport(ctx, installed, installSkipped);
}
