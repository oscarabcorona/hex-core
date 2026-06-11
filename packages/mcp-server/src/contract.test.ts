/* eslint-disable no-console */
/**
 * Protocol-level contract test for the MCP server.
 *
 * Spawns the built server (dist/index.js) over stdio and drives it with the
 * canonical `@modelcontextprotocol/sdk` Client — the same SDK every supported
 * MCP client uses underneath. A green run proves the server speaks standard
 * MCP regardless of which downstream client (Claude Code, Cursor, Continue,
 * Gemini CLI, ChatGPT Desktop, Zed) opens the connection.
 *
 * Asserts:
 *   1. initialize handshake succeeds
 *   2. tools/list returns the canonical TOOL_NAMES set
 *   3. tools/call list_themes returns a JSON array
 *   4. resources/list returns the hex://catalog resource
 *   5. emit_app_context rejects unknown input fields (zod .strict() enforced)
 *   6. emit_app_context output contains the canonical section headers
 *   7. emit_app_context globals.css reflects current `@hex-core/tokens` (no #18 drift)
 *   8. emit_figma_tokens output is markdown wrapping a Figma POST JSON body
 *   9. get_component / get_component_schema / emit_app_context stay under
 *      the documented token ceilings (regression gate for response bloat)
 *  10. client.close() disposes the transport without throwing
 *
 * Run via `pnpm --filter \@hex-core/mcp test:contract` (expects `pnpm build`
 * to have produced dist/index.js).
 */

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { encode } from "gpt-tokenizer/encoding/cl100k_base";
import { TOOL, TOOL_NAMES } from "./tool-names.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// `dist/contract-test.js` and `dist/index.js` live side-by-side after build.
const SERVER_BIN = path.resolve(here, "index.js");

/**
 * Print the failure message and exit non-zero so CI sees the regression.
 * Never returns — terminates the process via `process.exit(1)`.
 * @param message - One-line explanation of what failed (assertion + observed shape)
 */
function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

/**
 * Print a passing assertion to stdout for the test report.
 * @param message - One-line explanation of what passed
 */
function pass(message: string): void {
	console.log(`✓ ${message}`);
}

/** Drive the server through every contract assertion in sequence. */
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

		// ─── 3a. tools/call search_components(category:"motion") surfaces every motion item ───
		// Pins the new `motion` category to the protocol surface so a regression
		// in the schema enum or registry index reaches CI before publish.
		const MOTION_SLUGS = [
			// Phase 1 primitives (11)
			"clip",
			"motion",
			"motion-pro",
			"motion-timeline",
			"presence",
			"scene",
			"track",
			"transition",
			"use-animate",
			"use-scroll",
			"variants",
			// Phase 2 popular-animation catalog (15) — `shine` is the sweep wrapper
			// (renamed from `shimmer` to avoid colliding with the AI shimmer effect).
			"blur-in",
			"bounce",
			"count-up",
			"fade-in",
			"marquee",
			"page-transition",
			"parallax",
			"pulse",
			"reveal-on-scroll",
			"scale-in",
			"shake",
			"shine",
			"slide-in",
			"stagger",
			"typewriter",
		];
		const motionResult = await client.callTool({
			name: TOOL.SEARCH_COMPONENTS,
			arguments: { category: "motion" },
		});
		const motionPayload = motionResult.content as Array<{ type: string; text?: string }>;
		const motionText = motionPayload?.[0]?.text;
		if (typeof motionText !== "string") {
			fail("search_components(category:motion) response missing text content");
		}
		let motionParsed: unknown;
		try {
			motionParsed = JSON.parse(motionText);
		} catch {
			fail("search_components(category:motion) content[0].text is not JSON");
		}
		if (!Array.isArray(motionParsed)) {
			fail(`search_components(category:motion) returned ${typeof motionParsed}, expected array`);
		}
		const gotSlugs = (motionParsed as Array<{ name: string }>).map((i) => i.name).sort();
		const missingMotion = MOTION_SLUGS.filter((s) => !gotSlugs.includes(s));
		if (missingMotion.length > 0) {
			fail(
				`search_components(category:motion) missing slugs: ${missingMotion.join(", ")} (got: ${gotSlugs.join(", ")})`,
			);
		}
		pass(
			`search_components(category:motion) returns all ${MOTION_SLUGS.length} motion items`,
		);

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

		// ─── 5. emit_app_context rejects unknown input fields ───
		// Zod .strict() on the input schema surfaces InvalidParams via the SDK's
		// `isError: true` tool-result path (NOT a thrown exception). Consumers
		// reading the published JSON Schema's `additionalProperties: false`
		// claim need this to be enforced at runtime, so the assertion is on
		// shape: isError + a recognized-keys-rejection message.
		//
		// NOTE: The substring match below depends on Zod's error-code stability.
		// Zod 4 emits `unrecognized_keys` (snake_case code) and "Unrecognized
		// key:" (user-facing message) for strict-mode rejections. Both are
		// matched as fallbacks so a future Zod major bump that renames one but
		// keeps the other doesn't break this test silently. If both ever change,
		// review the SDK validation path at:
		//   node_modules/.pnpm/@modelcontextprotocol+sdk@*/...
		//     /server/mcp.js:safeParseAsync
		const strictResult = (await client.callTool({
			name: TOOL.EMIT_APP_CONTEXT,
			arguments: {
				theme: "default",
				components: ["button"],
				junkField: "should-reject",
			},
		})) as { isError?: boolean; content?: Array<{ type: string; text?: string }> };
		const strictText = strictResult.content?.[0]?.text ?? "";
		const rejectedUnknownKey =
			strictText.includes("unrecognized_keys") || strictText.includes("Unrecognized key");
		if (!strictResult.isError || !rejectedUnknownKey) {
			fail(
				`emit_app_context did not reject unknown field — isError=${strictResult.isError}, text=${strictText.slice(0, 120)}`,
			);
		}
		pass("emit_app_context rejects unknown input fields (strict mode)");

		// ─── 6. emit_app_context output carries the canonical section headers ───
		const ctxResult = await client.callTool({
			name: TOOL.EMIT_APP_CONTEXT,
			arguments: {
				theme: "default",
				components: ["button"],
			},
		});
		const ctxPayload = ctxResult.content as Array<{ type: string; text?: string }>;
		const ctxText = ctxPayload?.[0]?.text ?? "";
		const requiredHeaders = [
			"## Theme",
			"## globals.css",
			"## tailwind.config.ts",
			"## Components",
			"## Install",
			"## Context prompt",
		];
		const missingHeaders = requiredHeaders.filter((h) => !ctxText.includes(h));
		if (missingHeaders.length > 0) {
			fail(`emit_app_context output missing headers: ${missingHeaders.join(", ")}`);
		}
		pass("emit_app_context output contains all canonical section headers");

		// ─── #18 regression: emit_app_context emits CURRENT @hex-core/tokens
		// values, not a stale inlined snapshot ───
		// Before the @hex-core/payload extraction (PR #90), mcp inlined theme
		// data per "to avoid runtime dependency on @hex-core/tokens" — that
		// inlining drifted (mcp@0.3.0 shipped pre-v1.1.1 destructive while
		// @hex-core/tokens@latest already had a corrected value). Lock the
		// post-extraction shape: payload imports themes from tokens, so the
		// emitted globals.css block must reflect the LIVE tokens version.
		//
		// Read the expected value from the live default theme via payload
		// (mcp-server doesn't depend on `@hex-core/tokens` directly — it
		// goes through `@hex-core/payload`, same as the runtime). When
		// default.ts changes (maintainer ships a new visual signature),
		// this assertion stays green without a manual edit.
		const { getTheme } = await import("@hex-core/payload");
		const liveDefault = getTheme("default");
		const expectedDestructive = liveDefault?.tokens.light.destructive?.value;
		if (!expectedDestructive) {
			fail("default theme's light destructive token missing — payload theme contract broken upstream.");
		}
		if (!ctxText.includes(`--destructive: ${expectedDestructive}`)) {
			fail(
				`emit_app_context globals.css block is stale — expected \`--destructive: ${expectedDestructive}\` ` +
					"from @hex-core/tokens (finding #18 regression). Got:\n" +
					(ctxText.match(/--destructive: [^;\n]+/)?.[0] ?? "<no destructive line>"),
			);
		}
		if (ctxText.includes("--destructive: 0 84.2% 60.2%")) {
			fail(
				"emit_app_context output contains the pre-v1.1.1 stale destructive value — " +
					"finding #18 has regressed.",
			);
		}
		pass("emit_app_context globals.css reflects current @hex-core/tokens (no #18 drift)");

		// ─── 7. emit_figma_tokens returns markdown + a Figma POST JSON body ───
		// Asserts the four top-level keys Figma's POST endpoint requires
		// (variableCollections / variableModes / variables / variableModeValues)
		// appear inside a JSON code block. Doesn't validate every field — that
		// belongs in the figma-tokens unit snapshot — just locks the contract
		// surface external clients see.
		const figmaResult = (await client.callTool({
			name: TOOL.EMIT_FIGMA_TOKENS,
			arguments: { theme: "default" },
		})) as { content?: Array<{ type: string; text?: string }> };
		const figmaText = figmaResult.content?.[0]?.text ?? "";
		const requiredFigmaKeys = [
			"# Figma tokens — Hex Core",
			"```json",
			'"variableCollections"',
			'"variableModes"',
			'"variables"',
			'"variableModeValues"',
			// Positive-content gate: assert at least one COLOR variable rendered
			// for the default theme. A regression where the builder returns an
			// empty-variables payload would still match the four canonical-key
			// substrings above (because `"variables": []` matches `"variables"`),
			// but cannot match a `resolvedType: "COLOR"` declaration.
			'"resolvedType": "COLOR"',
		];
		const missingFigma = requiredFigmaKeys.filter((k) => !figmaText.includes(k));
		if (missingFigma.length > 0) {
			fail(`emit_figma_tokens output missing keys: ${missingFigma.join(", ")}`);
		}
		pass("emit_figma_tokens emits a Figma POST-shaped JSON body");

		// ─── 8. describe_intent returns variant useWhen + antiPatterns + semantic tokens ───
		const intentResult = (await client.callTool({
			name: TOOL.DESCRIBE_INTENT,
			arguments: { name: "button" },
		})) as { content?: Array<{ type: string; text?: string }> };
		const intentText = intentResult.content?.[0]?.text ?? "";
		let intentParsed: {
			variants?: Array<{ name: string; values: Array<{ value: string; useWhen: string | null }> }>;
			antiPatterns?: Array<{ mistake: string; insteadUse: string }>;
			semanticTokens?: Record<string, unknown>;
		};
		try {
			intentParsed = JSON.parse(intentText);
		} catch (err) {
			fail(`describe_intent did not return valid JSON: ${(err as Error).message}`);
		}
		const variantUseWhen = intentParsed.variants?.[0]?.values?.[0]?.useWhen;
		if (typeof variantUseWhen !== "string" || variantUseWhen.length === 0) {
			fail("describe_intent: button.variants[0].values[0].useWhen missing — variant intent payload not surfaced.");
		}
		if (!Array.isArray(intentParsed.antiPatterns) || intentParsed.antiPatterns.length === 0) {
			fail("describe_intent: button.antiPatterns missing or empty — structured anti-pattern payload not surfaced.");
		}
		if (!intentParsed.semanticTokens || Object.keys(intentParsed.semanticTokens).length === 0) {
			fail("describe_intent: button.semanticTokens missing — defaultSemanticTokens not filtered through.");
		}
		pass("describe_intent surfaces variant useWhen + antiPatterns + semantic tokens");

		// ─── 9. search_compositions returns examples by tag overlap ───
		const compResult = (await client.callTool({
			name: TOOL.SEARCH_COMPOSITIONS,
			arguments: { tags: ["destructive", "confirm"], limit: 5 },
		})) as { content?: Array<{ type: string; text?: string }> };
		const compText = compResult.content?.[0]?.text ?? "";
		let compParsed: Array<{ component: string; composition: string[]; overlap: number }>;
		try {
			compParsed = JSON.parse(compText);
		} catch (err) {
			fail(`search_compositions did not return valid JSON: ${(err as Error).message}`);
		}
		if (!Array.isArray(compParsed) || compParsed.length === 0) {
			fail("search_compositions returned empty for ['destructive', 'confirm'] — at least one Button or Dialog example should match.");
		}
		const allOverlap = compParsed.every(
			(m) => m.composition.some((c) => ["destructive", "confirm"].includes(c.toLowerCase())),
		);
		if (!allOverlap) {
			fail("search_compositions returned examples that don't actually overlap the query tags.");
		}
		pass("search_compositions returns tag-matched examples ranked by overlap");

		// ─── 10. Blocks round-trip — search_components(category:"block") + get_component ───
		// Locks the block tier as a first-class registry surface. A regression that
		// dropped block schemas from the build (or stripped the "block" filter from
		// search_components) would surface here before consumers saw it.
		const blocksResult = (await client.callTool({
			name: TOOL.SEARCH_COMPONENTS,
			arguments: { category: "block" },
		})) as { content?: Array<{ type: string; text?: string }> };
		const blocksText = blocksResult.content?.[0]?.text ?? "";
		let blocksParsed: Array<{ name: string; category: string }>;
		try {
			blocksParsed = JSON.parse(blocksText);
		} catch {
			fail(`search_components(category:"block") did not return JSON: ${blocksText.slice(0, 120)}`);
		}
		// Lock the password-auth journey: sign-in + sign-up + forgot + reset +
		// verify-email + verify-otp. Six blocks proves both the contract surface
		// (registry round-trip) and that the bundle hasn't dropped any of the
		// auth journey's blocks via a build regression.
		const EXPECTED_AUTH_BLOCKS = [
			"auth-sign-in-split",
			"auth-sign-up-card",
			"auth-forgot-password",
			"auth-reset-password",
			"auth-verify-email",
			"auth-verify-otp",
		];
		if (!Array.isArray(blocksParsed) || blocksParsed.length < EXPECTED_AUTH_BLOCKS.length) {
			fail(
				`search_components(category:"block") returned ${blocksParsed?.length ?? 0} blocks, expected ≥${EXPECTED_AUTH_BLOCKS.length}.`,
			);
		}
		const wrongCategory = blocksParsed.filter((b) => b.category !== "block");
		if (wrongCategory.length > 0) {
			fail(
				`search_components(category:"block") leaked non-block items: ${wrongCategory
					.map((b) => `${b.name}=${b.category}`)
					.join(", ")}`,
			);
		}
		const blockNames = new Set(blocksParsed.map((b) => b.name));
		const missingAuth = EXPECTED_AUTH_BLOCKS.filter((slug) => !blockNames.has(slug));
		if (missingAuth.length > 0) {
			fail(
				`search_components(category:"block") missing password-journey blocks: ${missingAuth.join(", ")}`,
			);
		}
		pass(`search_components(category:"block") returns ${blocksParsed.length} block(s) including the password-auth journey`);

		// ─── 10b. Page-recipe round-trip — get_recipe(kind:"page") ───
		// Locks the page-recipe contract: a regression in the recipe schema or the
		// get_recipe response (dropping sections/theme/layout/pageType, or emitting
		// empty sections) would surface here before an agent tried to assemble a page.
		const recipeResult = (await client.callTool({
			name: TOOL.GET_RECIPE,
			arguments: { slug: "landing-page" },
		})) as { content?: Array<{ type: string; text?: string }> };
		const recipeText = recipeResult.content?.[0]?.text ?? "";
		let recipeParsed: {
			kind?: string;
			pageType?: string;
			theme?: { preset?: string };
			layout?: string;
			sections?: Array<{ id: string; block: string; intent: string; role: string }>;
			install?: { recipeCommand?: string };
		};
		try {
			recipeParsed = JSON.parse(recipeText);
		} catch {
			fail(`get_recipe("landing-page") did not return JSON: ${recipeText.slice(0, 120)}`);
		}
		if (recipeParsed.kind !== "page") {
			fail(`get_recipe("landing-page"): kind was ${recipeParsed.kind}, expected "page".`);
		}
		if (recipeParsed.pageType !== "landing") {
			fail(`get_recipe("landing-page"): pageType was ${recipeParsed.pageType}, expected "landing".`);
		}
		if (!Array.isArray(recipeParsed.sections) || recipeParsed.sections.length === 0) {
			fail("get_recipe(\"landing-page\"): sections missing or empty — page can't be assembled.");
		}
		const badSection = recipeParsed.sections.find((s) => !s.block || !s.intent);
		if (badSection) {
			fail(`get_recipe("landing-page"): a section is missing block/intent: ${JSON.stringify(badSection)}`);
		}
		if (!recipeParsed.theme?.preset) {
			fail("get_recipe(\"landing-page\"): theme.preset missing — no token guidance for the page.");
		}
		if (!recipeParsed.layout || recipeParsed.layout.length === 0) {
			fail("get_recipe(\"landing-page\"): layout brief missing — agent has no assembly guidance.");
		}
		if (recipeParsed.install?.recipeCommand !== "hex recipe add landing-page") {
			fail(
				`get_recipe("landing-page"): install.recipeCommand was ${recipeParsed.install?.recipeCommand}, expected "hex recipe add landing-page".`,
			);
		}
		pass(
			`get_recipe("landing-page") round-trips as kind:"page" with ${recipeParsed.sections.length} ordered sections + theme + layout`,
		);

		// Confirm the canonical first-shipped block (auth-sign-in-split) round-trips
		// through get_component with its full spec — schema, files, AuthAdapter prop.
		const blockResult = (await client.callTool({
			name: TOOL.GET_COMPONENT,
			arguments: { name: "auth-sign-in-split" },
		})) as { content?: Array<{ type: string; text?: string }> };
		const blockText = blockResult.content?.[0]?.text ?? "";
		let blockParsed: {
			name?: string;
			category?: string;
			props?: Array<{ name: string; required: boolean }>;
			files?: Array<{ path: string }>;
		};
		try {
			blockParsed = JSON.parse(blockText);
		} catch {
			fail(`get_component(auth-sign-in-split) did not return JSON: ${blockText.slice(0, 120)}`);
		}
		if (blockParsed.category !== "block") {
			fail(`get_component(auth-sign-in-split): category was ${blockParsed.category}, expected "block".`);
		}
		const adapterProp = blockParsed.props?.find((p) => p.name === "adapter");
		if (!adapterProp || !adapterProp.required) {
			fail("get_component(auth-sign-in-split): required `adapter` prop missing — AuthAdapter contract not surfaced.");
		}
		const adapterFile = blockParsed.files?.find((f) => f.path === "components/_shared/auth-adapter.tsx");
		if (!adapterFile) {
			fail("get_component(auth-sign-in-split): adapter source not bundled at components/_shared/auth-adapter.tsx — install would write a broken import.");
		}
		pass("get_component(auth-sign-in-split) round-trips with adapter prop + bundled adapter source");

		// ─── 12. Token budget ceilings ───
		// Ceilings = current max + ~25 % buffer, derived from `pnpm audit:tokens`
		// (packages/mcp-server/TOKEN_AUDIT.md). A regression that pushes any wire
		// shape above the ceiling fails here BEFORE it bloats every MCP session.
		// Counted with the same tokenizer the audit uses (cl100k_base) so the
		// numbers stay comparable across runs.
		// REFRESH WHEN BUMPING: `pnpm audit:tokens` → read the "Aggregate" table
		//   in TOKEN_AUDIT.md → set each ceiling to max × 1.25, rounded.
		const tokensIn = (text: string): number => encode(text).length;
		const CEILINGS = {
			getComponent: 15_000, // current max 12,655 (block component, wire-pretty)
			getComponentSchema: 2_500, // current max 2,265 (wire-pretty)
			emitAppContextN20: 5_000, // current 3,775 at N=20
		};
		const budgetSamples = ["button", "auth-sign-in-split", "input"];
		for (const slug of budgetSamples) {
			const r = await client.callTool({
				name: TOOL.GET_COMPONENT,
				arguments: { name: slug },
			});
			const text = (r.content as Array<{ text?: string }>)[0]?.text ?? "";
			const n = tokensIn(text);
			if (n > CEILINGS.getComponent) {
				fail(`get_component(${slug}) is ${n} tokens, ceiling ${CEILINGS.getComponent}`);
			}
			const s = await client.callTool({
				name: TOOL.GET_COMPONENT_SCHEMA,
				arguments: { name: slug },
			});
			const sText = (s.content as Array<{ text?: string }>)[0]?.text ?? "";
			const sn = tokensIn(sText);
			if (sn > CEILINGS.getComponentSchema) {
				fail(`get_component_schema(${slug}) is ${sn} tokens, ceiling ${CEILINGS.getComponentSchema}`);
			}
		}
		pass(`get_component / get_component_schema stay under ceilings for ${budgetSamples.length} samples`);

		// Derive the N=20 sample from the live catalog (first 20 sorted slugs)
		// so a rename / removal can't silently shrink N and pass on smaller
		// payloads. Mirrors the audit script's same ordering.
		const allItemsResult = await client.callTool({
			name: TOOL.SEARCH_COMPONENTS,
			arguments: {},
		});
		const allItemsText = (allItemsResult.content as Array<{ text?: string }>)[0]?.text ?? "";
		const allSlugs = (JSON.parse(allItemsText) as Array<{ name: string }>)
			.map((c) => c.name)
			.sort();
		const appCtxComponents = allSlugs.slice(0, 20);
		if (appCtxComponents.length < 20) {
			fail(`expected ≥20 components for emit_app_context gate, registry only has ${appCtxComponents.length}`);
		}
		const budgetCtxResult = await client.callTool({
			name: TOOL.EMIT_APP_CONTEXT,
			arguments: { theme: "default", components: appCtxComponents },
		});
		const budgetCtxText = (budgetCtxResult.content as Array<{ text?: string }>)[0]?.text ?? "";
		const budgetCtxTokens = tokensIn(budgetCtxText);
		if (budgetCtxTokens > CEILINGS.emitAppContextN20) {
			fail(`emit_app_context(N=20) is ${budgetCtxTokens} tokens, ceiling ${CEILINGS.emitAppContextN20}`);
		}
		pass(`emit_app_context(N=20) stays under ${CEILINGS.emitAppContextN20} tokens (got ${budgetCtxTokens})`);
	} finally {
		// ─── 13. Clean disposal — close should not throw ───
		await client.close();
		pass("client.close() disposed transport cleanly");
	}

	console.log("\nMCP contract test: all assertions passed.");
}

main().catch((err) => {
	console.error("✗ contract test threw:", err);
	process.exit(1);
});
