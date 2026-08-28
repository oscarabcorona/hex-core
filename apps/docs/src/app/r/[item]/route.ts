import { loadRegistryItem, rewriteRegistryImports } from "@hex-core/payload";
import { toShadcnRegistryItem } from "@hex-core/registry";
import { listComponents } from "../../../lib/registry";
import { getRegistryItem } from "../../../lib/registry.server";

/**
 * shadcn-compatible per-item registry route. Consumers declare
 * `"registries": { "@hex": "<site>/r/{name}.json" }` in components.json and
 * install with `npx shadcn@latest add @hex/button`; the CLI substitutes
 * `{name}` and fetches this route. Every response is the Hex item projected
 * through `toShadcnRegistryItem` — shadcn wire format with the `ai` block
 * riding along.
 */

/** Every catalog slug, prerendered at build time. */
export function generateStaticParams(): { item: string }[] {
	return listComponents().map((component) => ({ item: `${component.name}.json` }));
}

/** Params outside the catalog 404 instead of rendering at request time. */
export const dynamicParams = false;

/** Prerendered — responses derive only from the committed registry. */
export const dynamic = "force-static";

/**
 * Serve one registry item in shadcn registry-item wire format.
 * @param _request - Unused; the response depends only on the route param
 * @param context - Route context carrying the `item` param (`<slug>.json`)
 * @returns The projected item, or 404 when the param is not `<slug>.json`
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ item: string }> },
): Promise<Response> {
	const { item } = await context.params;
	if (!item.endsWith(".json")) {
		return new Response("Not found", { status: 404 });
	}
	const slug = item.slice(0, -".json".length);
	const registryItem = await getRegistryItem(slug);
	if (!registryItem) {
		// dynamicParams=false means every slug reaching here came from
		// generateStaticParams — a null load is a malformed registry item, and
		// the build should fail loudly (same philosophy as llms-full.txt).
		throw new Error(`Registry item failed to load: ${slug}`);
	}
	// The registry ships monorepo-source-style import specifiers; the Hex CLI
	// rewrites them at install time, the shadcn CLI never will. Rewriting to
	// `@/` aliases here lets shadcn map them onto the consumer's own aliases.
	// The internal-dependency resolver lets the projection union npm deps
	// across the inlined-file closure — another install-time pass shadcn
	// doesn't have.
	return Response.json(
		toShadcnRegistryItem(registryItem, {
			transformFileContent: (content) => rewriteRegistryImports(content),
			resolveInternalItem: (slug) => loadRegistryItem(slug),
		}),
	);
}
