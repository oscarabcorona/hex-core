import * as fs from "node:fs";
import * as path from "node:path";
import {
	type ApplicationMap,
	buildApplicationMap,
	buildPocFiles,
	mapFromRecipe,
	parseMap,
	type PocBuildResult,
} from "@hex-core/payload";
import pc from "picocolors";
import { type Catalog, loadCatalog } from "../lib/load-catalog.js";

export interface PocOptions {
	/** Read the application map from this file instead of mapping a brief. */
	from?: string;
	/** Scaffold a single explicitly chosen recipe (no scoring). */
	recipe?: string;
	/** Target directory for the generated app. */
	dir: string;
	/** Theme preset override (default: the map's preset). */
	theme?: string;
	/** package.json name for the generated app (default: the dir basename). */
	name?: string;
	/** Skip the confirmation gate and allow writing into a non-empty dir. */
	yes: boolean;
	/** Plan and print the file tree without writing anything. */
	dryRun: boolean;
}

/**
 * Return every file path that would escape the target directory.
 *
 * `mapSchema` constrains the map-derived path segments, but component file
 * paths come from `item.files[].path` in the registry — and the registry
 * candidate probe includes a cwd-relative fallback, so those bytes are not
 * guaranteed to come from the tarball. This is the only check standing
 * between a hostile registry item and an arbitrary write. Exported so the
 * guard itself is testable, not just the schema in front of it.
 * @param targetDir - Absolute directory the scaffold may write into
 * @param files - The planned file tree
 * @returns The offending relative paths (empty when everything is contained)
 */
export function findEscapingPaths(targetDir: string, files: Array<{ path: string }>): string[] {
	const dirPrefix = targetDir.endsWith(path.sep) ? targetDir : targetDir + path.sep;
	return files
		.filter((file) => !path.resolve(targetDir, file.path).startsWith(dirPrefix))
		.map((file) => file.path);
}

/**
 * Normalize a thrown value for display. `err` is genuinely `unknown`, so
 * this avoids asserting it is an Error.
 * @param err - The thrown value
 * @returns Human-readable text
 */
function errorText(err: unknown): string {
	if (!(err instanceof Error)) return String(err);
	// Authored errors carry their own fix; an unexpected throw from a
	// 700-line codegen engine needs the stack to be diagnosable at all.
	return process.env.HEX_DEBUG ? (err.stack ?? err.message) : err.message;
}

/**
 * `hex poc` — scaffold a standalone runnable Next.js demo app from a
 * brief, an existing `hex.map.json`, or one page recipe. All generation
 * happens in `@hex-core/payload`'s pure `buildPocFiles`; this command is
 * IO only: resolve the map, confirm, write files, report.
 * @param brief - Positional brief (omit when using --from or --recipe)
 * @param options - Source, target, and gating flags
 */
export async function createPoc(brief: string | undefined, options: PocOptions): Promise<void> {
	const catalog = loadCatalog();
	const map = resolveMap(brief, options, catalog);
	if (map.screens.length === 0) {
		console.error("The brief mapped to no screens — nothing to scaffold.");
		console.error(`Run ${pc.bold(`hex map "<brief>"`)} first to see (and tune) the mapping.`);
		process.exit(1);
	}

	const targetDir = path.resolve(process.cwd(), options.dir);
	const appName = options.name ?? path.basename(targetDir);

	let result: PocBuildResult;
	try {
		result = buildPocFiles(map, {
			graph: catalog.graph,
			loadItem: catalog.loadItem,
			theme: options.theme,
			appName,
		});
	} catch (err) {
		console.error(errorText(err));
		process.exit(1);
	}

	renderHeader(map, result, targetDir);

	if (options.dryRun) {
		// Match add.ts's dry-run contract: writes use `wx` and skip existing
		// files, so a plan that promises every file would be a lie against a
		// partially-populated dir.
		let planned = 0;
		let skipped = 0;
		for (const file of result.files) {
			const display = path.join(options.dir, file.path);
			if (fs.existsSync(path.resolve(targetDir, file.path))) {
				skipped += 1;
				console.log(`  ${pc.dim("Skip:")} ${display} ${pc.dim("(already exists)")}`);
				continue;
			}
			planned += 1;
			console.log(`  ${pc.cyan("Would write:")} ${display}`);
		}
		console.log(`\n${pc.cyan("Dry-run summary:")} ${planned} file${planned === 1 ? "" : "s"} would be written, ${skipped} skipped, ${result.npmDependencies.length} npm deps, ${result.routes.length} routes.`);
		console.log(pc.dim("(Re-run without --dry-run to scaffold.)"));
		return;
	}

	if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
		if (!options.yes) {
			console.error(`\n${options.dir} exists and is not empty.`);
			console.error(`Re-run with ${pc.bold("--yes")} to write into it anyway, or pick another ${pc.bold("--dir")}.`);
			process.exit(1);
		}
	} else if (!options.yes) {
		console.log(`This will write ${result.files.length} files into ${options.dir}/.`);
		console.log(`Re-run with ${pc.bold("--yes")} to proceed, or ${pc.bold("--dry-run")} for the full file list.`);
		// Non-zero: nothing was scaffolded, and an agent driving this must not
		// read "gate not passed" as success and then `cd` into a missing dir.
		process.exitCode = 1;
		return;
	}

	// Containment guard, run as a pre-pass so a rejection can't leave a
	// half-written tree behind.
	const escaping = findEscapingPaths(targetDir, result.files);
	if (escaping.length > 0) {
		console.error(`Refusing to write outside ${options.dir}: ${escaping.join(", ")}`);
		process.exit(1);
	}

	let written = 0;
	const skipped: string[] = [];
	for (const file of result.files) {
		const target = path.resolve(targetDir, file.path);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		try {
			fs.writeFileSync(target, file.content, { flag: "wx" });
			written += 1;
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === "EEXIST") {
				skipped.push(file.path);
				continue;
			}
			throw err;
		}
	}

	renderReport(options.dir, result, written, skipped);
}

/**
 * Resolve the application map from the mutually-exclusive sources:
 * positional brief, --from file, or --recipe slug.
 * @param brief - Positional brief text
 * @param options - The command options
 * @param catalog - Loaded registry catalog
 * @returns The application map to scaffold
 */
function resolveMap(brief: string | undefined, options: PocOptions, catalog: Catalog): ApplicationMap {
	const sources = [brief, options.from, options.recipe].filter((s) => s !== undefined).length;
	if (sources !== 1) {
		console.error('Pass exactly one of: a brief ("…"), --from <hex.map.json>, or --recipe <page-recipe>.');
		process.exit(1);
	}

	const builderOptions = {
		graph: catalog.graph,
		registry: catalog.registry,
		recipes: catalog.recipes,
		loadRecipe: catalog.loadRecipe,
	};

	if (options.from) {
		const abs = path.resolve(process.cwd(), options.from);
		if (!fs.existsSync(abs)) {
			console.error(`Map file not found: ${options.from}`);
			process.exit(1);
		}
		let raw: unknown;
		try {
			raw = JSON.parse(fs.readFileSync(abs, "utf-8"));
		} catch (err) {
			console.error(`Map file ${options.from} is not valid JSON: ${errorText(err)}`);
			process.exit(1);
		}
		const parsed = parseMap(raw);
		if (!parsed.success) {
			console.error(`Map file ${options.from} is malformed: ${parsed.error}`);
			process.exit(1);
		}
		return parsed.data;
	}

	if (options.recipe) {
		try {
			return mapFromRecipe(options.recipe, builderOptions);
		} catch (err) {
			console.error(errorText(err));
			process.exit(1);
		}
	}

	return buildApplicationMap((brief ?? "").trim(), builderOptions);
}

/**
 * Print the scaffold header — screens, routes, target.
 * @param map - The map being materialized
 * @param result - The built file tree
 * @param targetDir - Absolute target directory
 */
function renderHeader(map: ApplicationMap, result: PocBuildResult, targetDir: string): void {
	console.log(`\n${pc.bold("Hex poc")} — ${result.routes.length} route${result.routes.length === 1 ? "" : "s"}, ${result.components.length} components → ${path.relative(process.cwd(), targetDir) || "."}\n`);
	const routeWidth = Math.max(14, ...result.routes.map((r) => r.route.length));
	for (const route of result.routes) {
		console.log(`  ${pc.green(route.route.padEnd(routeWidth))} ${pc.dim(route.recipe)}`);
	}
	const skippedIds = new Set(result.skippedScreens.map((s) => s.screenId));
	for (const id of result.installOnlyScreens) {
		if (skippedIds.has(id)) continue;
		const screen = map.screens.find((s) => s.id === id);
		console.log(`  ${pc.dim("(install-only)")} ${id}${screen?.recipe ? ` ${pc.dim(`— ${screen.recipe}`)}` : ""}`);
	}
	for (const skipped of result.skippedScreens) {
		console.log(`  ${pc.yellow("(skipped)")} ${skipped.screenId} ${pc.dim(`— ${skipped.reason}`)}`);
	}
	console.log("");
}

/**
 * Print the final report and follow-ups.
 * @param dir - The target directory as the user passed it
 * @param result - The built file tree
 * @param written - Count of files actually written
 * @param skipped - Paths skipped because they already existed
 */
function renderReport(dir: string, result: PocBuildResult, written: number, skipped: string[]): void {
	console.log(`${pc.bold("Summary")}`);
	console.log(`  ${pc.green(`Wrote ${written} files`)} (${result.npmDependencies.length} npm deps, ${result.components.length} components)`);
	if (skipped.length > 0) {
		console.log(`  ${pc.yellow(`Skipped ${skipped.length} existing:`)} ${skipped.slice(0, 8).join(", ")}${skipped.length > 8 ? ", …" : ""}`);
	}
	if (result.skippedScreens.length > 0) {
		console.log(
			`  ${pc.yellow(`No route generated for ${result.skippedScreens.length} screen(s):`)} ${result.skippedScreens.map((s) => s.screenId).join(", ")}`,
		);
		console.log(pc.dim(`  Their components were still installed — compose them by hand from components/ui/.`));
	}
	console.log(`\n${pc.bold("Follow-ups:")}`);
	console.log(`  1. cd ${dir} && pnpm install && pnpm dev`);
	console.log(`  2. Review hex.map.json (checklist + suggestions) inside the app.`);
	console.log(`  3. Run ${pc.bold("npx hex doctor")} inside the app to verify the install.`);
}
