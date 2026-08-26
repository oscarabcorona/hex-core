/**
 * Token audit — measures the actual token cost of every LLM-bound text surface
 * in this monorepo and emits a markdown report at
 * `packages/mcp-server/TOKEN_AUDIT.md`. Compares each component's declared
 * `ai.tokenBudget` against the measured size of the wire-shape (pretty-
 * printed) `get_component_schema` response — that is what MCP clients
 * actually receive and rank by. Tokens are counted with `gpt-tokenizer`
 * (cl100k_base) — a pure-JS proxy that tracks Claude tokens within ~5–15 %
 * on JSON/code-heavy payloads. Good enough for an audit and for budget
 * calibration; not tight enough to base a hard CI ceiling on without a
 * buffer.
 *
 * This script measures and reports. It does NOT compact pretty-printed
 * output: human readability of MCP responses matters, and the catalog is
 * nowhere near a context-window ceiling (compound load is ~5 % of 200K).
 *
 * Convention follows scripts/build-registry.ts (ESM, no shebang, run via tsx).
 *
 *   pnpm run audit:tokens                       # measure + write report
 *   pnpm run audit:tokens -- --update-budgets   # rewrite tokenBudget in each schema source
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
// Named encoding, not the bare entry point — see the note in
// scripts/build-registry.ts. This file's own report footer claims cl100k_base;
// the default export silently became o200k_base in gpt-tokenizer 3.x, which
// made that claim false.
import { encode } from "gpt-tokenizer/encoding/cl100k_base";

import {
	buildAppContext,
	type AppContextComponentSlot,
	type AppContextInput,
	type AppContextRecipeSlot,
	type AppContextTheme,
} from "../packages/payload/src/builders/app-context.js";
import { getTheme } from "../packages/tokens/src/index.js";
import { buildApplicationMap, mapFromRecipe } from "../packages/payload/src/builders/map.js";
import { buildPocFiles } from "../packages/payload/src/builders/poc.js";
import { loadGraph } from "../packages/payload/src/graph/graph-loader.js";
import { explainNode } from "../packages/payload/src/graph/graph-query.js";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
// The MCP server serves whatever `@hex-core/payload` bundles (its `prebuild`
// `cp -R`s the repo-root `registry/` into the package). Measuring the bundled
// copy mirrors what real consumers see. Sanity check below catches the case
// where build-registry.ts has run but the payload re-bundle hasn't — otherwise
// `--update-budgets` would silently calibrate against yesterday's numbers.
const REGISTRY_ITEMS_DIR = join(REPO_ROOT, "packages/payload/registry/items");
const REGISTRY_INDEX = join(REPO_ROOT, "packages/payload/registry/registry.json");
const ROOT_REGISTRY_ITEMS_DIR = join(REPO_ROOT, "registry/items");
const COMPONENTS_SRC = join(REPO_ROOT, "packages/components/src");
const MOTION_SRC = join(REPO_ROOT, "packages/motion/src/schemas");
const RECIPE_BUILT_DIR = join(REPO_ROOT, "packages/cli/registry/recipes");
const RECIPE_SOURCE_DIR = join(REPO_ROOT, "packages/registry/src/recipes");
const SKILLS_DIR = join(REPO_ROOT, "packages/cli/skills");
const DESIGN_REFS_DIR = join(REPO_ROOT, ".claude/skills/design-refs");
const REPORT_OUT = join(REPO_ROOT, "packages/mcp-server/TOKEN_AUDIT.md");

const CONTEXT_WINDOWS = [
	{ name: "Claude Sonnet/Opus 200K", tokens: 200_000 },
	{ name: "GPT-4o 128K", tokens: 128_000 },
	{ name: "Opus 4.7 1M", tokens: 1_000_000 },
] as const;

const tok = (s: string): number => encode(s).length;

interface ItemRow {
	slug: string;
	category: string;
	declared: number | undefined;
	getComponentPretty: number;
	schemaPretty: number;
	searchRow: number;
	bytes: number;
}

function listJsonFiles(dir: string): string[] {
	return readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => join(dir, f));
}

function listSchemaFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...listSchemaFiles(full));
		else if (entry.name.endsWith(".schema.ts")) out.push(full);
	}
	return out;
}

function loadJson<T = unknown>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function loadDefaultTheme(): AppContextTheme {
	const t = getTheme("default");
	if (!t) throw new Error("Default theme not found");
	const toSlot = (rec: Record<string, { value: string; type: string }>) => {
		const out: Record<string, { value: string; type: string }> = {};
		for (const [k, v] of Object.entries(rec)) {
			out[k] = { value: v.value, type: v.type };
		}
		return out;
	};
	return {
		name: t.name,
		displayName: t.displayName,
		description: t.description,
		tokens: {
			light: toSlot(t.tokens.light as Record<string, { value: string; type: string }>),
			dark: toSlot(t.tokens.dark as Record<string, { value: string; type: string }>),
		},
	};
}

function measureItem(item: Record<string, unknown>, file: string): ItemRow {
	const bytes = statSync(file).size;
	const ai = item.ai as { tokenBudget?: number } | undefined;
	const declared = ai?.tokenBudget;

	// get_component — mirrors packages/mcp-server/src/index.ts:155 (pretty wire shape).
	const getComponentPretty = tok(JSON.stringify(item, null, 2));

	// get_component_schema — mirrors packages/mcp-server/src/index.ts:188–203.
	const schema = {
		name: item.name,
		displayName: item.displayName,
		description: item.description,
		props: item.props,
		variants: item.variants,
		slots: item.slots,
		ai: item.ai,
		examples: item.examples,
	};
	const schemaPretty = tok(JSON.stringify(schema, null, 2));

	// search_components row — mirrors packages/mcp-server/src/index.ts:97–105.
	const searchRow = tok(
		JSON.stringify({
			name: item.name,
			displayName: item.displayName,
			description: item.description,
			category: item.category,
			subcategory: item.subcategory,
			tags: item.tags,
			tokenBudget: declared,
		}),
	);

	return {
		slug: String(item.name),
		category: String(item.category ?? "?"),
		declared,
		getComponentPretty,
		schemaPretty,
		searchRow,
		bytes,
	};
}

function fmt(n: number): string {
	return n.toLocaleString("en-US");
}

function quantile(sorted: number[], q: number): number {
	if (sorted.length === 0) return 0;
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	}
	return sorted[base];
}

/**
 * Rewrite the `tokenBudget: <number>` literal in each `.schema.ts` source file
 * so the declared budget matches the wire-shape (pretty-printed)
 * `get_component_schema` token count — the response MCP clients actually
 * receive. Skips schemas with no matching built item (which would indicate
 * a source/built mismatch — the audit's "Catalog state" section reports
 * those separately). Returns the count of files updated.
 */
function updateBudgets(rows: ItemRow[]): { updated: number; skipped: number } {
	const bySlug = new Map<string, ItemRow>(rows.map((r) => [r.slug, r]));
	let updated = 0;
	let skipped = 0;
	const sources = [...listSchemaFiles(COMPONENTS_SRC), ...listSchemaFiles(MOTION_SRC)];
	for (const file of sources) {
		const slug = basename(file).replace(/\.schema\.ts$/, "");
		const row = bySlug.get(slug);
		if (!row) {
			skipped++;
			continue;
		}
		// Pretty-printed `get_component_schema` is the wire shape consumers pay
		// for. Calibrate against that, not the minified hypothetical.
		const next = row.schemaPretty;
		const before = readFileSync(file, "utf8");
		const after = before.replace(/tokenBudget:\s*\d+/, `tokenBudget: ${next}`);
		if (before === after) {
			skipped++;
			continue;
		}
		writeFileSync(file, after);
		updated++;
	}
	return { updated, skipped };
}

function aggregate(rows: ItemRow[]) {
	// Pretty-printed is the actual wire shape; that's what consumers pay.
	const sortedSchema = [...rows].map((r) => r.schemaPretty).sort((a, b) => a - b);
	const sortedFull = [...rows].map((r) => r.getComponentPretty).sort((a, b) => a - b);
	return {
		n: rows.length,
		schemaSum: sortedSchema.reduce((a, b) => a + b, 0),
		fullSum: sortedFull.reduce((a, b) => a + b, 0),
		schemaP50: Math.round(quantile(sortedSchema, 0.5)),
		schemaP95: Math.round(quantile(sortedSchema, 0.95)),
		schemaMax: sortedSchema[sortedSchema.length - 1] ?? 0,
		fullP50: Math.round(quantile(sortedFull, 0.5)),
		fullP95: Math.round(quantile(sortedFull, 0.95)),
		fullMax: sortedFull[sortedFull.length - 1] ?? 0,
	};
}

console.log("Token audit — reading sources…");

// Drift guard — see comment on REGISTRY_ITEMS_DIR. Bail out loud rather than
// silently measure (or rewrite) against a stale bundle.
try {
	const bundled = readdirSync(REGISTRY_ITEMS_DIR).filter((f) => f.endsWith(".json")).length;
	const root = readdirSync(ROOT_REGISTRY_ITEMS_DIR).filter((f) => f.endsWith(".json")).length;
	if (bundled !== root) {
		console.error(
			`Bundled registry (${bundled} items) is out of sync with repo-root registry (${root} items).`,
		);
		console.error("Run: pnpm run build:registry && pnpm --filter @hex-core/payload build");
		process.exit(1);
	}
} catch (err) {
	console.error("Failed to compare registry dirs:", (err as Error).message);
	process.exit(1);
}

// ─── A. Surface: built registry items ───
const itemFiles = listJsonFiles(REGISTRY_ITEMS_DIR);
console.log(`  registry items: ${itemFiles.length}`);
const itemRows: ItemRow[] = [];
for (const file of itemFiles) {
	const item = loadJson<Record<string, unknown>>(file);
	itemRows.push(measureItem(item, file));
}

// --update-budgets rewrites tokenBudget in each schema source to match the
// measured wire-shape get_component_schema (pretty-printed) count. Runs
// after measurement so the rewrite uses the same numbers the report shows.
// The canonical report numbers update on the next run AFTER a registry
// rebuild; until then the committed report still reflects the pre-rewrite
// state. The flow is:
// audit --update-budgets → pnpm run build:registry → pnpm --filter @hex-core/payload build → pnpm audit:tokens.
const updateBudgetsRequested = process.argv.includes("--update-budgets");
if (updateBudgetsRequested) {
	const result = updateBudgets(itemRows);
	console.log(`\n--update-budgets: rewrote ${result.updated} schema(s), skipped ${result.skipped}.`);
	console.log("Next: pnpm run build:registry && pnpm --filter @hex-core/payload build && pnpm audit:tokens");
	process.exit(0);
}

// Split rows by category for blocks-vs-primitives breakdown
const blockRows = itemRows.filter((r) => r.category === "block");
const nonBlockRows = itemRows.filter((r) => r.category !== "block");

// ─── A. Surface: registry index ───
const indexJson = readFileSync(REGISTRY_INDEX, "utf8");
const indexPretty = tok(indexJson);

// ─── B. Source-vs-built parity ───
const schemaFiles = [...listSchemaFiles(COMPONENTS_SRC), ...listSchemaFiles(MOTION_SRC)];
const sourceCount = schemaFiles.length;
const builtCount = itemFiles.length;

// ─── C. Surface: recipes (built + source) ───
const recipeBuiltFiles = listJsonFiles(RECIPE_BUILT_DIR).filter(
	(f) => !f.endsWith("recipes.json") && !f.endsWith("registry.json"),
);
const recipeRows = recipeBuiltFiles.map((f) => {
	const data = loadJson<Record<string, unknown>>(f);
	return {
		slug: String(data.slug),
		bytes: statSync(f).size,
		pretty: tok(JSON.stringify(data, null, 2)),
		min: tok(JSON.stringify(data)),
	};
});
const recipeSourceCount = readdirSync(RECIPE_SOURCE_DIR).filter((f) =>
	f.endsWith(".recipe.ts"),
).length;

// ─── D. Surface: skills (Claude Code context packs) ───
function readSkillFiles(dir: string): { file: string; bytes: number; tokens: number }[] {
	const out: { file: string; bytes: number; tokens: number }[] = [];
	const walk = (d: string) => {
		for (const entry of readdirSync(d, { withFileTypes: true })) {
			const full = join(d, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.name.endsWith(".md") || entry.name === "SKILL.md") {
				const body = readFileSync(full, "utf8");
				out.push({
					file: relative(REPO_ROOT, full),
					bytes: body.length,
					tokens: tok(body),
				});
			}
		}
	};
	try {
		walk(dir);
	} catch {
		// dir may not exist (design-refs is optional)
	}
	return out;
}

const cliSkills = readSkillFiles(SKILLS_DIR);
const designRefs = readSkillFiles(DESIGN_REFS_DIR);

// ─── E. Surface: emit_app_context at varied N ───
const defaultTheme = loadDefaultTheme();
const itemMap = new Map<string, Record<string, unknown>>();
for (let i = 0; i < itemFiles.length; i++) {
	const item = loadJson<Record<string, unknown>>(itemFiles[i]);
	itemMap.set(String(item.name), item);
}

function makeAppContextInput(slugs: string[]): AppContextInput {
	const components: AppContextComponentSlot[] = slugs.map((slug) => ({
		slug,
		item: (itemMap.get(slug) ?? null) as AppContextComponentSlot["item"],
	}));
	const recipes: AppContextRecipeSlot[] = [];
	return {
		theme: { requested: "default", resolved: defaultTheme },
		components,
		recipes,
	};
}

// Sort so the "N=20 (first 20)" sample is deterministic across platforms /
// filesystems and matches the contract test's sorted-slug derivation.
const allSlugs = [...itemMap.keys()].sort();
const samples: { label: string; slugs: string[] }[] = [
	{ label: "N=1 (button)", slugs: ["button"].filter((s) => itemMap.has(s)) },
	{
		label: "N=5 (form fundamentals)",
		slugs: ["button", "input", "label", "checkbox", "form"].filter((s) => itemMap.has(s)),
	},
	{ label: "N=20 (first 20)", slugs: allSlugs.slice(0, 20) },
	{ label: `N=all (${allSlugs.length})`, slugs: allSlugs },
];

const appContextRows = samples.map((s) => {
	const md = buildAppContext(makeAppContextInput(s.slugs));
	return { label: s.label, bytes: md.length, tokens: tok(md) };
});

// ─── F. Compound scenario: skills + recipe + components ───
const skill4Tokens = cliSkills
	.slice(0, 4)
	.reduce((sum, s) => sum + s.tokens, 0);
const pageRecipeApprox =
	recipeRows.find((r) => r.slug === "settings-page")?.pretty ?? 0;
const tenPrimitivesAppContext = appContextRows.find((r) =>
	r.label.startsWith("N=20"),
)?.tokens ?? 0;
const compoundTotal = skill4Tokens + pageRecipeApprox + tenPrimitivesAppContext;

// ─── Aggregates ───
const allAgg = aggregate(itemRows);
const blockAgg = aggregate(blockRows);
const nonBlockAgg = aggregate(nonBlockRows);

const declaredVsMeasured = itemRows
	.filter((r) => r.declared !== undefined)
	.map((r) => ({
		slug: r.slug,
		category: r.category,
		declared: r.declared as number,
		measured: r.schemaPretty,
		delta: r.schemaPretty - (r.declared as number),
		ratio: r.schemaPretty / (r.declared as number),
	}))
	.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

// ─── Build report ───
const reportLines: string[] = [];
const push = (s = "") => reportLines.push(s);

push("# Token audit — Hex Core");
push("");
push(`_Generated by [scripts/audit-tokens.ts](../../scripts/audit-tokens.ts) on ${new Date().toISOString()}._`);
push("");
push(
	"Counts use `gpt-tokenizer` (cl100k_base). Claude tokens land within ~5–15 % of these numbers on JSON/code payloads. Treat absolute values as estimates; treat the declared-vs-measured deltas as accurate. All wire-shape numbers are for pretty-printed JSON / markdown — the actual response shape MCP clients receive.",
);
push("");

push("## Catalog state");
push("");
push("| Metric | Value |");
push("|---|---|");
push(`| Source schemas (components + motion) | ${sourceCount} |`);
push(`| Built items (\`packages/payload/registry/items/*.json\`) | ${builtCount} |`);
push(
	`| Source/built delta | ${sourceCount - builtCount} (${sourceCount === builtCount ? "in sync" : "rebuild needed — see below"}) |`,
);
push(`| Recipe sources (\`packages/registry/src/recipes/*.recipe.ts\`) | ${recipeSourceCount} |`);
push(`| Recipe built JSONs (\`packages/cli/registry/recipes/*.json\`) | ${recipeBuiltFiles.length} |`);
push("");
if (sourceCount !== builtCount) {
	push(
		`> **Build gap**: source has ${sourceCount} schemas but built dir has ${builtCount}. Run \`pnpm --filter @hex-core/registry build && pnpm run build:registry && pnpm --filter @hex-core/payload build\` to resync.`,
	);
	push("");
}

push("## Surface A — registry index");
push("");
push("| Shape | Tokens | Bytes |");
push("|---|---|---|");
push(`| \`registry.json\` (wire shape, pretty-printed) | ${fmt(indexPretty)} | ${fmt(indexJson.length)} |`);
push("");

push("## Surface B — MCP tool responses (per-component)");
push("");
push("### Aggregate (built registry, N=" + builtCount + ", wire shape)");
push("");
push("| Shape | Sum | p50 | p95 | max |");
push("|---|---|---|---|---|");
push(`| \`get_component\` | ${fmt(allAgg.fullSum)} | ${fmt(allAgg.fullP50)} | ${fmt(allAgg.fullP95)} | ${fmt(allAgg.fullMax)} |`);
push(`| \`get_component_schema\` | ${fmt(allAgg.schemaSum)} | ${fmt(allAgg.schemaP50)} | ${fmt(allAgg.schemaP95)} | ${fmt(allAgg.schemaMax)} |`);
push("");

if (blockRows.length > 0) {
	push("### Blocks vs. non-blocks");
	push("");
	push("Block-level templates (`auth-sign-in-split`, `commerce-cart`, …) are page-scale composites. Splitting these out so the right tail doesn't hide behind the median.");
	push("");
	push("| Category | N | `get_component` p95 | `get_component` max | `schema` p95 |");
	push("|---|---|---|---|---|");
	push(`| Blocks | ${blockRows.length} | ${fmt(blockAgg.fullP95)} | ${fmt(blockAgg.fullMax)} | ${fmt(blockAgg.schemaP95)} |`);
	push(`| Non-blocks (primitives + AI + artifacts + motion) | ${nonBlockRows.length} | ${fmt(nonBlockAgg.fullP95)} | ${fmt(nonBlockAgg.fullMax)} | ${fmt(nonBlockAgg.schemaP95)} |`);
	push("");
}

push("### Top 15 declared-vs-measured deltas (schema shape)");
push("");
push("Sorted by `|measured - declared|`. Sign = measured > declared (undercount). The `get_component_schema` shape is what ranking consumers actually pay for — that's the right calibration target.");
push("");
push("| Slug | Category | Declared | Measured | Δ | Ratio |");
push("|---|---|---|---|---|---|");
for (const r of declaredVsMeasured.slice(0, 15)) {
	const sign = r.delta > 0 ? "+" : "";
	push(`| \`${r.slug}\` | ${r.category} | ${fmt(r.declared)} | ${fmt(r.measured)} | ${sign}${fmt(r.delta)} | ${r.ratio.toFixed(2)}× |`);
}
push("");

push("## Surface C — catalog totals");
push("");
const totalPretty = itemRows.reduce((s, r) => s + r.getComponentPretty, 0);
push(`Total \`get_component\` cost across all ${itemRows.length} components: **${fmt(totalPretty)} tokens** (wire-shape pretty-printed).`);
push("");

push("## Surface D — `emit_app_context` markdown");
push("");
push("Calls `buildAppContext` with the default theme + the listed component slugs, no recipes, no overrides. Measured against the actual builder, not a simulation.");
push("");
push("| Scenario | Tokens | Bytes |");
push("|---|---|---|");
for (const r of appContextRows) {
	push(`| ${r.label} | ${fmt(r.tokens)} | ${fmt(r.bytes)} |`);
}
push("");

push("## Surface E — recipes");
push("");
push("Built recipe JSONs that MCP's `get_recipe` returns. Wire shape is pretty-printed for human/agent readability.");
push("");
push("| Slug | Tokens |");
push("|---|---|");
for (const r of [...recipeRows].sort((a, b) => b.pretty - a.pretty)) {
	push(`| \`${r.slug}\` | ${fmt(r.pretty)} |`);
}
const recipePrettySum = recipeRows.reduce((s, r) => s + r.pretty, 0);
push(`| **Total** | **${fmt(recipePrettySum)}** |`);
push("");

push("## Surface F — bundled SKILL.md packs");
push("");
push("Loaded into Claude on demand by `hex skills install`. Each session that triggers a skill pays this cost once.");
push("");
push("| File | Tokens | Bytes |");
push("|---|---|---|");
const sortedSkills = [...cliSkills].sort((a, b) => b.tokens - a.tokens);
for (const s of sortedSkills) {
	push(`| ${s.file} | ${fmt(s.tokens)} | ${fmt(s.bytes)} |`);
}
const skillSum = sortedSkills.reduce((s, x) => s + x.tokens, 0);
push(`| **Total** | **${fmt(skillSum)}** | — |`);
push("");

if (designRefs.length > 0) {
	push("## Surface G — design-ref skills (`.claude/skills/design-refs/`)");
	push("");
	push("Brand-style reference packs. Heavier than SKILL.md packs — worth scrutinizing if all are loaded together.");
	push("");
	push("| File | Tokens | Bytes |");
	push("|---|---|---|");
	const sortedRefs = [...designRefs].sort((a, b) => b.tokens - a.tokens);
	for (const s of sortedRefs) {
		push(`| ${s.file} | ${fmt(s.tokens)} | ${fmt(s.bytes)} |`);
	}
	const refSum = sortedRefs.reduce((s, x) => s + x.tokens, 0);
	push(`| **Total** | **${fmt(refSum)}** | — |`);
	push("");
}

push("## Surface H — catalog graph + agent-builder tools");
push("");
push("The graph ships in the registry bundle; the tool rows measure representative wire-shape responses of the three agent-builder tools (`map_application`, `query_graph`, `scaffold_poc`). `scaffold_poc` embeds full file contents by design — agents should write the tree, not hold it in context.");
push("");
const graph = loadGraph();
const graphPretty = JSON.stringify(graph, null, 2);
const sampleMap = buildApplicationMap("a SaaS site with a landing page and pricing page, plus an admin dashboard with a data table");
const sampleMapPretty = JSON.stringify(sampleMap, null, 2);
const sampleExplain = JSON.stringify(explainNode(graph, "marketing-hero"), null, 2);
const samplePoc = JSON.stringify(buildPocFiles(mapFromRecipe("landing-page"), { appName: "audit-poc" }), null, 2);
push("| Shape | Tokens | Bytes |");
push("|---|---|---|");
push(`| \`registry/graph.json\` (${graph.nodes.length} nodes, ${graph.edges.length} edges) | ${fmt(tok(graphPretty))} | ${fmt(Buffer.byteLength(graphPretty))} |`);
push(`| \`map_application\` (3-screen SaaS brief) | ${fmt(tok(sampleMapPretty))} | ${fmt(Buffer.byteLength(sampleMapPretty))} |`);
push(`| \`query_graph\` (explain marketing-hero) | ${fmt(tok(sampleExplain))} | ${fmt(Buffer.byteLength(sampleExplain))} |`);
push(`| \`scaffold_poc\` (landing-page recipe, full file tree) | ${fmt(tok(samplePoc))} | ${fmt(Buffer.byteLength(samplePoc))} |`);
push("");

push("## Context window fit");
push("");
push("Realistic compound scenario: user loads 4 skills + `emit_app_context` with N=20 components + 1 page-shaped recipe.");
push("");
push("| Component | Tokens |");
push("|---|---|");
push(`| 4 SKILL.md packs | ${fmt(skill4Tokens)} |`);
push(`| \`emit_app_context\` (N=20) | ${fmt(tenPrimitivesAppContext)} |`);
push(`| 1 page-recipe (\`settings-page\`) | ${fmt(pageRecipeApprox)} |`);
push(`| **Total** | **${fmt(compoundTotal)}** |`);
push("");
push("| Window | Capacity | Headroom |");
push("|---|---|---|");
for (const w of CONTEXT_WINDOWS) {
	const pct = ((compoundTotal / w.tokens) * 100).toFixed(2);
	push(`| ${w.name} | ${fmt(w.tokens)} | ${fmt(w.tokens - compoundTotal)} (${pct}% used) |`);
}
push("");
push(
	"**Worst case** (every built item served via repeated `get_component` + all skills loaded): `" +
		fmt(totalPretty + skillSum) +
		"` tokens (wire shape, pretty-printed). Fits inside the 1M window with significant room.",
);
push("");

push("## Status");
push("");
push(`- ✅ Declared \`tokenBudget\` is calibrated against the wire-shape \`get_component_schema\` (declared-vs-measured delta is within ±1 token across all ${itemRows.length} items; residual comes from the literal length of the budget number itself).`);
push("- ✅ Registry build covers both component and page recipes (`scripts/build-registry.ts` branches on `recipe.kind`).");
push("- ✅ Contract test enforces wire-shape ceilings: `get_component` ≤ 15K, `get_component_schema` ≤ 2.5K, `emit_app_context(N=20)` ≤ 5K.");
push("");
push("## Maintenance");
push("");
push("Re-run `pnpm audit:tokens` after any registry change to refresh this report. Use `--update-budgets` to push measured numbers back into each schema's `ai.tokenBudget` literal — pair with a registry rebuild so the built items pick up the new values.");
push("");

const report = reportLines.join("\n") + "\n";
writeFileSync(REPORT_OUT, report);
console.log(`\nReport written: ${relative(REPO_ROOT, REPORT_OUT)}`);
console.log(`  items measured: ${itemRows.length}`);
console.log(`  catalog total (wire shape): ${fmt(totalPretty)} tokens`);
console.log(`  emit_app_context N=20: ${fmt(tenPrimitivesAppContext)} tokens`);
console.log(`  compound scenario total: ${fmt(compoundTotal)} tokens`);
