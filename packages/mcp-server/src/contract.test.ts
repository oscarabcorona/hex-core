/**
 * Protocol-level contract test for `@hex-core/mcp`.
 *
 * Spawns the built server (`dist/index.js`) over stdio and drives it with the
 * canonical `@modelcontextprotocol/sdk` Client — the same SDK every supported
 * MCP client uses underneath. A green run proves the server speaks standard
 * MCP regardless of which downstream client (Claude Code, Cursor, Continue,
 * Gemini CLI, ChatGPT Desktop, Zed) opens the connection.
 *
 * Asserts:
 *   1. initialize handshake succeeds
 *   2. tools/list returns exactly the canonical TOOL_NAMES set
 *   3. tools/call list_themes returns a JSON array
 *   4. resources/list returns the hex://catalog resource
 *   5. client.close() disposes the transport without throwing
 *
 * Run via `pnpm --filter @hex-core/mcp test:contract` (which expects
 * `pnpm build` to have produced `dist/index.js`).
 */

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { TOOL, TOOL_NAMES } from "./tool-names.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// `dist/contract-test.js` and `dist/index.js` live side-by-side after build.
const SERVER_BIN = path.resolve(here, "index.js");

function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

function pass(message: string): void {
	console.log(`✓ ${message}`);
}

async function main(): Promise<void> {
	const transport = new StdioClientTransport({
		command: "node",
		args: [SERVER_BIN],
	});
	const client = new Client(
		{ name: "hex-mcp-contract-test", version: "0.0.0" },
		{ capabilities: {} },
	);

	// ─── 1. Handshake ───
	try {
		await client.connect(transport);
		pass("initialize handshake completed");
	} catch (err) {
		fail(`initialize handshake failed: ${(err as Error).message}`);
	}

	try {
		// ─── 2. tools/list set-equal to TOOL_NAMES ───
		const toolsResult = await client.listTools();
		const got = new Set(toolsResult.tools.map((t) => t.name));
		const want = new Set<string>(TOOL_NAMES);
		const missing = [...want].filter((n) => !got.has(n));
		const extra = [...got].filter((n) => !want.has(n));
		if (missing.length > 0 || extra.length > 0) {
			fail(
				`tools/list mismatch — missing: [${missing.join(", ")}] · extra: [${extra.join(", ")}]`,
			);
		}
		pass(`tools/list returns all ${TOOL_NAMES.length} canonical tools`);

		// ─── 3. tools/call list_themes returns a JSON array ───
		const themesResult = await client.callTool({
			name: TOOL.LIST_THEMES,
			arguments: {},
		});
		if (!Array.isArray(themesResult.content) || themesResult.content.length === 0) {
			fail("tools/call list_themes returned empty content");
		}
		const themesPayload = themesResult.content as Array<{ type: string; text?: string }>;
		const firstText = themesPayload[0];
		if (firstText.type !== "text" || typeof firstText.text !== "string") {
			fail("tools/call list_themes response shape unexpected (no text content)");
		}
		let parsed: unknown;
		try {
			parsed = JSON.parse(firstText.text);
		} catch {
			fail("tools/call list_themes content[0].text is not JSON");
		}
		if (!Array.isArray(parsed)) {
			fail(`tools/call list_themes returned ${typeof parsed}, expected array`);
		}
		pass("tools/call list_themes returns a JSON array");

		// ─── 4. resources/list contains hex://catalog ───
		const resourcesResult = await client.listResources();
		const catalog = resourcesResult.resources.find(
			(r) => r.uri === "hex://catalog",
		);
		if (!catalog) {
			fail(
				`resources/list missing hex://catalog (got: ${resourcesResult.resources
					.map((r) => r.uri)
					.join(", ")})`,
			);
		}
		pass("resources/list contains hex://catalog");
	} finally {
		// ─── 5. Clean disposal — close should not throw ───
		await client.close();
		pass("client.close() disposed transport cleanly");
	}

	console.log("\nMCP contract test: all 5 assertions passed.");
}

main().catch((err) => {
	console.error("✗ contract test threw:", err);
	process.exit(1);
});
