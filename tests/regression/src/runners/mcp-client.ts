import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface McpHandle {
	client: Client;
	close(): Promise<void>;
}

/**
 * Spawn `npx -y \@hex-core/mcp@latest` from npm and return a connected MCP
 * `Client`. Mirrors the pattern in `packages/mcp-server/src/contract.test.ts:60`,
 * but pulls from the registry instead of running the workspace dist —
 * that's what makes this a regression test rather than a unit test.
 *
 * The transport spawns a subprocess via `pnpm dlx \@hex-core/mcp@<version>`
 * (NOT `npx`, to match the install path used everywhere else in this
 * suite). On close, the transport sends a clean `client.close()` so the
 * subprocess exits without leaking; tests still set a timeout because
 * if the server hangs on close, vitest would otherwise hang too.
 * @param mcpVersion - Optional pin (default `latest`).
 * @returns Connected client + dispose handle.
 */
export async function connectMcp(mcpVersion = "latest"): Promise<McpHandle> {
	const transport = new StdioClientTransport({
		command: "pnpm",
		args: ["dlx", `@hex-core/mcp@${mcpVersion}`],
	});

	const client = new Client(
		{ name: "hex-regression-suite", version: "0.0.0" },
		{ capabilities: {} },
	);

	await client.connect(transport);

	return {
		client,
		async close() {
			await client.close();
		},
	};
}
