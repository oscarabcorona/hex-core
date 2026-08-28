import recipesIndex from "../../../../../registry/recipes.json";
import { GETTING_STARTED_NAV } from "../../lib/docs-nav";
import { buildLlmsTxt } from "../../lib/llms";
import { HEX_REGISTRY_NAMESPACE, HEX_REGISTRY_TEMPLATE, SITE_URL } from "../../lib/site";

/** Prerendered — derives only from committed registry data and the nav. */
export const dynamic = "force-static";

/**
 * The llmstxt.org agent index: what Hex is, where the docs are, which
 * machine endpoints exist, and the recipe list. Deliberately compact — the
 * 187-item catalog lives at `/registry.json` and `/llms-full.txt`.
 * @returns llms.txt as `text/plain`
 */
export function GET(): Response {
	const body = buildLlmsTxt({
		siteUrl: SITE_URL,
		registryTemplate: HEX_REGISTRY_TEMPLATE,
		namespace: HEX_REGISTRY_NAMESPACE,
		docs: GETTING_STARTED_NAV,
		recipes: recipesIndex.items,
	});
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
