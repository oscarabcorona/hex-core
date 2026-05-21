import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addComponents } from "../src/commands/add.js";
import { _resetAliasCacheForTests } from "../src/lib/resolve-alias.js";

let tmpDir: string;
let originalCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-add-test-"));
	process.chdir(tmpDir);
	_resetAliasCacheForTests();
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
	_resetAliasCacheForTests();
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
});

/**
 * Heavy-peer aggregation across multiple components in a single `hex add`
 * invocation. Uses the real `terminal` (xterm peer), `diagram` (mermaid),
 * and the audio-* pair (shared wavesurfer.js peer) to exercise the
 * dedupe + requiredBy accumulation path. Runs with `install: false` so
 * the prompt+install branch isn't reached — the manual-install branch
 * prints all the same data the prompt would.
 */
describe("addComponents — heavy peer aggregation", () => {
	it("collects a single heavy peer from one component (--no-install path)", async () => {
		await addComponents(["terminal"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("heavy peer dependencies were skipped");
		expect(stdout).toContain("@xterm/xterm@^5.5.0");
		expect(stdout).toContain("~150 KB gzip");
		// And the component source still landed.
		expect(fs.existsSync(path.join(tmpDir, "components/ui/terminal.tsx"))).toBe(true);
	});

	it("dedupes shared heavy peer across multiple components (audio-player + audio-waveform → one wavesurfer.js entry)", async () => {
		await addComponents(["audio-player", "audio-waveform"], {
			yes: false,
			overwrite: false,
			deps: false,
			install: false,
		});
		const stdout = logSpy.mock.calls.flat().join("\n");
		// One line in the bullet list (carries the "~50 KB gzip" tag) PLUS
		// the line in the "Run yourself: …" install command. Filter the
		// disclosure list to the size-tagged bullet.
		const disclosureLines = stdout
			.split("\n")
			.filter((line) => line.includes("wavesurfer.js") && line.includes("KB gzip"));
		expect(disclosureLines).toHaveLength(1);
		expect(disclosureLines[0]).toContain("~50 KB gzip");
	});

	it("aggregates DIFFERENT heavy peers across components (terminal + diagram → xterm + mermaid)", async () => {
		await addComponents(["terminal", "diagram"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("@xterm/xterm@^5.5.0");
		expect(stdout).toContain("mermaid@^11.0.0");
		// Manual install command lists both peers.
		expect(stdout).toMatch(/Run yourself: \w+ (?:add|install) .*@xterm\/xterm.*mermaid/);
	});

	it("does NOT prompt or print heavy-peer messages for components without a heavy peer", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toContain("heavy peer dependencies");
		expect(stdout).not.toContain("Install now?");
	});

	it("hex add sonner prints a Toaster mount reminder at the end", async () => {
		await addComponents(["sonner"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("Next steps:");
		expect(stdout).toContain("<Toaster />");
		expect(stdout).toContain("@/components/ui/sonner");
		expect(stdout).toMatch(/app\/layout\.tsx/);
	});

	it("hex add of a component WITHOUT a hint does not print Next steps", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toContain("Next steps:");
	});

	it("component files keep the loud `use --overwrite` hint", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		logSpy.mockClear();
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Skip: components\/ui\/button\.tsx \(already exists, use --overwrite\)/);
	});
});

describe("addComponents — onboarding nudges", () => {
	it("prints the `Related primitives` line for `hex add card`", async () => {
		await addComponents(["card"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("Related primitives you might want next:");
		// `card`'s schema lists button/separator/container/stack — at least one must surface.
		expect(stdout).toMatch(/hex add .*\b(button|separator|container|stack)\b/);
	});

	it("does NOT include slugs that are already in this run", async () => {
		await addComponents(["card", "button", "separator"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		const line = stdout.split("\n").find((l) => l.startsWith("  hex add "));
		// Even if the related line prints, button/separator are this-run — must not echo back.
		if (line) {
			expect(line).not.toMatch(/\bbutton\b/);
			expect(line).not.toMatch(/\bseparator\b/);
		}
	});

	it("prints the layout-pack nudge when ≥3 primitives install without any layout primitive", async () => {
		await addComponents(["button", "input", "label"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/no layout primitives/);
		expect(stdout).toContain("hex add --pack layout");
	});

	it("does NOT print the layout-pack nudge when at least one layout primitive is in the run", async () => {
		await addComponents(["button", "input", "stack"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toContain("hex add --pack layout");
	});

	it("does NOT print the layout-pack nudge when a layout primitive is already on disk", async () => {
		// Pre-stage a stack.tsx so the consumer "has layout" before this run.
		fs.mkdirSync(path.join(tmpDir, "components/ui"), { recursive: true });
		fs.writeFileSync(path.join(tmpDir, "components/ui/stack.tsx"), "export const Stack = null;");
		await addComponents(["button", "input", "label"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toContain("hex add --pack layout");
	});

	it("does NOT print the layout-pack nudge for a single-component run (< 3 primitives)", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).not.toContain("hex add --pack layout");
	});
});

/**
 * Alias-aware write-path resolution. The @hex-core/cli@0.4.0 reviewer
 * found components landing in `<cwd>/components/ui/` regardless of
 * `tsconfig.json#paths` or `--src-dir` Next.js layout. These tests
 * lock in the fix for v0.5.0.
 */
describe("addComponents — alias-aware write paths", () => {
	it("writes to <cwd>/components/ui when no src/ layout exists (regression baseline)", async () => {
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx"))).toBe(false);
	});

	it("writes to src/components/ui when src/ layout is detected (no tsconfig)", async () => {
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx"))).toBe(false);
		expect(fs.existsSync(path.join(tmpDir, "src/lib/utils.ts"))).toBe(true);
	});

	it("writes to src/components/ui when tsconfig maps `@/*` to ./src/*", async () => {
		fs.writeFileSync(
			path.join(tmpDir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
		);
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.existsSync(path.join(tmpDir, "src/components/ui/button.tsx"))).toBe(true);
	});

	it("writes to app/components when tsconfig maps `@/*` to ./app/*", async () => {
		fs.writeFileSync(
			path.join(tmpDir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { paths: { "@/*": ["./app/*"] } } }),
		);
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		expect(fs.existsSync(path.join(tmpDir, "app/components/ui/button.tsx"))).toBe(true);
	});

	it("logs the resolved path, not the raw registry path", async () => {
		fs.mkdirSync(path.join(tmpDir, "src/app"), { recursive: true });
		await addComponents(["button"], { yes: false, overwrite: false, deps: false, install: false });
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toContain("src/components/ui/button.tsx");
	});
});

/**
 * --dry-run gates every disk-mutating call. Output mirrors a real run
 * so users can preview exactly what would happen.
 */
describe("addComponents — --dry-run", () => {
	it("does not write any files to disk", async () => {
		await addComponents(["button"], {
			yes: false,
			overwrite: false,
			deps: false,
			install: false,
			dryRun: true,
		});
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx"))).toBe(false);
		expect(fs.existsSync(path.join(tmpDir, "lib/utils.ts"))).toBe(false);
	});

	it("logs `Would write:` for each file that would be written", async () => {
		await addComponents(["button"], {
			yes: false,
			overwrite: false,
			deps: false,
			install: false,
			dryRun: true,
		});
		const stdout = logSpy.mock.calls.flat().join("\n");
		expect(stdout).toMatch(/Would write:.*button\.tsx/);
		expect(stdout).toContain("Dry-run summary:");
	});
});

/**
 * --from <manifest> reads a `hex.components.json`-style file and uses
 * its `components` array as the install queue. Mixing positional args
 * with --from is an error.
 */
describe("addComponents — --from manifest", () => {
	it("reads the manifest's components array and installs them", async () => {
		fs.writeFileSync(
			path.join(tmpDir, "hex.components.json"),
			JSON.stringify({ components: ["button", "input"] }),
		);
		await addComponents([], {
			yes: false,
			overwrite: false,
			deps: false,
			install: false,
			from: "hex.components.json",
		});
		expect(fs.existsSync(path.join(tmpDir, "components/ui/button.tsx"))).toBe(true);
		expect(fs.existsSync(path.join(tmpDir, "components/ui/input.tsx"))).toBe(true);
	});

	it("errors on a malformed manifest", async () => {
		fs.writeFileSync(path.join(tmpDir, "bad.json"), JSON.stringify({ wrong: true }));
		const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
			throw new Error(`process.exit(${code ?? 0})`);
		}) as never);
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			await expect(
				addComponents([], {
					yes: false,
					overwrite: false,
					deps: false,
					install: false,
					from: "bad.json",
				}),
			).rejects.toThrow(/exit/);
			expect(errSpy.mock.calls.flat().join("\n")).toContain("malformed");
		} finally {
			exitSpy.mockRestore();
			errSpy.mockRestore();
		}
	});

	it("errors when both positional args and --from are provided", async () => {
		fs.writeFileSync(
			path.join(tmpDir, "hex.components.json"),
			JSON.stringify({ components: ["button"] }),
		);
		const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
			throw new Error(`process.exit(${code ?? 0})`);
		}) as never);
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			await expect(
				addComponents(["button"], {
					yes: false,
					overwrite: false,
					deps: false,
					install: false,
					from: "hex.components.json",
				}),
			).rejects.toThrow(/exit/);
			expect(errSpy.mock.calls.flat().join("\n")).toMatch(/either positional component names or --from/);
		} finally {
			exitSpy.mockRestore();
			errSpy.mockRestore();
		}
	});
});
