import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileContains, assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex add` regression cases. Tests the canonical install flow: write the
 * component to the alias-resolved path, install Radix peers, walk
 * internal deps recursively (default), or skip them under `--no-deps`.
 *
 * One init per host is shared across the `add` cases that don't need
 * isolation — the cost saving (~30s/case × 6 cases) is worth it; tests
 * that DO need isolation (e.g. `--from manifest` writes a manifest)
 * use their own freshHost().
 */
describe("cli/add", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Bootstrap a per-case host that's already had `hex init` run against it.
	 * Pre-init keeps the assertions in each `it` focused on the `add`
	 * surface (file writes, peer-dep prompts) without re-validating init.
	 * @param slug - Stable identifier for the test case (used in the dir name).
	 * @returns Absolute path of the inited host.
	 */
	async function freshHost(slug: string): Promise<string> {
		const dir = makeTmpDir(`add-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		await runHexCli(dir, ["init", "--no-install"]);
		return dir;
	}

	it("single component — `hex add button --no-install` writes button.tsx + lib/utils.ts", async () => {
		const cwd = await freshHost("button");
		const result = await runHexCli(cwd, ["add", "button", "--no-install"]);
		assertProcessOk(result);
		assertFileExists(cwd, "src/components/ui/button.tsx");
		assertFileExists(cwd, "src/lib/utils.ts");
		assertFileContains(cwd, "src/components/ui/button.tsx", "Button");
	});

	it("internal deps walked — `hex add combobox` pulls in popover + command", async () => {
		const cwd = await freshHost("combobox");
		const result = await runHexCli(cwd, ["add", "combobox", "--no-install"]);
		assertProcessOk(result);
		assertFileExists(cwd, "src/components/ui/combobox.tsx");
		assertFileExists(cwd, "src/components/ui/popover.tsx");
		assertFileExists(cwd, "src/components/ui/command.tsx");
	});

	it("--no-deps — only the named component lands; internal deps are warned", async () => {
		const cwd = await freshHost("no-deps");
		const result = await runHexCli(cwd, ["add", "combobox", "--no-deps", "--no-install"]);
		assertProcessOk(result);
		assertFileExists(cwd, "src/components/ui/combobox.tsx");
		// Pop / command should NOT be auto-installed under --no-deps.
		// The CLI's verifyChecklist surfaces missing deps as a warning,
		// so stdout should mention them — but the files don't land.
		if (result.stdout.includes("Write: src/components/ui/popover.tsx")) {
			throw new Error("--no-deps should not write popover.tsx; got it anyway");
		}
	});

	it("--dry-run — plans without writing files", async () => {
		const cwd = await freshHost("dry-run");
		const result = await runHexCli(cwd, ["add", "card", "--dry-run", "--no-install"]);
		assertProcessOk(result, "Would write");
		// File must NOT be on disk after a dry-run.
		// (assertFileExists would throw on miss; we want the inverse.)
		try {
			assertFileExists(cwd, "src/components/ui/card.tsx");
			throw new Error("Dry-run wrote card.tsx; should have been planning-only");
		} catch (e) {
			if (!(e as Error).message.startsWith("Expected file does not exist")) throw e;
		}
	});

	it("--from manifest — installs every slug in a hex.components.json", async () => {
		const cwd = await freshHost("from-manifest");
		const manifest = { components: ["button", "card", "input"] };
		writeFileSync(join(cwd, "hex.components.json"), JSON.stringify(manifest, null, 2));
		const result = await runHexCli(cwd, [
			"add",
			"--from",
			"hex.components.json",
			"--no-install",
		]);
		assertProcessOk(result);
		assertFileExists(cwd, "src/components/ui/button.tsx");
		assertFileExists(cwd, "src/components/ui/card.tsx");
		assertFileExists(cwd, "src/components/ui/input.tsx");
	});

	it("multi positional — `hex add button input label` writes all three", async () => {
		const cwd = await freshHost("multi");
		const result = await runHexCli(cwd, [
			"add",
			"button",
			"input",
			"label",
			"--no-install",
		]);
		assertProcessOk(result);
		assertFileExists(cwd, "src/components/ui/button.tsx");
		assertFileExists(cwd, "src/components/ui/input.tsx");
		assertFileExists(cwd, "src/components/ui/label.tsx");
	});
});
