/**
 * Site-level constants shared by every derived endpoint (sitemap, robots,
 * llms.txt, the agent-facing registry routes) and by docs prose that prints
 * absolute URLs. One definition — the sitemap and robots files each carried
 * their own copy of the env fallback before this module existed.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hex-core.dev";

/**
 * The URL template consumers put in `components.json` to install Hex items
 * through the shadcn CLI's namespaced-registry support:
 *
 * ```json
 * { "registries": { "@hex": "https://hex-core.dev/r/{name}.json" } }
 * ```
 *
 * The literal `{name}` is substituted by the shadcn CLI — it is not a bug.
 * Served by `src/app/r/[item]/route.ts`.
 */
export const HEX_REGISTRY_TEMPLATE = `${SITE_URL}/r/{name}.json`;

/** The namespace consumers address the Hex registry by (`@hex/button`). */
export const HEX_REGISTRY_NAMESPACE = "@hex";
