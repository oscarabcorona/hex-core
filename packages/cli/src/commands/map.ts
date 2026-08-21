import * as fs from "node:fs";
import * as path from "node:path";
import { buildApplicationMap, segmentBrief, stableStringifyMap, type ApplicationMap } from "@hex-core/payload";
import pc from "picocolors";
import { loadCatalog } from "../lib/load-catalog.js";

export interface MapOptions {
	/** Read the brief from this file instead of the positional argument. */
	spec?: string;
	/** Write the map to this path (e.g. hex.map.json). */
	out?: string;
	/** Print the raw map JSON to stdout (nothing else on stdout). */
	json: boolean;
	/** Overwrite an existing --out file. */
	yes: boolean;
	/** Per-segment component-match limit. */
	limit?: number;
}

/**
 * `hex map` — deterministically map an application brief onto the catalog:
 * screens → recipes/blocks/components, an install manifest, suggestions,
 * anti-pattern warnings, and token budgets. The emitted `hex.map.json`
 * feeds `hex add --from` and `hex poc --from`.
 * @param brief - Positional brief text (omit when using --spec)
 * @param options - Output and sizing flags
 */
export async function mapApplication(brief: string | undefined, options: MapOptions): Promise<void> {
	const text = readBrief(brief, options.spec);
	const catalog = loadCatalog();
	const map = buildApplicationMap(text, {
		graph: catalog.graph,
		registry: catalog.registry,
		recipes: catalog.recipes,
		loadRecipe: catalog.loadRecipe,
		limit: options.limit,
	});

	if (!options.json) {
		renderReport(map);
	}

	if (options.out) {
		const target = path.resolve(process.cwd(), options.out);
		try {
			fs.writeFileSync(target, `${stableStringifyMap(map)}\n`, { flag: options.yes ? "w" : "wx" });
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === "EEXIST") {
				console.error(`\n${options.out} already exists — re-run with ${pc.bold("--yes")} to overwrite.`);
				process.exit(1);
			}
			throw err;
		}
		// In --json mode the confirmation goes to stderr so stdout stays pipeable.
		const wrote = `Wrote ${path.relative(process.cwd(), target)}`;
		if (options.json) console.error(wrote);
		else console.log(`\n${wrote}`);
	}

	if (options.json) {
		// Stdout carries only the JSON so `hex map --json | jq` stays clean.
		console.log(stableStringifyMap(map));
		return;
	}

	console.log(`\n${pc.bold("Next:")}`);
	console.log(`  hex add --from ${options.out ?? "hex.map.json"}   # install the mapped components`);
	console.log(`  hex poc --from ${options.out ?? "hex.map.json"}   # scaffold a runnable demo app`);
	if (!options.out) {
		console.log(pc.dim(`  (re-run with --out hex.map.json to write the map first)`));
	}
}

/**
 * Resolve the brief text from the positional argument or --spec file.
 * @param brief - Positional brief
 * @param spec - Path passed via --spec
 * @returns The non-empty brief text
 */
function readBrief(brief: string | undefined, spec: string | undefined): string {
	if (brief && spec) {
		console.error("Pass either a brief argument or --spec <file>, not both.");
		process.exit(1);
	}
	if (spec) {
		const abs = path.resolve(process.cwd(), spec);
		if (!fs.existsSync(abs)) {
			console.error(`Spec file not found: ${spec}`);
			process.exit(1);
		}
		const text = fs.readFileSync(abs, "utf-8").trim();
		if (text.length === 0) {
			console.error(`Spec file ${spec} is empty.`);
			process.exit(1);
		}
		return text;
	}
	if (!brief || brief.trim().length === 0) {
		console.error('Pass a brief: hex map "a SaaS site with a landing page …" (or --spec <file>).');
		process.exit(1);
	}
	return brief.trim();
}

/**
 * Render the human-readable map report.
 * @param map - The built application map
 */
function renderReport(map: ApplicationMap): void {
	console.log(`\n${pc.bold("Hex map")} — ${map.screens.length} screen${map.screens.length === 1 ? "" : "s"} from brief\n`);

	if (map.screens.length === 0) {
		console.log(`  ${pc.yellow("No screens matched.")} Try naming pages or components the catalog knows`);
		console.log(`  (run ${pc.bold("hex list")} / ${pc.bold("hex recipe list")} for the vocabulary).`);
		return;
	}

	const idWidth = Math.max(18, ...map.screens.map((s) => s.id.length));
	for (const screen of map.screens) {
		const badge =
			screen.source === "page-recipe" ? pc.green("page") : screen.source === "recipe" ? pc.cyan("recipe") : pc.dim("components");
		const via = screen.recipe ?? screen.components.join(", ");
		console.log(`  ${pc.bold(screen.id.padEnd(idWidth))} ${badge}  ${via}  ${pc.dim(`(score ${screen.score}, ${screen.confidence})`)}`);
	}

	const matched = new Set(map.screens.map((s) => s.segment));
	const unmatched = segmentBrief(map.brief).filter((segment) => !matched.has(segment));
	if (unmatched.length > 0) {
		console.log(`\n  ${pc.yellow(`Unmatched segment${unmatched.length === 1 ? "" : "s"}:`)}`);
		for (const segment of unmatched) console.log(`    ${pc.dim("·")} ${segment}`);
	}

	console.log(`\n  ${pc.dim("Install:")} ${map.install.components.length} components — ${map.install.components.join(", ")}`);
	if (map.suggestions.length > 0) {
		console.log(`  ${pc.dim("Consider:")} ${map.suggestions.map((s) => s.slug).join(", ")}`);
	}
	for (const warning of map.warnings) {
		console.log(`  ${pc.yellow("Warn:")} ${warning.slug} — ${warning.note} ${pc.dim(`(instead use ${warning.insteadUse})`)}`);
	}
	console.log(`  ${pc.dim("Theme:")} ${map.theme.preset}   ${pc.dim("Checklist:")} ${map.checklist.length} items   ${pc.dim("Token budget:")} ~${map.tokenBudget.total}`);
}
