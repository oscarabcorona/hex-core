/**
 * theme command unit tests.
 *
 * Each test runs in its own tmpdir so the working directory side-effects
 * of themeInit / themeEdit don't leak between tests. We also stub
 * process.exit so failure-path assertions don't actually kill the runner.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { themeApply, themeEdit, themeInit } from "../src/commands/theme.js";

let tmpDir: string;
let originalCwd: string;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-cli-test-"));
	process.chdir(tmpDir);
	// Make process.exit a no-op that throws so we can assert on it.
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	exitSpy.mockRestore();
});

describe("themeInit", () => {
	it("writes globals.css with the requested preset", async () => {
		await themeInit({ name: "midnight", out: "globals.css", format: "css", overwrite: false });
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		expect(content).toContain(":root");
		expect(content).toContain(".dark");
		expect(content).toContain("--background:");
		expect(content).toContain("--space-4:");
		expect(content).toContain("--control-height-md:");
	});

	it("writes JSON when format is json", async () => {
		await themeInit({ name: "default", out: "tokens.json", format: "json", overwrite: false });
		const raw = fs.readFileSync(path.join(tmpDir, "tokens.json"), "utf8");
		const parsed = JSON.parse(raw) as { name: string; light: Record<string, string>; dark: Record<string, string> };
		expect(parsed.name).toBe("default");
		expect(parsed.light["--background"]).toBeDefined();
		expect(parsed.dark["--background"]).toBeDefined();
	});

	it("rejects unknown presets", async () => {
		await expect(
			themeInit({ name: "haunted", out: "globals.css", format: "css", overwrite: false }),
		).rejects.toThrow(/process\.exit/);
	});

	it("refuses to overwrite an existing file without --overwrite", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), "existing content");
		await expect(
			themeInit({ name: "default", out: "globals.css", format: "css", overwrite: false }),
		).rejects.toThrow(/process\.exit/);
		expect(fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8")).toBe("existing content");
	});

	it("overwrites when --overwrite is passed", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), "existing content");
		await themeInit({ name: "default", out: "globals.css", format: "css", overwrite: true });
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		expect(content).not.toBe("existing content");
		expect(content).toContain(":root");
	});

	it("creates parent directories as needed", async () => {
		await themeInit({ name: "default", out: "src/styles/globals.css", format: "css", overwrite: false });
		const content = fs.readFileSync(path.join(tmpDir, "src/styles/globals.css"), "utf8");
		expect(content).toContain(":root");
	});
});

describe("themeEdit", () => {
	beforeEach(async () => {
		// Every edit test starts with a fresh globals.css scaffolded from default.
		await themeInit({ name: "default", out: "globals.css", format: "css", overwrite: false });
	});

	it("updates a token in both :root and .dark when mode=both", async () => {
		await themeEdit({
			file: "globals.css",
			tokens: ["primary=240 50% 50%"],
			mode: "both",
		});
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		// Find both :root and .dark sections
		const root = content.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
		const dark = content.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
		expect(root).toMatch(/--primary:\s*240 50% 50%;/);
		expect(dark).toMatch(/--primary:\s*240 50% 50%;/);
	});

	it("scopes update to :root when mode=light", async () => {
		await themeEdit({
			file: "globals.css",
			tokens: ["primary=240 50% 50%"],
			mode: "light",
		});
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		const root = content.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
		const dark = content.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
		expect(root).toMatch(/--primary:\s*240 50% 50%;/);
		// Dark should still have its original primary value (not the new one).
		expect(dark).not.toMatch(/--primary:\s*240 50% 50%;/);
	});

	it("does not modify other tokens", async () => {
		const before = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		const beforeBg = before.match(/:root\s*\{[\s\S]*?--background:\s*([^;]+);/)?.[1];
		await themeEdit({ file: "globals.css", tokens: ["primary=240 50% 50%"], mode: "both" });
		const after = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		const afterBg = after.match(/:root\s*\{[\s\S]*?--background:\s*([^;]+);/)?.[1];
		expect(afterBg).toBe(beforeBg);
	});

	it("supports multiple tokens in one call", async () => {
		await themeEdit({
			file: "globals.css",
			tokens: ["primary=240 50% 50%", "background=200 10% 95%"],
			mode: "light",
		});
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		const root = content.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
		expect(root).toMatch(/--primary:\s*240 50% 50%;/);
		expect(root).toMatch(/--background:\s*200 10% 95%;/);
	});

	it("rejects when the input file does not exist", async () => {
		fs.rmSync(path.join(tmpDir, "globals.css"));
		await expect(
			themeEdit({ file: "globals.css", tokens: ["primary=240 50% 50%"], mode: "both" }),
		).rejects.toThrow(/process\.exit/);
	});

	it("rejects when no tokens are passed", async () => {
		await expect(themeEdit({ file: "globals.css", tokens: [], mode: "both" })).rejects.toThrow(
			/process\.exit/,
		);
	});

	it("rejects malformed token strings missing the equals sign", async () => {
		await expect(
			themeEdit({ file: "globals.css", tokens: ["primary"], mode: "both" }),
		).rejects.toThrow(/process\.exit/);
	});

	it("strips surrounding quotes from values (LLMs sometimes paste with quotes)", async () => {
		await themeEdit({
			file: "globals.css",
			tokens: ['primary="240 50% 50%"'],
			mode: "light",
		});
		const content = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		const root = content.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
		expect(root).toMatch(/--primary:\s*240 50% 50%;/);
		// Should NOT have wrapping quotes in the output.
		expect(root).not.toMatch(/--primary:\s*"240/);
	});
});

describe("themeApply", () => {
	it("swaps tokens to the requested preset without touching the rest of globals.css", async () => {
		await themeInit({ name: "default", out: "globals.css", format: "css", overwrite: false });
		const before = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		// Add a custom rule the user might have written; themeApply must not touch it
		const userMarker = "\n/* user-custom — do not touch */\n.my-thing { color: red; }\n";
		fs.writeFileSync(path.join(tmpDir, "globals.css"), before + userMarker);

		await themeApply({ name: "midnight", file: "./globals.css" });
		const after = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");

		// User customization preserved
		expect(after).toContain(userMarker.trim());
		// :root and .dark blocks both updated to midnight values
		const rootBlock = after.match(/:root\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
		expect(rootBlock).toMatch(/--background:/);
		// Sentinel: midnight's :root --background differs from default's (different theme)
		const beforeRoot = before.match(/:root\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
		expect(rootBlock).not.toBe(beforeRoot);
	});

	it("rejects unknown preset names", async () => {
		await themeInit({ name: "default", out: "globals.css", format: "css", overwrite: false });
		await expect(themeApply({ name: "neon-bunny", file: "./globals.css" })).rejects.toThrow(/process\.exit\(1\)/);
	});

	it("aborts when the target globals.css is missing", async () => {
		await expect(themeApply({ name: "midnight", file: "./missing.css" })).rejects.toThrow(/process\.exit\(1\)/);
	});

	it("aborts when the file has no :root block at all", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), "/* no :root here */");
		await expect(themeApply({ name: "midnight", file: "./globals.css" })).rejects.toThrow(/process\.exit\(1\)/);
	});
});
