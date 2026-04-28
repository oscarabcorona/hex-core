/**
 * Registry-loader candidate-path priority tests. Runs as a standalone node
 * script via `pnpm -F @hex-core/payload test:registry-loader`. Pure — no
 * test runner dependency.
 *
 * The candidate ordering is the contract that lets the bundled-tarball
 * `<pkg>/registry` win over monorepo-dev / cwd-mirror fallbacks. The
 * original PR #88 install bug ("Could not find registry") regresses if
 * this priority slips, so every slot is asserted here.
 *
 * All output writes to stderr; exit code is the contract (0 = pass).
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildRegistryCandidates, firstExistingPath } from "./registry-loader.js";

interface Case {
	name: string;
	run: () => void;
}

const CASES: Case[] = [
	{
		name: "buildRegistryCandidates returns 5 candidates",
		run: () => {
			const candidates = buildRegistryCandidates("/pkg/dist", "/some/cwd");
			assertEqual(candidates.length, 5, "candidate count");
		},
	},
	{
		name: "from /pkg/dist (canonical bundled layout), slot 0 is /pkg/registry",
		run: () => {
			const [first] = buildRegistryCandidates("/pkg/dist", "/cwd");
			assertEqual(first, "/pkg/registry", "slot 0 from canonical dist");
		},
	},
	{
		name: "from /pkg/dist/cjs (deeper bundled layout), slot 1 is /pkg/registry",
		run: () => {
			const candidates = buildRegistryCandidates("/pkg/dist/cjs", "/cwd");
			assertEqual(candidates[1], "/pkg/registry", "slot 1 from deeper dist");
		},
	},
	{
		name: "from /repo/packages/payload/src/loaders (monorepo dev), slot 2 is /repo/registry",
		run: () => {
			const candidates = buildRegistryCandidates("/repo/packages/payload/src/loaders", "/repo/scratch");
			assertEqual(candidates[2], "/repo/registry", "slot 2 from monorepo dev");
		},
	},
	{
		name: "from /repo/packages/payload/src (tsx-from-src), slot 3 is /repo/registry",
		run: () => {
			const candidates = buildRegistryCandidates("/repo/packages/payload/src", "/repo/scratch");
			assertEqual(candidates[3], "/repo/registry", "slot 3 from tsx-from-src");
		},
	},
	{
		name: "slot 4 is always cwd/registry (consumer mirror, last resort)",
		run: () => {
			const candidates = buildRegistryCandidates("/pkg/dist", "/consumer/app");
			assertEqual(candidates[4], "/consumer/app/registry", "slot 4 cwd-relative");
		},
	},
	{
		name: "firstExistingPath returns null when no candidate exists",
		run: () => {
			const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hex-payload-loader-"));
			try {
				const result = firstExistingPath([path.join(tmp, "a"), path.join(tmp, "b")]);
				assertEqual(result, null, "all-missing returns null");
			} finally {
				fs.rmSync(tmp, { recursive: true, force: true });
			}
		},
	},
	{
		name: "firstExistingPath picks the first hit when later candidates also exist (bundled wins over cwd)",
		run: () => {
			const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hex-payload-loader-"));
			try {
				const bundled = path.join(tmp, "pkg-registry");
				const cwd = path.join(tmp, "consumer-registry");
				fs.mkdirSync(bundled);
				fs.mkdirSync(cwd);
				assertEqual(firstExistingPath([bundled, cwd]), bundled, "bundled wins");
			} finally {
				fs.rmSync(tmp, { recursive: true, force: true });
			}
		},
	},
	{
		name: "firstExistingPath skips missing candidates and lands on the first existing",
		run: () => {
			const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hex-payload-loader-"));
			try {
				const second = path.join(tmp, "second");
				fs.mkdirSync(second);
				assertEqual(firstExistingPath([path.join(tmp, "missing"), second]), second, "skip-missing");
			} finally {
				fs.rmSync(tmp, { recursive: true, force: true });
			}
		},
	},
];

function assertEqual<T>(actual: T, expected: T, label: string) {
	if (actual !== expected) {
		throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}

let failed = 0;
for (const c of CASES) {
	try {
		c.run();
		process.stderr.write(`  ✓ ${c.name}\n`);
	} catch (err) {
		failed++;
		process.stderr.write(`  ✗ ${c.name}\n    ${(err as Error).message}\n`);
	}
}
process.stderr.write(`\nregistry-loader: ${failed === 0 ? `${CASES.length} cases passed` : `${failed} of ${CASES.length} failed`}\n`);
process.exit(failed === 0 ? 0 : 1);
