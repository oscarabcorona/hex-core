import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * `hex skills install` — copies the bundled SKILL.md packs into the
 * consumer's `.claude/skills/`. After the rebrand, the directory names
 * are `hex-core-*`; this test guards against an accidental fall-back
 * to the old `hex-ui-*` naming.
 */
describe("cli/skills", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("install — drops hex-core-* skills under .claude/skills/", async () => {
		const dir = makeTmpDir("skills-install");
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		const result = await runHexCli(dir, ["skills", "install"]);
		assertProcessOk(result);
		// At least one canonical skill must land.
		assertFileExists(dir, ".claude/skills/hex-core-overview/SKILL.md");
	});
});
