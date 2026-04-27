import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ChildProcess } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInstall } from "../src/lib/run-install.js";

let tmpDir: string;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-runinstall-"));
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
	logSpy.mockRestore();
});

/** Build a fake spawn that records every invocation and emits `close` with the configured code. */
function fakeSpawn(exitCode = 0) {
	const calls: Array<{ command: string; args: string[] }> = [];
	const fn = vi.fn((command: string, args: ReadonlyArray<string>) => {
		calls.push({ command, args: [...args] });
		const ee = new EventEmitter() as unknown as ChildProcess;
		// Schedule the close on the next tick so the awaiting Promise has a chance to register.
		setImmediate(() => (ee as unknown as EventEmitter).emit("close", exitCode));
		return ee;
	});
	return { fn, calls };
}

describe("runInstall", () => {
	it("returns early without spawning when every dep is already present", async () => {
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ dependencies: { clsx: "*", "tailwind-merge": "*" } }),
		);
		const { fn, calls } = fakeSpawn();
		const result = await runInstall(["clsx", "tailwind-merge"], { cwd: tmpDir, spawnImpl: fn as never });
		expect(result.installed).toEqual([]);
		expect(result.skipped).toEqual(["clsx", "tailwind-merge"]);
		expect(calls).toHaveLength(0);
	});

	it("dryRun returns the planned command without spawning", async () => {
		const { fn, calls } = fakeSpawn();
		const result = await runInstall(["clsx"], { cwd: tmpDir, dryRun: true, spawnImpl: fn as never });
		expect(result.installed).toEqual(["clsx"]);
		expect(calls).toHaveLength(0);
	});

	it("spawns the detected package manager with the right argv", async () => {
		fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "");
		fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ dependencies: {} }));
		const { fn, calls } = fakeSpawn(0);
		const result = await runInstall(["clsx", "@radix-ui/react-dialog"], {
			cwd: tmpDir,
			spawnImpl: fn as never,
		});
		expect(calls).toHaveLength(1);
		expect(calls[0].command).toBe("pnpm");
		expect(calls[0].args).toEqual(["add", "clsx", "@radix-ui/react-dialog"]);
		expect(result.exitCode).toBe(0);
		expect(result.manager).toBe("pnpm");
	});

	it("uses 'install' for npm", async () => {
		fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}");
		fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ dependencies: {} }));
		const { fn, calls } = fakeSpawn(0);
		await runInstall(["clsx"], { cwd: tmpDir, spawnImpl: fn as never });
		expect(calls[0].command).toBe("npm");
		expect(calls[0].args).toEqual(["install", "clsx"]);
	});

	it("filters out already-installed deps before spawning", async () => {
		fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "");
		fs.writeFileSync(
			path.join(tmpDir, "package.json"),
			JSON.stringify({ dependencies: { clsx: "*" } }),
		);
		const { fn, calls } = fakeSpawn(0);
		const result = await runInstall(["clsx", "tailwind-merge"], {
			cwd: tmpDir,
			spawnImpl: fn as never,
		});
		expect(calls).toHaveLength(1);
		expect(calls[0].args).toEqual(["add", "tailwind-merge"]);
		expect(result.skipped).toEqual(["clsx"]);
	});

	it("returns the spawn exit code without throwing on failure", async () => {
		fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ dependencies: {} }));
		const { fn } = fakeSpawn(127);
		const result = await runInstall(["clsx"], { cwd: tmpDir, spawnImpl: fn as never });
		expect(result.exitCode).toBe(127);
	});
});
