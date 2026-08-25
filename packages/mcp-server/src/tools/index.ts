import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as customizeComponent from "./customize-component.js";
import * as describeIntent from "./describe-intent.js";
import * as emitAppContext from "./emit-app-context.js";
import * as emitFigmaTokens from "./emit-figma-tokens.js";
import * as getComponent from "./get-component.js";
import * as getComponentSchema from "./get-component-schema.js";
import * as getRecipe from "./get-recipe.js";
import * as getTheme from "./get-theme.js";
import * as listRecipes from "./list-recipes.js";
import * as listThemes from "./list-themes.js";
import * as mapApplication from "./map-application.js";
import * as queryGraph from "./query-graph.js";
import * as resolveSpec from "./resolve-spec.js";
import * as scaffoldPoc from "./scaffold-poc.js";
import * as scaffoldProject from "./scaffold-project.js";
import * as searchComponents from "./search-components.js";
import * as searchCompositions from "./search-compositions.js";
import * as searchThemes from "./search-themes.js";
import * as verifyChecklist from "./verify-checklist.js";

/**
 * Every tool this server exposes, as a manifest.
 *
 * This barrel is a curated public API, not a convenience re-export: the
 * order here is the order tools register in, and a module only belongs
 * once it is meant to be served. Nineteen `server.registerTool(...)` calls
 * used to sit inline in a 1,312-line `index.ts`; each now owns a file and
 * declares its own dependencies, so changing one tool's schema no longer
 * means scrolling past eighteen others.
 *
 * Shared state lives in `./_shared.js` — deliberately excluded from this
 * list, because it registers nothing.
 */
const TOOL_MODULES: ReadonlyArray<{ register: (server: McpServer) => void }> = [
	customizeComponent,
	describeIntent,
	emitAppContext,
	emitFigmaTokens,
	getComponent,
	getComponentSchema,
	getRecipe,
	getTheme,
	listRecipes,
	listThemes,
	mapApplication,
	queryGraph,
	resolveSpec,
	scaffoldPoc,
	scaffoldProject,
	searchComponents,
	searchCompositions,
	searchThemes,
	verifyChecklist,
];

/**
 * Register every tool against an MCP server.
 * @param server - The server to register against
 * @returns How many tools were registered
 */
export function registerAllTools(server: McpServer): number {
	for (const module of TOOL_MODULES) module.register(server);
	return TOOL_MODULES.length;
}
