import { execa, type ExecaError, type Result } from "execa";

export interface ProcessResult {
	exitCode: number;
	stdout: string;
	stderr: string;
	command: string;
	durationMs: number;
	timedOut: boolean;
}

export interface RunHexCliOptions {
	/** Lines to pipe into stdin — useful for the heavy-peer `y/N` prompt. */
	stdin?: string;
	/** Override the default 5-min timeout (ms). */
	timeout?: number;
	/**
	 * Pin a specific version instead of `@latest`. Use to test a release
	 *  that's been published but not yet promoted.
	 */
	cliVersion?: string;
}

/**
 * Invoke the published `\@hex-core/cli` against a fresh consumer project.
 *
 * Always uses `pnpm dlx \@hex-core/cli@<version>` — the suite's whole point
 * is exercising what consumers actually run, and `pnpm dlx` is the
 * canonical way to run a CLI from npm without installing it as a dep.
 * Using `pnpm` (not `npm`/`npx`) is intentional: `pnpm dlx` has the
 * fastest cold cache among package managers, and the suite's runtime
 * cost is dominated by these invocations.
 *
 * Never throws on non-zero exit — the caller asserts on `exitCode`. This
 * mirrors the pattern in `packages/cli/src/lib/run-install.ts:33`, where
 * the install helper returns a typed result instead of throwing so the
 * caller can print a fallback hint instead of crashing the whole suite.
 * @param cwd - Absolute path of the bootstrapped host project.
 * @param args - CLI args (e.g. `["init", "--yes"]`, `["add", "button"]`).
 * @param opts - Optional stdin / timeout / version overrides.
 * @returns Captured exit code, stdout, stderr, and runtime metadata.
 */
export async function runHexCli(
	cwd: string,
	args: string[],
	opts: RunHexCliOptions = {},
): Promise<ProcessResult> {
	const version = opts.cliVersion ?? "latest";
	const cliSpec = `@hex-core/cli@${version}`;
	const fullArgs = ["dlx", cliSpec, ...args];
	const command = `pnpm ${fullArgs.join(" ")}`;
	const start = Date.now();

	try {
		const result = await execa("pnpm", fullArgs, {
			cwd,
			input: opts.stdin,
			timeout: opts.timeout ?? 300_000,
			reject: false,
			all: true,
		});
		return shape(result, command, start);
	} catch (err) {
		const e = err as ExecaError;
		return {
			exitCode: typeof e.exitCode === "number" ? e.exitCode : 1,
			stdout: e.stdout ? String(e.stdout) : "",
			stderr: e.stderr ? String(e.stderr) : String(err),
			command,
			durationMs: Date.now() - start,
			timedOut: Boolean(e.timedOut),
		};
	}
}

/**
 * Run an arbitrary host command (`npm run build`, `pnpm vite build`, etc.)
 * inside the bootstrapped project. Used by host-smoke tests to validate
 * that `hex add` outputs survive the consumer's actual build pipeline.
 * @param cwd - Absolute path of the bootstrapped host project.
 * @param command - Executable (`npm`, `pnpm`, `npx`, ...).
 * @param args - Arguments forwarded to the executable.
 * @param opts - Same shape as `runHexCli`.
 * @returns Captured exit code, stdout, stderr, and runtime metadata.
 */
export async function runInHost(
	cwd: string,
	command: string,
	args: string[],
	opts: RunHexCliOptions = {},
): Promise<ProcessResult> {
	const display = `${command} ${args.join(" ")}`;
	const start = Date.now();
	try {
		const result = await execa(command, args, {
			cwd,
			input: opts.stdin,
			timeout: opts.timeout ?? 180_000,
			reject: false,
			all: true,
		});
		return shape(result, display, start);
	} catch (err) {
		const e = err as ExecaError;
		return {
			exitCode: typeof e.exitCode === "number" ? e.exitCode : 1,
			stdout: e.stdout ? String(e.stdout) : "",
			stderr: e.stderr ? String(e.stderr) : String(err),
			command: display,
			durationMs: Date.now() - start,
			timedOut: Boolean(e.timedOut),
		};
	}
}

/**
 * Normalize an execa Result to our typed shape.
 * @param result - The native execa result returned by `execa(...)`.
 * @param command - Display string for logging/findings (e.g. `pnpm dlx ...`).
 * @param start - `Date.now()` from before the spawn — used to compute duration.
 * @returns The normalized `ProcessResult` ready for assertions.
 */
function shape(result: Result, command: string, start: number): ProcessResult {
	return {
		exitCode: typeof result.exitCode === "number" ? result.exitCode : 0,
		stdout: typeof result.stdout === "string" ? result.stdout : "",
		stderr: typeof result.stderr === "string" ? result.stderr : "",
		command,
		durationMs: Date.now() - start,
		timedOut: Boolean(result.timedOut),
	};
}
