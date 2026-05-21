import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { printSkillsHint } from "../src/lib/post-install.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-post-install-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function installSkill(name: string): void {
	const dir = path.join(tmpDir, ".claude", "skills", name);
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, "SKILL.md"), "stub");
}

describe("printSkillsHint", () => {
	it("prints the hex-core-overview hint when at least one hex-core-* skill is installed", () => {
		installSkill("hex-core-overview");
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		printSkillsHint(tmpDir);
		const printed = spy.mock.calls.map((c) => c.join(" ")).join("\n");
		spy.mockRestore();
		expect(printed).toMatch(/hex-core-overview/);
	});

	it("is silent when no hex-core-* skill is installed", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		printSkillsHint(tmpDir);
		spy.mockRestore();
		expect(spy.mock.calls.length).toBe(0);
	});

	it("is silent when the skills dir exists but no entry starts with hex-core-", () => {
		fs.mkdirSync(path.join(tmpDir, ".claude", "skills", "other-skill"), {
			recursive: true,
		});
		fs.writeFileSync(
			path.join(tmpDir, ".claude", "skills", "other-skill", "SKILL.md"),
			"stub",
		);
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		printSkillsHint(tmpDir);
		spy.mockRestore();
		expect(spy.mock.calls.length).toBe(0);
	});

	it("prints unconditionally under { always: true } (for hex skills install)", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		printSkillsHint(tmpDir, { always: true });
		const printed = spy.mock.calls.map((c) => c.join(" ")).join("\n");
		spy.mockRestore();
		expect(printed).toMatch(/hex-core-overview/);
	});
});
