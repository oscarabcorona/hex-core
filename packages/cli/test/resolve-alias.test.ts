import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { _resetAliasCacheForTests, detectSrcLayout, resolveAlias } from "../src/lib/resolve-alias.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-resolve-alias-"));
	_resetAliasCacheForTests();
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
	_resetAliasCacheForTests();
});

function writeTsconfig(content: object): void {
	fs.writeFileSync(path.join(tmpDir, "tsconfig.json"), JSON.stringify(content));
}

describe("resolveAlias", () => {
	it("`./foo` is returned as cwd-relative", () => {
		expect(resolveAlias(tmpDir, "./components")).toBe(path.join(tmpDir, "components"));
	});

	it("absolute paths are returned literally", () => {
		expect(resolveAlias(tmpDir, "/abs/path")).toBe("/abs/path");
	});

	it("`@/foo` falls back to cwd when no tsconfig and no src/ layout", () => {
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "components"));
	});

	it("`@/foo` resolves through `src/` heuristic when src/app exists but no tsconfig", () => {
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "src", "components"));
	});

	it("`@/foo` honors tsconfig.compilerOptions.paths['@/*'] = ['./src/*']", () => {
		writeTsconfig({ compilerOptions: { paths: { "@/*": ["./src/*"] } } });
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "src", "components"));
	});

	it("`@/foo` honors a tsconfig that maps `@/*` to a non-src directory", () => {
		writeTsconfig({ compilerOptions: { paths: { "@/*": ["./app/*"] } } });
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "app", "components"));
	});

	it("tolerates JSONC comments and trailing commas in tsconfig.json", () => {
		fs.writeFileSync(
			path.join(tmpDir, "tsconfig.json"),
			`// top-level comment
			{
				"compilerOptions": {
					"paths": {
						"@/*": ["./src/*"], // trailing comma below
					},
				},
			}`,
		);
		expect(resolveAlias(tmpDir, "@/lib")).toBe(path.join(tmpDir, "src", "lib"));
	});

	it("follows tsconfig#extends to inherit paths", () => {
		fs.mkdirSync(path.join(tmpDir, "config"), { recursive: true });
		fs.writeFileSync(
			path.join(tmpDir, "config/base.json"),
			JSON.stringify({ compilerOptions: { paths: { "@/*": ["../src/*"] } } }),
		);
		writeTsconfig({ extends: "./config/base.json" });
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "src", "components"));
	});

	it("multi-target paths prefer the first target whose directory exists", () => {
		writeTsconfig({ compilerOptions: { paths: { "@/*": ["./src/*", "./*"] } } });
		// Neither src/ nor anything else exists → falls through to first valid target = src.
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "src", "components"));
		_resetAliasCacheForTests();
		// Make ./components/ exist but not ./src/components/. The first listed
		// target (./src/*) takes precedence because its dir doesn't exist
		// either, but the resolver still picks the first valid mapping.
		// (The behavior to lock in: ordering wins when nothing exists.)
		fs.mkdirSync(path.join(tmpDir, "components"), { recursive: true });
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "src", "components"));
	});

	it("multi-target paths skip a leading non-existent target when a later one exists", () => {
		fs.mkdirSync(path.join(tmpDir, "app/components"), { recursive: true });
		writeTsconfig({ compilerOptions: { paths: { "@/*": ["./src/*", "./app/*"] } } });
		// src/ doesn't exist, app/ does → resolver picks app/.
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "app", "components"));
	});

	it("child tsconfig wins over inherited paths", () => {
		fs.mkdirSync(path.join(tmpDir, "config"), { recursive: true });
		fs.writeFileSync(
			path.join(tmpDir, "config/base.json"),
			JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
		);
		writeTsconfig({
			extends: "./config/base.json",
			compilerOptions: { paths: { "@/*": ["./app/*"] } },
		});
		expect(resolveAlias(tmpDir, "@/components")).toBe(path.join(tmpDir, "app", "components"));
	});
});

describe("detectSrcLayout", () => {
	it("returns false on empty cwd", () => {
		expect(detectSrcLayout(tmpDir)).toBe(false);
	});

	it("returns true when src/app exists", () => {
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		expect(detectSrcLayout(tmpDir)).toBe(true);
	});

	it("returns true when src/components exists (Vite-style projects)", () => {
		fs.mkdirSync(path.join(tmpDir, "src/components"), { recursive: true });
		expect(detectSrcLayout(tmpDir)).toBe(true);
	});
});
