import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProcessResult } from "./install.js";

/**
 * Assert that `relPath` exists under `cwd`. Throws an `Error` whose message
 * is shaped to flow into the regression findings doc directly — vitest's
 * default error formatter renders the message verbatim under the failed
 * `it(...)` block, which the orchestrator then captures from the JSON
 * reporter and routes into the markdown.
 * @param cwd - Bootstrapped host root.
 * @param relPath - Cwd-relative path expected to exist.
 * @throws {Error} When the path does not exist.
 */
export function assertFileExists(cwd: string, relPath: string): void {
	const abs = join(cwd, relPath);
	if (!existsSync(abs)) {
		throw new Error(`Expected file does not exist: ${relPath} (under ${cwd})`);
	}
}

/**
 * Assert that the file at `relPath` contains `substr`. Reads the file
 * synchronously — the suite is serial and the files we're checking are
 * always small (component sources, configs, generated CSS).
 * @param cwd - Bootstrapped host root.
 * @param relPath - Cwd-relative file path.
 * @param substr - Required substring.
 * @throws {Error} When the file is missing or doesn't contain `substr`.
 */
export function assertFileContains(cwd: string, relPath: string, substr: string): void {
	const abs = join(cwd, relPath);
	if (!existsSync(abs)) {
		throw new Error(`Expected file does not exist: ${relPath}`);
	}
	const content = readFileSync(abs, "utf-8");
	if (!content.includes(substr)) {
		throw new Error(
			`Expected ${relPath} to contain ${JSON.stringify(substr)}; first 200 chars: ${content.slice(0, 200)}`,
		);
	}
}

/**
 * Assert that a process exited cleanly. When `expectedSubstr` is provided,
 * also asserts that the substring appears in stdout — the canonical
 * "command did the thing" signal (the CLI's success lines like
 * `Write: <path>` or `pnpm add <pkg>`).
 * @param result - The captured `ProcessResult` from `runHexCli` / `runInHost`.
 * @param expectedSubstr - Optional substring expected in stdout on success.
 * @throws {Error} When the exit code is non-zero or the substring is missing.
 */
export function assertProcessOk(result: ProcessResult, expectedSubstr?: string): void {
	if (result.exitCode !== 0) {
		const tail = (result.stderr || result.stdout).split("\n").slice(-30).join("\n");
		throw new Error(
			`Process failed (exit ${result.exitCode}, ${result.durationMs}ms): ${result.command}\n--- output tail ---\n${tail}`,
		);
	}
	if (expectedSubstr && !result.stdout.includes(expectedSubstr)) {
		const tail = result.stdout.split("\n").slice(-30).join("\n");
		throw new Error(
			`Process succeeded but stdout missing ${JSON.stringify(expectedSubstr)}; tail:\n${tail}`,
		);
	}
}

/**
 * Lightweight import-resolution check. Walks `entry`, finds every
 * `from "@/<...>"` specifier, and verifies the resolved file exists on
 * disk. Mirrors the pattern from `scripts/verify-add-all.ts:30-110`.
 *
 * Resolution: `@/<rest>` maps to `<cwd>/src/<rest>` when `<cwd>/src`
 * exists, else `<cwd>/<rest>`. Tries `.tsx`, `.ts`, `.jsx`, `.js`,
 * `/index.tsx`, `/index.ts`. Anything else is a miss.
 * @param cwd - Bootstrapped host root.
 * @param entry - Cwd-relative path of the entry file to scan.
 * @throws {Error} When any `@/...` import in `entry` fails to resolve.
 */
export function assertNoUnresolvedImports(cwd: string, entry: string): void {
	const abs = join(cwd, entry);
	if (!existsSync(abs)) {
		throw new Error(`Entry file missing: ${entry}`);
	}
	const content = readFileSync(abs, "utf-8");
	const importRe = /from\s+["'](@\/[^"']+)["']/g;
	const aliasRoot = existsSync(join(cwd, "src")) ? "src" : "";

	const dangling: string[] = [];
	let match: RegExpExecArray | null = importRe.exec(content);
	while (match !== null) {
		const spec = match[1].slice(2);
		const candidates = [
			join(cwd, aliasRoot, `${spec}.tsx`),
			join(cwd, aliasRoot, `${spec}.ts`),
			join(cwd, aliasRoot, `${spec}.jsx`),
			join(cwd, aliasRoot, `${spec}.js`),
			join(cwd, aliasRoot, spec, "index.tsx"),
			join(cwd, aliasRoot, spec, "index.ts"),
		];
		if (!candidates.some((p) => existsSync(p))) {
			dangling.push(match[1]);
		}
		match = importRe.exec(content);
	}

	if (dangling.length > 0) {
		throw new Error(
			`Entry ${entry} has ${dangling.length} unresolved import(s): ${dangling.join(", ")}`,
		);
	}
}
