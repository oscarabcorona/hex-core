import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addComponents } from "../src/commands/add.js";

let tmpDir: string;
let originalCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-add-test-"));
	process.chdir(tmpDir);
	// Skeleton hex.config.json so add doesn't need to walk to the real one.
	fs.writeFileSync(
		path.join(tmpDir, "hex.config.json"),
		JSON.stringify({ aliases: { components: "@/components", lib: "@/lib" } }),
	);
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	logSpy.mockRestore();
});

/**
 * Uses the real registry (resolved by findRegistryDir) and the real `button`
 * + `input` items. The shared lib/utils.ts they both reference is what we're
 * exercising — the registry contract guarantees these items always ship it.
 */
describe("addComponents — shared lib file behavior", () => {
	it("first add writes lib files alongside the component", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "lib/utils.ts"))).toBe(true);
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("Write: lib/utils.ts");
	});

	it("second add silently skips existing lib files — no `Skip: lib/...` log line", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		logSpy.mockClear();
		await addComponents(["input"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toMatch(/Skip: lib\/utils\.ts/);
		// The component file IS written in the second pass
		expect(fs.existsSync(path.join(tmpDir, "components/ui/input.tsx"))).toBe(true);
	});

	it("preserves the existing lib/utils.ts content on the silent skip", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		// Tamper with the file to simulate a user customization
		const customized = "// custom marker\nexport const cn = () => 'custom';\n";
		fs.writeFileSync(path.join(tmpDir, "lib/utils.ts"), customized);
		await addComponents(["input"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.readFileSync(path.join(tmpDir, "lib/utils.ts"), "utf-8")).toBe(customized);
	});

	it("with --overwrite, lib files ARE replaced", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		fs.writeFileSync(path.join(tmpDir, "lib/utils.ts"), "// stale\n");
		await addComponents(["input"], { yes: false, overwrite: true, deps: false, install: false });
		const after = fs.readFileSync(path.join(tmpDir, "lib/utils.ts"), "utf-8");
		expect(after).not.toBe("// stale\n");
		expect(after).toContain("twMerge"); // sentinel from the real registry's lib/utils.ts
	});

	it("component files keep the loud `use --overwrite` hint", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		logSpy.mockClear();
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Skip: components\/ui\/button\.tsx \(already exists, use --overwrite\)/);
	});
});
