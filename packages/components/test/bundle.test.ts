import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classifySources, hasUseClientDirective } from "../scripts/_client-patterns.mjs";

/**
 * Bundle-shape tests for the per-component split (1.4.0+).
 *
 * The previous version of this file kept hand-curated `RSC_SAFE` and
 * `CLIENT_ONLY` lists. Stepper + TimePicker silently slipped through
 * because the lists weren't auto-derived. This rewrite uses the same
 * `_client-patterns.mjs` classifier the inject script uses, so any new
 * component (or any tightening of the heuristic) is checked end-to-end
 * with no test edits required.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "../dist");
const srcDir = path.resolve(here, "../src");

function read(file: string): string {
	return fs.readFileSync(path.join(distDir, file), "utf8");
}

const sourceClassification = classifySources(srcDir);

const expectedClient: string[] = [];
const expectedServer: string[] = [];
for (const [rel, kind] of Object.entries(sourceClassification)) {
	const base = path.basename(rel, path.extname(rel));
	const distFile = `${base}.js`;
	if (kind === "client") expectedClient.push(distFile);
	else expectedServer.push(distFile);
}

describe("dist bundle shape", () => {
	it("emits one entry per component (.js + .d.ts)", () => {
		for (const file of [...expectedClient, ...expectedServer]) {
			expect(fs.existsSync(path.join(distDir, file)), `missing ${file}`).toBe(true);
			expect(
				fs.existsSync(path.join(distDir, file.replace(/\.js$/, ".d.ts"))),
				`missing types for ${file}`,
			).toBe(true);
		}
	});

	it("RSC-safe components ship without a 'use client' directive", () => {
		const offenders = expectedServer.filter((file) => hasUseClientDirective(read(file)));
		expect(offenders, `dist files marked client when source is server-safe: ${offenders.join(", ")}`).toEqual([]);
	});

	it("RSC-safe dist files do not import @radix-ui packages transitively", () => {
		// Source-level classifier marks files based on what the SOURCE
		// imports, but `splitting: false` can pull a Radix-using module
		// in via a shared variant or helper. Pagination + buttonVariants
		// was the canonical regression — variants live in their own file
		// now. This guard catches any future analog.
		const offenders = expectedServer.filter((file) => /from ['"]@radix-ui\//.test(read(file)));
		expect(
			offenders,
			`server-safe dist files leak Radix imports (will fail in Next.js RSC): ${offenders.join(", ")}`,
		).toEqual([]);
	});

	it("client-only components ship with a 'use client' directive", () => {
		const offenders = expectedClient.filter((file) => !hasUseClientDirective(read(file)));
		expect(offenders, `dist files missing required "use client": ${offenders.join(", ")}`).toEqual([]);
	});

	it("barrel index is marked client (compatibility path)", () => {
		expect(hasUseClientDirective(read("index.js"))).toBe(true);
	});

	it("schemas entry exposes the typed manifest", () => {
		expect(fs.existsSync(path.join(distDir, "schemas.js"))).toBe(true);
		expect(fs.existsSync(path.join(distDir, "schemas.d.ts"))).toBe(true);
		// Spot-check that representative schemas survive the move and the
		// types still resolve via @hex-core/registry. If a future change
		// removes the registry coupling at the type level (e.g. inlining
		// ComponentSchemaDefinition) update this test alongside the change.
		const schemasDts = read("schemas.d.ts");
		expect(schemasDts).toMatch(/buttonSchema/);
		expect(schemasDts).toMatch(/cardSchema/);
		expect(schemasDts).toMatch(/dialogSchema/);
	});

	it("per-component bundles stay under 20KB raw (with markdown exception)", () => {
		// 20KB default cap — current largest non-markdown is ~12KB
		// (combobox/command). Catches accidental imports of large
		// transitive libs.
		//
		// 32KB markdown exception — markdown.js inlines closeUnterminated +
		// remarkAdmonitions + 5 slot renderers (InlineCitation/Sources/
		// ToolCall/Reasoning routing + the inline-code path) into a single
		// self-contained file so the registry CLI distribution path ships
		// one file. If a 6th slot lands, prefer extracting the slots into a
		// `slots/` subdir + restoring the 20KB default rather than bumping
		// this further.
		const PER_COMPONENT_LIMIT = 20 * 1024;
		const MARKDOWN_LIMIT = 32 * 1024;
		const all = fs
			.readdirSync(distDir)
			.filter((f) => f.endsWith(".js") && f !== "index.js" && f !== "schemas.js");
		for (const file of all) {
			const size = fs.statSync(path.join(distDir, file)).size;
			const limit = file === "markdown.js" ? MARKDOWN_LIMIT : PER_COMPONENT_LIMIT;
			expect(size, `${file} grew past ${limit / 1024}KB raw (${size} bytes)`).toBeLessThan(limit);
		}
	});

	it("does not import @hex-core/registry at runtime", () => {
		const allJs = fs.readdirSync(distDir).filter((f) => f.endsWith(".js"));
		const offenders: string[] = [];
		for (const file of allJs) {
			if (read(file).includes("@hex-core/registry")) offenders.push(file);
		}
		expect(offenders, `registry must not appear in runtime JS: ${offenders.join(", ")}`).toEqual([]);
	});

	it("barrel index.d.ts no longer pulls in @hex-core/registry", () => {
		// After moving schema re-exports out of the barrel, the public
		// type surface should be free of the registry dependency. Schema
		// consumers explicitly use `@hex-core/components/schemas`.
		const barrelDts = read("index.d.ts");
		expect(barrelDts).not.toContain("@hex-core/registry");
	});
});
