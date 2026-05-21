import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectMcpTarget, writeMcpEntry } from "../src/lib/mcp-config.js";

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hex-mcp-cfg-"));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeJson(rel: string, value: unknown): void {
	const abs = path.join(tmpDir, rel);
	fs.mkdirSync(path.dirname(abs), { recursive: true });
	fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(rel: string): Record<string, unknown> {
	return JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8")) as Record<string, unknown>;
}

describe("detectMcpTarget", () => {
	it("prefers .mcp.json over .cursor/mcp.json", () => {
		writeJson(".mcp.json", {});
		writeJson(".cursor/mcp.json", {});
		const hit = detectMcpTarget(tmpDir);
		expect(hit.target.relPath).toBe(".mcp.json");
	});

	it("falls back to .cursor/mcp.json when .mcp.json is absent", () => {
		writeJson(".cursor/mcp.json", {});
		const hit = detectMcpTarget(tmpDir);
		expect(hit.target.relPath).toBe(".cursor/mcp.json");
	});

	it("returns the create-on-demand .mcp.json target when no file exists", () => {
		const hit = detectMcpTarget(tmpDir);
		expect(hit.target.relPath).toBe(".mcp.json");
		expect(hit.target.createIfMissing).toBe(true);
		expect(fs.existsSync(hit.abs)).toBe(false);
	});
});

describe("writeMcpEntry", () => {
	it("adds hex-core to an existing .mcp.json without clobbering other mcpServers", () => {
		writeJson(".mcp.json", {
			mcpServers: {
				other: { command: "node", args: ["x"] },
			},
		});
		const result = writeMcpEntry(tmpDir);
		expect(result.wrote).toBe(true);
		expect(result.alreadyConfigured).toBe(false);
		expect(result.target).toBe(".mcp.json");
		const after = readJson(".mcp.json");
		const servers = after.mcpServers as Record<string, unknown>;
		expect("other" in servers).toBe(true);
		expect("hex-core" in servers).toBe(true);
		expect((servers["hex-core"] as { command: string }).command).toBe("npx");
	});

	it("returns alreadyConfigured when hex-core is already present", () => {
		writeJson(".mcp.json", {
			mcpServers: {
				"hex-core": { command: "npx", args: ["-y", "@hex-core/mcp@latest"] },
			},
		});
		const result = writeMcpEntry(tmpDir);
		expect(result.wrote).toBe(false);
		expect(result.alreadyConfigured).toBe(true);
	});

	it("creates .mcp.json at repo root when no MCP config exists yet", () => {
		const result = writeMcpEntry(tmpDir);
		expect(result.wrote).toBe(true);
		expect(result.target).toBe(".mcp.json");
		const after = readJson(".mcp.json");
		const servers = after.mcpServers as Record<string, unknown>;
		expect("hex-core" in servers).toBe(true);
	});

	it("does not write under { dryRun: true } but still reports wrote=true", () => {
		writeJson(".cursor/mcp.json", {});
		const result = writeMcpEntry(tmpDir, { dryRun: true });
		expect(result.wrote).toBe(true);
		const after = readJson(".cursor/mcp.json");
		// Dry run must not have touched the file's contents.
		expect(after.mcpServers).toBeUndefined();
	});

	it("surfaces malformed JSON via malformed=true and leaves the file untouched", () => {
		const abs = path.join(tmpDir, ".mcp.json");
		fs.writeFileSync(abs, "{ broken");
		const result = writeMcpEntry(tmpDir);
		expect(result.wrote).toBe(false);
		expect(result.malformed).toBe(true);
		expect(result.target).toBe(".mcp.json");
		// The malformed content must stay exactly as the user left it.
		expect(fs.readFileSync(abs, "utf-8")).toBe("{ broken");
	});

	it("creates mcpServers when an existing .mcp.json doesn't have it yet", () => {
		writeJson(".mcp.json", { unrelated: true });
		const result = writeMcpEntry(tmpDir);
		expect(result.wrote).toBe(true);
		const after = readJson(".mcp.json");
		expect(after.unrelated).toBe(true);
		const servers = after.mcpServers as Record<string, unknown>;
		expect("hex-core" in servers).toBe(true);
	});
});
