/**
 * Wiring data for every MCP client `@hex-core/mcp` is verified against. Both
 * the README generator (`scripts/build-readme.mjs`) and the docs page
 * (`apps/docs/src/app/docs/mcp/page.tsx`) render from this single array — no
 * duplicated snippets, no client-specific code paths anywhere else.
 *
 * `verified-volatile` entries carry a `verifiedOn` date so quarterly
 * research-cadence refreshes can spot stale entries. The 2026-04-27 stamps
 * below were verified against the upstream docs/repos linked in `docsUrl` at
 * authoring time. ChatGPT Desktop's MCP support (config path, transport
 * support) and Zed's `context_servers` schema were both moving targets in
 * late 2025 — re-verify by running the contract test against a real install
 * of each client before publishing a new minor version of `@hex-core/mcp`,
 * and roll the `verifiedOn` date forward on any snippet you touch.
 */

export type McpClientId =
	| "claude-code"
	| "cursor"
	| "continue"
	| "gemini-cli"
	| "chatgpt-desktop"
	| "zed";

export interface McpClientWiring {
	/** Stable id used as React key + URL anchor. */
	id: McpClientId;
	/** Human label rendered in section headings and chip tags. */
	label: string;
	/** Path to the file the snippet goes in (relative or absolute, with platform note when not portable). */
	configPath: string;
	/** OS / scope caveat when configPath isn't portable. */
	configPathNote?: string;
	/** Snippet syntax — drives the doc fence language. */
	format: "json" | "jsonc" | "yaml";
	/** Top-level key in the config file — `mcpServers` for most, `context_servers` for Zed. */
	topLevelKey: "mcpServers" | "context_servers";
	/** Ready-to-paste config body (already wrapped in the surrounding object). */
	snippet: string;
	/** `stable` = schema unchanged for >12 months; `verified-volatile` = re-checked at `verifiedOn`. */
	schemaStability: "stable" | "verified-volatile";
	/** ISO date this snippet was verified against the client's official docs. */
	verifiedOn?: string;
	/** Upstream docs link the consumer can follow if our snippet ever drifts. */
	docsUrl: string;
	/** One-line gotchas surfaced in both the README and the docs page. */
	quirks: string[];
}

/** The npx command every snippet ultimately invokes. Single source of truth. */
export const HEX_SERVER_COMMAND = {
	command: "npx",
	args: ["-y", "@hex-core/mcp"],
} as const;

const CLAUDE_CURSOR_GEMINI_CHATGPT_SNIPPET = `{
  "mcpServers": {
    "hex-ui": {
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}`;

const CONTINUE_SNIPPET = `mcpServers:
  - name: hex-ui
    command: npx
    args:
      - -y
      - "@hex-core/mcp"`;

const ZED_SNIPPET = `{
  "context_servers": {
    "hex-ui": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "@hex-core/mcp"]
    }
  }
}`;

export const MCP_CLIENTS: readonly McpClientWiring[] = [
	{
		id: "claude-code",
		label: "Claude Code",
		configPath: ".claude/settings.json",
		configPathNote: "Project-scoped; for global wiring use ~/.claude/settings.json.",
		format: "json",
		topLevelKey: "mcpServers",
		snippet: CLAUDE_CURSOR_GEMINI_CHATGPT_SNIPPET,
		schemaStability: "stable",
		docsUrl: "https://docs.anthropic.com/en/docs/claude-code/mcp",
		quirks: [],
	},
	{
		id: "cursor",
		label: "Cursor",
		configPath: ".cursor/mcp.json",
		configPathNote: "Project-scoped; for all projects use ~/.cursor/mcp.json.",
		format: "json",
		topLevelKey: "mcpServers",
		snippet: CLAUDE_CURSOR_GEMINI_CHATGPT_SNIPPET,
		schemaStability: "stable",
		docsUrl: "https://docs.cursor.com/context/model-context-protocol",
		quirks: [],
	},
	{
		id: "continue",
		label: "Continue",
		configPath: "~/.continue/config.yaml",
		configPathNote:
			"Continue migrated from JSON to YAML; the legacy ~/.continue/config.json still works for older builds.",
		format: "yaml",
		topLevelKey: "mcpServers",
		snippet: CONTINUE_SNIPPET,
		schemaStability: "verified-volatile",
		verifiedOn: "2026-04-27",
		docsUrl: "https://docs.continue.dev/customize/deep-dives/mcp",
		quirks: [
			"Config is a YAML list of server objects, not a map keyed by name.",
			"Restart Continue after editing — it doesn't hot-reload MCP servers.",
		],
	},
	{
		id: "gemini-cli",
		label: "Gemini CLI",
		configPath: "~/.gemini/settings.json",
		configPathNote:
			"Global scope; project-scoped wiring goes in .gemini/settings.json at the repo root.",
		format: "json",
		topLevelKey: "mcpServers",
		snippet: CLAUDE_CURSOR_GEMINI_CHATGPT_SNIPPET,
		schemaStability: "verified-volatile",
		verifiedOn: "2026-04-27",
		docsUrl:
			"https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md",
		quirks: [
			"Each server entry also accepts `cwd` and `env` siblings to `command` and `args`.",
		],
	},
	{
		id: "chatgpt-desktop",
		label: "ChatGPT Desktop",
		configPath: "~/Library/Application Support/ChatGPT/mcp.json",
		configPathNote:
			"macOS path; Windows: %APPDATA%\\ChatGPT\\mcp.json. MCP support requires Developer Mode in ChatGPT Desktop settings.",
		format: "json",
		topLevelKey: "mcpServers",
		snippet: CLAUDE_CURSOR_GEMINI_CHATGPT_SNIPPET,
		schemaStability: "verified-volatile",
		verifiedOn: "2026-04-27",
		docsUrl: "https://platform.openai.com/docs/mcp",
		quirks: [
			"Toggle Developer Mode under Settings → Beta features before mcp.json is read.",
			"Stdio servers only — HTTP/SSE transports are not yet supported on Desktop.",
		],
	},
	{
		id: "zed",
		label: "Zed",
		configPath: "~/.config/zed/settings.json",
		configPathNote:
			"Open via Cmd+, in Zed; the file is plain JSONC (comments + trailing commas allowed).",
		format: "jsonc",
		topLevelKey: "context_servers",
		snippet: ZED_SNIPPET,
		schemaStability: "verified-volatile",
		verifiedOn: "2026-04-27",
		docsUrl: "https://zed.dev/docs/assistant/model-context-protocol",
		quirks: [
			"Zed uses `context_servers`, NOT `mcpServers` — every other client uses the latter.",
			"`source: \"custom\"` is required so Zed treats the entry as a user-defined server (not an extension).",
		],
	},
];
