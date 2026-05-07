import type { MetadataRoute } from "next";
import { listComponents } from "../lib/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hex-core.dev";

/** Pinned once per build so crawlers see a stable `lastModified` per deploy. */
const BUILD_TIME = new Date();

const STATIC_ROUTES: readonly { path: string; priority: number }[] = [
	{ path: "/", priority: 1 },
	{ path: "/docs", priority: 0.9 },
	{ path: "/docs/getting-started", priority: 0.9 },
	{ path: "/docs/installation", priority: 0.8 },
	{ path: "/docs/theming", priority: 0.8 },
	{ path: "/docs/mcp", priority: 0.8 },
	{ path: "/docs/motion", priority: 0.8 },
	{ path: "/docs/faq", priority: 0.7 },
] as const;

/**
 * Dynamic sitemap. Emits entries for the marketing landing, docs shell pages,
 * and one entry per registry component. `lastModified` is pinned to build time
 * so crawler caches aren't needlessly busted.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
		url: `${SITE_URL}${path}`,
		lastModified: BUILD_TIME,
		changeFrequency: "weekly",
		priority,
	}));
	const componentRoutes: MetadataRoute.Sitemap = listComponents().map((item) => ({
		url: `${SITE_URL}/docs/components/${item.name}`,
		lastModified: BUILD_TIME,
		changeFrequency: "weekly",
		priority: 0.8,
	}));
	return [...staticRoutes, ...componentRoutes];
}
