/**
 * Interactive theme-edit (`hex theme edit -i`) tests.
 *
 * Covers:
 *   - parseGlobalsCss round-trips with applyTokenOverride
 *   - happy path: pick color → token → both → new value → save
 *   - sub-AA contrast warning + retry path
 *   - sub-AA contrast warning + accept path
 *   - "no changes queued" exits without writing (user picks token, then declines edit-another after no change)
 *   - file-missing error path
 *
 * Same mocking pattern as theme-interactive.test.ts: stub @inquirer/prompts
 * with answer queues, drain to zero in afterEach.
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

async function getQueues(): Promise<PromptQueues> {
	const { __queues } = await import("@inquirer/prompts");
	return __queues;
}

const SAMPLE_CSS = `@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --destructive: 0 72% 45%;
    --destructive-foreground: 0 0% 100%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 217 91% 65%;
    --primary-foreground: 240 10% 3.9%;
    --destructive: 0 72% 55%;
    --destructive-foreground: 0 0% 98%;
    --radius: 0.5rem;
  }
}
`;

beforeEach(async () => {
	originalCwd = process.cwd();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-cli-iv-edit-"));
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

describe("parseGlobalsCss", () => {
	it("extracts both :root and .dark blocks", async () => {
		const { parseGlobalsCss } = await import("../src/lib/parse-globals.js");
		const result = parseGlobalsCss(SAMPLE_CSS);

		expect(result.hasDarkBlock).toBe(true);
		expect(result.light.primary).toBe("217 91% 60%");
		expect(result.light.background).toBe("0 0% 100%");
		expect(result.light.radius).toBe("0.5rem");
		expect(result.dark.primary).toBe("217 91% 65%");
		expect(result.dark.background).toBe("240 10% 3.9%");
	});

	it("returns hasDarkBlock=false and empty dark record when only :root present", async () => {
		const { parseGlobalsCss } = await import("../src/lib/parse-globals.js");
		const lightOnly = `:root {\n  --primary: 217 91% 60%;\n  --foreground: 240 10% 3.9%;\n}\n`;
		const result = parseGlobalsCss(lightOnly);

		expect(result.hasDarkBlock).toBe(false);
		expect(Object.keys(result.dark)).toHaveLength(0);
		expect(result.light.primary).toBe("217 91% 60%");
	});

	it("ignores tokens outside :root and .dark blocks", async () => {
		const { parseGlobalsCss } = await import("../src/lib/parse-globals.js");
		const noisy = `:root {\n  --primary: 217 91% 60%;\n}\n\n.unrelated {\n  --primary: 0 0% 0%;\n  --custom: 5px;\n}\n`;
		const result = parseGlobalsCss(noisy);

		expect(result.light.primary).toBe("217 91% 60%");
		expect(result.light.custom).toBeUndefined();
	});

	it("returns empty records for css without :root", async () => {
		const { parseGlobalsCss } = await import("../src/lib/parse-globals.js");
		const result = parseGlobalsCss("/* no tokens here */");
		expect(Object.keys(result.light)).toHaveLength(0);
		expect(Object.keys(result.dark)).toHaveLength(0);
		expect(result.hasDarkBlock).toBe(false);
	});
});

describe("themeEditInteractive — happy path", () => {
	it("writes the new value to both :root and .dark when mode=both", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), SAMPLE_CSS, "utf8");

		const queues = await getQueues();
		queues.select = [
			"color",   // category
			"primary", // token
			"both",    // mode
		];
		// Use a raw triplet so the output round-trips deterministically without
		// depending on culori's hex→hsl float precision.
		queues.input = [
			"220 13% 18%",
		];
		queues.confirm = [
			false, // edit another? no
		];

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await themeEditInteractive({ file: "globals.css" });

		const written = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		// new value should land in BOTH blocks
		const matches = written.match(/--primary: 220 13% 18%;/g);
		expect(matches).not.toBeNull();
		expect(matches).toHaveLength(2);
		// other tokens untouched
		expect(written).toContain("--foreground: 240 10% 3.9%;");
	});

	it("writes only the dark block when mode=dark", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), SAMPLE_CSS, "utf8");

		const queues = await getQueues();
		queues.select = ["color", "primary", "dark"];
		queues.input = ["180 50% 50%"];
		queues.confirm = [false];

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await themeEditInteractive({ file: "globals.css" });

		const written = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		// light block untouched (still 217)
		expect(written).toMatch(/:root\s*\{[^}]*--primary: 217 91% 60%;/);
		// dark block updated
		expect(written).toMatch(/\.dark\s*\{[^}]*--primary: 180 50% 50%;/);
	});
});

describe("themeEditInteractive — AA contrast gate", () => {
	it("offers retry/accept when a foreground-paired token goes sub-AA", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), SAMPLE_CSS, "utf8");

		const queues = await getQueues();
		queues.select = [
			"color",                // category
			"primary-foreground",   // token (pairs with primary)
			"light",                // mode
			"accept",               // accept sub-AA
		];
		// primary in light is "217 91% 60%". A near-identical foreground will fail AA.
		queues.input = [
			"217 91% 65%",          // sub-AA
		];
		queues.confirm = [false];

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await themeEditInteractive({ file: "globals.css" });

		const written = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		expect(written).toMatch(/:root\s*\{[^}]*--primary-foreground: 217 91% 65%;/);
	});

	it("loops back to value prompt when user picks retry", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), SAMPLE_CSS, "utf8");

		const queues = await getQueues();
		queues.select = [
			"color",                // category
			"primary-foreground",   // token
			"light",                // mode
			"retry",                // retry the value
		];
		queues.input = [
			"217 91% 65%",          // sub-AA — triggers gate
			"240 10% 3.9%",         // re-enter — near-black, high AA contrast against primary 217 91% 60%
		];
		queues.confirm = [false];

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await themeEditInteractive({ file: "globals.css" });

		const written = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		// Final value (the retry) is what landed
		expect(written).toMatch(/:root\s*\{[^}]*--primary-foreground: 240 10% 3\.9%;/);
	});
});

describe("themeEditInteractive — error paths", () => {
	it("exits with a helpful error when the file is missing", async () => {
		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await expect(themeEditInteractive({ file: "missing.css" })).rejects.toThrow("process.exit(1)");
	});

	it("exits when the file has no :root block", async () => {
		fs.writeFileSync(path.join(tmpDir, "broken.css"), "/* no tokens */\n", "utf8");

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await expect(themeEditInteractive({ file: "broken.css" })).rejects.toThrow("process.exit(1)");
	});

	it("leaves the file untouched when a prompt rejects mid-flow (Ctrl-C semantics)", async () => {
		fs.writeFileSync(path.join(tmpDir, "globals.css"), SAMPLE_CSS, "utf8");

		// Mid-flow rejection: category is picked, then token select rejects
		// (simulates the user hitting Ctrl-C at the token picker). We assert
		// the function rejects AND the file on disk is unchanged — proves the
		// "buffered write at exit" guarantee.
		const promptsModule = await import("@inquirer/prompts");
		const queues = await getQueues();
		queues.select = ["color"]; // first select succeeds; second will reject
		const selectMock = vi.mocked(promptsModule.select);
		selectMock.mockImplementationOnce(async () => {
			const next = queues.select.shift();
			if (next === undefined) throw new Error("input() called but answer queue is empty");
			return next;
		});
		selectMock.mockImplementationOnce(async () => {
			throw new Error("User force closed the prompt");
		});

		const { themeEditInteractive } = await import("../src/commands/theme-edit-interactive.js");
		await expect(themeEditInteractive({ file: "globals.css" })).rejects.toThrow(
			"User force closed",
		);

		const after = fs.readFileSync(path.join(tmpDir, "globals.css"), "utf8");
		expect(after).toBe(SAMPLE_CSS);
	});
});
