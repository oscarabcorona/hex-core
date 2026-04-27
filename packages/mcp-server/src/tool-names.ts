/**
 * Single source of truth for `@hex-core/mcp` tool names.
 *
 * `TOOL` is consumed by `index.ts` to register each tool — no inline string
 * literals — and `TOOL_NAMES` is consumed by the contract test to assert
 * set-equality against `tools/list`. Adding a tool means adding one entry
 * here; both surfaces pick it up automatically.
 */
export const TOOL = {
	SEARCH_COMPONENTS: "search_components",
	GET_COMPONENT: "get_component",
	GET_COMPONENT_SCHEMA: "get_component_schema",
	GET_THEME: "get_theme",
	LIST_THEMES: "list_themes",
	SCAFFOLD_PROJECT: "scaffold_project",
	CUSTOMIZE_COMPONENT: "customize_component",
	LIST_RECIPES: "list_recipes",
	GET_RECIPE: "get_recipe",
	RESOLVE_SPEC: "resolve_spec",
	VERIFY_CHECKLIST: "verify_checklist",
	EMIT_APP_CONTEXT: "emit_app_context",
} as const;

export const TOOL_NAMES = Object.values(TOOL) as readonly ToolName[];

export type ToolName = (typeof TOOL)[keyof typeof TOOL];
