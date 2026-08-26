import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// The ENCODING IS NAMED, not defaulted. `gpt-tokenizer`'s bare entry point
// re-exports whichever encoding is current for the newest OpenAI model, so it
// silently became o200k_base in 3.x. That made the budgets baked in here
// disagree with `scripts/audit-tokens.ts` and with the ceilings pinned in
// `packages/mcp-server/src/contract.test.ts` (which always named cl100k_base),
// while every comment claimed the three agreed. Naming it is what makes the
// claim survive the next major.
import { encode } from "gpt-tokenizer/encoding/cl100k_base";
import {
	componentSchemaDefinition,
	recipeSchemaDefinition,
	type ComponentSchemaDefinition,
	type RecipeChecklistItem,
} from "@hex-core/registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const COMPONENTS_SRC = path.join(ROOT, "packages/components/src");
const REGISTRY_OUT = path.join(ROOT, "registry");
const ITEMS_OUT = path.join(REGISTRY_OUT, "items");
const LIB_DIR = path.join(COMPONENTS_SRC, "lib");
const RECIPES_SRC = path.join(ROOT, "packages/registry/src/recipes");
const RECIPES_OUT = path.join(REGISTRY_OUT, "recipes");

// Ensure output dirs exist
fs.mkdirSync(ITEMS_OUT, { recursive: true });
fs.mkdirSync(RECIPES_OUT, { recursive: true });

interface SchemaFile {
	category: string;
	name: string;
	schemaPath: string;
	/** `null` for schema-only roots whose runtime ships from a sibling npm package. */
	componentPath: string | null;
}

/**
 * Discover all component schema files across category directories.
 * @returns An array of schema file descriptors with category, name, and file paths
 */
/**
 * Filesystem-directory → category-key map for the components package
 * (each entry is a per-component subdirectory containing `<name>.schema.ts`
 * and `<name>.tsx`). Explicit so future additions (`hooks`, `libs`,
 * `themes`) don't get silently mangled by a `replace(/s$/)` heuristic.
 */
const CATEGORY_DIR_TO_KEY = {
	primitives: "primitive",
	components: "component",
	blocks: "block",
	ai: "ai",
	artifacts: "artifact",
} as const;

/**
 * Schema-only roots — packages that ship their runtime as a publishable
 * npm package and only contribute registry **metadata** (no per-component
 * `.tsx` source to copy into consumers' projects). Each entry maps a flat
 * directory of `<name>.schema.ts` files to a registry category.
 *
 * The motion package is the first one of these: `<Motion.div>` is real
 * code in `@hex-core/motion`, but `npx hex add motion` doesn't copy
 * source — it installs the npm package via `dependencies.npm`.
 */
const SCHEMA_ONLY_ROOTS: Array<{ dir: string; category: string }> = [
	{ dir: path.join(ROOT, "packages/motion/src/schemas"), category: "motion" },
	// AI Kit hooks (Phase 3+) ship runtime from `@hex-core/components` itself —
	// the schema is metadata only; the CLI adds the npm dep via dependencies.npm
	// and the consumer imports from the existing `@hex-core/components` install.
	{ dir: path.join(COMPONENTS_SRC, "hooks/schemas"), category: "hook" },
];

function findSchemaFiles(): SchemaFile[] {
	const results: SchemaFile[] = [];

	// Component roots — each schema has a sibling .tsx the registry copies.
	for (const [dirName, categoryKey] of Object.entries(CATEGORY_DIR_TO_KEY)) {
		const categoryDir = path.join(COMPONENTS_SRC, dirName);
		if (!fs.existsSync(categoryDir)) continue;

		// Sorted: readdir order is filesystem-dependent (APFS vs ext4), and
		// this order reaches the committed registry/. CI diffs that artifact.
		for (const componentDir of fs.readdirSync(categoryDir).sort()) {
			const fullDir = path.join(categoryDir, componentDir);
			if (!fs.statSync(fullDir).isDirectory()) continue;

			const schemaFile = path.join(fullDir, `${componentDir}.schema.ts`);
			const componentFile = path.join(fullDir, `${componentDir}.tsx`);

			if (fs.existsSync(schemaFile) && fs.existsSync(componentFile)) {
				results.push({
					category: categoryKey,
					name: componentDir,
					schemaPath: schemaFile,
					componentPath: componentFile,
				});
			}
		}
	}

	// Schema-only roots — flat directories of `<name>.schema.ts` files.
	for (const root of SCHEMA_ONLY_ROOTS) {
		if (!fs.existsSync(root.dir)) continue;
		for (const file of fs.readdirSync(root.dir).sort()) {
			if (!file.endsWith(".schema.ts")) continue;
			const name = file.replace(/\.schema\.ts$/, "");
			results.push({
				category: root.category,
				name,
				schemaPath: path.join(root.dir, file),
				componentPath: null,
			});
		}
	}

	return results;
}

/**
 * Load the exported definition object from a schema or recipe module.
 *
 * The authoring convention is `export const <x>Schema = { ... }` for
 * components and `export const <x>Recipe = { ... }` for recipes. This
 * imports the module for real (the script runs under `tsx`) rather than
 * slicing the object literal out of the source text, so schema files are
 * free to reference imported constants, shared fragments and computed
 * values. The returned object is typed as `unknown`; callers must
 * validate it through a Zod schema before use.
 * @param filePath - Absolute path to the source file
 * @param suffix - Which export convention to look for
 * @returns The exported definition as `unknown`, or null if none is found
 */
async function loadDefinition(
	filePath: string,
	suffix: "Schema" | "Recipe",
): Promise<unknown> {
	let mod: unknown;
	try {
		mod = await import(pathToFileURL(filePath).href);
	} catch (err) {
		console.error(`  ERROR: Could not import ${path.relative(ROOT, filePath)}`, err);
		return null;
	}
	if (typeof mod !== "object" || mod === null) {
		console.error(`  ERROR: ${path.relative(ROOT, filePath)} is not a module namespace`);
		return null;
	}
	const exports: Record<string, unknown> = { ...mod };

	// EXACTLY ONE, or refuse. The previous rule took the alphabetically-first
	// match: deterministic, but arbitrary — and arbitrary in a direction nobody
	// would predict, because `Object.keys().sort()` puts every capitalised name
	// ahead of every camelCase one. A schema file that grew a Zod
	// `PropsSchema` beside its `buttonSchema` would have silently shipped the
	// Zod object as the component definition, to be rejected downstream by a
	// validator pointing at the wrong thing.
	//
	// All 159 schemas and every recipe export exactly one, so uniqueness costs
	// nothing today and turns that class of mistake into a build error naming
	// both candidates. Name the second export something that does not end in
	// `${suffix}`, or move it to a sibling module.
	const matches = Object.keys(exports)
		.filter((k) => k.endsWith(suffix))
		.sort();
	if (matches.length === 0) {
		console.error(`  ERROR: ${path.relative(ROOT, filePath)} exports no \`*${suffix}\` binding`);
		return null;
	}
	if (matches.length > 1) {
		console.error(
			`  ERROR: ${path.relative(ROOT, filePath)} exports ${String(matches.length)} ` +
				`\`*${suffix}\` bindings (${matches.join(", ")}) — exactly one is required so the ` +
				`definition picked is never a coin flip.`,
		);
		return null;
	}
	return exports[matches[0]];
}

/**
 * Read a component source file as a UTF-8 string.
 * @param filePath - Absolute path to the component file
 * @returns The file contents as a string
 */
function readComponentSource(filePath: string): string {
	return fs.readFileSync(filePath, "utf-8");
}

/**
 * Measure what installing a component actually costs an LLM, in tokens.
 *
 * Counts the component's own source plus the dependency files unique to
 * it, and deliberately excludes `type: "lib"` — every item bundles the
 * same shared `lib/*.ts`, so including them would add a flat ~2.4k to
 * every component and destroy the ranking signal the budget exists for.
 *
 * Schema-only items (motion, hooks) ship no source to measure, so their
 * author-declared value stands.
 *
 * Replaces 161 hand-typed integers that nothing recomputed and that had
 * drifted badly — `data-table` declared 820 against a real 2,269.
 * @param files - The item's emitted file list
 * @param declared - The author-declared budget, used as the fallback
 * @returns The measured token count, or `declared` when there is no source
 */
function deriveTokenBudget(
	files: Array<{ content: string; type: string }>,
	declared: number | undefined,
): number | undefined {
	const measurable = files.filter((f) => f.type !== "lib");
	if (measurable.length === 0) return declared;
	return encode(measurable.map((f) => f.content).join("\n")).length;
}

/**
 * Read all TypeScript lib files from the shared lib directory.
 * @returns An array of file descriptors with relative path, content, and type "lib"
 */
function readLibFiles(): Array<{ path: string; content: string; type: string }> {
	const files: Array<{ path: string; content: string; type: string }> = [];
	if (!fs.existsSync(LIB_DIR)) return files;

	for (const file of fs.readdirSync(LIB_DIR).sort()) {
		if (file.endsWith(".ts") || file.endsWith(".tsx")) {
			files.push({
				path: `lib/${file}`,
				content: fs.readFileSync(path.join(LIB_DIR, file), "utf-8"),
				type: "lib",
			});
		}
	}
	return files;
}

interface RegistryFile {
	path: string;
	content: string;
	type: string;
}

/**
 * Discover sibling/cross-package files a component depends on, so the
 * registry manifest ships them alongside the main component:
 *
 *   1. Co-located `*-variants.{ts,tsx}` siblings — flatten into `components/ui/`.
 *   2. Cross-package variants `from "../<...>/<dir>/<dir>-variants"` — flatten
 *      into `components/ui/<dir>-variants.tsx` so consumers don't need to
 *      install the producing component first.
 *   3. Shared imports `from "../_shared/<name>"` — ship at
 *      `components/_shared/<name>.tsx`, matching `rewriteRegistryImports` rule 3.
 *   4. Same-directory sibling imports `from "./<name>"` (e.g. extracted
 *      utility modules like `./close-unterminated.js`) — flatten into
 *      `components/ui/<name>.ts(x)`. Skips `*-variants` (rule 1 owns
 *      those) and the entry file's self-reference. Keeps the original
 *      extension so pure `.ts` utilities don't masquerade as `.tsx`.
 *
 * Files dedup by target path; the caller appends to `registryItem.files`.
 */
function collectDirectDependencies(
	componentPath: string,
	source: string,
	mainName: string,
): Map<string, { file: RegistryFile; origin: string }> {
	const out = new Map<string, { file: RegistryFile; origin: string }>();
	const componentDir = path.dirname(componentPath);

	// 1. Sibling -variants files in the same directory.
	for (const f of fs.readdirSync(componentDir).sort()) {
		if (!/-variants\.(ts|tsx)$/.test(f)) continue;
		if (f === `${mainName}.tsx`) continue;
		const baseName = f.replace(/\.ts$/, "").replace(/\.tsx$/, "");
		const targetPath = `components/ui/${baseName}.tsx`;
		if (out.has(targetPath)) continue;
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(path.join(componentDir, f), "utf-8"),
				type: "component",
			},
			origin: path.join(componentDir, f),
		});
	}

	// 2. Cross-package variants: `../<...>/<dir>/<dir>-variants[.js]`.
	//    Match `from`, `import`, and `export … from` so static, side-effect,
	//    and re-export shapes all surface their dependencies.
	const xPkgVariants =
		/(?:from|import|export\s+(?:\*|\{[^}]*\})\s+from)\s+["'](?:\.\.\/)+(?:primitives\/|components\/)?([a-z][a-z0-9-]*)\/\1-variants(?:\.js)?["']/g;
	for (const m of source.matchAll(xPkgVariants)) {
		const dirName = m[1];
		const targetPath = `components/ui/${dirName}-variants.tsx`;
		if (out.has(targetPath)) continue;
		const importSpec = m[0].match(/["']([^"']+)["']/)?.[1] ?? "";
		const sourcePath = resolveSourceFile(componentDir, importSpec);
		if (!sourcePath) {
			console.warn(`  Warning: could not locate ${importSpec} from ${mainName}`);
			continue;
		}
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(sourcePath, "utf-8"),
				type: "component",
			},
			origin: sourcePath,
		});
	}

	// 3. _shared imports: `../_shared/<name>[.js]` — same import-shape coverage as rule 2.
	const sharedImports =
		/(?:from|import|export\s+(?:\*|\{[^}]*\})\s+from)\s+["'](?:\.\.\/)+_shared\/([a-z][a-z0-9-]*)(?:\.js)?["']/g;
	for (const m of source.matchAll(sharedImports)) {
		const name = m[1];
		const targetPath = `components/_shared/${name}.tsx`;
		if (out.has(targetPath)) continue;
		const importSpec = m[0].match(/["']([^"']+)["']/)?.[1] ?? "";
		const sourcePath = resolveSourceFile(componentDir, importSpec);
		if (!sourcePath) {
			console.warn(`  Warning: could not locate ${importSpec} from ${mainName}`);
			continue;
		}
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(sourcePath, "utf-8"),
				type: "component",
			},
			origin: sourcePath,
		});
	}

	// 4. Cross-directory component imports: `../<name>/<name>[.js]` and
	//    `../../<category>/<name>/<name>[.js]` — one component composing
	//    another from a sibling or another category directory.
	//
	//    `rewriteRegistryImports` in @hex-core/payload already rewrites
	//    these to `@/components/ui/<name>`, so the consumer's import
	//    resolves — but only if the file is actually shipped alongside it.
	//    Without this rule the item emits a dangling import: `hex add
	//    sources` produced a `sources.tsx` importing a `citation` that was
	//    never written.
	//
	//    `\1` ties the directory name to the file name, which is the
	//    convention every component follows and keeps this from matching
	//    `../_shared/x` (rule 3) or `../<dir>/<dir>-variants` (rule 2).
	const crossDirComponents =
		/(?:from|import|export\s+(?:\*|\{[^}]*\})\s+from)\s+["'](?:\.\.\/)+(?:[a-z][a-z0-9-]*\/)?([a-z][a-z0-9-]*)\/\1(?:\.js)?["']/g;
	for (const m of source.matchAll(crossDirComponents)) {
		const name = m[1];
		if (!name || name === mainName) continue;
		const importSpec = m[0].match(/["']([^"']+)["']/)?.[1] ?? "";
		const sourcePath = resolveSourceFile(componentDir, importSpec);
		if (!sourcePath) {
			console.warn(`  Warning: could not locate ${importSpec} from ${mainName}`);
			continue;
		}
		const ext = sourcePath.endsWith(".tsx") ? ".tsx" : ".ts";
		const targetPath = `components/ui/${name}${ext}`;
		if (out.has(targetPath)) continue;
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(sourcePath, "utf-8"),
				type: "component",
			},
			origin: sourcePath,
		});
	}

	// 4b. Category-level shared modules: `../<name>[.js]` — a single
	//     segment with no directory after it, which is what distinguishes
	//     `../types.js` (the `ai/` category's shared type module) from
	//     `../<name>/<name>.js` (rule 4) and `../lib/utils.js` (shipped
	//     separately as a lib file).
	const categoryModules =
		/(?:from|import|export\s+(?:\*|\{[^}]*\})\s+from)\s+["']\.\.\/([a-z][a-z0-9-]*)(?:\.js)?["']/g;
	for (const m of source.matchAll(categoryModules)) {
		const name = m[1];
		if (!name || name === mainName) continue;
		const importSpec = m[0].match(/["']([^"']+)["']/)?.[1] ?? "";
		const sourcePath = resolveSourceFile(componentDir, importSpec);
		if (!sourcePath) continue;
		const ext = sourcePath.endsWith(".tsx") ? ".tsx" : ".ts";
		const targetPath = `components/ui/${name}${ext}`;
		if (out.has(targetPath)) continue;
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(sourcePath, "utf-8"),
				type: "component",
			},
			origin: sourcePath,
		});
	}

	// 5. Direct same-directory sibling imports: `./<name>[.js]`. Skips
	//    `*-variants` (rule 1) and the entry's own filename. The shipped
	//    file keeps its source extension (.ts vs .tsx) so utility modules
	//    don't pretend to be React components.
	const siblingImports =
		/(?:from|import|export\s+(?:\*|\{[^}]*\})\s+from)\s+["']\.\/([a-z][a-z0-9-]*)(?:\.js)?["']/g;
	for (const m of source.matchAll(siblingImports)) {
		const name = m[1];
		if (!name) continue;
		if (name === mainName) continue;
		if (/-variants$/.test(name)) continue;
		const importSpec = m[0].match(/["']([^"']+)["']/)?.[1] ?? "";
		const sourcePath = resolveSourceFile(componentDir, importSpec);
		if (!sourcePath) {
			console.warn(`  Warning: could not locate ${importSpec} from ${mainName}`);
			continue;
		}
		const ext = sourcePath.endsWith(".tsx") ? ".tsx" : ".ts";
		const targetPath = `components/ui/${name}${ext}`;
		if (out.has(targetPath)) continue;
		out.set(targetPath, {
			file: {
				path: targetPath,
				content: fs.readFileSync(sourcePath, "utf-8"),
				type: "component",
			},
			origin: sourcePath,
		});
	}

	return out;
}

/**
 * Every file a registry item must ship, following imports transitively.
 *
 * `collectDirectDependencies` only sees the entry component's own source.
 * That is not enough: pulling in `button.tsx` also has to pull in the
 * `button-variants.tsx` it imports, and pulling in `command.tsx` has to
 * pull in `dialog.tsx`. Walking the closure is what makes an installed
 * item actually compile.
 *
 * Before this walk, 23 items shipped dangling imports — `hex add
 * auth-sign-in-split` wrote a file importing six components that were
 * never written beside it.
 *
 * Dedups by target path, and tracks visited source paths so a cycle
 * between two components cannot loop forever.
 * @param componentPath - Absolute path to the item's entry source file
 * @param source - The entry file's contents
 * @param mainName - The item's slug, used to skip self-references
 * @returns Every file to ship, entry excluded (the caller adds it)
 */
function discoverDependencies(
	componentPath: string,
	source: string,
	mainName: string,
): RegistryFile[] {
	const out = new Map<string, RegistryFile>();
	const queue: Array<{ filePath: string; source: string }> = [
		{ filePath: componentPath, source },
	];
	const visited = new Set<string>([componentPath]);

	while (queue.length > 0) {
		const next = queue.shift();
		if (!next) break;
		for (const [targetPath, { file, origin }] of collectDirectDependencies(
			next.filePath,
			next.source,
			mainName,
		)) {
			if (!out.has(targetPath)) out.set(targetPath, file);
			if (visited.has(origin)) continue;
			visited.add(origin);
			queue.push({ filePath: origin, source: file.content });
		}
	}

	return [...out.values()];
}


/**
 * Resolve a relative `.js`-suffixed monorepo import to an actual `.ts(x)`
 * file on disk. Tries `.ts` first, then `.tsx`. Returns null if neither
 * exists — callers warn and skip rather than crashing the build.
 */
function resolveSourceFile(fromDir: string, spec: string): string | null {
	const stripped = spec.replace(/\.js$/, "");
	const base = path.resolve(fromDir, stripped);
	for (const ext of [".ts", ".tsx"]) {
		const candidate = `${base}${ext}`;
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

// ─── Main ───

console.log("Building Hex Core registry...\n");

const schemaFiles = findSchemaFiles();
const libFiles = readLibFiles();

interface RegistryIndexItem {
	name: string;
	displayName: string;
	description: string;
	category: string;
	subcategory?: string;
	tags: string[];
	internalDeps: string[];
	tokenBudget?: number;
}

const indexItems: RegistryIndexItem[] = [];

/**
 * Map of compiled components keyed by slug. Recipe compilation reads from
 * this map to derive checklist items from each step's `ai.commonMistakes`
 * and `ai.accessibilityNotes`, so recipes stay consistent with the live
 * component metadata without the author copying any strings by hand.
 */
interface CompiledComponent {
	name: string;
	displayName: string;
	commonMistakes: string[];
	accessibilityNotes: string;
}

const componentsBySlug = new Map<string, CompiledComponent>();

for (const sf of schemaFiles) {
	console.log(`Processing: ${sf.name} (${sf.category})`);

	const raw = await loadDefinition(sf.schemaPath, "Schema");
	if (!raw) {
		console.error(`  ERROR: Failed to load schema for ${sf.name}`);
		continue;
	}

	const parsed = componentSchemaDefinition.safeParse(raw);
	if (!parsed.success) {
		console.error(`  ERROR: Schema validation failed for ${sf.name}`);
		console.error(`  ${parsed.error.message}`);
		continue;
	}
	const schema: ComponentSchemaDefinition = parsed.data;

	// Schema-only items (motion) ship no source files — the runtime lives in
	// a sibling npm package declared via `dependencies.npm`. Component-source
	// items copy their `.tsx` plus discovered dependency files plus libs.
	const itemFiles =
		sf.componentPath === null
			? []
			: (() => {
					const componentSource = readComponentSource(sf.componentPath);
					const dependencyFiles = discoverDependencies(
						sf.componentPath,
						componentSource,
						sf.name,
					);
					return [
						{
							path: `components/ui/${sf.name}.tsx`,
							content: componentSource,
							type: "component",
						},
						...dependencyFiles,
						...libFiles,
					];
				})();

	const ai = { ...schema.ai, tokenBudget: deriveTokenBudget(itemFiles, schema.ai.tokenBudget) };

	// Build the registry item
	const registryItem = {
		$schema: "https://hex-core.dev/schema/registry-item.json",
		name: schema.name,
		displayName: schema.displayName,
		description: schema.description,
		category: schema.category,
		subcategory: schema.subcategory,
		version: "0.1.0",
		framework: "react" as const,
		props: schema.props,
		variants: schema.variants,
		slots: schema.slots,
		files: itemFiles,
		dependencies: schema.dependencies,
		tokensUsed: schema.tokensUsed,
		examples: schema.examples,
		ai,
		tags: schema.tags,
	};

	// Write individual registry item
	const itemPath = path.join(ITEMS_OUT, `${sf.name}.json`);
	fs.writeFileSync(itemPath, JSON.stringify(registryItem, null, 2));
	console.log(`  → ${path.relative(ROOT, itemPath)}`);

	indexItems.push({
		name: schema.name,
		displayName: schema.displayName,
		description: schema.description,
		category: schema.category,
		subcategory: schema.subcategory,
		tags: schema.tags,
		internalDeps: schema.dependencies.internal,
		tokenBudget: ai.tokenBudget,
	});

	componentsBySlug.set(schema.name, {
		name: schema.name,
		displayName: schema.displayName,
		commonMistakes: schema.ai.commonMistakes,
		accessibilityNotes: schema.ai.accessibilityNotes,
	});
}

// Write registry index
const registryIndex = {
	$schema: "https://hex-core.dev/schema/registry.json",
	name: "hex-core",
	version: "0.1.0",
	description: "Hex Core — AI-native component library for LLMs and humans",
	homepage: "https://hex-core.dev",
	items: indexItems,
};

const indexPath = path.join(REGISTRY_OUT, "registry.json");
fs.writeFileSync(indexPath, JSON.stringify(registryIndex, null, 2));

console.log(`\n✓ Registry built: ${indexItems.length} components`);
console.log(`  Index: ${path.relative(ROOT, indexPath)}`);

// ─── Recipes ───

interface RecipeIndexEntry {
	slug: string;
	kind: "component" | "page";
	pageType?: "landing" | "app" | "ecommerce";
	title: string;
	summary: string;
	tags: string[];
	components: string[];
	tokenBudget?: number;
}

/**
 * Slug-ify an arbitrary string into a stable checklist-item id. Lowercases,
 * keeps alphanumerics, replaces everything else with a hyphen, collapses
 * runs of hyphens, and trims to avoid id collisions when two derived
 * mistakes happen to start identically.
 * @param input - Text to convert into a slug
 * @returns A lowercase hyphenated slug (always non-empty, trimmed to 48 chars)
 */
function slugify(input: string): string {
	const raw = input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
	return raw.length > 0 ? raw : "item";
}

console.log("\nBuilding Hex Core recipes...\n");

const recipeIndex: RecipeIndexEntry[] = [];

if (fs.existsSync(RECIPES_SRC)) {
	const recipeFiles = fs
		.readdirSync(RECIPES_SRC)
		.filter((f) => f.endsWith(".recipe.ts"))
		.sort();

	for (const file of recipeFiles) {
		const fullPath = path.join(RECIPES_SRC, file);
		const raw = await loadDefinition(fullPath, "Recipe");
		if (!raw) {
			console.error(`  ERROR: Failed to load recipe ${file}`);
			continue;
		}

		const parsed = recipeSchemaDefinition.safeParse(raw);
		if (!parsed.success) {
			console.error(`  ERROR: Recipe validation failed for ${file}`);
			console.error(`  ${parsed.error.message}`);
			continue;
		}
		const recipe = parsed.data;

		// Component slugs this recipe depends on: flat `steps` for component
		// recipes, ordered section `block`s for page recipes. The Zod schema's
		// superRefine guarantees the correct field is populated for each kind,
		// but the fields are independent — branching here keeps us honest.
		const referencedSlugs =
			recipe.kind === "page"
				? recipe.sections.map((s) => s.block)
				: recipe.steps.map((s) => s.component);
		const unknownSlugs = referencedSlugs.filter((slug) => !componentsBySlug.has(slug));
		if (unknownSlugs.length > 0) {
			console.error(
				`  ERROR: Recipe "${recipe.slug}" references unknown components: ${unknownSlugs.join(", ")}`,
			);
			continue;
		}

		// Derive checklist items from each referenced component's metadata
		// (steps + section blocks), in declaration order, deduped by id.
		const usedIds = new Set(recipe.checklist.map((c) => c.id));
		const derived: RecipeChecklistItem[] = [];

		for (const slug of referencedSlugs) {
			const comp = componentsBySlug.get(slug);
			if (!comp) continue;

			for (const mistake of comp.commonMistakes) {
				const id = `${slug}-${slugify(mistake)}`;
				if (usedIds.has(id)) continue;
				usedIds.add(id);
				derived.push({
					id,
					check: `[${comp.displayName}] Avoid: ${mistake}`,
					severity: "warn",
					source: "derived-mistake",
				});
			}

			const a11y = comp.accessibilityNotes;
			if (a11y.trim().length > 0) {
				const id = `${slug}-a11y`;
				if (!usedIds.has(id)) {
					usedIds.add(id);
					derived.push({
						id,
						check: `[${comp.displayName}] A11y: ${a11y}`,
						severity: "warn",
						source: "derived-a11y",
					});
				}
			}
		}

		const compiled = {
			$schema: "https://hex-core.dev/schema/recipe.json",
			slug: recipe.slug,
			kind: recipe.kind,
			title: recipe.title,
			summary: recipe.summary,
			tags: recipe.tags,
			brief: recipe.brief,
			steps: recipe.steps,
			pageType: recipe.pageType,
			theme: recipe.theme,
			sections: recipe.sections,
			layout: recipe.layout,
			checklist: [...recipe.checklist, ...derived],
			example: recipe.example,
			tokenBudget: recipe.tokenBudget,
		};

		const outPath = path.join(RECIPES_OUT, `${recipe.slug}.json`);
		fs.writeFileSync(outPath, JSON.stringify(compiled, null, 2));
		console.log(`  → ${path.relative(ROOT, outPath)}`);

		recipeIndex.push({
			slug: recipe.slug,
			kind: recipe.kind,
			pageType: recipe.pageType,
			title: recipe.title,
			summary: recipe.summary,
			tags: recipe.tags,
			components: referencedSlugs,
			tokenBudget: recipe.tokenBudget,
		});
	}
}

const recipesIndexPath = path.join(REGISTRY_OUT, "recipes.json");
fs.writeFileSync(
	recipesIndexPath,
	JSON.stringify(
		{
			$schema: "https://hex-core.dev/schema/recipes.json",
			name: "hex-core",
			version: "0.1.0",
			items: recipeIndex,
		},
		null,
		2,
	),
);

console.log(`\n✓ Recipes built: ${recipeIndex.length} recipes`);
console.log(`  Index: ${path.relative(ROOT, recipesIndexPath)}`);
