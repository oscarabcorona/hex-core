import "server-only";
import { registryItemSchema, type RegistryItem } from "@hex-core/registry";

/**
 * Load a full registry item by slug. Server-only to avoid bundling every JSON
 * payload into the client chunk.
 *
 * The JSON is parsed through the schema rather than `as`-cast into it: a
 * cast on a dynamic import asserts a shape nothing verified, so a registry
 * item that drifted from the schema would render as `undefined` fields
 * deep in a page instead of failing here.
 * @param slug - Component name, e.g. "button"
 * @returns The full registry item, or null if not found or malformed
 */
export async function getRegistryItem(slug: string): Promise<RegistryItem | null> {
	try {
		const item = await import(`../../../../registry/items/${slug}.json`);
		const parsed = registryItemSchema.safeParse(item.default);
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}
