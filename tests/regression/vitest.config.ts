import { defineConfig } from "vitest/config";

/**
 * Use-case regression suite. Each test bootstraps a fresh consumer project
 * in a tmpdir, runs `pnpm dlx \@hex-core/...@latest` against the published
 * tarball on npm, and asserts the canonical adoption flow succeeds.
 *
 * - Serial execution: `pnpm install` and `pnpm dlx` are I/O-heavy and
 *   parallelizing them swamps the network + slows individual cases.
 * - 5-minute per-test timeout: heavy-peer installs (xterm@~150KB,
 *   mermaid@~700KB) plus the host's pnpm-install can blow past 60s.
 * - JSON reporter so `scripts/run.ts` can post-process pass/fail and
 *   build the findings doc.
 */
export default defineConfig({
	test: {
		testTimeout: 300_000,
		hookTimeout: 300_000,
		fileParallelism: false,
		pool: "forks",
		isolate: true,
		maxWorkers: 1,
		minWorkers: 1,
		reporters: process.env.REGRESSION_JSON
			? [["json", { outputFile: "test-results.json" }], "default"]
			: ["default"],
	},
});
