import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

/**
 * The `hex-core` MCP server.
 *
 * Tool implementations live one-per-file under `./tools/`; this entry
 * point only wires the manifest to a transport. It was a 1,312-line file
 * with all nineteen `registerTool` calls inline.
 */
const server = new McpServer({
	name: "hex-core",
	version: "0.1.0",
});

registerAllTools(server);

/**
 * Connect the server to stdio and serve until the transport closes.
 */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(console.error);
