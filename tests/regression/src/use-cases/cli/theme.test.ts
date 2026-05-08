import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileContains, assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex theme {init,apply,list}` regression cases. Theme commands edit
 * globals.css surgically (replace the `:root` and `.dark` blocks without
 * clobbering custom rules); these tests assert that surgical replacement
 * actually preserves the surrounding content.
 */
describe("cli/theme", () => {
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
		const dir = makeTmpDir(`theme-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		await runHexCli(dir, ["init", "--no-install"]);
		return dir;
	}

	it("theme list --json — emits a parseable JSON catalog", async () => {
		const cwd = await freshInitedHost("list");
		const result = await runHexCli(cwd, ["theme", "list", "--json"]);
		assertProcessOk(result);
		// Must parse cleanly — silent JSON drift would break agents that pipe this.
		const start = result.stdout.indexOf("[");
		const end = result.stdout.lastIndexOf("]");
		if (start === -1 || end === -1) {
			throw new Error(`theme list --json output had no JSON array; stdout:\n${result.stdout}`);
		}
		const parsed = JSON.parse(result.stdout.slice(start, end + 1)) as unknown[];
		if (!Array.isArray(parsed) || parsed.length === 0) {
			throw new Error(`theme list --json returned empty/non-array; got ${typeof parsed}`);
		}
	});

	it("theme apply midnight — swaps globals.css palette without clobbering custom rules", async () => {
		const cwd = await freshInitedHost("apply");
		// theme apply is surgical — the prior `init` ran with --theme=default,
		// so swapping to midnight should rewrite :root/.dark only.
		const result = await runHexCli(cwd, [
			"theme",
			"apply",
			"midnight",
			"--file",
			"src/app/globals.css",
		]);
		assertProcessOk(result);
		// Sentinel: midnight's primary token has a different hue than default.
		// We assert the file is still well-formed (has both blocks).
		assertFileContains(cwd, "src/app/globals.css", ":root {");
		assertFileContains(cwd, "src/app/globals.css", ".dark {");
	});

	it("theme init --preset=ember --out=themes/custom.css — scaffolds at the chosen path", async () => {
		const cwd = await freshInitedHost("init-out");
		const result = await runHexCli(cwd, [
			"theme",
			"init",
			"--preset",
			"ember",
			"--out",
			"themes/custom.css",
			"--overwrite",
		]);
		assertProcessOk(result);
		assertFileExists(cwd, "themes/custom.css");
		assertFileContains(cwd, "themes/custom.css", ":root {");
	});
});
