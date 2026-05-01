import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import {
	formatManualInstallCommand,
	promptHeavyPeers,
	type PendingHeavyPeer,
} from "../src/lib/heavy-peer-prompt.js";

function captureStdout(): {
	stream: NodeJS.WritableStream;
	chunks: string[];
} {
	const chunks: string[] = [];
	const stream = new PassThrough();
	stream.on("data", (chunk: Buffer | string) => {
		chunks.push(chunk.toString());
	});
	return { stream, chunks };
}

function feedStdin(line: string): NodeJS.ReadableStream {
	const stream = new PassThrough();
	// Defer write so the readline interface is wired up before the line lands.
	queueMicrotask(() => {
		stream.write(line);
		stream.end();
	});
	return stream;
}

describe("promptHeavyPeers", () => {
	it("returns true immediately when peers list is empty", async () => {
		const result = await promptHeavyPeers([]);
		expect(result).toBe(true);
	});

	it("returns true without prompting when assumeYes is set", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5.3.0", bundleKbGzip: 150, requiredBy: ["terminal"] },
		];
		const { stream, chunks } = captureStdout();
		const result = await promptHeavyPeers(peers, { assumeYes: true, stdout: stream });
		expect(result).toBe(true);
		const out = chunks.join("");
		expect(out).toContain("xterm@^5.3.0");
		expect(out).toContain("~150 KB gzip");
		expect(out).toContain("--yes flag passed");
	});

	it("renders bundle size and aggregates total", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5.3.0", bundleKbGzip: 150, requiredBy: ["terminal"] },
			{ name: "mermaid", version: "^11", bundleKbGzip: 700, requiredBy: ["diagram"] },
		];
		const { stream, chunks } = captureStdout();
		await promptHeavyPeers(peers, { assumeYes: true, stdout: stream });
		const out = chunks.join("");
		expect(out).toContain("These components require 2 heavy peer dependencies");
		expect(out).toContain("for terminal");
		expect(out).toContain("for diagram");
		expect(out).toMatch(/Total: ~850 KB gzip/);
	});

	it("uses MB suffix when total exceeds 1000 KB", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "a", version: "^1", bundleKbGzip: 800, requiredBy: ["x"] },
			{ name: "b", version: "^1", bundleKbGzip: 500, requiredBy: ["y"] },
		];
		const { stream, chunks } = captureStdout();
		await promptHeavyPeers(peers, { assumeYes: true, stdout: stream });
		expect(chunks.join("")).toMatch(/Total: ~1\.3 MB gzip/);
	});

	it("renders the reason line when present", async () => {
		const peers: PendingHeavyPeer[] = [
			{
				name: "xterm",
				version: "^5",
				requiredBy: ["terminal"],
				reason: "Renders the terminal grid",
			},
		];
		const { stream, chunks } = captureStdout();
		await promptHeavyPeers(peers, { assumeYes: true, stdout: stream });
		expect(chunks.join("")).toContain("Renders the terminal grid");
	});

	it("accepts on 'y' input from stdin", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5", bundleKbGzip: 150, requiredBy: ["terminal"] },
		];
		const { stream } = captureStdout();
		const result = await promptHeavyPeers(peers, {
			stdin: feedStdin("y\n"),
			stdout: stream,
		});
		expect(result).toBe(true);
	});

	it("accepts on empty input (Enter == default Yes)", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5", requiredBy: ["terminal"] },
		];
		const { stream } = captureStdout();
		const result = await promptHeavyPeers(peers, {
			stdin: feedStdin("\n"),
			stdout: stream,
		});
		expect(result).toBe(true);
	});

	it("declines on 'n' input from stdin", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5", requiredBy: ["terminal"] },
		];
		const { stream } = captureStdout();
		const result = await promptHeavyPeers(peers, {
			stdin: feedStdin("n\n"),
			stdout: stream,
		});
		expect(result).toBe(false);
	});

	it("declines on any non-yes input", async () => {
		const peers: PendingHeavyPeer[] = [
			{ name: "xterm", version: "^5", requiredBy: ["terminal"] },
		];
		const { stream } = captureStdout();
		const result = await promptHeavyPeers(peers, {
			stdin: feedStdin("nope\n"),
			stdout: stream,
		});
		expect(result).toBe(false);
	});
});

describe("formatManualInstallCommand", () => {
	const peers: PendingHeavyPeer[] = [
		{ name: "xterm", version: "^5.3.0", requiredBy: ["terminal"] },
		{ name: "mermaid", version: "^11", requiredBy: ["diagram"] },
	];

	it("formats for pnpm", () => {
		expect(formatManualInstallCommand("pnpm", peers)).toBe("pnpm add xterm@^5.3.0 mermaid@^11");
	});

	it("formats for npm with 'install' verb", () => {
		expect(formatManualInstallCommand("npm", peers)).toBe("npm install xterm@^5.3.0 mermaid@^11");
	});

	it("formats for yarn / bun with 'add' verb", () => {
		expect(formatManualInstallCommand("yarn", peers)).toBe("yarn add xterm@^5.3.0 mermaid@^11");
		expect(formatManualInstallCommand("bun", peers)).toBe("bun add xterm@^5.3.0 mermaid@^11");
	});
});
