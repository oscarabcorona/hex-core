import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

// Read at runtime — a build-time JSON import would inline the version
// into the bundle and drift on every publish. Fallback so a malformed
// tarball missing package.json doesn't brick `hex add`.
const __dirname = dirname(fileURLToPath(import.meta.url));
let pkg: { version: string };
try {
	pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
} catch {
	pkg = { version: "0.0.0-unknown" };
}

const program = new Command();

program.name("hex").description("Hex Core — AI-native component library").version(pkg.version);

program
	.command("list")
	.description("List all available Hex Core components")
	.action(async () => {
		const { listComponents } = await import("./commands/list.js");
		await listComponents();
	});

program
	.command("add")
	.description("Add a component to your project")
	.argument("[components...]", "Component names to add (omit when using --from or --pack)")
	.option("-y, --yes", "Skip confirmation prompts", false)
	.option("-o, --overwrite", "Overwrite existing files", false)
	.option("--no-deps", "Don't install internal component dependencies recursively")
	.option("--no-install", "Don't auto-install npm peer dependencies — only print the install line")
	.option("--dry-run", "Plan but do not write files or run installs", false)
	.option(
		"--from <manifest>",
		"Install every slug from a `hex.components.json` manifest or a `hex.map.json` application map instead of positional args",
	)
	.option(
		"--pack <name>",
		"Install a curated pack instead of positional args. Currently: `layout` (container, stack, cluster, grid, spacer, empty)",
	)
	.action(
		async (
			components: string[],
			options: {
				yes: boolean;
				overwrite: boolean;
				deps: boolean;
				install: boolean;
				dryRun?: boolean;
				from?: string;
				pack?: string;
			},
		) => {
			const { addComponents, layoutPack } = await import("./commands/add.js");
			let queue = components;
			if (options.pack !== undefined) {
				if (options.pack !== "layout") {
					console.error(`Unknown --pack value: ${options.pack}. Known packs: layout.`);
					process.exit(1);
				}
				queue = [...components, ...layoutPack()];
			}
			if (queue.length === 0 && !options.from) {
				console.error("Pass at least one component name, --from <manifest>, or --pack <name>.");
				process.exit(1);
			}
			await addComponents(queue, options);
		},
	);

program
	.command("init")
	.description("Initialize Hex Core in your project")
	.option("--theme <theme>", "Theme to use", "default")
	.option(
		"--overwrite [targets]",
		"Replace existing files. Pass a comma list (globals.css,tailwind.config.ts) or omit the value for everything.",
	)
	.option("--no-install", "Don't auto-install peer dependencies — only print the install line")
	.option("--mcp", "Wire @hex-core/mcp into your AI tool (creates .mcp.json at repo root, or merges into .cursor/mcp.json / .continue/config.json)", false)
	.option("--check", "Verify alias/Tailwind drift and exit non-zero if anything's wrong (CI mode)", false)
	.action(
		async (options: {
			theme: string;
			overwrite?: string | boolean;
			install: boolean;
			mcp: boolean;
			check?: boolean;
		}) => {
			const { initProject, parseOverwriteFlag } = await import("./commands/init.js");
			await initProject({
				theme: options.theme,
				overwrite: parseOverwriteFlag(options.overwrite),
				install: options.install,
				mcp: options.mcp,
				check: options.check,
			});
		},
	);

const recipe = program
	.command("recipe")
	.description(
		"Work with Hex Core recipes (spec-driven blueprints: auth-form, settings-page, ...). Subcommands: list, add.",
	);

recipe
	.command("list")
	.description("List all available recipes")
	.action(async () => {
		const { listRecipes } = await import("./commands/recipe.js");
		await listRecipes();
	});

recipe
	.command("add")
	.description("Install every component in a recipe, then print its checklist")
	.argument("<slug>", "Recipe slug (e.g. auth-form, settings-page)")
	.option("-y, --yes", "Skip confirmation prompts", false)
	.option("-o, --overwrite", "Overwrite existing files", false)
	.action(async (slug: string, options: { yes: boolean; overwrite: boolean }) => {
		const { addRecipe } = await import("./commands/recipe.js");
		await addRecipe(slug, options);
	});

const theme = program
	.command("theme")
	.description("Author + edit Hex Core themes (token files for your project)");

theme
	.command("init")
	.description("Scaffold a theme file. Pass -i to author interactively from seed colors; otherwise scaffolds from a Hex Core preset.")
	.option("-i, --interactive", "Walk through prompts to author from seeds (use for new themes)", false)
	.option("--name <preset>", "Preset slug to scaffold from when not interactive (alias: --preset). Run `hex theme list` to see all 70+ options.", "default")
	.option("--preset <slug>", "Alias for --name")
	.option("--out <path>", "Output file path", "./globals.css")
	.option("--format <kind>", "Output format: css | json | ts", "css")
	.option("--overwrite", "Overwrite the output file if it exists", false)
	.action(
		async (options: {
			interactive: boolean;
			name: string;
			preset?: string;
			out: string;
			format: "css" | "json" | "ts";
			overwrite: boolean;
		}) => {
			if (options.interactive) {
				const { themeInitInteractive } = await import("./commands/theme-interactive.js");
				await themeInitInteractive({ out: options.out, format: options.format, overwrite: options.overwrite });
				return;
			}
			// --preset is the more discoverable alias for --name; users
			// who pass both get the preset value (preset wins).
			const slug = options.preset ?? options.name;
			const { themeInit } = await import("./commands/theme.js");
			await themeInit({ name: slug, out: options.out, format: options.format, overwrite: options.overwrite });
		},
	);

theme
	.command("edit")
	.description("Override one or more token values in an existing globals.css. Pass -i to walk the tokens interactively with swatches and AA contrast warnings.")
	.option("-i, --interactive", "Walk tokens with prompts (visual swatches, contrast warnings)", false)
	.option("--file <path>", "Path to the globals.css to edit", "./globals.css")
	.option(
		"--token <key=value...>",
		"Token override (repeatable). Example: --token primary=\"240 50% 50%\"",
	)
	.option("--mode <kind>", "Which color mode to update: light | dark | both", "both")
	.action(
		async (options: {
			interactive: boolean;
			file: string;
			token?: string[];
			mode: "light" | "dark" | "both";
		}) => {
			if (options.interactive) {
				// --token / non-default --mode are silently ignored under -i (the
				// interactive flow asks for both per token). Warn so the user
				// doesn't think their flags took effect.
				if (options.token && options.token.length > 0) {
					console.warn("warn: --token is ignored when -i is set; entering interactive flow.");
				}
				if (options.mode !== "both") {
					console.warn(`warn: --mode=${options.mode} is ignored when -i is set; mode is asked per token.`);
				}
				const { themeEditInteractive } = await import("./commands/theme-edit-interactive.js");
				await themeEditInteractive({ file: options.file });
				return;
			}
			const { themeEdit } = await import("./commands/theme.js");
			await themeEdit({ file: options.file, tokens: options.token ?? [], mode: options.mode });
		},
	);

theme
	.command("list")
	.description("List every available theme preset (first-party + 71 voltagent brand presets), grouped by category")
	.option("--category <name>", "Filter to a single category: ai, dev-tools, backend, productivity, design, fintech, ecommerce, media, automotive")
	.option("--tag <name>", "Filter to a single tag")
	.option("--json", "Emit JSON instead of grouped human output (for piping)", false)
	.action(async (options: { category?: string; tag?: string; json?: boolean }) => {
		const { themeList } = await import("./commands/theme-list.js");
		await themeList(options);
	});

theme
	.command("add")
	.description("Compose a custom theme from a Hex Core Studio URL and write it as a TypeScript file in your project.")
	.argument("<slug>", "Slug for the new theme (used as the filename and Theme.name field)")
	.requiredOption("--from <url>", "Hex Core Studio URL describing the theme (base preset + token overrides)")
	.option("--out <path>", "Output file path (default: src/themes/<slug>.ts or themes/<slug>.ts)")
	.option("--overwrite", "Replace the file if it already exists", false)
	.action(async (slug: string, options: { from: string; out?: string; overwrite: boolean }) => {
		const { themeAdd } = await import("./commands/theme.js");
		await themeAdd({ slug, from: options.from, out: options.out, overwrite: options.overwrite });
	});

theme
	.command("apply")
	.description("Swap an existing globals.css to a different preset (default | midnight | ember) without clobbering custom rules")
	.argument("<preset>", "Preset to apply: default, midnight, or ember")
	.option("--file <path>", "Path to the globals.css to update", "./globals.css")
	.action(async (preset: string, options: { file: string }) => {
		const { themeApply } = await import("./commands/theme.js");
		await themeApply({ name: preset, file: options.file });
	});

program
	.command("map")
	.description(
		"Map an application brief onto the catalog: screens → recipes/blocks/components, install manifest, warnings, budgets. Deterministic — feeds `hex add --from` and `hex poc --from`.",
	)
	.argument("[brief]", 'Freeform description of the app (e.g. "a SaaS site with a landing page and pricing page")')
	.option("--spec <file>", "Read the brief from a file (PRD, notes) instead of the argument")
	.option("--out <file>", "Write the map JSON to a file (e.g. hex.map.json)")
	.option("--json", "Print the raw map JSON to stdout (for piping)", false)
	.option("-y, --yes", "Overwrite an existing --out file", false)
	.option("--limit <n>", "Per-segment component-match limit (default 8)")
	.action(
		async (
			brief: string | undefined,
			options: { spec?: string; out?: string; json: boolean; yes: boolean; limit?: string },
		) => {
			const { mapApplication } = await import("./commands/map.js");
			const limit = options.limit === undefined ? undefined : Number(options.limit);
			// Same ceiling as MCP map_application so the two surfaces don't drift.
			if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 20)) {
				console.error(`--limit must be an integer between 1 and 20, got "${options.limit}".`);
				process.exit(1);
			}
			await mapApplication(brief, { ...options, limit });
		},
	);

program
	.command("poc")
	.description(
		"Scaffold a standalone runnable Next.js demo app from a brief, a hex.map.json, or one page recipe — the fastest way to see a mapped application working.",
	)
	.argument("[brief]", "Freeform description of the app (omit when using --from or --recipe)")
	.option("--from <map>", "Scaffold from an existing hex.map.json (as written by `hex map --out`)")
	.option("--recipe <slug>", "Scaffold a single page recipe (e.g. landing-page) without scoring")
	.option("--dir <path>", "Target directory for the generated app", "hex-poc")
	.option("--theme <preset>", "Theme preset override (default: the map's preset)")
	.option("--name <name>", "package.json name for the generated app (default: the dir basename)")
	.option("-y, --yes", "Skip the confirmation gate (required for non-empty --dir)", false)
	.option("--dry-run", "Print the planned file tree without writing anything", false)
	.action(
		async (
			brief: string | undefined,
			options: {
				from?: string;
				recipe?: string;
				dir: string;
				theme?: string;
				name?: string;
				yes: boolean;
				dryRun: boolean;
			},
		) => {
			const { createPoc } = await import("./commands/poc.js");
			await createPoc(brief, options);
		},
	);

const graph = program
	.command("graph")
	.description("Query the catalog knowledge graph (items, recipes, themes and their relationships)");

graph
	.command("explain")
	.description("Explain one slug: its edges grouped by relation, community, and peers")
	.argument("<slug>", "Item, recipe, or theme slug (e.g. marketing-hero, landing-page)")
	.option("--json", "Emit JSON instead of the human rendering", false)
	.action(async (slug: string, options: { json: boolean }) => {
		const { explainSlug } = await import("./commands/graph.js");
		await explainSlug(slug, options);
	});

graph
	.command("affected")
	.description("Reverse blast radius: which items and recipes are touched if this item changes")
	.argument("<slug>", "Item slug (e.g. button)")
	.option("--json", "Emit JSON instead of the human rendering", false)
	.action(async (slug: string, options: { json: boolean }) => {
		const { affectedSlug } = await import("./commands/graph.js");
		await affectedSlug(slug, options);
	});

graph
	.command("neighbors")
	.description("List adjacent nodes, optionally filtered by relation")
	.argument("<slug>", "Item, recipe, or theme slug")
	.option("--relation <name...>", "Filter to these relations: requires, related, instead-use, composes, themes")
	.option("--json", "Emit JSON instead of the human rendering", false)
	.action(async (slug: string, options: { relation?: string[]; json: boolean }) => {
		const { neighborsOfSlug } = await import("./commands/graph.js");
		await neighborsOfSlug(slug, options);
	});

graph
	.command("path")
	.description("Shortest connection between two catalog slugs")
	.argument("<from>", "Starting slug")
	.argument("<to>", "Destination slug")
	.option("--json", "Emit JSON instead of the human rendering", false)
	.action(async (from: string, to: string, options: { json: boolean }) => {
		const { pathBetween } = await import("./commands/graph.js");
		await pathBetween(from, to, options);
	});

program
	.command("migrate")
	.description("Convert an existing Next.js / Vite / CRA / CRACO + shadcn/ui project to Hex Core in-place")
	.option("-y, --yes", "Skip the confirmation prompt before writing", false)
	.option("--dry-run", "Plan + print every would-write/would-install line without touching disk", false)
	.option("--no-backup", "Don't write *.shadcn.bak alongside replaced files (default: backup is on)")
	.option("--no-install", "Don't auto-install peer dependencies — only print the install line")
	.option("--from <dir>", "Treat <dir> as project root instead of cwd (monorepo escape hatch)")
	.option("--theme <mode>", "globals.css strategy: preserve | replace", "preserve")
	.option("--only <slugs>", "Comma-list of shadcn slugs to migrate (default: all detected)")
	.action(
		async (options: {
			yes: boolean;
			dryRun: boolean;
			backup: boolean;
			install: boolean;
			from?: string;
			theme: string;
			only?: string;
		}) => {
			if (options.theme !== "preserve" && options.theme !== "replace") {
				console.error(`Unknown --theme value: "${options.theme}". Use 'preserve' or 'replace'.`);
				process.exit(1);
			}
			const { migrateProject } = await import("./commands/migrate.js");
			await migrateProject({
				yes: options.yes,
				dryRun: options.dryRun,
				backup: options.backup,
				install: options.install,
				from: options.from,
				theme: options.theme,
				only: options.only ? options.only.split(",").map((s) => s.trim()).filter(Boolean) : [],
			});
		},
	);

program
	.command("doctor")
	.description("Diagnose your Hex Core install and report what's missing")
	.option(
		"--layout",
		"Additionally scan source for installed-but-unused components + hand-rolled layout patterns that primitives would replace",
		false,
	)
	.action(async (options: { layout: boolean }) => {
		const { runDoctor, reportDoctor } = await import("./commands/doctor.js");
		const checks = await runDoctor(process.cwd(), { layout: options.layout });
		const code = reportDoctor(checks);
		if (code !== 0) process.exit(code);
	});

const skills = program
	.command("skills")
	.description("Manage Hex Core agent skills (SKILL.md packs for Claude Code)");

skills
	.command("install")
	.description("Copy Hex Core skills into .claude/skills/ (or a custom --target)")
	.option("-t, --target <path>", "Target directory (default: .claude/skills/)")
	.option("-o, --overwrite", "Replace existing skill directories", false)
	.action(async (options: { target?: string; overwrite: boolean }) => {
		const { installSkills } = await import("./commands/skills.js");
		await installSkills(options);
	});

program.parse();
