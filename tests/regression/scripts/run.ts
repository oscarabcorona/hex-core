#!/usr/bin/env tsx
import { execa } from "execa";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	renderMarkdown,
	type FailedCase,
	type FindingsReport,
	type PassedCase,
} from "../src/runners/finding.js";

/**
 * Orchestrator for the use-case regression suite.
 *
 * Wraps `vitest run` with the JSON reporter, walks the result tree, and
 * emits a severity-graded findings doc at `.claude/findings/regression-<date>.md`
 * shaped to match `.qa/spec-driven-layer-findings.md`. Pass-only runs
 * still produce the doc (with empty severity buckets) so downstream
 * automation can grep for the "Pass / Fail / Skip" line consistently.
 *
 * CLI args (forwarded to vitest after the orchestrator's own filters):
 *   --filter <pattern>   substring filter on test file path
 *   --host <kind>        run only tests under hosts/<kind>-smoke or matching the host
 *
 * Exits 0 on full pass, 1 on any failure. CI integration would gate on
 * exit code; the markdown doc is always written for human review.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const REGRESSION_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(REGRESSION_ROOT, "..", "..");
const FINDINGS_DIR = join(REPO_ROOT, ".claude", "findings");

interface VitestJsonReport {
	testResults: Array<{
		name: string;
		assertionResults: Array<{
			ancestorTitles: string[];
			title: string;
			status: "passed" | "failed" | "skipped" | "pending" | "todo";
			duration?: number;
			location?: { line: number; column: number };
			failureMessages?: string[];
		}>;
		startTime: number;
		endTime: number;
	}>;
	startTime?: number;
	success?: boolean;
	numTotalTests?: number;
}

/**
 * Orchestrator entry point. Spawns vitest with the JSON reporter, walks
 * the result tree, classifies failures, and writes the findings doc.
 * @returns Exits the process with code 0 on full pass, 1 on any failure.
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const filterIdx = args.indexOf("--filter");
	const filter = filterIdx >= 0 ? args[filterIdx + 1] : undefined;

	const passthrough: string[] = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--filter") {
			i++;
			continue;
		}
		passthrough.push(args[i]);
	}

	const jsonOut = join(REGRESSION_ROOT, "test-results.json");

	console.log("> regression:use-cases — invoking vitest");
	const env = { ...process.env, REGRESSION_JSON: "1" };
	const vitestArgs = ["vitest", "run", "--reporter=json", `--outputFile=${jsonOut}`];
	if (filter) vitestArgs.push(filter);
	for (const p of passthrough) vitestArgs.push(p);

	const startedAt = Date.now();
	const result = await execa("pnpm", vitestArgs, {
		cwd: REGRESSION_ROOT,
		env,
		reject: false,
		stdio: "inherit",
	});
	const wallDuration = Date.now() - startedAt;

	if (!existsSync(jsonOut)) {
		console.error(`Vitest did not emit ${jsonOut}; cannot generate findings doc.`);
		process.exit(typeof result.exitCode === "number" ? result.exitCode : 1);
	}

	const report = JSON.parse(readFileSync(jsonOut, "utf-8")) as VitestJsonReport;
	const passed: PassedCase[] = [];
	const failed: FailedCase[] = [];
	const skipped: string[] = [];

	for (const file of report.testResults) {
		const relFile = relativeToRepo(file.name);
		for (const assertion of file.assertionResults) {
			const name = [...assertion.ancestorTitles, assertion.title].join(" > ");
			const duration = assertion.duration ?? 0;
			if (assertion.status === "passed") {
				passed.push({ file: relFile, name, durationMs: duration });
			} else if (assertion.status === "skipped" || assertion.status === "pending") {
				skipped.push(name);
			} else {
				failed.push({
					file: relFile,
					line: assertion.location?.line ?? 0,
					name,
					message: (assertion.failureMessages ?? ["(no failure message captured)"]).join("\n\n"),
					output: undefined,
					durationMs: duration,
				});
			}
		}
	}

	const pnpmVersion = await captureVersion("pnpm", ["--version"]);
	const packageVersions = await resolvePackageVersions();

	const findings: FindingsReport = {
		date: new Date().toISOString().slice(0, 10),
		durationMs: wallDuration,
		passed,
		failed,
		skipped,
		packageVersions,
		hosts: ["next-app-src", "next-pages-src", "vite-react", "cra"],
		nodeVersion: process.version,
		pnpmVersion,
	};

	mkdirSync(FINDINGS_DIR, { recursive: true });
	const docPath = join(FINDINGS_DIR, `regression-${findings.date}.md`);
	writeFileSync(docPath, renderMarkdown(findings), "utf-8");
	console.log(`\n> findings written: ${docPath}`);
	console.log(`  pass=${passed.length} fail=${failed.length} skip=${skipped.length}`);

	process.exit(failed.length > 0 ? 1 : 0);
}

/**
 * Convert an absolute test-file path to a repo-rooted display path.
 * @param absPath - Absolute path emitted by vitest's JSON reporter.
 * @returns A path relative to the repo root, or the original input when
 *          it doesn't live under the repo (rare; defensive).
 */
function relativeToRepo(absPath: string): string {
	return absPath.startsWith(REPO_ROOT) ? absPath.slice(REPO_ROOT.length + 1) : absPath;
}

/**
 * Capture `<cmd> --version` (or similar) without throwing on failure.
 * @param cmd - Executable to run.
 * @param args - Arguments for the executable.
 * @returns Trimmed stdout, or `"(unknown)"` if the spawn errored.
 */
async function captureVersion(cmd: string, args: string[]): Promise<string> {
	try {
		const r = await execa(cmd, args, { reject: false });
		return typeof r.stdout === "string" ? r.stdout.trim() : "(unknown)";
	} catch {
		return "(unknown)";
	}
}

/**
 * Resolve the live `latest` versions of the `\@hex-core/*` packages under
 * test. Done once at the start of the run and stamped into the doc so
 * the doc tells the maintainer exactly which tarball each finding hit.
 * @returns A map from package name to resolved version string.
 */
async function resolvePackageVersions(): Promise<Record<string, string>> {
	const names = [
		"@hex-core/cli",
		"@hex-core/components",
		"@hex-core/mcp",
		"@hex-core/motion",
		"@hex-core/payload",
		"@hex-core/registry",
		"@hex-core/themes",
		"@hex-core/tokens",
	];
	const out: Record<string, string> = {};
	for (const name of names) {
		const v = await captureVersion("npm", ["view", name, "version"]);
		out[name] = v || "(unresolved)";
	}
	return out;
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
