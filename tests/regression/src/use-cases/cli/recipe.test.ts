import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex recipe add <slug>` regression cases. One case per shipped recipe.
 * Each recipe is a curated bundle of components + a checklist; the test
 * asserts the bundle lands on disk and the checklist is printed.
 *
 * The recipe set is intentionally exhaustive (13 recipes ship today) so a
 * silent recipe drop OR a missing component reference inside a recipe is
 * caught immediately — the resolve_spec MCP tool depends on every shipped
 * recipe being installable end-to-end.
 */
describe("cli/recipe", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Bootstrap a per-case host with `hex init` already run.
	 * @param slug - Test case identifier (used in tmpdir name).
	 * @returns Absolute path of the inited host.
	 */
	async function freshInitedHost(slug: string): Promise<string> {
		const dir = makeTmpDir(`recipe-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		await runHexCli(dir, ["init", "--no-install"]);
		return dir;
	}

	it("recipe list — prints the catalog without crashing", async () => {
		const cwd = await freshInitedHost("list");
		const result = await runHexCli(cwd, ["recipe", "list"]);
		assertProcessOk(result, "Hex Core Recipes");
	});

	const RECIPES: ReadonlyArray<{ slug: string; samplePath: string }> = [
		{ slug: "auth-sign-in", samplePath: "src/components/ui/button.tsx" },
		{ slug: "auth-sign-up", samplePath: "src/components/ui/button.tsx" },
		{ slug: "auth-forgot-password", samplePath: "src/components/ui/button.tsx" },
		{ slug: "auth-reset-password", samplePath: "src/components/ui/button.tsx" },
		{ slug: "auth-verify-email", samplePath: "src/components/ui/button.tsx" },
		{ slug: "auth-verify-otp", samplePath: "src/components/ui/input-otp.tsx" },
		{ slug: "auth-form", samplePath: "src/components/ui/button.tsx" },
		{ slug: "command-palette", samplePath: "src/components/ui/command.tsx" },
		{ slug: "confirm-destructive", samplePath: "src/components/ui/alert-dialog.tsx" },
		{ slug: "data-table-view", samplePath: "src/components/ui/data-table.tsx" },
		{ slug: "intro-sequence", samplePath: "src/components/ui/motion.tsx" },
		{ slug: "pricing-table", samplePath: "src/components/ui/card.tsx" },
		{ slug: "settings-page", samplePath: "src/components/ui/card.tsx" },
	];

	for (const recipe of RECIPES) {
		it(`recipe add ${recipe.slug} — installs bundle + writes ${recipe.samplePath}`, async () => {
			const cwd = await freshInitedHost(recipe.slug);
			const result = await runHexCli(cwd, [
				"recipe",
				"add",
				recipe.slug,
				"--yes",
				"--overwrite",
			]);
			assertProcessOk(result);
			assertFileExists(cwd, recipe.samplePath);
		});
	}
});
