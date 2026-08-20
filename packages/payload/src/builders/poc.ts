import { compareStrings } from "../lib/compare.js";
import { loadGraph } from "../graph/graph-loader.js";
import type { CatalogGraph } from "../graph/graph-schema.js";
import { requiresClosure } from "../graph/graph-query.js";
import { DEFAULT_ALIASES, rewriteRegistryImports } from "../lib/rewrite-imports.js";
import { loadRegistryItem, type RegistryItem } from "../loaders/registry-loader.js";
import type { Theme } from "@hex-core/registry";
import { generateGlobalsCss, getTheme } from "../loaders/theme-loader.js";
import type { ApplicationMap, MapScreen } from "./map.js";
import { stableStringifyMap } from "./map.js";

/**
 * POC scaffolder — the pure "demo side" engine behind `hex poc` and MCP
 * `scaffold_poc`. Takes an application map and returns the complete file
 * tree of a standalone runnable Next.js App Router app: scaffold files,
 * copied component sources (imports rewritten), and one deterministically
 * generated route per page-recipe screen, assembled from each section
 * block's schema-authored example. No filesystem writes, no LLM — the
 * CLI writes files, MCP returns the tree as JSON, both from this one
 * builder. Same map ⇒ same bytes.
 */

/** One file of the generated POC, path relative to the app root. */
export interface PocFile {
	/** Path relative to the generated app root (e.g. `app/landing/page.tsx`). */
	path: string;
	/** Complete file contents. */
	content: string;
}

/** A generated route for one page-recipe screen. */
export interface PocRoute {
	/** Id of the map screen this route was generated from. */
	screenId: string;
	/** URL path of the generated route (e.g. `/landing`). */
	route: string;
	/** Recipe slug the screen resolved to. */
	recipe: string;
}

/** Everything the POC builder produces. */
export interface PocBuildResult {
	/** Complete file tree, sorted by path. */
	files: PocFile[];
	/** npm packages the app's package.json depends on (sorted). */
	npmDependencies: string[];
	/** Routes generated for page-recipe screens. */
	routes: PocRoute[];
	/** Screen ids installed as components only (no generated route in v1). */
	installOnlyScreens: string[];
	/**
	 * Screens whose route could not be generated because of a catalog
	 * defect. The rest of the app is still scaffolded — one bad block
	 * shouldn't cost the user every other screen.
	 */
	skippedScreens: Array<{ screenId: string; reason: string }>;
	/** Every component slug whose source was copied into the app (sorted). */
	components: string[];
}

/** Injection options — the CLI passes its own registry snapshot loaders. */
export interface PocBuilderOptions {
	graph?: CatalogGraph;
	/** Full-item loader; defaults to the payload registry directory. */
	loadItem?: (slug: string) => RegistryItem | null;
	/** Theme preset override; defaults to the map's preset. */
	theme?: string;
	/** package.json name for the generated app. */
	appName?: string;
}

/**
 * Base runtime deps of the generated app (Tailwind v4 lane).
 *
 * Third of three places the v4 dep set is expressed: `hex init`'s
 * `peerDepsFor()` installs it, `hex doctor`'s base-dep check verifies it,
 * and this pins it for generated apps. They serve different shapes (names
 * vs. pinned ranges), but anyone changing the v4 lane must move all three.
 */
const BASE_DEPENDENCIES: Record<string, string> = {
	"class-variance-authority": "^0.7.0",
	clsx: "^2.1.0",
	next: "^16.2.4",
	react: "^19.2.5",
	"react-dom": "^19.2.5",
	"tailwind-merge": "^3.6.0",
	"tw-animate-css": "^1.4.0",
};

/** Dev deps of the generated app. */
const DEV_DEPENDENCIES: Record<string, string> = {
	"@tailwindcss/postcss": "^4.3.1",
	"@types/node": "^25",
	"@types/react": "^19",
	"@types/react-dom": "^19",
	tailwindcss: "^4",
	typescript: "^6.0.3",
};

/**
 * Known-good version ranges for registry npm deps that ship as bare names.
 * Sourced from the monorepo's own manifests (`packages/components` peer
 * ranges + `apps/docs`) — the versions the component sources are actually
 * written and visually verified against. A bare dep missing here falls
 * back to `latest`, which risks a breaking major (that is exactly how
 * `@tanstack/react-table@latest` broke the data-table POC in testing).
 *
 * `packages/payload/src/builders/poc-pins.test.ts` walks every registry
 * item and fails when a bare npm name is absent here, so this table can
 * only drift for one commit before CI catches it.
 */
const KNOWN_NPM_VERSIONS: Record<string, string> = {
	// First-party packages whose runtime the POC installs rather than copies
	// (motion primitives and AI-kit hooks ship no source files).
	"@hex-core/components": "^1.15.0",
	"@hex-core/motion": "^0.3.1",
	"@hookform/resolvers": "^5.2.2",
	"@radix-ui/react-accordion": "^1.2.14",
	"@radix-ui/react-alert-dialog": "^1.1.17",
	"@radix-ui/react-aspect-ratio": "^1.1.10",
	"@radix-ui/react-avatar": "^1.2.0",
	"@radix-ui/react-checkbox": "^1.3.5",
	"@radix-ui/react-collapsible": "^1.1.14",
	"@radix-ui/react-context-menu": "^2.3.1",
	"@radix-ui/react-dialog": "^1.1.17",
	"@radix-ui/react-dropdown-menu": "^2.1.18",
	"@radix-ui/react-hover-card": "^1.1.17",
	"@radix-ui/react-label": "^2.1.10",
	"@radix-ui/react-menubar": "^1.1.18",
	"@radix-ui/react-navigation-menu": "^1.2.16",
	"@radix-ui/react-popover": "^1.1.17",
	"@radix-ui/react-progress": "^1.1.10",
	"@radix-ui/react-radio-group": "^1.4.1",
	"@radix-ui/react-scroll-area": "^1.2.12",
	"@radix-ui/react-select": "^2.3.1",
	"@radix-ui/react-separator": "^1.1.10",
	"@radix-ui/react-slider": "^1.4.1",
	"@radix-ui/react-slot": "^1.3.0",
	"@radix-ui/react-switch": "^1.3.1",
	"@radix-ui/react-tabs": "^1.1.15",
	"@radix-ui/react-toggle": "^1.1.12",
	"@radix-ui/react-toggle-group": "^1.1.13",
	"@radix-ui/react-toolbar": "^1.1.13",
	"@radix-ui/react-tooltip": "^1.2.10",
	"@tanstack/react-table": "^8.21.3",
	"class-variance-authority": "^0.7.0",
	clsx: "^2.1.0",
	cmdk: "^1.1.1",
	"date-fns": "^4.4.0",
	"input-otp": "^1.4.2",
	"react-day-picker": "^10.0.1",
	"react-hook-form": "^7.78.0",
	"react-markdown": "^10.1.0",
	"react-resizable-panels": "^4.10.0",
	"rehype-raw": "^7.0.0",
	"rehype-sanitize": "^6.0.0",
	"remark-gfm": "^4.0.1",
	shiki: "^4.0.2",
	sonner: "^2.0.7",
	"tailwind-merge": "^3.6.0",
	"unist-util-visit": "^5.1.0",
	vaul: "^1.1.2",
	zod: "^4.4.3",
};

/**
 * Split a registry npm dep entry into name + version range. Entries come
 * as bare names (`"sonner"`) or with an inline range
 * (`"@dnd-kit/core@^6.3.1"`). Bare names resolve through
 * `KNOWN_NPM_VERSIONS`, falling back to `latest`.
 * @param entry - Raw `dependencies.npm` entry from a registry item
 * @returns The package name and the version range to write
 */
function parseNpmDep(entry: string): { name: string; version: string } {
	// `at > 0` skips the leading `@` of a scoped name; `at < length - 1`
	// rejects a trailing `@` ("foo@"), which npm would read as `*`.
	const at = entry.lastIndexOf("@");
	if (at > 0 && at < entry.length - 1) {
		return { name: entry.slice(0, at), version: entry.slice(at + 1) };
	}
	const name = at === entry.length - 1 && at > 0 ? entry.slice(0, at) : entry;
	return { name, version: KNOWN_NPM_VERSIONS[name] ?? "latest" };
}

/**
 * Extract the npm package name from an import specifier, dropping any
 * subpath: `next/navigation` → `next`, `@hex-core/motion/adapters/x` →
 * `@hex-core/motion`. Subpaths are valid in import statements but not as
 * `package.json` dependency keys.
 * @param specifier - Bare import specifier from an example
 * @returns The owning package name
 */
function packageNameOf(specifier: string): string {
	const segments = specifier.split("/");
	return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

/**
 * Neutralize star-slash sequences so map-supplied text can never
 * terminate the JSX/JSDoc comment it is emitted into (an unescaped
 * terminator would drop the rest of the string into expression position).
 * @param text - Arbitrary text destined for a comment
 * @returns The text with comment terminators broken up
 */
function commentSafe(text: string): string {
	return text.split("*/").join("* /");
}

/**
 * Convert a screen id into a valid PascalCase component identifier.
 * Non-alphanumerics are treated as word breaks; a leading digit gets a
 * `Screen` prefix (`2fa-login` → `Screen2faLogin`) so the generated
 * `export default function <X>Page()` always parses.
 * @param id - Screen id (slug-shaped for schema-validated maps)
 * @returns A valid identifier prefix
 */
function componentIdentifier(id: string): string {
	const pascal = id
		.split(/[^a-zA-Z0-9]+/)
		.filter((part) => part.length > 0)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
	if (pascal.length === 0) return "Screen";
	return /^[0-9]/.test(pascal) ? `Screen${pascal}` : pascal;
}

/**
 * Convert an identifier to kebab-case (`MarketingHero` → `marketing-hero`).
 * @param identifier - A PascalCase or camelCase identifier
 * @returns The kebab-case form
 */
function kebabCase(identifier: string): string {
	return identifier
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}

/**
 * Index every graph item's exported identifiers so example imports can be
 * routed to the copied component modules.
 * @param graph - The catalog graph
 * @returns identifier → item slugs exporting it (sorted for determinism)
 */
function buildExportIndex(graph: CatalogGraph): Map<string, string[]> {
	const index = new Map<string, string[]>();
	for (const node of graph.nodes) {
		if (node.kind !== "item" || !node.exports) continue;
		for (const name of node.exports) {
			const slugs = index.get(name);
			if (slugs) slugs.push(node.slug);
			else index.set(name, [node.slug]);
		}
	}
	for (const slugs of index.values()) slugs.sort();
	return index;
}

/** What generating one page produced. */
export interface GeneratedPage {
	/** The page.tsx source. */
	source: string;
	/** Item slugs the page imports from `@/components/ui/`. */
	componentSlugs: string[];
	/** Non-barrel packages the page still imports (e.g. `@hex-core/motion`). */
	externalPackages: string[];
}

/**
 * Deterministically generate the `page.tsx` source for a page-recipe
 * screen. Each section contributes its block's first schema example:
 * import lines are stripped, every identifier imported from the
 * `@hex-core/components` barrel is re-routed to the copied module
 * (`@/components/ui/<slug>`) via the graph's export index, and the JSX
 * bodies are stitched into one Server Component in section order with
 * `{/* id: intent *\/}` markers.
 * @param screen - A `page-recipe` screen from an application map
 * @param options - Graph / item-loader injection (same as `buildPocFiles`)
 * @returns The page source plus the component slugs and packages it uses
 * @throws {Error} Naming the offending block and the fix when a section
 * has no example or an identifier cannot be resolved
 */
export function generatePageSource(screen: MapScreen, options: PocBuilderOptions = {}): GeneratedPage {
	if (screen.source !== "page-recipe" || !screen.sections || screen.sections.length === 0) {
		throw new Error(`Screen "${screen.id}" is not a page-recipe screen — only page recipes generate routes.`);
	}
	const graph = options.graph ?? loadGraph();
	const loadItem = options.loadItem ?? loadRegistryItem;
	const exportIndex = buildExportIndex(graph);

	// identifier → import source module (deduped across sections).
	const importsByModule = new Map<string, Set<string>>();
	const moduleByIdentifier = new Map<string, string>();
	const componentSlugs = new Set<string>();
	const externalPackages = new Set<string>();
	const passthroughImports = new Set<string>();
	const hoisted: string[] = [];
	const hoistedNames = new Set<string>();
	const sectionsJsx: string[] = [];

	/**
	 * Register one identifier import against its resolved module. Imports are
	 * keyed by module, so without this check two sections importing the same
	 * name from different modules would emit two conflicting import lines
	 * (`TS2300: Duplicate identifier`) in the user's app.
	 * @param module - Import specifier for the generated page
	 * @param identifier - Named export to import
	 * @param blockSlug - Block whose example requested it (for the error)
	 * @throws {Error} When the identifier is already bound to another module
	 */
	const addImport = (module: string, identifier: string, blockSlug: string): void => {
		const prior = moduleByIdentifier.get(identifier);
		if (prior && prior !== module) {
			throw new Error(
				`Catalog defect: "${identifier}" is imported from both "${prior}" and "${module}" across sections of "${screen.id}" (block "${blockSlug}"). Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
			);
		}
		moduleByIdentifier.set(identifier, module);
		const set = importsByModule.get(module);
		if (set) set.add(identifier);
		else importsByModule.set(module, new Set([identifier]));
	};

	for (const section of screen.sections) {
		const item = loadItem(section.block);
		const example = item?.examples?.[0]?.code;
		if (!item || !example) {
			throw new Error(
				`Catalog defect: block "${section.block}" (section "${section.id}" of "${screen.recipe ?? screen.id}") ships no usage example to generate from. Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
			);
		}

		const lines = example.split("\n");
		const bodyLines: string[] = [];
		for (const line of lines) {
			const importMatch = /^import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["'];?\s*$/.exec(line);
			if (importMatch) {
				const module = importMatch[2];
				for (const piece of importMatch[1].split(",")) {
					const identifier = piece.trim().replace(/^type\s+/, "");
					if (identifier.length === 0) continue;
					if (module === "@hex-core/components") {
						const slug = resolveIdentifier(identifier, section.block, exportIndex, graph);
						componentSlugs.add(slug);
						addImport(`@/components/ui/${slug}`, identifier, section.block);
					} else if (module.startsWith("@/")) {
						// Alias import — the example already points at a copied
						// module. Accept the components/ui shape; anything else
						// has no defined install source.
						const aliasSlug = /^@\/components\/ui\/([a-z0-9][a-z0-9-]*)$/.exec(module)?.[1];
						if (!aliasSlug) {
							throw new Error(
								`Catalog defect: block "${section.block}" example imports "${module}"; only "@/components/ui/<slug>" alias imports are supported. Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
							);
						}
						componentSlugs.add(aliasSlug);
						addImport(module, identifier, section.block);
					} else {
						externalPackages.add(packageNameOf(module));
						addImport(module, identifier, section.block);
					}
				}
				continue;
			}
			// Side-effect import (e.g. `import "reactflow/dist/style.css";`) —
			// pass through verbatim and record the owning package.
			const sideEffectMatch = /^import\s+["']([^"']+)["'];?\s*$/.exec(line);
			if (sideEffectMatch) {
				const module = sideEffectMatch[1];
				if (module === "@hex-core/components" || module.startsWith("@/") || module.startsWith(".")) {
					throw new Error(
						`Catalog defect: block "${section.block}" example has an unsupported side-effect import "${module}". Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
					);
				}
				externalPackages.add(packageNameOf(module));
				passthroughImports.add(`import "${module}";`);
				continue;
			}
			// Default / namespace / multi-line imports from external packages
			// pass through verbatim; from the barrel they can't be resolved to
			// a copied module, so fail loudly instead of emitting broken code.
			if (/^(?:import|export)\b/.test(line)) {
				const module = /from\s+["']([^"']+)["']/.exec(line)?.[1];
				if (module && module !== "@hex-core/components" && !module.startsWith("@/") && !module.startsWith(".")) {
					externalPackages.add(packageNameOf(module));
					passthroughImports.add(line.trim());
					continue;
				}
				throw new Error(
					`Catalog defect: block "${section.block}" example has an unsupported import shape (${line.trim().slice(0, 80)}). Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
				);
			}
			bodyLines.push(line);
		}

		// Split any leading fixture statements from the JSX expression so they
		// can be hoisted above the return. The JSX scan ignores lines inside an
		// unterminated template literal, so a backtick string containing a line
		// starting with `<` can't be mistaken for the start of the JSX.
		const body = bodyLines.join("\n").trim();
		const jsxStart = findJsxStart(body);
		if (jsxStart < 0) {
			throw new Error(
				`Catalog defect: block "${section.block}" example has no top-level JSX element to render. Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
			);
		}
		const statements = body.slice(0, jsxStart).trim();
		const jsx = body.slice(jsxStart).trim();
		if (statements.length > 0) {
			for (const name of declaredNames(statements)) {
				if (hoistedNames.has(name)) {
					throw new Error(
						`Catalog defect: block "${section.block}" redeclares fixture "${name}" already used by an earlier section of "${screen.id}". Drop that screen from hex.map.json to scaffold the rest, and please report it at ${ISSUES_URL}.`,
					);
				}
				hoistedNames.add(name);
			}
			hoisted.push(statements);
		}

		const indented = indentBlock(jsx, "\t\t\t");
		sectionsJsx.push(
			`\t\t\t{/* ${commentSafe(section.id)}: ${commentSafe(section.intent)} */}\n${indented}`,
		);
	}

	const importLines = [
		...[...importsByModule.entries()]
			.sort((a, b) => compareStrings(a[0], b[0]))
			.map(([module, names]) => `import { ${[...names].sort().join(", ")} } from "${module}";`),
		...[...passthroughImports].sort(compareStrings),
	];

	// Blocks that render their own <main> (app-shell) must not be nested in
	// another one; every other page needs the landmark so screen-reader
	// landmark navigation and skip-links have a target.
	const wrapsMain = screen.sections.some((section) => SELF_MAIN_BLOCKS.has(section.block));
	const [openTag, closeTag] = wrapsMain ? ["<>", "</>"] : ['<main className="min-h-screen">', "</main>"];
	// Indent hoisted fixtures with the same template-aware helper the JSX
	// uses: a naive per-line prefix would inject tabs *inside* a multi-line
	// template literal, changing the string's runtime value (a leading tab
	// turns a markdown line into a code block).
	const hoistedBlock = hoisted.length > 0 ? `${indentBlock(hoisted.join("\n\n"), "\t")}\n\n` : "";
	const source = `import type { Metadata } from "next";
${importLines.join("\n")}

export const metadata: Metadata = {
	title: ${JSON.stringify(screen.name)},
	description: ${JSON.stringify(screen.segment)},
};

/** ${commentSafe(screen.name)} — generated from the ${commentSafe(screen.recipe ?? screen.id)} recipe. */
export default function ${componentIdentifier(screen.id)}Page() {
${hoistedBlock}	return (
		${openTag}
${sectionsJsx.join("\n")}
		${closeTag}
	);
}
`;
	return {
		source,
		componentSlugs: [...componentSlugs].sort(),
		externalPackages: [...externalPackages].sort(),
	};
}

/**
 * Resolve a barrel identifier to the item slug that exports it. On
 * collisions, an exact kebab-case name match wins, then the section's own
 * block, then the alphabetically first exporter.
 * @param identifier - Named export from the `@hex-core/components` barrel
 * @param blockSlug - Slug of the block whose example imports it
 * @param exportIndex - identifier → exporting slugs
 * @param graph - The catalog graph (for the block's requires closure)
 * @returns The chosen item slug
 * @throws {Error} When no registry item exports the identifier
 */
function resolveIdentifier(
	identifier: string,
	blockSlug: string,
	exportIndex: Map<string, string[]>,
	graph: CatalogGraph,
): string {
	const candidates = exportIndex.get(identifier);
	if (!candidates || candidates.length === 0) {
		throw new Error(
			`Cannot resolve "${identifier}" (imported by block "${blockSlug}"): no registry item exports it — rebuild the registry graph or fix the block's example imports.`,
		);
	}
	if (candidates.length === 1) return candidates[0];
	const kebab = kebabCase(identifier);
	if (candidates.includes(kebab)) return kebab;
	const closure = new Set(requiresClosure(graph, [blockSlug]));
	const inClosure = candidates.find((slug) => closure.has(slug));
	return inClosure ?? candidates[0];
}

/**
 * Build the complete file tree of a standalone Next.js POC app for an
 * application map.
 * @param map - The application map to materialize
 * @param options - Graph / loader injection, theme and name overrides
 * @returns The file tree plus dependency and route metadata
 * @throws {Error} When the theme preset is unknown, a mapped item is
 * missing from the registry, or page generation cannot resolve a block
 */
export function buildPocFiles(map: ApplicationMap, options: PocBuilderOptions = {}): PocBuildResult {
	const graph = options.graph ?? loadGraph();
	const loadItem = options.loadItem ?? loadRegistryItem;
	const appName = options.appName ?? "hex-poc";
	const presetName = options.theme ?? map.theme.preset;
	const theme = getTheme(presetName);
	if (!theme) {
		throw new Error(`Unknown theme preset "${presetName}" — run \`hex theme list\` for available presets.`);
	}

	// Generate pages first: they may pull components beyond the map's
	// install closure (block examples compose buttons, badges, …).
	const routes: PocRoute[] = [];
	const installOnlyScreens: string[] = [];
	const pageFiles: PocFile[] = [];
	const pageSlugs = new Set<string>();
	const externalPackages = new Set<string>();
	const skippedScreens: Array<{ screenId: string; reason: string }> = [];
	for (const screen of map.screens) {
		if (screen.source !== "page-recipe" || !screen.recipe) {
			installOnlyScreens.push(screen.id);
			continue;
		}
		// Degrade, don't abort: a catalog defect in one block used to cost
		// the user every other screen in the map. The components still get
		// installed; only this route is skipped, and the caller reports it.
		let page: GeneratedPage;
		try {
			page = generatePageSource(screen, { graph, loadItem });
		} catch (err) {
			skippedScreens.push({
				screenId: screen.id,
				reason: err instanceof Error ? err.message : String(err),
			});
			installOnlyScreens.push(screen.id);
			continue;
		}
		routes.push({ screenId: screen.id, route: `/${screen.id}`, recipe: screen.recipe });
		pageFiles.push({ path: `app/${screen.id}/page.tsx`, content: repointAssets(page.source) });
		for (const slug of page.componentSlugs) pageSlugs.add(slug);
		for (const pkg of page.externalPackages) externalPackages.add(pkg);
	}

	const copySlugs = requiresClosure(graph, [...new Set([...map.install.components, ...pageSlugs])]);

	// Copy component sources with imports rewritten to the app's aliases.
	const fileMap = new Map<string, PocFile>();
	const npmDeps = new Map<string, string>();
	for (const [name, version] of Object.entries(BASE_DEPENDENCIES)) npmDeps.set(name, version);
	// External page imports resolve through the known-good pin table and
	// never overwrite an existing (base) pin — `latest` proved able to pull
	// a breaking major during testing.
	for (const pkg of externalPackages) {
		const { name, version } = parseNpmDep(pkg);
		if (!npmDeps.has(name)) npmDeps.set(name, version);
	}
	for (const slug of copySlugs) {
		const item = loadItem(slug);
		if (!item) {
			throw new Error(`Mapped component "${slug}" is missing from the registry — regenerate the map.`);
		}
		for (const file of item.files) {
			if (fileMap.has(file.path)) continue;
			const rewritten = /\.(?:tsx?|jsx?)$/.test(file.path)
				? rewriteRegistryImports(file.content, DEFAULT_ALIASES)
				: file.content;
			fileMap.set(file.path, { path: file.path, content: rewritten });
		}
		for (const dep of item.dependencies?.npm ?? []) {
			const { name, version } = parseNpmDep(dep);
			if (!npmDeps.has(name)) npmDeps.set(name, version);
		}
		// Same first-wins guard as the npm loop above: a heavy peer must never
		// clobber an established pin (including a BASE_DEPENDENCIES one).
		for (const peer of item.dependencies?.heavyPeer ?? []) {
			if (!npmDeps.has(peer.name)) npmDeps.set(peer.name, peer.version);
		}
	}

	const dependencies = Object.fromEntries([...npmDeps.entries()].sort((a, b) => compareStrings(a[0], b[0])));

	// Ship the placeholder only when a generated page actually references it.
	const assetFiles: PocFile[] = pageFiles.some((f) => f.content.includes(PLACEHOLDER_ASSET))
		? [{ path: `public${PLACEHOLDER_ASSET}`, content: PLACEHOLDER_SVG }]
		: [];

	// The map written into the app must describe the app beside it: page
	// generation pulls components beyond the brief's own closure (block
	// examples compose buttons, badges…), so `hex add --from hex.map.json`
	// inside the POC would otherwise be a partial install.
	const materializedMap: ApplicationMap = { ...map, install: { components: copySlugs } };

	const files: PocFile[] = [
		...scaffoldFiles(appName, materializedMap, presetName, theme, dependencies, routes, installOnlyScreens),
		...pageFiles,
		...assetFiles,
		...fileMap.values(),
	].sort((a, b) => compareStrings(a.path, b.path));

	return {
		files,
		npmDependencies: Object.keys(dependencies),
		routes,
		installOnlyScreens,
		skippedScreens,
		components: copySlugs,
	};
}

/**
 * Blocks that render their own `<main>` landmark. A page composed from one
 * of these must not be wrapped in another `<main>` (nested landmarks are
 * invalid), so `generatePageSource` emits a fragment for those.
 */
const SELF_MAIN_BLOCKS = new Set(["app-shell"]);

/**
 * Coerce an app name into a valid npm package name for `package.json`.
 * `--dir Demo` or `--dir "My Demo"` would otherwise emit an invalid name and
 * break the very next command the CLI prints (`pnpm install`).
 * @param appName - Human-facing app name
 * @returns A lowercase npm-safe name, never empty
 */
function npmSafeName(appName: string): string {
	const safe = kebabCase(appName)
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/^[-._]+/, "")
		.replace(/-+$/g, "");
	return safe.length > 0 ? safe : "hex-poc";
}

/** Where a user should report a catalog defect surfaced by codegen. */
const ISSUES_URL = "https://github.com/oscarabcorona/hex-core/issues";

/**
 * Find the offset of the first top-level JSX element in an example body,
 * skipping any line that sits inside an unterminated template literal (a
 * backtick string may legitimately contain a line starting with `<`).
 * @param body - Example source with import lines already removed
 * @returns Character offset of the JSX start, or -1 when there is none
 */
function findJsxStart(body: string): number {
	let offset = 0;
	let inTemplate = false;
	for (const line of body.split("\n")) {
		if (!inTemplate && /^\s*</.test(line)) return offset + line.length - line.trimStart().length;
		// Odd backtick count flips template state (examples don't nest them).
		if ((line.match(/`/g)?.length ?? 0) % 2 === 1) inTemplate = !inTemplate;
		offset += line.length + 1;
	}
	return -1;
}

/**
 * Collect every binding name a fixture statement block declares, including
 * destructured and non-`const` forms, so a collision between two sections
 * is caught here rather than as a duplicate-identifier error in the user's
 * generated app.
 * @param statements - Hoisted statement source
 * @returns The declared binding names
 */
function declaredNames(statements: string): string[] {
	const names: string[] = [];
	for (const match of statements.matchAll(
		/(?:const|let|var|function)\s+(?:(\{[^}]*\}|\[[^\]]*\])|([A-Za-z_$][\w$]*))/g,
	)) {
		if (match[2]) {
			names.push(match[2]);
			continue;
		}
		for (const part of (match[1] ?? "").replace(/[{}[\]]/g, "").split(",")) {
			const bound = part.split(":").pop()?.trim().replace(/=.*$/, "").trim();
			if (bound && /^[A-Za-z_$][\w$]*$/.test(bound)) names.push(bound);
		}
	}
	return names;
}

/**
 * Indent a JSX block, leaving lines inside template literals untouched so
 * whitespace-significant content is not rewritten.
 * @param jsx - The JSX source to indent
 * @param prefix - Indentation to prepend
 * @returns The indented source
 */
function indentBlock(jsx: string, prefix: string): string {
	let inTemplate = false;
	return jsx
		.split("\n")
		.map((line) => {
			if (inTemplate || line.length === 0) {
				if ((line.match(/`/g)?.length ?? 0) % 2 === 1) inTemplate = !inTemplate;
				return line;
			}
			// Block examples are authored with 2-space indents; the repo (and
			// everything else this generator emits) is tab-indented. Convert
			// before prefixing so the output isn't half tabs, half spaces.
			const tabbed = line.replace(/^ +/, (spaces) => "\t".repeat(Math.ceil(spaces.length / 2)));
			if ((line.match(/`/g)?.length ?? 0) % 2 === 1) inTemplate = !inTemplate;
			return `${prefix}${tabbed}`;
		})
		.join("\n");
}

/** Public path of the single placeholder image generated POCs point at. */
const PLACEHOLDER_ASSET = "/placeholder.svg";

/**
 * Neutral placeholder image. One SVG serves every reference: emitting a
 * file at each original path (`/tote.jpg`) would mean SVG bytes served as
 * `image/jpeg`, which browsers refuse to render.
 */
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" role="img" aria-label="Placeholder image">
	<rect width="400" height="300" fill="#e5e7eb" />
	<rect x="0.5" y="0.5" width="399" height="299" fill="none" stroke="#9ca3af" stroke-dasharray="6 6" />
	<text x="200" y="150" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">placeholder</text>
</svg>
`;

/** Matches a root-relative image reference in generated JSX. */
const ASSET_REFERENCE = /((?:src|poster)=")(\/[^"]+\.(?:svg|png|jpe?g|webp|gif|avif))(")/g;

/**
 * Repoint every root-relative image reference in a generated page at the
 * bundled placeholder. Block examples cite demo assets (`/logos/acme.svg`,
 * `/tote.jpg`) that no generated app ships, so leaving them intact renders
 * broken-image icons on the user's first `pnpm dev`.
 * @param source - Generated page source
 * @returns The source with image references repointed
 */
function repointAssets(source: string): string {
	return source.replace(ASSET_REFERENCE, (_, prefix: string, _path: string, suffix: string) =>
		`${prefix}${PLACEHOLDER_ASSET}${suffix}`,
	);
}

/**
 * Emit the static scaffold files of the POC app (configs, layout, globals
 * CSS, index page, README, map artifact).
 * @param appName - package.json name
 * @param map - The application map being materialized
 * @param presetName - Resolved theme preset name
 * @param theme - The resolved theme (already validated by the caller)
 * @param dependencies - Final sorted runtime dependency map
 * @param routes - Generated routes (for the index page and README)
 * @param installOnlyScreens - Screens without routes (surfaced, not hidden)
 * @returns The scaffold files
 */
function scaffoldFiles(
	appName: string,
	map: ApplicationMap,
	presetName: string,
	theme: Theme,
	dependencies: Record<string, string>,
	routes: PocRoute[],
	installOnlyScreens: string[],
): PocFile[] {
	const globalsCss = generateGlobalsCss(theme, { target: "v4" });

	const packageJson = {
		name: npmSafeName(appName),
		private: true,
		version: "0.1.0",
		scripts: { dev: "next dev", build: "next build", start: "next start" },
		dependencies,
		devDependencies: DEV_DEPENDENCIES,
	};

	const tsconfig = {
		compilerOptions: {
			target: "ES2022",
			lib: ["dom", "dom.iterable", "esnext"],
			allowJs: true,
			skipLibCheck: true,
			strict: true,
			noEmit: true,
			esModuleInterop: true,
			module: "esnext",
			moduleResolution: "bundler",
			resolveJsonModule: true,
			isolatedModules: true,
			jsx: "preserve",
			incremental: true,
			plugins: [{ name: "next" }],
			paths: { "@/*": ["./*"] },
		},
		include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
		exclude: ["node_modules"],
	};

	const hexConfig = {
		$schema: "https://hex-core.dev/schema/config.json",
		framework: "react",
		styling: "tailwind",
		typescript: true,
		theme: presetName,
		aliases: { components: "@/components", lib: "@/lib" },
	};

	// Most briefs match no page recipe (only 8 of 25 recipes are pages), so
	// the zero-route case is common, not exotic: give it a real empty state
	// rather than an empty <ul> of dead space.
	const routeList =
		routes.length > 0
			? `\t\t\t<ul className="mt-8 space-y-2">\n${routes
					.map(
						(route) =>
							`\t\t\t\t<li>\n\t\t\t\t\t<Link className="text-primary underline-offset-4 hover:underline" href="${route.route}">\n\t\t\t\t\t\t${route.route}\n\t\t\t\t\t</Link>{" "}\n\t\t\t\t\t<span className="text-muted-foreground">— ${route.recipe}</span>\n\t\t\t\t</li>`,
					)
					.join("\n")}\n\t\t\t</ul>`
			: `\t\t\t<p className="mt-8 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">\n\t\t\t\tNo page routes were generated from this brief. The mapped components are in{" "}\n\t\t\t\t<code>components/ui/</code> — see <code>hex.map.json</code> for the screen plan.\n\t\t\t</p>`;
	const installOnlyList =
		installOnlyScreens.length > 0
			? `\n\t\t\t<p className="mt-6 text-sm text-muted-foreground">\n\t\t\t\tInstalled without a generated route: ${installOnlyScreens.join(", ")} — compose these from{" "}\n\t\t\t\t<code>components/ui/</code>.\n\t\t\t</p>`
			: "";

	const indexPage = `import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: ${JSON.stringify(appName)},
	description: ${JSON.stringify(map.brief)},
};

/** Generated POC index — links every mapped screen. */
export default function HomePage() {
	return (
		<main className="mx-auto max-w-2xl px-6 py-16">
			<h1 className="text-3xl font-semibold tracking-tight">${escapeJsxText(appName)}</h1>
			<p className="mt-2 text-muted-foreground">${escapeJsxText(map.brief)}</p>
${routeList}${installOnlyList}
		</main>
	);
}
`;

	const layout = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: { default: ${JSON.stringify(appName)}, template: ${JSON.stringify(`%s — ${appName}`)} },
};

/** Root layout for the generated POC app. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
		</html>
	);
}
`;

	const nextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`;

	const postcssConfig = `const config = {
	plugins: { "@tailwindcss/postcss": {} },
};

export default config;
`;

	// One joined list — a `.join("\n")` over an empty array would otherwise
	// leave a blank line that terminates the markdown table.
	const screenRows = [
		...routes.map((r) => `| [\`${r.route}\`](./app${r.route}/page.tsx) | page-recipe | ${r.recipe} |`),
		...installOnlyScreens.map((id) => `| — | install-only | ${id} |`),
	].join("\n");

	const readme = `# ${appName}

Generated by \`hex poc\` from the brief:

> ${map.brief}

## Run

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Screens

| Route | Source | Recipe |
| --- | --- | --- |
${screenRows}

Images referenced by the block examples point at \`public/placeholder.svg\`.
Swap in real assets and update the \`src\` values when you make this yours.

The full mapping (screens, install list, checklist, token budgets) lives
in [hex.map.json](./hex.map.json). Re-run \`hex add --from hex.map.json\`
after editing it, and \`npx hex doctor\` to verify the install.
`;

	return [
		{ path: "package.json", content: `${JSON.stringify(packageJson, null, 2)}\n` },
		{ path: "tsconfig.json", content: `${JSON.stringify(tsconfig, null, 2)}\n` },
		{ path: "next.config.ts", content: nextConfig },
		{ path: "postcss.config.mjs", content: postcssConfig },
		{ path: ".gitignore", content: "node_modules/\n.next/\nnext-env.d.ts\n" },
		{ path: "hex.config.json", content: `${JSON.stringify(hexConfig, null, 2)}\n` },
		{ path: "hex.map.json", content: `${stableStringifyMap(map)}\n` },
		{ path: "README.md", content: readme },
		{ path: "app/globals.css", content: globalsCss },
		{ path: "app/layout.tsx", content: layout },
		{ path: "app/page.tsx", content: indexPage },
	];
}

/**
 * Escape text destined for a JSX text position.
 * @param text - Arbitrary text
 * @returns Text with JSX-significant characters escaped
 */
function escapeJsxText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
}
