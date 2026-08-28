import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	registerAppResource,
	registerAppTool,
	RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { listThemes } from "@hex-core/payload";
import { TOOL } from "../tool-names.js";

/**
 * URI of the theme-browser MCP App (SEP-1865). Hosts that support MCP Apps
 * fetch this resource via `resources/read` and render it when `list_themes`
 * is called; hosts that don't simply ignore the `_meta` and see the same
 * text output as before. The HTML never enters model context, so it has no
 * token-ceiling implications.
 */
export const THEME_BROWSER_URI = "ui://hex-core/theme-browser.html";

/**
 * Candidate locations of the bundled app HTML. The build (`tsup` +
 * `scripts/build-app.mjs`) emits `dist/apps/theme-browser.html` next to the
 * bundled `dist/index.js`, so the first candidate resolves in production.
 * The second covers `pnpm dev` (tsx runs from `src/tools/`, two levels above
 * `dist/`).
 */
const APP_HTML_CANDIDATES = ["./apps/theme-browser.html", "../../dist/apps/theme-browser.html"];

/**
 * Read the bundled theme-browser HTML, resolving relative to this module.
 * @returns The self-contained app HTML
 * @throws When the bundle is missing (build not run)
 */
function readAppHtml(): string {
	const tried: string[] = [];
	for (const candidate of APP_HTML_CANDIDATES) {
		const path = fileURLToPath(new URL(candidate, import.meta.url));
		tried.push(path);
		if (existsSync(path)) return readFileSync(path, "utf8");
	}
	throw new Error(
		`theme-browser.html not built — run \`pnpm --filter @hex-core/mcp build\`. Tried: ${tried.join(", ")}`,
	);
}

/**
 * Register the `list-themes` tool and its MCP App resource.
 * @param server - The MCP server to register against
 */
export function register(server: McpServer): void {

	// ─── Tool 5: list_themes ───

	// registerAppTool (not registerTool) so the SDK mirrors _meta.ui.resourceUri
	// into the legacy `ui/resourceUri` key for hosts on the older meta shape.
	registerAppTool(
		server,
		TOOL.LIST_THEMES,
		{
			description:
				"List all available Hex Core themes with names, descriptions, and (when set) category + tags + attribution. Includes 71 brand-derived voltagent presets (Tesla, Stripe, Linear, …) plus first-party themes (default, midnight, ember). Brand presets are style references inspired by publicly visible design systems — not endorsements; trademarks belong to their respective owners. In hosts that support MCP Apps, also renders an interactive theme browser with palette previews.",
			inputSchema: z.object({}).strict(),
			_meta: { ui: { resourceUri: THEME_BROWSER_URI } },
		},
		async () => {
			const themeList = listThemes();
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(themeList, null, 2),
					},
				],
			};
		},
	);

	// The interactive view for the tool above — co-located with it the same
	// way scaffold-poc.ts co-locates the hex://catalog resource. Read lazily
	// so a missing bundle fails the individual read, not server startup.
	registerAppResource(
		server,
		"Hex theme browser",
		THEME_BROWSER_URI,
		{ description: "Interactive Hex theme browser with palette previews" },
		async () => ({
			contents: [
				{
					uri: THEME_BROWSER_URI,
					mimeType: RESOURCE_MIME_TYPE,
					text: readAppHtml(),
				},
			],
		}),
	);
}
