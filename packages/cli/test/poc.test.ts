import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPoc } from "../src/commands/poc.js";

let tmpDir: string;
let originalCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-poc-"));
	process.chdir(tmpDir);
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	logSpy.mockRestore();
	errSpy.mockRestore();
	exitSpy.mockRestore();
});

/** Read a file from the scaffolded app. */
function readOut(dir: string, rel: string): string {
	return fs.readFileSync(path.join(tmpDir, dir, rel), "utf-8");
}

/** Recursively list every file under a directory, relative paths sorted. */
function listFiles(root: string, prefix = ""): string[] {
	const out: string[] = [];
	for (const entry of fs.readdirSync(path.join(tmpDir, root, prefix), { withFileTypes: true })) {
		const rel = path.join(prefix, entry.name);
		if (entry.isDirectory()) out.push(...listFiles(root, rel));
		else out.push(rel);
	}
	return out.sort();
}

describe("hex poc", () => {
	it("requires exactly one source (brief | --from | --recipe)", async () => {
		await expect(
			createPoc(undefined, { dir: "demo", yes: true, dryRun: false }),
		).rejects.toThrow(/exit/);
		await expect(
			createPoc("a brief", { dir: "demo", yes: true, dryRun: false, recipe: "landing-page" }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("exactly one");
	});

	it("dry-run prints the plan and writes nothing", async () => {
		await createPoc("landing page", { dir: "demo", yes: false, dryRun: true });
		expect(fs.existsSync(path.join(tmpDir, "demo"))).toBe(false);
		expect(logSpy.mock.calls.flat().join("\n")).toContain("Would write:");
	});

	it("gates on confirmation without --yes", async () => {
		await createPoc("landing page", { dir: "demo", yes: false, dryRun: false });
		expect(fs.existsSync(path.join(tmpDir, "demo"))).toBe(false);
		expect(logSpy.mock.calls.flat().join("\n")).toContain("--yes");
	});

	it("scaffolds a complete app from a brief", async () => {
		await createPoc("landing page", { dir: "demo", yes: true, dryRun: false, name: "demo" });

		const pkg = JSON.parse(readOut("demo", "package.json")) as {
			name: string;
			dependencies: Record<string, string>;
		};
		expect(pkg.name).toBe("demo");
		expect(pkg.dependencies.next).toBeDefined();

		const page = readOut("demo", "app/landing/page.tsx");
		expect(page).toContain('from "@/components/ui/marketing-hero"');
		expect(page).not.toContain("@hex-core/components");

		expect(fs.existsSync(path.join(tmpDir, "demo/components/ui/marketing-hero.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "demo/lib/utils.ts"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "demo/hex.map.json"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "demo/app/globals.css"))).toBe(true);
	});

	it("is byte-deterministic for a fixed app name", async () => {
		await createPoc("landing page", { dir: "a", yes: true, dryRun: false, name: "fixed" });
		await createPoc("landing page", { dir: "b", yes: true, dryRun: false, name: "fixed" });
		const filesA = listFiles("a");
		expect(filesA).toEqual(listFiles("b"));
		for (const rel of filesA) {
			expect(readOut("a", rel)).toBe(readOut("b", rel));
		}
	});

	it("scaffolds from --recipe without scoring", async () => {
		await createPoc(undefined, { dir: "demo", yes: true, dryRun: false, recipe: "pricing-page", name: "demo" });
		expect(fs.existsSync(path.join(tmpDir, "demo/app/pricing/page.tsx"))).toBe(true);
	});

	it("scaffolds from a hex.map.json written by hex map", async () => {
		// A map file round-trips: schema-validate on read, same scaffold out.
		await createPoc("landing page", { dir: "first", yes: true, dryRun: false, name: "fixed" });
		fs.copyFileSync(path.join(tmpDir, "first/hex.map.json"), path.join(tmpDir, "hex.map.json"));
		await createPoc(undefined, { dir: "second", yes: true, dryRun: false, from: "hex.map.json", name: "fixed" });
		expect(readOut("second", "app/landing/page.tsx")).toBe(readOut("first", "app/landing/page.tsx"));
	});

	it("refuses a non-empty --dir without --yes", async () => {
		fs.mkdirSync(path.join(tmpDir, "demo"));
		fs.writeFileSync(path.join(tmpDir, "demo/existing.txt"), "keep me");
		await expect(createPoc("landing page", { dir: "demo", yes: false, dryRun: false })).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("not empty");
	});

	it("refuses to write a file whose path escapes the target dir", async () => {
		// The guard's real job is registry-sourced paths (item.files[].path),
		// which mapSchema never sees — so exercise the guard itself rather
		// than the schema in front of it.
		const { findEscapingPaths } = await import("../src/commands/poc.js");
		const target = path.join(tmpDir, "demo");
		expect(
			findEscapingPaths(target, [
				{ path: "app/page.tsx" },
				{ path: "components/ui/button.tsx" },
			]),
		).toEqual([]);
		expect(
			findEscapingPaths(target, [
				{ path: "../../escaped.txt" },
				{ path: "app/page.tsx" },
				{ path: "../sibling/evil.tsx" },
			]),
		).toEqual(["../../escaped.txt", "../sibling/evil.tsx"]);
		// A sibling dir sharing the prefix must not pass (demo vs demo-evil).
		expect(findEscapingPaths(target, [{ path: "../demo-evil/x.txt" }])).toEqual([
			"../demo-evil/x.txt",
		]);
	});

	it("errors on malformed map files", async () => {
		fs.writeFileSync(path.join(tmpDir, "bad.json"), JSON.stringify({ screens: "nope" }));
		await expect(
			createPoc(undefined, { dir: "demo", yes: true, dryRun: false, from: "bad.json" }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("malformed");
	});

	it("rejects a map whose screen id attempts path traversal", async () => {
		// Regression for the hostile-map write path: ../-shaped ids must die
		// at schema validation, never reach the file writer.
		await createPoc("landing page", { dir: "seed", yes: true, dryRun: false, name: "seed" });
		const map = JSON.parse(readOut("seed", "hex.map.json")) as { screens: Array<{ id: string }> };
		map.screens[0].id = "../../evil";
		fs.writeFileSync(path.join(tmpDir, "evil.json"), JSON.stringify(map));
		await expect(
			createPoc(undefined, { dir: "demo", yes: true, dryRun: false, from: "evil.json" }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("malformed");
		expect(fs.existsSync(path.join(tmpDir, "evil"))).toBe(false);
	});

	it("errors when the brief maps to nothing", async () => {
		await expect(
			createPoc("qwzx florble grumpet", { dir: "demo", yes: true, dryRun: false }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("no screens");
	});
});
