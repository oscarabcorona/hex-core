import * as fs from "node:fs";
import * as path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TOOL } from "./tool-names.js";
import { buildAppContext } from "./tools/app-context.js";
import { loadRecipe, loadRecipes } from "./tools/recipe-loader.js";
import {
	internalDepToSlug,
	loadRegistry,
	loadRegistryItem,
	SLUG_REGEX,
} from "./tools/registry-loader.js";
import { resolveSpec } from "./tools/resolver.js";
import {
	generateGlobalsCss,
	getTheme,
	listThemes,
	themeToFlatJson,
	themeToTailwindConfig,
} from "./tools/theme-loader.js";

const registry = loadRegistry();

const server = new McpServer({
	name: "hex-ui",
	version: "0.1.0",
});

// ─── Tool 1: search_components ───

server.registerTool(
	TOOL.SEARCH_COMPONENTS,
	{
		description:
			"Search for Hex UI components by name, description, category, or tags. Returns lightweight summaries for discovery.",
		inputSchema: z
			.object({
				query: z
					.string()
					.optional()
					.describe("Search query to match against name, description, and tags"),
				category: z
					.enum(["primitive", "component", "block", "example", "hook", "lib"])
					.optional()
					.describe("Filter by category"),
				tags: z.array(z.string()).optional().describe("Filter by tags (matches any)"),
			})
			.strict(),
	},
	async ({ query, category, tags }) => {
		let items = registry.items;

		if (category) {
			items = items.filter((item) => item.category === category);
		}

		if (tags && tags.length > 0) {
			items = items.filter((item) => tags.some((tag) => item.tags.includes(tag)));
		}

		if (query) {
			const q = query.toLowerCase();
			items = items.filter(
				(item) =>
					item.name.includes(q) ||
					item.displayName.toLowerCase().includes(q) ||
					item.description.toLowerCase().includes(q) ||
					item.tags.some((t) => t.includes(q)),
			);
		}

		if (items.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: "No components found matching your query.",
					},
				],
			};
		}

		const results = items.map((item) => ({
			name: item.name,
			displayName: item.displayName,
			description: item.description,
			category: item.category,
			subcategory: item.subcategory,
			tags: item.tags,
			tokenBudget: item.tokenBudget,
		}));

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(results, null, 2),
				},
			],
		};
	},
);

// ─── Tool 2: get_component ───

server.registerTool(
	TOOL.GET_COMPONENT,
	{
		description:
			"Get the full Hex UI component definition including source code, props, variants, examples, and AI hints. Use this to install a component into a project.",
		inputSchema: z
			.object({
				name: z.string().describe("Component name (e.g. 'button', 'input', 'label')"),
				includeExamples: z
					.boolean()
					.optional()
					.default(true)
					.describe("Include usage examples"),
			})
			.strict(),
	},
	async ({ name, includeExamples }) => {
		const item = loadRegistryItem(name);
		if (!item) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Component "${name}" not found. Use search_components to discover available components.`,
					},
				],
			};
		}

		const result = includeExamples ? item : { ...item, examples: [] };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

// ─── Tool 3: get_component_schema ───

server.registerTool(
	TOOL.GET_COMPONENT_SCHEMA,
	{
		description:
			"Get just the props, variants, slots, and AI hints for a component — without the full source code. Use this when you need to know HOW to use a component that's already installed.",
		inputSchema: z
			.object({
				name: z.string().describe("Component name"),
			})
			.strict(),
	},
	async ({ name }) => {
		const item = loadRegistryItem(name);
		if (!item) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Component "${name}" not found.`,
					},
				],
			};
		}

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

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(schema, null, 2),
				},
			],
		};
	},
);

// ─── Tool 4: get_theme ───

server.registerTool(
	TOOL.GET_THEME,
	{
		description:
			"Get a Hex UI theme in the specified format. Use 'css' for globals.css, 'json' for flat token map (most token-efficient for AI), 'tailwind' for Tailwind config extension.",
		inputSchema: z
			.object({
				name: z.string().describe("Theme name (e.g. 'default', 'midnight', 'ember')"),
				format: z
					.enum(["css", "json", "tailwind"])
					.optional()
					.default("css")
					.describe("Output format"),
				mode: z
					.enum(["light", "dark"])
					.optional()
					.default("light")
					.describe("Color mode (only for json format)"),
			})
			.strict(),
	},
	async ({ name, format, mode }) => {
		const theme = getTheme(name);
		if (!theme) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Theme "${name}" not found. Available: ${listThemes()
							.map((t) => t.name)
							.join(", ")}`,
					},
				],
			};
		}

		let output: string;
		switch (format) {
			case "css":
				output = generateGlobalsCss(theme);
				break;
			case "json":
				output = JSON.stringify(themeToFlatJson(theme, mode), null, 2);
				break;
			case "tailwind":
				output = JSON.stringify(themeToTailwindConfig(theme), null, 2);
				break;
			default:
				output = generateGlobalsCss(theme);
		}

		return {
			content: [
				{
					type: "text" as const,
					text: output,
				},
			],
		};
	},
);

// ─── Tool 5: list_themes ───

server.registerTool(
	TOOL.LIST_THEMES,
	{
		description: "List all available Hex UI themes with their names and descriptions.",
		inputSchema: z.object({}).strict(),
	},
	async () => {
		const themeList = listThemes();
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(themeList, null, 2),
				},
			],
		};
	},
);

// ─── Tool 6: scaffold_project ───

server.registerTool(
	TOOL.SCAFFOLD_PROJECT,
	{
		description:
			"Generate a complete file tree to set up Hex UI in a project. Returns the config file, globals.css with theme tokens, tailwind config extension, utility functions, and requested components.",
		inputSchema: z
			.object({
				components: z.array(z.string()).describe("Component names to include"),
				theme: z.string().optional().default("default").describe("Theme name"),
			})
			.strict(),
	},
	async ({ components, theme: themeName }) => {
		const theme = getTheme(themeName);
		if (!theme) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Theme "${themeName}" not found.`,
					},
				],
			};
		}

		const files: Array<{ path: string; content: string }> = [];

		// 1. globals.css with theme
		files.push({
			path: "app/globals.css",
			content: generateGlobalsCss(theme),
		});

		// 2. Tailwind config extension
		const twConfig = themeToTailwindConfig(theme);
		files.push({
			path: "tailwind.config.ts (extend section)",
			content: JSON.stringify({ theme: { extend: twConfig } }, null, 2),
		});

		// 3. cn utility
		files.push({
			path: "lib/utils.ts",
			content: `import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n\treturn twMerge(clsx(inputs));\n}\n`,
		});

		// 4. Each requested component
		for (const compName of components) {
			const item = loadRegistryItem(compName);
			if (!item) continue;

			for (const file of item.files) {
				if (file.type === "component") {
					files.push({
						path: file.path,
						content: file.content,
					});
				}
			}
		}

		// 5. npm dependencies
		const allNpmDeps = new Set<string>(["clsx", "tailwind-merge"]);
		for (const compName of components) {
			const item = loadRegistryItem(compName);
			if (!item) continue;
			const deps = item.dependencies as { npm?: string[] };
			if (deps.npm) {
				for (const dep of deps.npm) {
					allNpmDeps.add(dep);
				}
			}
		}

		const result = {
			files,
			npmDependencies: [...allNpmDeps].sort(),
			installCommand: `pnpm add ${[...allNpmDeps].sort().join(" ")}`,
		};

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

// ─── Tool 7: customize_component ───

server.registerTool(
	TOOL.CUSTOMIZE_COMPONENT,
	{
		description:
			"Get a component with customizations applied. Specify CSS variable overrides or additional Tailwind classes to inject.",
		inputSchema: z
			.object({
				name: z.string().describe("Component name"),
				cssOverrides: z
					.record(
						z.string(),
						z.object({
							light: z.string(),
							dark: z.string(),
						}),
					)
					.optional()
					.describe(
						"CSS variable overrides (e.g. { '--primary': { light: '220 90% 56%', dark: '220 80% 66%' } })",
					),
				additionalClasses: z
					.string()
					.optional()
					.describe("Additional Tailwind classes to add to the root element"),
			})
			.strict(),
	},
	async ({ name, cssOverrides, additionalClasses }) => {
		const item = loadRegistryItem(name);
		if (!item) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Component "${name}" not found.`,
					},
				],
			};
		}

		const result: Record<string, unknown> = { ...item };

		if (cssOverrides) {
			result.cssVariables = {
				...(item.cssVariables ?? {}),
				...cssOverrides,
			};
		}

		if (additionalClasses) {
			result.customization = {
				additionalClasses,
				note: `Add "${additionalClasses}" to the component's root className to apply customization.`,
			};
		}

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

// ─── Tool 8: list_recipes ───

server.registerTool(
	TOOL.LIST_RECIPES,
	{
		description:
			"List all Hex UI recipes — spec-driven blueprints that map a UI goal (auth form, settings page, pricing table) to an ordered checklist of components. Use this to discover recipes before calling get_recipe.",
		inputSchema: z.object({}).strict(),
	},
	async () => {
		const recipes = loadRecipes();
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(recipes.items, null, 2),
				},
			],
		};
	},
);

// ─── Tool 9: get_recipe ───

server.registerTool(
	TOOL.GET_RECIPE,
	{
		description:
			"Get the full Hex UI recipe: ordered install steps, the union of npm peer dependencies across all components, a post-install checklist (author-written plus items derived from each component's commonMistakes / accessibilityNotes), and an optional JSX example. Use this after list_recipes or resolve_spec to execute a blueprint.",
		inputSchema: z
			.object({
				slug: z.string().describe("Recipe slug (e.g. 'settings-page', 'auth-form')"),
			})
			.strict(),
	},
	async ({ slug }) => {
		const recipe = loadRecipe(slug);
		if (!recipe) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Recipe "${slug}" not found. Use list_recipes to discover available recipes.`,
					},
				],
			};
		}

		const npmDeps = new Set<string>();
		const peerDeps = new Set<string>();
		const internalDeps = new Set<string>();
		const missingComponents: string[] = [];
		const recipeSlugs = new Set(recipe.steps.map((s) => s.component));

		for (const step of recipe.steps) {
			const item = loadRegistryItem(step.component);
			if (!item) {
				missingComponents.push(step.component);
				continue;
			}
			for (const dep of item.dependencies?.npm ?? []) npmDeps.add(dep);
			for (const dep of item.dependencies?.peer ?? []) peerDeps.add(dep);
			for (const dep of item.dependencies?.internal ?? []) {
				const depSlug = internalDepToSlug(dep);
				if (depSlug && !recipeSlugs.has(depSlug)) internalDeps.add(depSlug);
			}
		}

		const response = {
			slug: recipe.slug,
			title: recipe.title,
			summary: recipe.summary,
			brief: recipe.brief,
			tags: recipe.tags,
			steps: recipe.steps,
			checklist: recipe.checklist,
			example: recipe.example,
			tokenBudget: recipe.tokenBudget,
			install: {
				componentCommand: `hex add ${recipe.steps.map((s) => s.component).join(" ")}`,
				npmDependencies: Array.from(npmDeps).sort(),
				peerDependencies: Array.from(peerDeps).sort(),
				internalDependencies: Array.from(internalDeps).sort(),
			},
			warnings:
				missingComponents.length > 0
					? [`Steps reference unknown components: ${missingComponents.join(", ")}`]
					: [],
		};

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	},
);

// ─── Tool 10: resolve_spec ───

server.registerTool(
	TOOL.RESOLVE_SPEC,
	{
		description:
			"Resolve a freeform brief or spec.md fragment ('build me a settings page') into a ranked shortlist of Hex UI components and recipes. Deterministic keyword + tag matching — no LLM reasoning server-side. Use this as the first step when translating a plan document into a concrete build.",
		inputSchema: z
			.object({
				brief: z
					.string()
					.min(3)
					.describe("Freeform description of the UI to build, or a spec.md section"),
				limit: z
					.number()
					.int()
					.positive()
					.max(20)
					.optional()
					.describe("Max number of component matches to return (default 8)"),
			})
			.strict(),
	},
	async ({ brief, limit }) => {
		const result = resolveSpec(brief, { limit });
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

// ─── Tool 11: verify_checklist ───

server.registerTool(
	TOOL.VERIFY_CHECKLIST,
	{
		description:
			"Cross-check an installed component list against the registry. Reports missing internal dependencies (e.g. combobox without popover + command) and, when a recipe slug is supplied, returns the recipe's checklist items for the agent to walk. When projectRoot is supplied, also reports which component files exist under <projectRoot>/components/ui/ (opt-in; projectRoot is canonicalized with realpath and each checked path is verified to stay under it).",
		inputSchema: z
			.object({
				components: z
					.array(z.string())
					.min(1)
					.describe("Component slugs the agent claims it has installed"),
				recipe: z.string().optional().describe("Optional recipe slug for checklist lookup"),
				projectRoot: z
					.string()
					.optional()
					.describe("Absolute project root to scan for component files under components/ui/"),
			})
			.strict(),
	},
	async ({ components, recipe, projectRoot }) => {
		const installed = new Set<string>();
		const unknownComponents: string[] = [];
		const missingInternalDeps: Array<{ component: string; missing: string[] }> = [];

		for (const slug of components) {
			if (!SLUG_REGEX.test(slug)) {
				unknownComponents.push(slug);
				continue;
			}
			const item = loadRegistryItem(slug);
			if (!item) {
				unknownComponents.push(slug);
				continue;
			}
			installed.add(slug);
		}

		for (const slug of installed) {
			const item = loadRegistryItem(slug);
			if (!item) continue;
			const deps = item.dependencies?.internal ?? [];
			const missingSlugs: string[] = [];
			for (const dep of deps) {
				const depSlug = internalDepToSlug(dep);
				if (!depSlug) continue;
				if (!installed.has(depSlug)) missingSlugs.push(depSlug);
			}
			if (missingSlugs.length > 0) {
				missingInternalDeps.push({ component: slug, missing: missingSlugs });
			}
		}

		let checklist: unknown[] = [];
		let resolvedRecipe: string | null = null;
		let recipeError: "not-found" | null = null;
		if (recipe) {
			const r = loadRecipe(recipe);
			if (!r) {
				recipeError = "not-found";
			} else {
				resolvedRecipe = r.slug;
				checklist = r.checklist;
			}
		}

		// Files scan: only attempted when an absolute projectRoot is supplied.
		// Canonicalize via realpath so a symlinked root is resolved to its real
		// path before we build candidate paths. The realpath + startsWith pair
		// defends against a caller passing a root that symlinks into someone
		// else's tree — the candidate must literally live under the real root.
		const filesPresent: string[] = [];
		const filesMissing: string[] = [];
		let filesError: string | null = null;
		if (projectRoot) {
			if (!path.isAbsolute(projectRoot)) {
				filesError = "projectRoot must be absolute";
			} else {
				let resolvedRoot: string | null = null;
				try {
					resolvedRoot = fs.realpathSync(path.resolve(projectRoot));
				} catch {
					filesError = "projectRoot does not exist";
				}
				if (resolvedRoot) {
					for (const slug of installed) {
						const candidate = path.resolve(resolvedRoot, "components", "ui", `${slug}.tsx`);
						if (!candidate.startsWith(`${resolvedRoot}${path.sep}`)) continue;
						if (fs.existsSync(candidate)) {
							filesPresent.push(path.relative(resolvedRoot, candidate));
						} else {
							filesMissing.push(path.relative(resolvedRoot, candidate));
						}
					}
				}
			}
		}

		const response = {
			ok:
				unknownComponents.length === 0 &&
				missingInternalDeps.length === 0 &&
				recipeError === null &&
				filesError === null,
			installed: Array.from(installed).sort(),
			unknownComponents,
			missingInternalDeps,
			recipe: resolvedRecipe,
			recipeError,
			checklist,
			files:
				projectRoot === undefined
					? null
					: filesError
						? { error: filesError }
						: { present: filesPresent, missing: filesMissing },
		};

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	},
);

// ─── Tool 12: emit_app_context ───

server.registerTool(
	TOOL.EMIT_APP_CONTEXT,
	{
		description:
			"Synthesize a deterministic markdown payload describing the chosen theme, components, and recipes — formatted for paste-into-LLM workflows so a downstream agent has the full Hex UI stack in one block. Looks up each slug in the registry; unknown slugs are flagged inline rather than dropped silently.",
		inputSchema: z
			.object({
				theme: z
					.string()
					.describe("Theme slug (e.g. 'default', 'midnight', 'ember')"),
				components: z
					.array(z.string())
					.min(1)
					.describe("Component slugs to include in the context"),
				recipes: z
					.array(z.string())
					.optional()
					.describe("Optional recipe slugs to include with their steps and checklists"),
			})
			.strict(),
	},
	async ({ theme, components, recipes }) => {
		const resolvedTheme = getTheme(theme) ?? null;
		// Dedupe slugs so a payload with `["button","button"]` doesn't render
		// duplicate component cards or duplicate `cli add` arguments.
		const uniqueComponents = Array.from(new Set(components));
		const uniqueRecipes = Array.from(new Set(recipes ?? []));
		const componentSlots = uniqueComponents.map((slug) => ({
			slug,
			item: SLUG_REGEX.test(slug) ? loadRegistryItem(slug) : null,
		}));
		const recipeSlots = uniqueRecipes.map((slug) => ({
			slug,
			recipe: SLUG_REGEX.test(slug) ? loadRecipe(slug) : null,
		}));

		const markdown = buildAppContext({
			theme: { requested: theme, resolved: resolvedTheme },
			components: componentSlots,
			recipes: recipeSlots,
		});

		return {
			content: [{ type: "text" as const, text: markdown }],
		};
	},
);

// ─── Resources ───

server.resource(
	"catalog",
	"hex://catalog",
	{
		description: "Full Hex UI component catalog — lightweight index of all available components",
		mimeType: "application/json",
	},
	async () => ({
		contents: [
			{
				uri: "hex://catalog",
				mimeType: "application/json",
				text: JSON.stringify(registry, null, 2),
			},
		],
	}),
);

// ─── Start Server ───

/** Initialize the MCP stdio transport and start the Hex UI server. */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(console.error);
