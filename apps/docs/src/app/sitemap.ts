import type { MetadataRoute } from "next";
import { GETTING_STARTED_NAV } from "../lib/docs-nav";
import { listComponents } from "../lib/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hex-core.dev";

/** Pinned once per build so crawlers see a stable `lastModified` per deploy. */
const BUILD_TIME = new Date();

/**
 * Docs routes are derived from `GETTING_STARTED_NAV` rather than re-listed
 * here — two hardcoded route lists had already drifted (spec-driven, blocks
 * and skills were missing from the sitemap). Adding a docs page is now a
 * one-line edit in `docs-nav.ts`, which is what its own docstring promises.
 */
const STATIC_ROUTES: readonly { path: string; priority: number }[] = [
	{ path: "/", priority: 1 },
	{ path: "/docs", priority: 0.9 },
	...GETTING_STARTED_NAV.map((link) => ({
		path: link.href,
		priority: link.href === "/docs/getting-started" ? 0.9 : 0.8,
	})),
];

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
