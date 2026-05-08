import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectMcp, type McpHandle } from "../../runners/mcp-client.js";

/**
 * `\@hex-core/mcp` post-publish contract regression. Pulls the published
 * tarball via `pnpm dlx`, opens an stdio client, and exercises a handful
 * of canonical tool calls. This catches:
 *
 * - Server name drift (rebrand left it at "hex-ui" by accident, etc.)
 * - Tools list that lost a registered tool between releases
 * - Bundled registry/recipe data that didn't make it into the tarball
 *
 * One-shot client: each `it` block reuses the same connection, since
 * spinning up `pnpm dlx \@hex-core/mcp` per test would add ~10s × 5 cases.
 */
describe("mcp/contract", () => {
	let handle: McpHandle;

	beforeAll(async () => {
		handle = await connectMcp();
	}, 120_000);

	afterAll(async () => {
		await handle?.close();
	});

	it("tools/list includes all canonical tools", async () => {
		const list = await handle.client.listTools();
		const names = list.tools.map((t) => t.name).sort();
		// Subset assertion — additions are fine; missing core tools is a regression.
		const required = [
			"search_components",
			"get_component",
			"get_component_schema",
			"list_themes",
			"get_theme",
			"list_recipes",
			"get_recipe",
			"resolve_spec",
			"verify_checklist",
			"emit_app_context",
		];
		for (const r of required) {
			if (!names.includes(r)) {
				throw new Error(
					`tools/list missing required tool: ${r}. Got: ${names.join(", ")}`,
				);
			}
		}
	});

	it("list_recipes returns the shipped recipe set", async () => {
		const result = await handle.client.callTool({ name: "list_recipes", arguments: {} });
		const text = extractText(result);
		const parsed = JSON.parse(text) as Array<{ slug: string }>;
		if (!Array.isArray(parsed) || parsed.length < 6) {
			throw new Error(
				`list_recipes returned ${parsed.length} items; expected ≥6 shipped recipes`,
			);
		}
		const slugs = parsed.map((r) => r.slug);
		// Sentinel — shipped from day one. Drop signals data drift in the tarball.
		if (!slugs.includes("auth-form")) {
			throw new Error(`list_recipes missing 'auth-form'; got: ${slugs.join(", ")}`);
		}
	});

	it("search_components q=button finds the button component", async () => {
		const result = await handle.client.callTool({
			name: "search_components",
			arguments: { query: "button" },
		});
		const text = extractText(result);
		const hits = JSON.parse(text) as Array<{ name: string }>;
		if (!hits.some((h) => h.name === "button")) {
			throw new Error(`search_components(button) didn't return 'button'; got ${text.slice(0, 200)}`);
		}
	});

	it("get_component(button) returns props + variants + AI hints", async () => {
		const result = await handle.client.callTool({
			name: "get_component",
			arguments: { name: "button" },
		});
		const text = extractText(result);
		const item = JSON.parse(text) as {
			name: string;
			props: unknown[];
			variants: unknown[];
			ai: { whenToUse: string };
		};
		expect(item.name).toBe("button");
		if (!Array.isArray(item.props) || item.props.length === 0) {
			throw new Error("get_component returned empty props array");
		}
		if (!item.ai?.whenToUse) {
			throw new Error("get_component missing ai.whenToUse — registry tarball drift");
		}
	});

	it("emit_app_context with default theme + button renders the canonical sections", async () => {
		const result = await handle.client.callTool({
			name: "emit_app_context",
			arguments: { theme: "default", components: ["button"], recipes: [] },
		});
		const text = extractText(result);
		// Canonical section headers — anything missing means the payload
		// builder regressed.
		const required = ["# App context", "## globals.css", "## Components", "## Install"];
		for (const r of required) {
			if (!text.includes(r)) {
				throw new Error(
					`emit_app_context missing section header ${JSON.stringify(r)}; got first 300 chars:\n${text.slice(0, 300)}`,
				);
			}
		}
	});
});

/**
 * Pull the first text block out of a tool-call response. The SDK's
 * CallToolResult type uses a discriminated union for `content`; we
 * narrow with a runtime guard so the helper accepts every response
 * shape (text / image / resource) without dragging the whole union
 * through the type signature.
 * @param result - The opaque MCP `CallToolResult` returned by `client.callTool`.
 * @returns The first text-content block's text.
 */
function extractText(result: unknown): string {
	const content =
		typeof result === "object" && result !== null && "content" in result
			? (result as { content: unknown }).content
			: undefined;
	if (Array.isArray(content)) {
		for (const part of content as Array<{ type?: string; text?: unknown }>) {
			if (part?.type === "text" && typeof part.text === "string") return part.text;
		}
	}
	throw new Error(`tool response had no text content: ${JSON.stringify(result).slice(0, 200)}`);
}
