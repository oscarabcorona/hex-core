import recipesIndex from "../../../../../registry/recipes.json";
import { GETTING_STARTED_NAV } from "../../lib/docs-nav";
import { buildLlmsFullTxt, type LlmsCatalogGroup } from "../../lib/llms";
import {
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	componentsByCategory,
	installCommand,
	listComponents,
} from "../../lib/registry";
import { getRegistryItem } from "../../lib/registry.server";
import { HEX_REGISTRY_NAMESPACE, HEX_REGISTRY_TEMPLATE, SITE_URL } from "../../lib/site";

/** Prerendered — derives only from committed registry data and the nav. */
export const dynamic = "force-static";

/**
 * Assemble the catalog groups: every category in display order, every item
 * with its `whenToUse` intent from the full registry item. Throws when an
 * item fails to load — a malformed registry should fail the build here, not
 * serve a silently shorter catalog.
 * @returns Ordered category groups for the llms-full catalog section
 */
async function loadCatalog(): Promise<LlmsCatalogGroup[]> {
	const groups = componentsByCategory();
	const covered = new Set<string>(CATEGORY_ORDER);
	const missing = listComponents().filter((item) => !covered.has(item.category));
	if (missing.length > 0) {
		throw new Error(
			`CATEGORY_ORDER does not cover: ${[...new Set(missing.map((m) => m.category))].join(", ")}`,
		);
	}
	const catalog: LlmsCatalogGroup[] = [];
	for (const category of CATEGORY_ORDER) {
		const items = groups[category] ?? [];
		if (items.length === 0) continue;
		catalog.push({
			label: CATEGORY_LABELS[category] ?? category,
			items: await Promise.all(
				items.map(async (summary) => {
					const item = await getRegistryItem(summary.name);
					if (!item) throw new Error(`Registry item failed to load: ${summary.name}`);
					return {
						name: item.name,
						displayName: item.displayName,
						description: item.description,
						whenToUse: item.ai.whenToUse,
					};
				}),
			),
		});
	}
	return catalog;
}

/**
 * The deliberate-load variant of `/llms.txt`: the compact index plus every
 * catalog item's one-line intent, grouped by category.
 * @returns llms-full.txt as `text/plain`
 */
export async function GET(): Promise<Response> {
	const body = buildLlmsFullTxt({
		siteUrl: SITE_URL,
		registryTemplate: HEX_REGISTRY_TEMPLATE,
		namespace: HEX_REGISTRY_NAMESPACE,
		docs: GETTING_STARTED_NAV,
		recipes: recipesIndex.items,
		catalog: await loadCatalog(),
		installCommand,
	});
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
