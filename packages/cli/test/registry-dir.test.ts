import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	buildRegistryCandidates,
	firstExistingPath,
} from "../src/lib/registry-dir.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-registry-dir-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("buildRegistryCandidates — priority order", () => {
	it("returns 5 candidates", () => {
		const candidates = buildRegistryCandidates("/pkg/dist", "/some/cwd");
		expect(candidates).toHaveLength(5);
	});

	it("from /pkg/dist (canonical published-tarball layout), slot 0 hits the bundled registry", () => {
		// dist/index.js → ../registry resolves to <pkg>/registry, which is
		// where the prebuild script copies the registry inside the tarball.
		// If this priority slips, npx consumers regress to the pre-PR-88 bug.
		const [first] = buildRegistryCandidates("/pkg/dist", "/some/cwd");
		expect(first).toBe("/pkg/registry");
	});

	it("from /pkg/dist/cjs (deeper bundled layout), slot 1 hits the bundled registry", () => {
		const candidates = buildRegistryCandidates("/pkg/dist/cjs", "/some/cwd");
		expect(candidates[1]).toBe("/pkg/registry");
	});

	it("from /repo/packages/cli/src/lib (monorepo dev), slot 2 hits the repo-root registry", () => {
		const candidates = buildRegistryCandidates("/repo/packages/cli/src/lib", "/repo/scratch");
		expect(candidates[2]).toBe("/repo/registry");
	});

	it("from /repo/packages/cli/src (tsx-from-src), slot 3 hits the repo-root registry", () => {
		const candidates = buildRegistryCandidates("/repo/packages/cli/src", "/repo/scratch");
		expect(candidates[3]).toBe("/repo/registry");
	});

	it("slot 4 is always cwd/registry (consumer mirror, last resort)", () => {
		const candidates = buildRegistryCandidates("/pkg/dist", "/consumer/app");
		expect(candidates[4]).toBe("/consumer/app/registry");
	});
});

describe("firstExistingPath", () => {
	it("returns null when none of the candidates exist", () => {
		const result = firstExistingPath([
			path.join(tmpDir, "a"),
			path.join(tmpDir, "b"),
		]);
		expect(result).toBeNull();
	});

	it("returns the first candidate that exists, even when later ones also exist", () => {
		const first = path.join(tmpDir, "first");
		const second = path.join(tmpDir, "second");
		fs.mkdirSync(first);
		fs.mkdirSync(second);
		expect(firstExistingPath([first, second])).toBe(first);
	});

	it("skips missing candidates and lands on the first existing one", () => {
		const second = path.join(tmpDir, "second");
		fs.mkdirSync(second);
		expect(firstExistingPath([path.join(tmpDir, "missing"), second])).toBe(second);
	});

	it("returns the bundled path when only the bundled and cwd candidates exist (npm install case)", () => {
		// Simulates the published-tarball install: bundled wins over the
		// consumer's empty cwd.
		const bundled = path.join(tmpDir, "pkg-registry");
		const cwd = path.join(tmpDir, "consumer-registry");
		fs.mkdirSync(bundled);
		fs.mkdirSync(cwd);
		expect(firstExistingPath([bundled, cwd])).toBe(bundled);
	});
});
