import { rmSync } from "node:fs";
import { afterAll, describe, it } from "vitest";
import { bootstrapHost, makeTmpDir } from "../../runners/bootstrap.js";
import { runHexCli } from "../../runners/install.js";
import { assertFileExists, assertProcessOk } from "../../runners/assert.js";

/**
 * Heavy-peer prompt regression. PR #120 introduced a heavy-peer prompt
 * for components like `terminal` (xterm@~150KB), `diagram` (mermaid@~700KB),
 * `canvas` (reactflow), `audio-player` (wavesurfer.js), `chord` (d3-chord).
 *
 * This test exercises the `--no-install` path which:
 *   1. Always writes the component source.
 *   2. Skips the prompt entirely.
 *   3. Prints the manual install command.
 *
 * The interactive `y/N` prompt path is NOT exercised here — it would need
 * a TTY-aware spawn the suite doesn't currently set up. The `--no-install`
 * path is what catches the regression we actually care about: the
 * component file landing on disk, with the heavy-peer disclosure in
 * stdout. Future iteration (v2) can wire a TTY-PTY for the prompt path.
 */
describe("heavy-peers (--no-install path)", () => {
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
		const dir = makeTmpDir(`heavy-${slug}`);
		tmpDirs.push(dir);
		await bootstrapHost("next-app-src", dir);
		await runHexCli(dir, ["init", "--no-install"]);
		return dir;
	}

	const HEAVY_COMPONENTS: ReadonlyArray<{
		slug: string;
		expectFile: string;
		expectPeerHint: string;
	}> = [
		{ slug: "terminal", expectFile: "src/components/ui/terminal.tsx", expectPeerHint: "@xterm/xterm" },
		{ slug: "diagram", expectFile: "src/components/ui/diagram.tsx", expectPeerHint: "mermaid" },
		{ slug: "canvas", expectFile: "src/components/ui/canvas.tsx", expectPeerHint: "reactflow" },
		{ slug: "audio-player", expectFile: "src/components/ui/audio-player.tsx", expectPeerHint: "wavesurfer.js" },
		{ slug: "chord", expectFile: "src/components/ui/chord.tsx", expectPeerHint: "d3-chord" },
	];

	for (const c of HEAVY_COMPONENTS) {
		it(`add ${c.slug} --no-install — writes source, defers ${c.expectPeerHint}`, async () => {
			const cwd = await freshInitedHost(c.slug);
			const result = await runHexCli(cwd, ["add", c.slug, "--no-install"]);
			assertProcessOk(result);
			assertFileExists(cwd, c.expectFile);
			// stdout must mention the heavy peer so the user can install
			// it manually. Drift in the heavy-peer-prompt UX (silent skip)
			// would surface here.
			if (!result.stdout.includes(c.expectPeerHint)) {
				throw new Error(
					`add ${c.slug} --no-install missing heavy-peer hint ${JSON.stringify(c.expectPeerHint)};\nstdout:\n${result.stdout}`,
				);
			}
		});
	}
});
