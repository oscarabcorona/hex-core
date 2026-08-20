import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mapApplication } from "../src/commands/map.js";

let tmpDir: string;
let originalCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-map-"));
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

/** Concatenate every console.log call into one string. */
function logged(): string {
	return logSpy.mock.calls.flat().join("\n");
}

describe("hex map", () => {
	it("emits parseable map JSON on --json with nothing else on stdout", async () => {
		await mapApplication("landing page with pricing page", { json: true, yes: false });
		expect(logSpy).toHaveBeenCalledTimes(1);
		const map = JSON.parse(String(logSpy.mock.calls[0][0])) as {
			screens: Array<{ recipe?: string }>;
			install: { components: string[] };
		};
		const recipes = map.screens.map((s) => s.recipe);
		expect(recipes).toContain("landing-page");
		expect(recipes).toContain("pricing-page");
		expect(map.install.components).toContain("marketing-hero");
	});

	it("is deterministic across runs", async () => {
		await mapApplication("landing page with pricing page", { json: true, yes: false });
		const first = String(logSpy.mock.calls[0][0]);
		logSpy.mockClear();
		await mapApplication("landing page with pricing page", { json: true, yes: false });
		expect(String(logSpy.mock.calls[0][0])).toBe(first);
	});

	it("writes a valid map file with --out and refuses to overwrite without --yes", async () => {
		await mapApplication("landing page", { json: false, yes: false, out: "hex.map.json" });
		const raw = JSON.parse(fs.readFileSync(path.join(tmpDir, "hex.map.json"), "utf-8")) as {
			version: number;
			screens: unknown[];
		};
		expect(raw.version).toBe(1);
		expect(raw.screens.length).toBeGreaterThan(0);

		await expect(
			mapApplication("landing page", { json: false, yes: false, out: "hex.map.json" }),
		).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("--yes");

		// With --yes the overwrite goes through.
		await mapApplication("landing page", { json: false, yes: true, out: "hex.map.json" });
	});

	it("reads the brief from --spec and rejects brief+spec together", async () => {
		fs.writeFileSync(path.join(tmpDir, "brief.md"), "kanban board with drag and drop columns\n");
		await mapApplication(undefined, { json: true, yes: false, spec: "brief.md" });
		const map = JSON.parse(String(logSpy.mock.calls[0][0])) as { screens: Array<{ recipe?: string }> };
		expect(map.screens[0]?.recipe).toBe("kanban-board");

		await expect(
			mapApplication("also a brief", { json: true, yes: false, spec: "brief.md" }),
		).rejects.toThrow(/exit/);
	});

	it("errors when no brief is given", async () => {
		await expect(mapApplication(undefined, { json: false, yes: false })).rejects.toThrow(/exit/);
		expect(errSpy.mock.calls.flat().join("\n")).toContain("Pass a brief");
	});

	it("reports unmatched segments in the human rendering", async () => {
		await mapApplication("landing page. qwzx florble grumpet", { json: false, yes: false });
		expect(logged()).toContain("Unmatched segment");
	});
});
