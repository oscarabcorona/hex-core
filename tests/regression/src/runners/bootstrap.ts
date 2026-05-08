import { execa } from "execa";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Hosts the regression suite knows how to bootstrap. */
export type HostKind = "next-app-src" | "next-pages-src" | "vite-react" | "cra";

export interface BootstrapResult {
	/** Absolute path of the bootstrapped project (the test's working dir). */
	cwd: string;
	/**
	 * Package manager used to seed `node_modules`. Always `npm` so the host
	 *  fixture stays portable (no `pnpm-lock.yaml` to maintain).
	 */
	pm: "npm";
}

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = resolve(HERE, "..", "fixtures", "hosts");

/**
 * Materialize a fresh host project in `tmpDir` from the matching fixture.
 *
 * Each fixture under `fixtures/hosts/<kind>/` is a minimal scaffold (no
 * `node_modules`, no lockfile) — copying is fast and avoids dragging stale
 * deps across runs. After the copy, we run `npm install --no-audit
 * --no-fund` once to seed deps; the host then becomes the cwd for any
 * subsequent `pnpm dlx \@hex-core/cli` invocation.
 *
 * Why npm and not pnpm: tests/regression itself is in the pnpm workspace,
 * but the bootstrapped project must not be — pnpm's workspace detection
 * would resolve `@hex-core/*` to local source and defeat the point of
 * pulling from the registry. Running `npm install` in the tmpdir keeps
 * the host install fully isolated.
 * @param kind - Which host fixture to materialize.
 * @param tmpDir - Absolute path to an existing empty directory.
 * @returns The cwd to use for subsequent CLI invocations and the PM detected.
 */
export async function bootstrapHost(kind: HostKind, tmpDir: string): Promise<BootstrapResult> {
	const fixture = join(FIXTURES_ROOT, kind);
	if (!existsSync(fixture)) {
		throw new Error(`Host fixture not found: ${fixture}`);
	}
	mkdirSync(tmpDir, { recursive: true });
	cpSync(fixture, tmpDir, { recursive: true });

	// Block pnpm's workspace detection from leaking into the host. Without
	// this guard, pnpm walking up the directory tree would find the parent
	// `pnpm-workspace.yaml` and resolve `@hex-core/*` to workspace source —
	// the opposite of what this suite tests.
	mkdirSync(join(tmpDir, "node_modules"), { recursive: true });

	await execa("npm", ["install", "--no-audit", "--no-fund", "--silent"], {
		cwd: tmpDir,
		env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" },
		timeout: 180_000,
	});

	return { cwd: tmpDir, pm: "npm" };
}

/**
 * Block-scoped tmpdir helper. Returns a unique absolute path under the OS
 * tmpdir and ensures it's created. Caller is responsible for cleanup.
 * @param prefix - Stable identifier for the test, used in the dir name so
 *                 a hung test is greppable in `/tmp`.
 * @returns Absolute tmpdir path.
 */
export function makeTmpDir(prefix: string): string {
	const slug = prefix.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
	const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const dir = join(process.env.RUNNER_TMPDIR ?? "/tmp", `hex-rg-${slug}-${stamp}`);
	mkdirSync(dir, { recursive: true });
	return dir;
}
