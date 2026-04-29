/**
 * Interactive theme authoring tests.
 *
 * Mocks `@inquirer/prompts` so we feed deterministic answer sequences
 * into the flow and assert on the file the CLI writes. Same tmpdir +
 * process.exit-stubbing pattern as the non-interactive tests.
 *
 * Type safety note (M2): the mock factory exports its `__queues`
 * object alongside the prompt mocks. A TS module-augmentation
 * (declared at the top of this file) types that field on the public
 * `@inquirer/prompts` shape so test code can reach for it without any
 * `as unknown as` casts. The augmentation only applies inside this
 * test compilation unit — production callsites of `@inquirer/prompts`
 * see the original public types.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface PromptQueues {
	input: string[];
	select: string[];
	confirm: boolean[];
}

declare module "@inquirer/prompts" {
	export const __queues: PromptQueues;
}

vi.mock("@inquirer/prompts", () => {
	const queues: PromptQueues = { input: [], select: [], confirm: [] };
	return {
		__queues: queues,
		input: vi.fn(async () => {
			const next = queues.input.shift();
			if (next === undefined) throw new Error("input() called but answer queue is empty");
			return next;
		}),
		select: vi.fn(async () => {
			const next = queues.select.shift();
			if (next === undefined) throw new Error("select() called but answer queue is empty");
			return next;
		}),
		confirm: vi.fn(async () => {
			const next = queues.confirm.shift();
			if (next === undefined) throw new Error("confirm() called but answer queue is empty");
			return next;
		}),
	};
});

let tmpDir: string;
let originalCwd: string;
let exitSpy: ReturnType<typeof vi.spyOn>;

/** Read the typed mock queues without any cross-module cast. */
async function getQueues(): Promise<PromptQueues> {
	const { __queues } = await import("@inquirer/prompts");
	return __queues;
}

beforeEach(async () => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-cli-iv-test-"));
	process.chdir(tmpDir);
	exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null | undefined) => {
		throw new Error(`process.exit(${code ?? 0})`);
	}) as never);

	const queues = await getQueues();
	queues.input = [];
	queues.select = [];
	queues.confirm = [];
});

afterEach(async () => {
	// L3: assert the flow consumed everything queued. A test that leaves
	// answers behind means we either added a prompt and forgot to test
	// it, or removed a prompt and forgot to update the queues. Either way
	// the test file silently drifts — fail loudly here.
	const queues = await getQueues();
	const leftover = queues.input.length + queues.select.length + queues.confirm.length;
	expect(
		leftover,
		`leftover prompt answers: input=${queues.input.length} select=${queues.select.length} confirm=${queues.confirm.length}`,
	).toBe(0);

	process.chdir(originalCwd);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	exitSpy.mockRestore();
	vi.clearAllMocks();
});

/** Seed the mocked prompt queues for a typical happy-path init session. */
async function seedHappyPath(opts?: { name?: string }): Promise<void> {
	const queues = await getQueues();
	queues.input = [
		opts?.name ?? "atelier",                  // theme name
		"Atelier",                                 // displayName
		"A warm-neutral theme for editorial UIs.",  // description
		"217 91% 60%",                             // primary
		"0 0% 100%",                               // background
		"240 10% 3.9%",                            // foreground
		"0 72% 45%",                               // destructive
	];
	queues.select = [
		"balanced",  // radius
		"derive",    // dark mode
	];
	queues.confirm = [
		true,        // "Write theme to disk?"
	];
}

describe("themeInitInteractive — happy path", () => {
	it("writes a CSS theme that contains both :root and .dark blocks", async () => {
		await seedHappyPath();
		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");

		await themeInitInteractive({
			out: "themes/atelier.css",
			format: "css",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/atelier.css"), "utf8");
		expect(written).toMatch(/:root\s*\{/);
		expect(written).toMatch(/\.dark\s*\{/);
		expect(written).toContain("--primary: 217 91% 60%;");
		expect(written).toContain("--background: 0 0% 100%;");
	});

	it("writes a TS theme file when format=ts (the dogfood path)", async () => {
		await seedHappyPath({ name: "atelier" });
		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");

		await themeInitInteractive({
			out: "themes/atelier.ts",
			format: "ts",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/atelier.ts"), "utf8");
		expect(written).toContain('import type { Theme, TokenValue } from "@hex-core/registry"');
		expect(written).toContain("export const atelierTheme: Theme = {");
		// M1: name + displayName must round-trip through JSON.stringify so a
		// quote in either field doesn't break the rendered TS.
		expect(written).toContain('name: "atelier"');
		expect(written).toContain('displayName: "Atelier"');
		expect(written).toContain('primary: { value: "217 91% 60%", type: "color" }');
		// B2: rendered TS is fully self-contained, NOT importing from "./shared.js".
		expect(written).not.toContain('from "./shared.js"');
		expect(written).toContain("const sharedTokens:");
		expect(written).toContain("...sharedTokens,");
	});

	it("re-prompts dark surface seeds when dark mode = author (B1: dark band)", async () => {
		const queues = await getQueues();
		queues.input = [
			"twilight",                  // theme name
			"Twilight",                  // displayName
			"Hand-authored both modes.", // description
			"217 91% 60%",               // primary
			"0 0% 100%",                 // background (light)
			"240 10% 3.9%",              // foreground (light)
			"0 72% 45%",                 // destructive (light)
			"220 30% 8%",                // background (dark) — distinct from auto-derive
			"60 20% 95%",                // foreground (dark)
			"0 80% 70%",                 // destructive (dark) — lightened
		];
		queues.select = ["balanced", "author"];
		queues.confirm = [true];

		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");
		await themeInitInteractive({
			out: "themes/twilight.css",
			format: "css",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/twilight.css"), "utf8");
		// Light retains the canonical seeds.
		expect(written).toContain("--background: 0 0% 100%;");
		// Dark uses the user-authored seeds AND dark-band derived neutrals.
		const darkMatch = written.match(/\.dark\s*\{([\s\S]*?)\}/);
		expect(darkMatch).not.toBeNull();
		const darkBody = darkMatch?.[1] ?? "";
		expect(darkBody).toContain("--background: 220 30% 8%;");
		expect(darkBody).toContain("--destructive: 0 80% 70%;");
		// B1 fix: the dark-mode `secondary` must collapse to a low-band
		// lightness (≤30%), NOT the light-band 95.9%.
		const secondaryLine = darkBody.match(/--secondary:\s*\d+\s+[\d.]+%\s+([\d.]+)%/);
		expect(secondaryLine, "dark --secondary missing").not.toBeNull();
		const secondaryL = Number(secondaryLine?.[1] ?? "0");
		expect(secondaryL, `dark --secondary lightness ${secondaryL}% should be in the dark band`).toBeLessThan(30);
	});

	it("derives both light and dark when dark mode = derive", async () => {
		await seedHappyPath();
		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");

		await themeInitInteractive({
			out: "themes/derive.css",
			format: "css",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/derive.css"), "utf8");
		const darkMatch = written.match(/\.dark\s*\{([\s\S]*?)\}/);
		expect(darkMatch).not.toBeNull();
		expect(darkMatch?.[1]).not.toContain("--background: 0 0% 100%;");
	});

	it("L2: accepts a custom radius value via the `custom` branch", async () => {
		const queues = await getQueues();
		queues.input = [
			"custom-radius",
			"Custom Radius",
			"A theme with a non-preset radius.",
			"217 91% 60%",
			"0 0% 100%",
			"240 10% 3.9%",
			"0 72% 45%",
			"0.42rem",                    // custom radius prompt
		];
		queues.select = ["custom", "derive"];
		queues.confirm = [true];

		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");
		await themeInitInteractive({
			out: "themes/custom-radius.css",
			format: "css",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/custom-radius.css"), "utf8");
		expect(written).toContain("--radius: 0.42rem;");
	});
});

describe("themeInitInteractive — failure paths", () => {
	it("aborts when output file exists and --overwrite is false", async () => {
		fs.mkdirSync(path.join(tmpDir, "themes"), { recursive: true });
		fs.writeFileSync(path.join(tmpDir, "themes/exists.css"), "/* pre-existing */");
		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");

		await expect(
			themeInitInteractive({
				out: "themes/exists.css",
				format: "css",
				overwrite: false,
			}),
		).rejects.toThrow(/process\.exit/);

		// File untouched.
		expect(fs.readFileSync(path.join(tmpDir, "themes/exists.css"), "utf8")).toBe("/* pre-existing */");
	});

	it("aborts cleanly when user declines the final 'Write to disk?' confirm", async () => {
		const queues = await getQueues();
		await seedHappyPath();
		queues.confirm = [false]; // override: decline the write

		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");

		await expect(
			themeInitInteractive({
				out: "themes/declined.css",
				format: "css",
				overwrite: false,
			}),
		).rejects.toThrow(/process\.exit\(0\)/);

		expect(fs.existsSync(path.join(tmpDir, "themes/declined.css"))).toBe(false);
	});
});

describe("themeInitInteractive — sub-AA contrast handling (M3)", () => {
	it("re-prompts foreground+background when the user picks 'retry' on a sub-AA pair", async () => {
		const queues = await getQueues();
		// First fg/bg pair fails AA → user picks retry → second pair passes.
		queues.input = [
			"retry-fix",
			"Retry Fix",
			"User restarts to fix sub-AA pair.",
			"217 91% 60%",
			"0 0% 100%",   // bg attempt 1
			"0 0% 60%",    // fg attempt 1 (sub-AA on white)
			"0 0% 100%",   // bg attempt 2
			"240 10% 3.9%", // fg attempt 2 (passes AA)
			"0 72% 45%",   // destructive
		];
		queues.select = [
			"retry",     // sub-AA gate: pick retry
			"balanced",  // radius
			"derive",    // dark mode
		];
		queues.confirm = [true]; // write

		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");
		await themeInitInteractive({
			out: "themes/retry-fix.css",
			format: "css",
			overwrite: false,
		});

		const written = fs.readFileSync(path.join(tmpDir, "themes/retry-fix.css"), "utf8");
		expect(written).toContain("--foreground: 240 10% 3.9%;"); // the second pair won
	});

	it("accepts a sub-AA pair when the user explicitly picks 'accept'", async () => {
		const queues = await getQueues();
		queues.input = [
			"sub-aa",
			"Sub AA",
			"Test theme.",
			"217 91% 60%",
			"0 0% 100%",
			"0 0% 60%",   // fg sub-AA
			"0 72% 45%",
		];
		queues.select = [
			"accept",    // sub-AA gate: accept
			"balanced",
			"derive",
		];
		queues.confirm = [true];

		const { themeInitInteractive } = await import("../src/commands/theme-interactive.js");
		await themeInitInteractive({
			out: "themes/sub-aa.css",
			format: "css",
			overwrite: false,
		});

		expect(fs.existsSync(path.join(tmpDir, "themes/sub-aa.css"))).toBe(true);
	});
});
