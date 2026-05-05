import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { themeAdd } from "../src/commands/theme.js";
import { _resetAliasCacheForTests } from "../src/lib/resolve-alias.js";

let tmpDir: string;
let originalCwd: string;
let exitSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-theme-add-"));
	process.chdir(tmpDir);
	_resetAliasCacheForTests();
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	exitSpy.mockRestore();
	logSpy.mockRestore();
	warnSpy.mockRestore();
	errSpy.mockRestore();
	_resetAliasCacheForTests();
});

const STUDIO_URL =
	"https://www.hex-core.dev/studio?base=midnight&mode=light&radius=0.825&background_light=220+31%25+61%25";

describe("themeAdd", () => {
	it("writes a TypeScript theme file under themes/<slug>.ts at project root", async () => {
		await themeAdd({ slug: "midnight-custom", from: STUDIO_URL, overwrite: false });
		const target = path.join(tmpDir, "themes/midnight-custom.ts");
		expect(fs.existsSync(target)).toBe(true);
		const content = fs.readFileSync(target, "utf-8");
		expect(content).toContain("220 31% 61%");
		expect(content).toContain("0.825rem");
	});

	it("writes under src/themes/<slug>.ts when src/ layout is detected", async () => {
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		await themeAdd({ slug: "midnight-custom", from: STUDIO_URL, overwrite: false });
		expect(fs.existsSync(path.join(tmpDir, "src/themes/midnight-custom.ts"))).toBe(true);
	});

	it("rejects URLs whose base is not a known preset", async () => {
		const url =
			"https://www.hex-core.dev/studio?base=does-not-exist&primary_light=220+50%25+50%25";
		await expect(themeAdd({ slug: "x", from: url, overwrite: false })).rejects.toThrow(/exit/);
		expect(errSpy).toHaveBeenCalled();
	});

	it("refuses to overwrite an existing file without --overwrite", async () => {
		const target = path.join(tmpDir, "themes/midnight-custom.ts");
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, "// existing");
		await expect(
			themeAdd({ slug: "midnight-custom", from: STUDIO_URL, overwrite: false }),
		).rejects.toThrow(/exit/);
		expect(fs.readFileSync(target, "utf-8")).toBe("// existing");
	});

	it("replaces an existing file when --overwrite is set", async () => {
		const target = path.join(tmpDir, "themes/midnight-custom.ts");
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, "// existing");
		await themeAdd({ slug: "midnight-custom", from: STUDIO_URL, overwrite: true });
		expect(fs.readFileSync(target, "utf-8")).not.toBe("// existing");
	});

	it("emits a valid TS identifier for kebab-case slugs", async () => {
		await themeAdd({ slug: "midnight-custom", from: STUDIO_URL, overwrite: false });
		const content = fs.readFileSync(path.join(tmpDir, "themes/midnight-custom.ts"), "utf-8");
		// Hyphens would make the identifier invalid; the rendered export must camelCase.
		expect(content).toContain("export const midnightCustomTheme");
		expect(content).not.toMatch(/export const midnight-customTheme/);
	});
});
