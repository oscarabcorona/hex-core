import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir, type HostKind } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * Per-host smoke. Validates that `hex init` + `hex add button` works
 * end-to-end on every framework variant the migrate command lists. The
 * detailed CLI cases under `cli/*` cover next-app-src exhaustively;
 * this layer is the breadth check — a host where the alias resolver
 * misfires (Vite without alias config, CRA without proper paths) would
 * surface here even if next-app-src is green.
 */
describe("hosts/smoke", () => {
	const tmpDirs: string[] = [];

	afterAll(() => {
		for (const dir of tmpDirs) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	/**
	 * Bootstrap a per-case host of the given framework kind.
	 * @param kind - Which fixture to materialize.
	 * @param slug - Test case identifier (used in tmpdir name).
	 * @returns Absolute path of the bootstrapped host.
	 */
	async function freshHost(kind: HostKind, slug: string): Promise<string> {
		const dir = makeTmpDir(`smoke-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost(kind, dir);
		return dir;
	}

	const HOSTS: ReadonlyArray<{ kind: HostKind; expectComponent: string }> = [
		{ kind: "next-pages-src", expectComponent: "src/components/ui/button.tsx" },
		{ kind: "vite-react", expectComponent: "src/components/ui/button.tsx" },
		{ kind: "cra", expectComponent: "src/components/ui/button.tsx" },
	];

	for (const h of HOSTS) {
		it(`${h.kind} — init + add button writes ${h.expectComponent}`, async () => {
			const cwd = await freshHost(h.kind, h.kind);
			const initResult = await runHexCli(cwd, ["init", "--no-install"]);
			assertProcessOk(initResult);
			const addResult = await runHexCli(cwd, ["add", "button", "--no-install"]);
			assertProcessOk(addResult);
			assertFileExists(cwd, h.expectComponent);
		});
	}
});
