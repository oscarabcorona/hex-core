/**
 * Application-map regression assertions. Runs as a standalone node script
 * via `pnpm -F @hex-core/payload test:map`. Same contract as
 * resolver.test.ts: all output on stderr, exit 0 = pass, 1 = fail.
 *
 * Cases fix the screen mapping for calibrated briefs — any scoring or
 * segmentation change must re-justify the brief or update the case
 * deliberately.
 */
import { createHash } from "node:crypto";
import { buildApplicationMap, mapSchema, segmentBrief, stableStringifyMap } from "./map.js";

const failures: string[] = [];

/**
 * Record a failed assertion.
 * @param name - Case label
 * @param detail - What was expected vs observed
 */
function fail(name: string, detail: string): void {
	failures.push(`${name}: ${detail}`);
}

// ── Segmentation ──
const saasBrief =
	"a SaaS site with a landing page and pricing page, plus an admin dashboard with a data table";
const segments = segmentBrief(saasBrief);
if (segments.length !== 2) {
	fail("segmentBrief(saas)", `expected 2 segments, got ${segments.length}: ${JSON.stringify(segments)}`);
}

// ── SaaS brief: two page screens + one component-recipe screen ──
const saas = buildApplicationMap(saasBrief);
{
	const bySlug = new Map(saas.screens.map((s) => [s.recipe ?? s.id, s]));
	const landing = bySlug.get("landing-page");
	const pricing = bySlug.get("pricing-page");
	const dataTable = bySlug.get("data-table-view");
	if (!landing || landing.source !== "page-recipe") fail("saas", "expected landing-page page-recipe screen");
	if (!pricing || pricing.source !== "page-recipe") fail("saas", "expected pricing-page page-recipe screen");
	if (!dataTable || dataTable.source !== "recipe") fail("saas", "expected data-table-view recipe screen");
	if (landing && landing.confidence !== "high") {
		fail("saas", `landing confidence ${landing.confidence} !== high`);
	}
	if (landing && (!landing.sections || landing.sections.length === 0)) {
		fail("saas", "landing screen should carry its recipe sections");
	}
	if (!saas.install.components.includes("marketing-hero")) {
		fail("saas", "install missing marketing-hero");
	}
	if (saas.theme.preset !== "default") fail("saas", `theme ${saas.theme.preset} !== default`);
	if (saas.checklist.length === 0) fail("saas", "expected merged checklist items");
	if (saas.tokenBudget.total <= 0) fail("saas", "expected positive token budget");
}

// ── One segment naming three pages yields three page screens ──
const multi = buildApplicationMap("landing page with pricing page and checkout");
{
	const recipes = multi.screens.map((s) => s.recipe).sort();
	const expected = ["checkout-page", "landing-page", "pricing-page"];
	if (JSON.stringify(recipes) !== JSON.stringify(expected)) {
		fail("multi-page segment", `expected ${expected.join(",")}, got ${recipes.join(",")}`);
	}
}

// ── Component-recipe brief ──
const kanban = buildApplicationMap("kanban board with drag and drop columns");
{
	const screen = kanban.screens[0];
	if (!screen || screen.recipe !== "kanban-board" || screen.source !== "recipe") {
		fail("kanban", `expected kanban-board recipe screen, got ${screen?.recipe ?? "none"}`);
	}
	// Install is the requires-closure superset of every screen's components.
	const direct = new Set(kanban.screens.flatMap((s) => s.components));
	for (const slug of direct) {
		if (!kanban.install.components.includes(slug)) {
			fail("kanban", `install missing direct component ${slug}`);
		}
	}
	if (!kanban.install.components.includes("dnd")) fail("kanban", "install missing dnd");
}

// ── Unmatchable brief degrades to an empty map, not an error ──
const nonsense = buildApplicationMap("qwzx florble grumpet");
if (nonsense.screens.length !== 0 || nonsense.install.components.length !== 0) {
	fail("nonsense", "expected empty screens and install");
}

// ── Emitted maps validate against their own schema ──
for (const [name, map] of [
	["saas", saas],
	["kanban", kanban],
	["nonsense", nonsense],
] as const) {
	const parsed = mapSchema.safeParse(JSON.parse(stableStringifyMap(map)));
	if (!parsed.success) fail(`schema(${name})`, parsed.error.issues[0]?.message ?? "invalid");
}

// ── Determinism: same brief ⇒ same bytes ──
if (stableStringifyMap(saas) !== stableStringifyMap(buildApplicationMap(saasBrief))) {
	fail("determinism", "two runs of the same brief produced different bytes");
}

// Two in-process runs share one memoized graph and one locale, so they
// cannot catch the collation hazard `compareStrings` exists to fix. Pin the
// actual bytes instead — this hash only moves when the registry or the
// builder legitimately changes, and it moves on a machine with a different
// ICU locale if a locale-sensitive sort ever creeps back in.
const saasDigest = createHash("sha256").update(stableStringifyMap(saas)).digest("hex");
const EXPECTED_SAAS_DIGEST = "f04b218922847c554be7319751452a313adb740a3955982bf9c07eaf41cb9ab4";
if (saasDigest !== EXPECTED_SAAS_DIGEST) {
	fail(
		"determinism digest",
		`map bytes changed — expected ${EXPECTED_SAAS_DIGEST}, got ${saasDigest}. If the registry or builder changed deliberately, update EXPECTED_SAAS_DIGEST.`,
	);
}

if (failures.length > 0) {
	console.error(`map: ${failures.length} regression(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.error("map: all cases passed");
