import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectTailwind } from "../src/lib/detect-tailwind.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-detect-tailwind-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(deps: Record<string, string>, devDeps: Record<string, string> = {}) {
	fs.writeFileSync(
		path.join(tmpDir, "package.json"),
		JSON.stringify({ name: "test", dependencies: deps, devDependencies: devDeps }, null, 2),
	);
}

describe("detectTailwind", () => {
	it("returns missing when package.json is absent", () => {
		expect(detectTailwind(tmpDir).version).toBe("missing");
	});

	it("returns missing when tailwindcss is not in deps", () => {
		writePkg({ react: "^19" });
		expect(detectTailwind(tmpDir).version).toBe("missing");
	});

	it("returns missing on malformed package.json", () => {
		fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not json");
		expect(detectTailwind(tmpDir).version).toBe("missing");
	});

	it.each([
		["^4", "v4"],
		["^4.0.0", "v4"],
		["~4.1.5", "v4"],
		["4", "v4"],
		["4.0.0", "v4"],
		["4.x", "v4"],
		[">=4.0.0", "v4"],
		["next", "v4"],
		["latest", "v4"],
		["canary", "v4"],
	])("treats %s as v4", (range, expected) => {
		writePkg({ tailwindcss: range });
		expect(detectTailwind(tmpDir).version).toBe(expected);
	});

	it.each([
		["^3.4.0", "v3"],
		["~3.3", "v3"],
		["3", "v3"],
		["3.4.1", "v3"],
		["^3", "v3"],
	])("treats %s as v3", (range, expected) => {
		writePkg({ tailwindcss: range });
		expect(detectTailwind(tmpDir).version).toBe(expected);
	});

	it("falls back to devDependencies when not in dependencies", () => {
		writePkg({}, { tailwindcss: "^4" });
		expect(detectTailwind(tmpDir).version).toBe("v4");
	});

	it("returns the raw range string for messaging", () => {
		writePkg({ tailwindcss: "^4.1.5" });
		const result = detectTailwind(tmpDir);
		expect(result.rawRange).toBe("^4.1.5");
	});
});
