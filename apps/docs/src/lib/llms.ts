/**
 * Builders for `/llms.txt` and `/llms-full.txt` — the llmstxt.org agent
 * index. Pure functions (data in → markdown out, no imports of Next or JSON
 * files) so measurement tooling like `scripts/audit-tokens.ts` can import
 * and price them without a web runtime.
 *
 * Token discipline mirrors the MCP server's: `llms.txt` is a compact map
 * (docs links, agent endpoints, recipes — no per-item catalog listing;
 * that's what `/registry.json` is for). `llms-full.txt` appends the full
 * catalog with per-item intent for agents that deliberately load everything.
 */

/** One docs page for the `## Docs` section. */
export interface LlmsDocLink {
	title: string;
	href: string;
	description: string;
}

/** One recipe row for the `## Recipes` section. */
export interface LlmsRecipe {
	slug: string;
	kind: string;
	title: string;
	summary: string;
}

/** One catalog item for the llms-full catalog section. */
export interface LlmsCatalogItem {
	name: string;
	displayName: string;
	description: string;
	whenToUse: string;
}

/** One category group, in display order, for the llms-full catalog section. */
export interface LlmsCatalogGroup {
	label: string;
	items: readonly LlmsCatalogItem[];
}

/** Everything `buildLlmsTxt` needs. */
export interface LlmsInput {
	siteUrl: string;
	/** shadcn registries URL template, e.g. `https://…/r/{name}.json`. */
	registryTemplate: string;
	/** shadcn registry namespace, e.g. `@hex`. */
	namespace: string;
	docs: readonly LlmsDocLink[];
	recipes: readonly LlmsRecipe[];
}

/** Everything `buildLlmsFullTxt` needs beyond the compact index. */
export interface LlmsFullInput extends LlmsInput {
	catalog: readonly LlmsCatalogGroup[];
	/** Derives an install command for a slug (single source: lib/registry). */
	installCommand: (slug: string) => string;
}

/**
 * Build the compact `/llms.txt` index per llmstxt.org: title, one-blockquote
 * summary, docs links, agent endpoints, and the recipe list.
 * @param input - Site, docs, and recipe data
 * @returns The llms.txt markdown
 */
export function buildLlmsTxt(input: LlmsInput): string {
	const { siteUrl } = input;
	const lines: string[] = [];
	const push = (s = ""): number => lines.push(s);

	push("# Hex UI");
	push();
	push(
		"> AI-native React component library (Radix UI + Tailwind CSS v4). Every one of its registry items carries a machine-readable `ai` block — whenToUse, whenNotToUse, anti-patterns with resolvable alternatives, accessibility notes, and a measured token budget — so agents can pick and compose components correctly on the first try. Distribution is MCP-first (`@hex-core/mcp`), with a CLI (`@hex-core/cli`) and shadcn CLI interop.");
	push();
	push("## Docs");
	push();
	for (const doc of input.docs) {
		push(`- [${doc.title}](${siteUrl}${doc.href}): ${doc.description}`);
	}
	push();
	push("## Agent endpoints");
	push();
	push(
		`- [Catalog index](${siteUrl}/registry.json): all items with name, description, category, tags, and token budget — start here, then fetch per-item JSON`,
	);
	push(
		`- [Per-item JSON](${input.registryTemplate}): shadcn registry-item format plus the \`ai\` intent block; install via \`npx shadcn@latest add ${input.namespace}/<name>\` after declaring \`"registries": { "${input.namespace}": "${input.registryTemplate}" }\` in components.json`,
	);
	push(`- [Recipes index](${siteUrl}/recipes.json): component- and page-recipes with component lists`);
	push(
		`- [Knowledge graph](${siteUrl}/graph.json): related / composes / requires / instead-use edges across the catalog`,
	);
	push(`- [Full catalog for LLMs](${siteUrl}/llms-full.txt): this file plus every item's intent summary`);
	push();
	push(
		"MCP server: `npx @hex-core/mcp` (tools: search, describe_intent, resolve_spec, map_application, scaffold_poc, themes, query_graph, …). CLI: `pnpm dlx @hex-core/cli add <slug>`. Agent skills: `hex skills install`.",
	);
	push();
	push("## Recipes");
	push();
	for (const recipe of input.recipes) {
		push(`- **${recipe.slug}** (${recipe.kind}): ${recipe.summary}`);
	}
	push();
	return lines.join("\n");
}

/**
 * Build `/llms-full.txt`: the compact index plus the full catalog grouped by
 * category, one item per line with its `whenToUse` intent and install command.
 * @param input - Everything the compact index needs, plus the catalog groups
 * @returns The llms-full.txt markdown
 */
export function buildLlmsFullTxt(input: LlmsFullInput): string {
	const lines: string[] = [buildLlmsTxt(input)];
	const push = (s = ""): number => lines.push(s);

	push("## Catalog");
	push();
	push(
		`Install any item with \`${input.installCommand("<slug>")}\` or \`npx shadcn@latest add ${input.namespace}/<slug>\`. Component docs live at ${input.siteUrl}/docs/components/<slug>.`,
	);
	for (const group of input.catalog) {
		push();
		push(`### ${group.label}`);
		push();
		for (const item of group.items) {
			push(`- **${item.name}** (${item.displayName}): ${item.description} When to use: ${item.whenToUse}`);
		}
	}
	push();
	return lines.join("\n");
}
