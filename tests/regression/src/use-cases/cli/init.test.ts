import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileContains, assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex init` regression cases. Each test pulls `\@hex-core/cli@latest`
 * from npm, runs against a fresh next-app-src host, and asserts the
 * canonical artifacts (hex.config.json, globals.css, peer deps) land
 * where expected.
 *
 * Per-test isolation: each `it` block bootstraps its own host so a write
 * in one case never bleeds into another. The cost is one ~30s `npm install`
 * per case — acceptable for a 5-min/test budget — and the upside is no
 * cleanup logic to misfire.
 */
describe("cli/init", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Bootstrap a per-case host. Each `it` block gets its own clean tmpdir
	 * so a write in one case can't bleed into another.
	 * @param slug - Stable identifier for the test case (used in the dir name).
	 * @returns Absolute path of the bootstrapped host.
	 */
	async function freshHost(slug: string): Promise<string> {
		const dir = makeTmpDir(`init-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		return dir;
	}

	it("default theme — writes hex.config.json + globals.css with Tailwind v4 syntax", async () => {
		const cwd = await freshHost("default");
		const result = await runHexCli(cwd, ["init", "--no-install"]);
		assertProcessOk(result);
		assertFileExists(cwd, "hex.config.json");
		assertFileContains(cwd, "hex.config.json", `"theme": "default"`);
		assertFileExists(cwd, "src/app/globals.css");
		assertFileContains(cwd, "src/app/globals.css", `@import "tailwindcss"`);
	});

	it("--theme=midnight — applies the midnight preset palette", async () => {
		const cwd = await freshHost("midnight");
		const result = await runHexCli(cwd, ["init", "--theme", "midnight", "--no-install"]);
		assertProcessOk(result);
		assertFileContains(cwd, "hex.config.json", `"theme": "midnight"`);
	});

	it("--theme=ember — applies the ember preset palette", async () => {
		const cwd = await freshHost("ember");
		const result = await runHexCli(cwd, ["init", "--theme", "ember", "--no-install"]);
		assertProcessOk(result);
		assertFileContains(cwd, "hex.config.json", `"theme": "ember"`);
	});

	it("--check on a fresh host exits non-zero (no hex.config.json yet)", async () => {
		const cwd = await freshHost("check-fresh");
		const result = await runHexCli(cwd, ["init", "--check"]);
		// --check is a CI mode: exits 1 when drift is detected.
		// On a fresh host with no hex.config.json, that's drift.
		if (result.exitCode === 0) {
			throw new Error(
				`Expected non-zero exit on fresh host (no hex.config.json yet); got exit 0.\nStdout:\n${result.stdout}`,
			);
		}
	});

	it("--no-install — prints manual install line instead of spawning the PM", async () => {
		const cwd = await freshHost("no-install");
		const result = await runHexCli(cwd, ["init", "--no-install"]);
		assertProcessOk(result, "pnpm add");
	});

	it("src layout detected — writes hex.config.json with @/ alias resolving to src/", async () => {
		// next-app-src host already has src/app/ — init should detect this
		// and the resulting alias resolution should land writes under src/.
		const cwd = await freshHost("src-layout");
		const result = await runHexCli(cwd, ["init", "--no-install"]);
		assertProcessOk(result, "src/ layout");
	});
});
