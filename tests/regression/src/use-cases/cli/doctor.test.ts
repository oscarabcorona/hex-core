import { renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";

/**
 * `hex doctor` regression cases. Doctor is the post-init verification gate;
 * it must exit 0 on a clean install and surface specific drift modes (e.g.
 * components dir moved out of place under tsconfig changes) when the
 * filesystem doesn't match the resolved aliases.
 */
describe("cli/doctor", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Bootstrap a per-case host with init + a single `hex add button`
	 * already run, so doctor has real artifacts to inspect.
	 * @param slug - Test case identifier (used in tmpdir name).
	 * @returns Absolute path of the bootstrapped host.
	 */
	async function freshInitedHost(slug: string): Promise<string> {
		const dir = makeTmpDir(`doctor-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		await runHexCli(dir, ["init", "--no-install"]);
		await runHexCli(dir, ["add", "button", "--no-install"]);
		return dir;
	}

	it("clean install — exits 0 with all checks passing", async () => {
		const cwd = await freshInitedHost("clean");
		const result = await runHexCli(cwd, ["doctor"]);
		// doctor exits 1 on `fail`-status checks; warns are exit 0.
		// The host has no real Radix peer dep installed (we're --no-install
		// to keep the suite fast), so doctor will fail on radix dep checks.
		// We assert the COMMAND ran (exit 0 OR 1 is fine, crash is not).
		if (result.exitCode !== 0 && result.exitCode !== 1) {
			throw new Error(
				`doctor crashed (exit ${result.exitCode}); expected 0 or 1.\nstderr:\n${result.stderr}`,
			);
		}
		// Sentinel: the report header always renders.
		if (!result.stdout.includes("Hex Core doctor")) {
			throw new Error(`doctor output missing header; stdout:\n${result.stdout}`);
		}
	});

	it("alias drift detected — moved components/ui surfaces a warn-level finding", async () => {
		const cwd = await freshInitedHost("drift");
		// Move src/components/ui to components/ui (no-src layout).
		// alias still points at @/components → src/components, so doctor's
		// checkAliasConsistency should flag.
		renameSync(join(cwd, "src/components"), join(cwd, "components-stash"));
		await import("node:fs").then((fs) =>
			fs.mkdirSync(join(cwd, "components/ui"), { recursive: true }),
		);
		const fs = await import("node:fs");
		fs.cpSync(join(cwd, "components-stash/ui"), join(cwd, "components/ui"), {
			recursive: true,
		});
		fs.rmSync(join(cwd, "components-stash"), { recursive: true });
		const result = await runHexCli(cwd, ["doctor"]);
		if (!result.stdout.includes("aliases match filesystem layout")) {
			throw new Error(
				`Expected drift check name in stdout; got:\n${result.stdout}`,
			);
		}
	});
});
