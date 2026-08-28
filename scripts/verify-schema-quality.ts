/**
 * Schema-quality gate — the bar every registry item's `ai` block must clear
 * for the catalog's machine-readable intent metadata to stay trustworthy.
 *
 * Two tiers:
 *
 * - **ERROR** (exit 1): structural lies an agent would act on — a missing or
 *   placeholder `ai` field, prose too short to carry intent, an
 *   `insteadUse`/`relatedComponents` slug that resolves to nothing, an item
 *   with no example. These make `describe_intent` worse than silence.
 * - **WARN** (reported, never gating): coverage metrics for the 0.4.0
 *   AI-native extensions (`useWhen` per variant value, `antiPatterns` on
 *   variant-bearing items, `composition` tags on examples) and declared
 *   `tokenBudget` drift vs the measured `get_component_schema` wire shape.
 *   These are a backfill worklist, not merge blockers.
 *
 * Reads the committed repo-root `registry/` (the source of truth CI diffs
 * against), not the payload bundle. The wire shape is imported from the MCP
 * tool rather than re-derived — same rule as scripts/audit-tokens.ts.
 *
 * Convention follows scripts/audit-tokens.ts (ESM, no shebang, run via tsx).
 *
 *   pnpm run verify:schema-quality
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { encode } from "gpt-tokenizer/encoding/cl100k_base";

import { registryItemSchema, type RegistryItem } from "../packages/registry/src/schema.js";
import { schemaWireShape } from "../packages/mcp-server/src/tools/get-component-schema.js";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const REGISTRY_INDEX = join(REPO_ROOT, "registry/registry.json");
const REGISTRY_ITEMS_DIR = join(REPO_ROOT, "registry/items");

/** Minimum length for the three load-bearing `ai` prose fields. */
const MIN_PROSE_CHARS = 40;
/** Minimum length for the item description shown in every search row. */
const MIN_DESCRIPTION_CHARS = 20;
/**
 * Authoring-scaffold leftovers. Deliberately does NOT include the word
 * "placeholder" — a UI library legitimately says it (Skeleton, Input) — and
 * matches TODO/FIXME case-sensitively so prose like "a todo list block"
 * passes while the uppercase scaffold convention is caught.
 */
const SCAFFOLD_RES = [/\b(TODO|FIXME)\b/, /\b(TBD|lorem)\b/i];
/**
 * Declared `tokenBudget` is acceptable within this band of the measured
 * wire-shape size. Outside it, ranking consumers are being misinformed.
 */
const BUDGET_RATIO_MIN = 0.5;
const BUDGET_RATIO_MAX = 1.5;

const tok = (s: string): number => encode(s).length;

interface ItemReport {
	slug: string;
	errors: string[];
}

interface Coverage {
	variantValuesTotal: number;
	variantValuesWithUseWhen: number;
	variantItemsTotal: number;
	variantItemsWithAntiPatterns: number;
	examplesTotal: number;
	examplesWithComposition: number;
	budgetChecked: number;
	budgetInBand: number;
	budgetWorst: { slug: string; ratio: number }[];
}

/**
 * Run the ERROR-tier checks for one parsed item.
 * @param item - The parsed registry item
 * @param slugs - Every valid item slug, for reference resolution
 * @returns Human-readable failure strings (empty when the item passes)
 */
function checkItem(item: RegistryItem, slugs: Set<string>): string[] {
	const errors: string[] = [];
	const { ai } = item;

	if (item.description.trim().length < MIN_DESCRIPTION_CHARS) {
		errors.push(`description is under ${MIN_DESCRIPTION_CHARS} chars`);
	}
	for (const [field, value] of [
		["whenToUse", ai.whenToUse],
		["whenNotToUse", ai.whenNotToUse],
		["accessibilityNotes", ai.accessibilityNotes],
	] as const) {
		if (value.trim().length < MIN_PROSE_CHARS) {
			errors.push(`ai.${field} is under ${MIN_PROSE_CHARS} chars ("${value}")`);
		}
	}
	if (ai.whenToUse.trim() === ai.whenNotToUse.trim()) {
		errors.push("ai.whenToUse and ai.whenNotToUse are identical");
	}
	for (const [field, value] of [
		["description", item.description],
		["ai.whenToUse", ai.whenToUse],
		["ai.whenNotToUse", ai.whenNotToUse],
		["ai.accessibilityNotes", ai.accessibilityNotes],
	] as const) {
		for (const re of SCAFFOLD_RES) {
			const hit = re.exec(value);
			if (hit) errors.push(`${field} contains authoring placeholder "${hit[0]}"`);
		}
	}
	if (ai.tokenBudget === undefined) {
		errors.push("ai.tokenBudget is missing (run pnpm audit:tokens -- --update-budgets)");
	}
	if (item.examples.length === 0) {
		errors.push("no usage examples — agents compose from examples, not prop tables");
	}
	for (const related of ai.relatedComponents) {
		if (!slugs.has(related)) {
			errors.push(`ai.relatedComponents references unknown slug "${related}"`);
		}
	}
	for (const anti of ai.antiPatterns ?? []) {
		if (!slugs.has(anti.insteadUse)) {
			errors.push(`ai.antiPatterns insteadUse references unknown slug "${anti.insteadUse}"`);
		}
	}
	return errors;
}

/**
 * Accumulate the WARN-tier coverage metrics for one parsed item.
 * @param item - The parsed registry item
 * @param coverage - The running totals to add into
 */
function tallyCoverage(item: RegistryItem, coverage: Coverage): void {
	for (const variant of item.variants) {
		for (const value of variant.values) {
			coverage.variantValuesTotal++;
			if (value.useWhen !== undefined && value.useWhen.trim().length > 0) {
				coverage.variantValuesWithUseWhen++;
			}
		}
	}
	if (item.variants.length > 0) {
		coverage.variantItemsTotal++;
		if ((item.ai.antiPatterns ?? []).length > 0) coverage.variantItemsWithAntiPatterns++;
	}
	for (const example of item.examples) {
		coverage.examplesTotal++;
		if ((example.composition ?? []).length > 0) coverage.examplesWithComposition++;
	}
	if (item.ai.tokenBudget !== undefined) {
		coverage.budgetChecked++;
		const measured = tok(JSON.stringify(schemaWireShape(item), null, 2));
		const ratio = measured / item.ai.tokenBudget;
		if (ratio >= BUDGET_RATIO_MIN && ratio <= BUDGET_RATIO_MAX) {
			coverage.budgetInBand++;
		} else {
			coverage.budgetWorst.push({ slug: item.name, ratio });
		}
	}
}

/**
 * Format a coverage fraction as `n/total (pct%)`.
 * @param n - Covered count
 * @param total - Total count
 * @returns The formatted fraction
 */
function pct(n: number, total: number): string {
	if (total === 0) return "n/a";
	return `${n}/${total} (${((n / total) * 100).toFixed(1)}%)`;
}

console.log("Schema quality gate — reading repo-root registry…");

const indexSlugs = new Set<string>();
{
	const index = JSON.parse(readFileSync(REGISTRY_INDEX, "utf8")) as {
		items: Array<{ name: string }>;
	};
	for (const entry of index.items) indexSlugs.add(entry.name);
}

const itemFiles = readdirSync(REGISTRY_ITEMS_DIR)
	.filter((f) => f.endsWith(".json"))
	.sort();
console.log(`  index slugs: ${indexSlugs.size}, item files: ${itemFiles.length}`);

const reports: ItemReport[] = [];
const coverage: Coverage = {
	variantValuesTotal: 0,
	variantValuesWithUseWhen: 0,
	variantItemsTotal: 0,
	variantItemsWithAntiPatterns: 0,
	examplesTotal: 0,
	examplesWithComposition: 0,
	budgetChecked: 0,
	budgetInBand: 0,
	budgetWorst: [],
};

for (const file of itemFiles) {
	const slug = file.replace(/\.json$/, "");
	const raw: unknown = JSON.parse(readFileSync(join(REGISTRY_ITEMS_DIR, file), "utf8"));
	const parsed = registryItemSchema.safeParse(raw);
	if (!parsed.success) {
		reports.push({
			slug,
			errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
		});
		continue;
	}
	const item = parsed.data;
	const errors = checkItem(item, indexSlugs);
	if (!indexSlugs.has(item.name)) {
		errors.push("item is not listed in registry.json — rebuild the registry");
	}
	if (errors.length > 0) reports.push({ slug, errors });
	tallyCoverage(item, coverage);
}

console.log("");
console.log("Coverage (WARN tier — backfill worklist, non-gating):");
console.log(`  variant values with useWhen:        ${pct(coverage.variantValuesWithUseWhen, coverage.variantValuesTotal)}`);
console.log(`  variant items with antiPatterns:    ${pct(coverage.variantItemsWithAntiPatterns, coverage.variantItemsTotal)}`);
console.log(`  examples with composition tags:     ${pct(coverage.examplesWithComposition, coverage.examplesTotal)}`);
console.log(`  tokenBudget within ${BUDGET_RATIO_MIN}–${BUDGET_RATIO_MAX}× measured:  ${pct(coverage.budgetInBand, coverage.budgetChecked)}`);
if (coverage.budgetWorst.length > 0) {
	const worst = [...coverage.budgetWorst]
		.sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio)))
		.slice(0, 5);
	console.log(
		`  worst budget drift: ${worst.map((w) => `${w.slug} (${w.ratio.toFixed(2)}×)`).join(", ")}`,
	);
}

if (reports.length > 0) {
	console.error("");
	console.error(`ERRORS — ${reports.length} item(s) fail the quality gate:`);
	for (const report of reports) {
		console.error(`\n  ${report.slug}`);
		for (const error of report.errors) console.error(`    ✗ ${error}`);
	}
	console.error(
		"\nFix the schema source (packages/components/src/**/*.schema.ts or packages/motion/src/schemas/*.schema.ts), then run: pnpm run build:registry",
	);
	process.exit(1);
}

console.log(`\n✓ All ${itemFiles.length} items pass the quality gate.`);
