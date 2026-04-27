import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initProject } from "../src/commands/init.js";

let tmpDir: string;
let originalCwd: string;
let exitSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-init-test-"));
	process.chdir(tmpDir);
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	exitSpy.mockRestore();
	logSpy.mockRestore();
	errSpy.mockRestore();
});

function writePkg(deps: Record<string, string>) {
	fs.writeFileSync(
		path.join(tmpDir, "package.json"),
		JSON.stringify({ name: "scratch", dependencies: deps }, null, 2),
	);
}

describe("init", () => {
	it("aborts with a clear message when tailwindcss is missing", async () => {
		writePkg({ react: "^19" });
		await expect(initProject({ theme: "default" })).rejects.toThrow(/process\.exit\(1\)/);
		const errOutput = errSpy.mock.calls.flat().join("\n");
		expect(errOutput).toMatch(/tailwindcss is not installed/);
	});

	it("v4 path: writes hex.config.json + app/globals.css with @import tailwindcss + @theme", async () => {
		writePkg({ tailwindcss: "^4" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		await initProject({ theme: "default" });

		expect(fs.existsSync(path.join(tmpDir, "hex.config.json"))).toBe(true);
		const cssPath = path.join(tmpDir, "app/globals.css");
		expect(fs.existsSync(cssPath)).toBe(true);
		const css = fs.readFileSync(cssPath, "utf8");
		expect(css).toContain(`@import "tailwindcss";`);
		expect(css).toContain(`@import "tw-animate-css";`);
		expect(css).toContain("@theme {");
		expect(css).toContain("--color-background: hsl(");

		// v4 must NOT generate tailwind.config.ts
		expect(fs.existsSync(path.join(tmpDir, "tailwind.config.ts"))).toBe(false);
	});

	it("v4 prints tw-animate-css in the peer-deps line", async () => {
		writePkg({ tailwindcss: "^4" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		await initProject({ theme: "default" });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("tw-animate-css");
		expect(stdout).not.toContain("tailwindcss-animate");
	});

	it("v3 path: writes globals.css with @tailwind base + tailwind.config.ts", async () => {
		writePkg({ tailwindcss: "^3.4.0" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		await initProject({ theme: "default" });

		const cssPath = path.join(tmpDir, "app/globals.css");
		const css = fs.readFileSync(cssPath, "utf8");
		expect(css).toContain("@tailwind base;");
		expect(css).toContain("@layer base {");
		expect(css).not.toContain(`@import "tailwindcss"`);

		const twConfigPath = path.join(tmpDir, "tailwind.config.ts");
		expect(fs.existsSync(twConfigPath)).toBe(true);
		const twConfig = fs.readFileSync(twConfigPath, "utf8");
		expect(twConfig).toContain(`import animate from "tailwindcss-animate";`);
		expect(twConfig).toContain(`darkMode: ["class"]`);
		expect(twConfig).toMatch(/"colors":\s*\{/);
	});

	it("v3 prints tailwindcss-animate in the peer-deps line", async () => {
		writePkg({ tailwindcss: "^3.4.0" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		await initProject({ theme: "default" });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("tailwindcss-animate");
		expect(stdout).not.toContain("tw-animate-css");
	});

	it("prefers src/app over app when both exist (matches Next's --src-dir flag)", async () => {
		writePkg({ tailwindcss: "^4" });
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		await initProject({ theme: "default" });
		expect(fs.existsSync(path.join(tmpDir, "src/app/globals.css"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "app/globals.css"))).toBe(false);
	});

	it("does not overwrite an existing globals.css unless --overwrite is set", async () => {
		writePkg({ tailwindcss: "^4" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		const cssPath = path.join(tmpDir, "app/globals.css");
		fs.writeFileSync(cssPath, "/* user content */");

		await initProject({ theme: "default" });
		expect(fs.readFileSync(cssPath, "utf8")).toBe("/* user content */");

		await initProject({ theme: "default", overwrite: true });
		expect(fs.readFileSync(cssPath, "utf8")).toContain(`@import "tailwindcss"`);
	});

	it("creates the app/ directory if neither app nor src/app exists yet", async () => {
		writePkg({ tailwindcss: "^4" });
		await initProject({ theme: "default" });
		expect(fs.existsSync(path.join(tmpDir, "app/globals.css"))).toBe(true);
	});

	it("rejects unknown theme presets with a clear message", async () => {
		writePkg({ tailwindcss: "^4" });
		fs.mkdirSync(path.join(tmpDir, "app"));
		await expect(initProject({ theme: "neon-bunny" as string })).rejects.toThrow(/process\.exit\(1\)/);
		const errOutput = errSpy.mock.calls.flat().join("\n");
		expect(errOutput).toMatch(/Unknown theme/);
	});
});
