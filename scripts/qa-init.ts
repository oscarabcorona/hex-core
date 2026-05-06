import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Seed per-component QA checklist files under `.qa/`.
 *
 * - Reads `registry/items/<slug>.json` for metadata (slug, subcategory, variants, tokenBudget).
 * - Reads `registry/registry.json` to enumerate all 47 components.
 * - Copies `.qa/CHECKLIST_TEMPLATE.md` to `.qa/<slug>.md` with metadata substituted.
 * - Writes `.qa/INDEX.md` as the running-status table.
 * - Skips `.qa/<slug>.md` files that already exist (non-destructive so in-progress QA isn't clobbered).
 *
 * Run with: `pnpm dlx tsx scripts/qa-init.ts`
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY_JSON = path.join(ROOT, "registry/registry.json");
const ITEMS_DIR = path.join(ROOT, "registry/items");
const QA_DIR = path.join(ROOT, ".qa");
const TEMPLATE = path.join(QA_DIR, "CHECKLIST_TEMPLATE.md");

/** Maps a cluster number (1–11 per plan) to its human-readable name and slug list. */
const CLUSTERS: Record<number, { name: string; slugs: string[] }> = {
	1: {
		name: "Primitive actions & display",
		slugs: ["separator", "label", "badge", "avatar", "aspect-ratio", "button"],
	},
	2: {
		name: "Primitive form controls",
		slugs: [
			"input",
			"textarea",
			"checkbox",
			"switch",
			"radio-group",
			"toggle",
			"toggle-group",
			"slider",
		],
	},
	3: {
		name: "Primitive feedback & layout",
		slugs: ["skeleton", "progress", "scroll-area", "select"],
	},
	4: { name: "Content containers", slugs: ["card", "table", "tabs"] },
	5: { name: "Disclosure", slugs: ["accordion", "collapsible"] },
	6: {
		name: "Simple overlays",
		slugs: ["tooltip", "popover", "hover-card", "dialog", "alert-dialog"],
	},
	7: {
		name: "Menus",
		slugs: ["dropdown-menu", "context-menu", "menubar", "navigation-menu"],
	},
	8: { name: "Navigation", slugs: ["breadcrumb", "pagination", "sidebar"] },
	9: {
		name: "Data & inputs",
		slugs: ["data-table", "form", "alert", "sonner", "input-otp"],
	},
	10: {
		name: "Date & search",
		slugs: ["calendar", "date-picker", "command", "combobox"],
	},
	11: { name: "Overlays v2 & layout", slugs: ["sheet", "drawer", "resizable"] },
};

/** Minimal shape of an entry in the root `registry/registry.json` `items` array. */
interface RegistryItemBrief {
	name: string;
	category: string;
	subcategory?: string;
	tokenBudget?: number;
}

/** Expanded shape of a per-item JSON under `registry/items/<slug>.json`. */
interface RegistryItemFull extends RegistryItemBrief {
	variants?: Array<{ name: string; values: Array<{ value: string }> }>;
	ai?: { tokenBudget?: number };
}

/**
 * Parse the global registry index to enumerate all components.
 * @returns All 47 components with their brief fields (name, category, subcategory, tokenBudget).
 */
function readRegistryIndex(): RegistryItemBrief[] {
	const raw = JSON.parse(fs.readFileSync(REGISTRY_JSON, "utf-8")) as {
		items: RegistryItemBrief[];
	};
	return raw.items;
}

/**
 * Read a single per-component registry item for variants and full metadata.
 * @param slug - The component slug (e.g. `"button"`).
 * @returns The full registry item JSON for that slug.
 */
function readItem(slug: string): RegistryItemFull {
	const p = path.join(ITEMS_DIR, `${slug}.json`);
	return JSON.parse(fs.readFileSync(p, "utf-8")) as RegistryItemFull;
}

/**
 * Look up the cluster number for a given slug.
 * @param slug - The component slug.
 * @returns The cluster index (1–11) or 0 if the slug isn't in any cluster.
 */
function findCluster(slug: string): number {
	for (const [n, c] of Object.entries(CLUSTERS)) {
		if (c.slugs.includes(slug)) return Number(n);
	}
	return 0;
}

/**
 * Resolve the component source file path for a slug.
 * @param slug - The component slug.
 * @param category - Either `"primitive"` or `"component"` (drives the `primitives/` vs `components/` bucket).
 * @returns A project-relative path to `<slug>.tsx`.
 */
function componentPath(slug: string, category: string): string {
	const bucket = category === "primitive" ? "primitives" : "components";
	return `packages/components/src/${bucket}/${slug}/${slug}.tsx`;
}

/**
 * Resolve the schema file path for a slug.
 * @param slug - The component slug.
 * @param category - Either `"primitive"` or `"component"`.
 * @returns A project-relative path to `<slug>.schema.ts`.
 */
function schemaPath(slug: string, category: string): string {
	const bucket = category === "primitive" ? "primitives" : "components";
	return `packages/components/src/${bucket}/${slug}/${slug}.schema.ts`;
}

/**
 * Resolve the demo file path for a slug.
 * @param slug - The component slug.
 * @returns A project-relative path to `<slug>-demo.tsx`.
 */
function demoPath(slug: string): string {
	return `apps/docs/src/app/demos/${slug}-demo.tsx`;
}

/**
 * Resolve the compiled registry-item JSON path for a slug.
 * @param slug - The component slug.
 * @returns A project-relative path to `registry/items/<slug>.json`.
 */
function registryJsonPath(slug: string): string {
	return `registry/items/${slug}.json`;
}

/**
 * Format a component's variants as a compact one-line string for the checklist header.
 * @param item - The full registry item.
 * @returns `"variant: a/b/c; size: sm/md/lg"` or `"—"` when there are no variants.
 */
function formatVariants(item: RegistryItemFull): string {
	if (!item.variants || item.variants.length === 0) return "—";
	return item.variants
		.map((v) => `${v.name}: ${v.values.map((vv) => vv.value).join("/")}`)
		.join("; ");
}

/**
 * Substitute a slug's metadata into the checklist template.
 * @param slug - The component slug.
 * @param item - The full registry item (used for category, subcategory, variants, tokenBudget).
 * @param cluster - The cluster number; 0 renders `(uncategorized)`.
 * @returns The rendered checklist markdown for `.qa/<slug>.md`.
 */
function renderChecklist(slug: string, item: RegistryItemFull, cluster: number): string {
	const template = fs.readFileSync(TEMPLATE, "utf-8");
	const cl = CLUSTERS[cluster];
	const clusterLabel = cl ? `Cluster ${cluster} — ${cl.name}` : "(uncategorized)";
	return template
		.replaceAll("<!-- SLUG -->", slug)
		.replaceAll("<!-- CATEGORY -->", item.category ?? "—")
		.replaceAll("<!-- SUBCATEGORY -->", item.subcategory ?? "—")
		.replaceAll(
			"<!-- TOKEN_BUDGET -->",
			String(item.tokenBudget ?? item.ai?.tokenBudget ?? "—"),
		)
		.replaceAll("<!-- VARIANTS -->", formatVariants(item))
		.replaceAll("<!-- CLUSTER -->", clusterLabel)
		.replaceAll("<!-- COMPONENT_PATH -->", componentPath(slug, item.category))
		.replaceAll("<!-- SCHEMA_PATH -->", schemaPath(slug, item.category))
		.replaceAll("<!-- DEMO_PATH -->", demoPath(slug))
		.replaceAll("<!-- REGISTRY_JSON -->", registryJsonPath(slug))
		.replaceAll("<!-- DATE -->", "—")
		.replaceAll("<!-- POLISH_PR_URL -->", "—");
}

/**
 * Render the running-status `INDEX.md` grouped by cluster.
 * @param items - All registry items (used to cross-check missing slugs and surface orphans).
 * @returns Markdown for `.qa/INDEX.md`.
 */
function renderIndex(items: RegistryItemBrief[]): string {
	const lines: string[] = [
		"# Hex Core — QA Polish Index",
		"",
		"> Status tracker for the senior-designer polish pass across all 47 components.",
		"> See `CHECKLIST_TEMPLATE.md` for the per-component checklist. Each component has its own `<slug>.md`.",
		"",
		"**Legend**: `todo` · `in-review` · `needs-fix` · `approved`",
		"",
	];

	for (const [n, cl] of Object.entries(CLUSTERS)) {
		lines.push(`## Cluster ${n} — ${cl.name}`);
		lines.push("");
		lines.push("| Slug | Status | Last reviewed | Checklist |");
		lines.push("|------|--------|---------------|-----------|");
		for (const slug of cl.slugs) {
			const meta = items.find((i) => i.name === slug);
			if (!meta) {
				lines.push(`| ${slug} | ⚠️ missing from registry | — | — |`);
				continue;
			}
			lines.push(`| \`${slug}\` | todo | — | [${slug}.md](./${slug}.md) |`);
		}
		lines.push("");
	}

	const allClusterSlugs = new Set(Object.values(CLUSTERS).flatMap((c) => c.slugs));
	const orphans = items.map((i) => i.name).filter((s) => !allClusterSlugs.has(s));
	if (orphans.length > 0) {
		lines.push("## ⚠️ Uncategorized (update `scripts/qa-init.ts` clusters)");
		lines.push("");
		for (const slug of orphans) lines.push(`- \`${slug}\``);
		lines.push("");
	}

	return lines.join("\n");
}

/**
 * Entry point: seed one `.qa/<slug>.md` per registry component and regenerate `.qa/INDEX.md`.
 * Existing per-slug files are preserved so in-progress QA notes aren't clobbered.
 * Exits non-zero if the checklist template is missing.
 */
function main(): void {
	if (!fs.existsSync(TEMPLATE)) {
		console.error(`Checklist template not found at ${TEMPLATE}`);
		process.exit(1);
	}
	fs.mkdirSync(QA_DIR, { recursive: true });

	const items = readRegistryIndex();
	let created = 0;
	let skipped = 0;

	for (const brief of items) {
		const slug = brief.name;
		const out = path.join(QA_DIR, `${slug}.md`);
		if (fs.existsSync(out)) {
			skipped++;
			continue;
		}
		let full: RegistryItemFull;
		try {
			full = readItem(slug);
		} catch {
			full = brief;
		}
		const cluster = findCluster(slug);
		fs.writeFileSync(out, renderChecklist(slug, full, cluster));
		created++;
	}

	fs.writeFileSync(path.join(QA_DIR, "INDEX.md"), renderIndex(items));

	console.log(`✓ QA checklists seeded`);
	console.log(`  Created: ${created}`);
	console.log(`  Skipped (already existed): ${skipped}`);
	console.log(`  Index: ${path.relative(ROOT, path.join(QA_DIR, "INDEX.md"))}`);
}

main();
