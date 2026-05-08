export type Severity = "blocker" | "high" | "medium" | "low";

export interface FailedCase {
	/** Test file path relative to repo root (e.g. `tests/regression/src/use-cases/cli/init.test.ts`). */
	file: string;
	/** Line where the failing `it(...)` block starts, or 0 if unknown. */
	line: number;
	/** Display name — e.g. `cli/init > default theme on next-app-src`. */
	name: string;
	/** Failure message — error.toString() from the failed assertion. */
	message: string;
	/** Stdout/stderr tail captured before the assertion failed. */
	output?: string;
	/** Wall-clock duration in ms. */
	durationMs: number;
}

export interface PassedCase {
	file: string;
	name: string;
	durationMs: number;
}

export interface FindingsReport {
	/** ISO date for the run, used in filename + heading. */
	date: string;
	/** Total wall-clock duration in ms across all cases. */
	durationMs: number;
	passed: PassedCase[];
	failed: FailedCase[];
	skipped: string[];
	/** Resolved versions of the packages this run pulled from npm. */
	packageVersions: Record<string, string>;
	/** Hosts the run touched, by fixture kind. */
	hosts: string[];
	/** `process.versions.node`. */
	nodeVersion: string;
	/** Captured `pnpm --version` output. */
	pnpmVersion: string;
}

/**
 * Heuristic severity classifier. Caller hands us the failure message + any
 * captured output; we route by substring match against the canonical
 * failure modes the suite knows about.
 *
 * - `blocker` — the suite couldn't even reach the assertion (process
 *   crash, npm install failure, MCP handshake never completed).
 * - `high` — the command exited non-zero or wrote the wrong file. The
 *   user's flow is broken.
 * - `medium` — secondary assertion (alias drift, theme didn't apply
 *   visibly) — flow finished but with degraded output.
 * - `low` — cosmetic mismatch (hint string drift, ordering change in
 *   list output). Doesn't block anyone.
 * @param failure - Failed case shape (message + optional output).
 * @param failure.message - Error message string from the failed assertion.
 * @param failure.output - Optional stdout/stderr tail captured at failure.
 * @returns The classified severity.
 */
export function classifySeverity(failure: { message: string; output?: string }): Severity {
	const haystack = `${failure.message}\n${failure.output ?? ""}`.toLowerCase();
	if (
		haystack.includes("crashed") ||
		haystack.includes("npm error") ||
		haystack.includes("enoent") ||
		haystack.includes("eacces") ||
		haystack.includes("connection closed") ||
		haystack.includes("npm install") ||
		haystack.includes("connect econnrefused") ||
		haystack.includes("could not resolve")
	) {
		return "blocker";
	}
	if (
		haystack.includes("process failed (exit") ||
		haystack.includes("expected file does not exist") ||
		haystack.includes("unresolved import") ||
		haystack.includes("missing package")
	) {
		return "high";
	}
	if (
		haystack.includes("expected") &&
		(haystack.includes("contain") || haystack.includes("to be") || haystack.includes("alias"))
	) {
		return "medium";
	}
	return "low";
}

/**
 * Render the findings doc to markdown. Shape mirrors
 * `.qa/spec-driven-layer-findings.md` so the maintainer's review loop is
 * consistent across all internal QA outputs.
 * @param report - The aggregated run results.
 * @returns Markdown string ready to write under `.claude/findings/`.
 */
export function renderMarkdown(report: FindingsReport): string {
	const buckets: Record<Severity, FailedCase[]> = {
		blocker: [],
		high: [],
		medium: [],
		low: [],
	};
	for (const failure of report.failed) {
		buckets[classifySeverity(failure)].push(failure);
	}

	const total = report.passed.length + report.failed.length + report.skipped.length;
	const lines: string[] = [];
	lines.push(`# Regression findings — ${report.date}`);
	lines.push("");
	lines.push(`Run: \`pnpm regression:use-cases\``);
	lines.push(`Duration: ${formatDuration(report.durationMs)}`);
	lines.push(
		`Pass / Fail / Skip: ${report.passed.length} / ${report.failed.length} / ${report.skipped.length} (of ${total})`,
	);
	lines.push("");

	for (const sev of ["blocker", "high", "medium", "low"] as const) {
		lines.push(`## ${capitalize(sev)}`);
		lines.push("");
		const cases = buckets[sev];
		if (cases.length === 0) {
			lines.push("(none)");
		} else {
			for (const c of cases) {
				lines.push(`### ${c.name}`);
				lines.push("");
				lines.push(`- File: ${c.file}${c.line > 0 ? `:${c.line}` : ""}`);
				lines.push(`- Duration: ${formatDuration(c.durationMs)}`);
				lines.push(`- Error:`);
				lines.push("");
				lines.push("```");
				lines.push(c.message.trim());
				lines.push("```");
				if (c.output) {
					lines.push("");
					lines.push("**Output tail**");
					lines.push("");
					lines.push("```");
					lines.push(c.output.trim());
					lines.push("```");
				}
				lines.push("");
			}
		}
		lines.push("");
	}

	lines.push(`## Passing (${report.passed.length})`);
	lines.push("");
	for (const p of report.passed) {
		lines.push(`- ${p.name} (${formatDuration(p.durationMs)}) ✓`);
	}
	lines.push("");

	if (report.skipped.length > 0) {
		lines.push(`## Skipped (${report.skipped.length})`);
		lines.push("");
		for (const s of report.skipped) lines.push(`- ${s}`);
		lines.push("");
	}

	lines.push("## Environment");
	lines.push("");
	lines.push(`- Node: ${report.nodeVersion}`);
	lines.push(`- pnpm: ${report.pnpmVersion}`);
	lines.push(`- Hosts: ${report.hosts.join(", ")}`);
	lines.push("- Packages under test:");
	for (const [name, version] of Object.entries(report.packageVersions).sort()) {
		lines.push(`  - ${name}@${version}`);
	}
	lines.push("");
	return lines.join("\n");
}

/**
 * Title-case the first character of a string.
 * @param s - Lowercase severity name.
 * @returns The same string with the first character upper-cased.
 */
function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Format a millisecond duration as a human-readable string. Sub-second
 * stays in `ms`, sub-minute uses `<seconds>s`, anything else `<m>m <s>s`.
 * @param ms - Wall-clock duration in milliseconds.
 * @returns Compact display string.
 */
function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	const m = Math.floor(s / 60);
	const rem = Math.round(s - m * 60);
	return `${m}m ${rem}s`;
}
