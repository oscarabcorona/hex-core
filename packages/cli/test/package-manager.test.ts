import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectPackageManager, filterMissingDeps, installArgv } from "../src/lib/package-manager.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-pm-test-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("detectPackageManager", () => {
	it("detects pnpm from pnpm-lock.yaml", () => {
		fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "");
		expect(detectPackageManager(tmpDir)).toBe("pnpm");
	});

	it("detects yarn from yarn.lock", () => {
		fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "");
		expect(detectPackageManager(tmpDir)).toBe("yarn");
	});

	it("detects bun from bun.lockb", () => {
		fs.writeFileSync(path.join(tmpDir, "bun.lockb"), "");
		expect(detectPackageManager(tmpDir)).toBe("bun");
	});

	it("detects bun from bun.lock (newer text format)", () => {
		fs.writeFileSync(path.join(tmpDir, "bun.lock"), "");
		expect(detectPackageManager(tmpDir)).toBe("bun");
	});

	it("detects npm from package-lock.json", () => {
		fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}");
		expect(detectPackageManager(tmpDir)).toBe("npm");
	});

	it("falls back to npm when no lockfile exists", () => {
		expect(detectPackageManager(tmpDir)).toBe("npm");
	});

	it("respects the documented precedence (pnpm > yarn > bun > npm)", () => {
		fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "");
		fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}");
		expect(detectPackageManager(tmpDir)).toBe("pnpm");
	});
});

describe("filterMissingDeps", () => {
	it("returns all candidates when package.json is absent", () => {
		expect(filterMissingDeps(tmpDir, ["clsx", "@radix-ui/react-dialog"])).toEqual([
			"clsx",
			"@radix-ui/react-dialog",
		]);
	});

	it("filters out deps already in dependencies", () => {
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ dependencies: { clsx: "^2" } }),
		);
		expect(filterMissingDeps(tmpDir, ["clsx", "tailwind-merge"])).toEqual(["tailwind-merge"]);
	});

	it("filters out deps already in devDependencies", () => {
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ devDependencies: { "tailwind-merge": "^2" } }),
		);
		expect(filterMissingDeps(tmpDir, ["clsx", "tailwind-merge"])).toEqual(["clsx"]);
	});

	it("handles scoped package names", () => {
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ dependencies: { "@radix-ui/react-dialog": "^1" } }),
		);
		expect(filterMissingDeps(tmpDir, ["@radix-ui/react-dialog", "@radix-ui/react-popover"])).toEqual([
			"@radix-ui/react-popover",
		]);
	});

	it("returns all candidates on malformed package.json", () => {
		fs.writeFileSync(path.join(tmpDir, "package.json"), "{ broken");
		expect(filterMissingDeps(tmpDir, ["clsx"])).toEqual(["clsx"]);
	});

	it("returns an empty array when every dep is present", () => {
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ dependencies: { clsx: "*", "tailwind-merge": "*" } }),
		);
		expect(filterMissingDeps(tmpDir, ["clsx", "tailwind-merge"])).toEqual([]);
	});
});

describe("installArgv", () => {
	it("uses 'add' for pnpm/yarn/bun and 'install' for npm", () => {
		expect(installArgv("pnpm", ["clsx"])).toEqual(["add", "clsx"]);
		expect(installArgv("yarn", ["clsx"])).toEqual(["add", "clsx"]);
		expect(installArgv("bun", ["clsx"])).toEqual(["add", "clsx"]);
		expect(installArgv("npm", ["clsx"])).toEqual(["install", "clsx"]);
	});

	it("passes through every package spec verbatim", () => {
		expect(installArgv("pnpm", ["clsx", "@radix-ui/react-dialog", "tailwind-merge"])).toEqual([
			"add",
			"clsx",
			"@radix-ui/react-dialog",
			"tailwind-merge",
		]);
	});
});
