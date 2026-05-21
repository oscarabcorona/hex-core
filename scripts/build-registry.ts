import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	componentSchemaDefinition,
	recipeSchemaDefinition,
	type ComponentSchemaDefinition,
	type RecipeDefinition,
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
];

function findSchemaFiles(): SchemaFile[] {
	const results: SchemaFile[] = [];

	// Component roots — each schema has a sibling .tsx the registry copies.
	for (const [dirName, categoryKey] of Object.entries(CATEGORY_DIR_TO_KEY)) {
		const categoryDir = path.join(COMPONENTS_SRC, dirName);
		if (!fs.existsSync(categoryDir)) continue;

		for (const componentDir of fs.readdirSync(categoryDir)) {
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
		for (const file of fs.readdirSync(root.dir)) {
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
 * Extract the first exported object-literal const from a source file. The
 * authoring convention is `export const <x>Schema = { ... }` for
 * components and `export const <x>Recipe = { ... }` for recipes; this
 * helper finds either and balances braces (respecting strings/templates)
 * to slice out the literal. The returned object is typed as `unknown`;
 * callers must validate it through a Zod schema before use so the regex
 * can never silently accept an incidental same-suffixed sibling export.
 * @param filePath - Absolute path to the source file
 * @returns The parsed object as `unknown`, or null if extraction fails
 */
function extractObjectLiteral(filePath: string): unknown {
	const content = fs.readFileSync(filePath, "utf-8");

	// Require the suffix to be at a word boundary so `fooSchemaHelper = ...`
	// won't match. `(?![a-zA-Z0-9_])` rejects any trailing identifier char.
	const start = content.search(/export\s+const\s+\w+(?:Schema|Recipe)(?![a-zA-Z0-9_])[^=]*=\s*\{/);
	if (start === -1) return null;

	const braceOpen = content.indexOf("{", start);
	if (braceOpen === -1) return null;

	let depth = 0;
	let inString: '"' | "'" | "`" | null = null;
	let escapeNext = false;
	let end = -1;
	for (let i = braceOpen; i < content.length; i++) {
		const ch = content[i];
		if (escapeNext) {
			escapeNext = false;
			continue;
		}
		if (inString) {
			if (ch === "\\") {
				escapeNext = true;
				continue;
			}
			if (ch === inString) inString = null;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === "`") {
			inString = ch;
		} else if (ch === "{") {
			depth++;
		} else if (ch === "}") {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}
	if (end === -1) return null;

	const objStr = content.slice(braceOpen, end + 1);
	try {
		const fn = new Function(`return (${objStr})`);
		return fn();
	} catch (err) {
		console.warn(`  Warning: Could not parse object from ${filePath}`, err);
		return null;
	}
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
 * Read all TypeScript lib files from the shared lib directory.
 * @returns An array of file descriptors with relative path, content, and type "lib"
 */
function readLibFiles(): Array<{ path: string; content: string; type: string }> {
	const files: Array<{ path: string; content: string; type: string }> = [];
	if (!fs.existsSync(LIB_DIR)) return files;

	for (const file of fs.readdirSync(LIB_DIR)) {
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
function discoverDependencies(
	componentPath: string,
	source: string,
	mainName: string,
): RegistryFile[] {
	const out = new Map<string, RegistryFile>();
	const componentDir = path.dirname(componentPath);

	// 1. Sibling -variants files in the same directory.
	for (const f of fs.readdirSync(componentDir)) {
		if (!/-variants\.(ts|tsx)$/.test(f)) continue;
		if (f === `${mainName}.tsx`) continue;
		const baseName = f.replace(/\.ts$/, "").replace(/\.tsx$/, "");
		const targetPath = `components/ui/${baseName}.tsx`;
		if (out.has(targetPath)) continue;
		out.set(targetPath, {
			path: targetPath,
			content: fs.readFileSync(path.join(componentDir, f), "utf-8"),
			type: "component",
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
			path: targetPath,
			content: fs.readFileSync(sourcePath, "utf-8"),
			type: "component",
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
			path: targetPath,
			content: fs.readFileSync(sourcePath, "utf-8"),
			type: "component",
		});
	}

	// 4. Direct same-directory sibling imports: `./<name>[.js]`. Skips
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
			path: targetPath,
			content: fs.readFileSync(sourcePath, "utf-8"),
			type: "component",
		});
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

	const raw = extractObjectLiteral(sf.schemaPath);
	if (!raw) {
		console.error(`  ERROR: Failed to parse schema for ${sf.name}`);
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
		ai: schema.ai,
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
		tokenBudget: schema.ai.tokenBudget,
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
		const raw = extractObjectLiteral(fullPath);
		if (!raw) {
			console.error(`  ERROR: Failed to parse recipe ${file}`);
			continue;
		}

		const parsed = recipeSchemaDefinition.safeParse(raw);
		if (!parsed.success) {
			console.error(`  ERROR: Recipe validation failed for ${file}`);
			console.error(`  ${parsed.error.message}`);
			continue;
		}
		const recipe: RecipeDefinition = parsed.data;

		// Validate every step references an existing component
		const unknownSteps = recipe.steps.filter((s) => !componentsBySlug.has(s.component));
		if (unknownSteps.length > 0) {
			console.error(
				`  ERROR: Recipe "${recipe.slug}" references unknown components: ${unknownSteps
					.map((s) => s.component)
					.join(", ")}`,
			);
			continue;
		}

		// Derive checklist items from each step's component metadata
		const usedIds = new Set(recipe.checklist.map((c) => c.id));
		const derived: RecipeDefinition["checklist"] = [];

		for (const step of recipe.steps) {
			const comp = componentsBySlug.get(step.component);
			if (!comp) continue;

			for (const mistake of comp.commonMistakes) {
				const id = `${step.component}-${slugify(mistake)}`;
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
				const id = `${step.component}-a11y`;
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
			title: recipe.title,
			summary: recipe.summary,
			tags: recipe.tags,
			brief: recipe.brief,
			steps: recipe.steps,
			checklist: [...recipe.checklist, ...derived],
			example: recipe.example,
			tokenBudget: recipe.tokenBudget,
		};

		const outPath = path.join(RECIPES_OUT, `${recipe.slug}.json`);
		fs.writeFileSync(outPath, JSON.stringify(compiled, null, 2));
		console.log(`  → ${path.relative(ROOT, outPath)}`);

		recipeIndex.push({
			slug: recipe.slug,
			title: recipe.title,
			summary: recipe.summary,
			tags: recipe.tags,
			components: recipe.steps.map((s) => s.component),
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
