import { Command } from "commander";

const program = new Command();

program.name("hex").description("Hex UI — AI-native component library").version("0.1.0");

program
	.command("list")
	.description("List all available Hex UI components")
	.action(async () => {
		const { listComponents } = await import("./commands/list.js");
		await listComponents();
	});

program
	.command("add")
	.description("Add a component to your project")
	.argument("<components...>", "Component names to add")
	.option("-y, --yes", "Skip confirmation prompts", false)
	.option("-o, --overwrite", "Overwrite existing files", false)
	.option("--no-deps", "Don't install internal component dependencies recursively")
	.option("--no-install", "Don't auto-install npm peer dependencies — only print the install line")
	.action(
		async (
			components: string[],
			options: { yes: boolean; overwrite: boolean; deps: boolean; install: boolean },
		) => {
			const { addComponents } = await import("./commands/add.js");
			await addComponents(components, options);
		},
	);

program
	.command("init")
	.description("Initialize Hex UI in your project")
	.option("--theme <theme>", "Theme to use", "default")
	.option("--overwrite", "Replace existing globals.css and tailwind.config.ts", false)
	.option("--no-install", "Don't auto-install peer dependencies — only print the install line")
	.action(async (options: { theme: string; overwrite: boolean; install: boolean }) => {
		const { initProject } = await import("./commands/init.js");
		await initProject(options);
	});

const recipe = program
	.command("recipe")
	.description("Work with Hex UI recipes (spec-driven blueprints: auth-form, settings-page, ...)");

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
	.option("--name <preset>", "Preset to scaffold from when not interactive: default | midnight | ember", "default")
	.option("--out <path>", "Output file path", "./globals.css")
	.option("--format <kind>", "Output format: css | json | ts", "css")
	.option("--overwrite", "Overwrite the output file if it exists", false)
	.action(
		async (options: {
			interactive: boolean;
			name: string;
			out: string;
			format: "css" | "json" | "ts";
			overwrite: boolean;
		}) => {
			if (options.interactive) {
				const { themeInitInteractive } = await import("./commands/theme-interactive.js");
				await themeInitInteractive({ out: options.out, format: options.format, overwrite: options.overwrite });
				return;
			}
			const { themeInit } = await import("./commands/theme.js");
			await themeInit({ name: options.name, out: options.out, format: options.format, overwrite: options.overwrite });
		},
	);

theme
	.command("edit")
	.description("Override one or more token values in an existing globals.css")
	.option("--file <path>", "Path to the globals.css to edit", "./globals.css")
	.option(
		"--token <key=value...>",
		"Token override (repeatable). Example: --token primary=\"240 50% 50%\"",
	)
	.option("--mode <kind>", "Which color mode to update: light | dark | both", "both")
	.action(
		async (options: {
			file: string;
			token?: string[];
			mode: "light" | "dark" | "both";
		}) => {
			const { themeEdit } = await import("./commands/theme.js");
			await themeEdit({ file: options.file, tokens: options.token ?? [], mode: options.mode });
		},
	);

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
	.command("doctor")
	.description("Diagnose your Hex UI install and report what's missing")
	.action(async () => {
		const { runDoctor, reportDoctor } = await import("./commands/doctor.js");
		const checks = await runDoctor();
		const code = reportDoctor(checks);
		if (code !== 0) process.exit(code);
	});

const skills = program
	.command("skills")
	.description("Manage Hex UI agent skills (SKILL.md packs for Claude Code)");

skills
	.command("install")
	.description("Copy Hex UI skills into .claude/skills/ (or a custom --target)")
	.option("-t, --target <path>", "Target directory (default: .claude/skills/)")
	.option("-o, --overwrite", "Replace existing skill directories", false)
	.action(async (options: { target?: string; overwrite: boolean }) => {
		const { installSkills } = await import("./commands/skills.js");
		await installSkills(options);
	});

program.parse();
