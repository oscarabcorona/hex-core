import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { walkSourceFiles } from "../src/lib/walk-sources.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-walk-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function touch(rel: string): void {
	const abs = path.join(tmpDir, rel);
	fs.mkdirSync(path.dirname(abs), { recursive: true });
	fs.writeFileSync(abs, "x");
}

describe("walkSourceFiles", () => {
	it("returns the files matching the requested extensions, recursively", () => {
		touch("a.tsx");
		touch("nested/b.ts");
		touch("nested/deep/c.tsx");
		touch("ignored.md");
		const files = walkSourceFiles(tmpDir, [".ts", ".tsx"]);
		expect(files.map((f) => path.relative(tmpDir, f)).sort()).toEqual([
			"a.tsx",
			"nested/b.ts",
			"nested/deep/c.tsx",
		]);
	});

	it("skips node_modules, dist, .next, .git, .turbo, and dotfile dirs", () => {
		touch("kept.ts");
		touch("node_modules/lib/index.ts");
		touch("dist/out.ts");
		touch(".next/server.ts");
		touch(".turbo/cache.ts");
		touch(".git/HEAD.ts");
		touch(".secret-dir/x.ts");
		const files = walkSourceFiles(tmpDir, [".ts"]);
		expect(files.map((f) => path.relative(tmpDir, f))).toEqual(["kept.ts"]);
	});

	it("returns an empty array when the root does not exist", () => {
		expect(walkSourceFiles(path.join(tmpDir, "missing"), [".ts"])).toEqual([]);
	});

	it("returns the file list in sorted order", () => {
		touch("z.tsx");
		touch("a.tsx");
		touch("m.tsx");
		const files = walkSourceFiles(tmpDir, [".tsx"]).map((f) => path.basename(f));
		expect(files).toEqual(["a.tsx", "m.tsx", "z.tsx"]);
	});
});
