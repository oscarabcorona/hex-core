/**
 * Visual regression tests for every registry component, in light + dark.
 *
 * Strategy: the docs site at /docs/components/<slug> already mounts every
 * component as a live preview (registry-driven). We screenshot the
 * `[data-testid="component-preview"]` region — that scopes the diff to
 * the rendered component itself, so docs chrome / sidebar / nav churn
 * doesn't churn baselines.
 *
 * Baselines live under `e2e/visual.spec.ts-snapshots/` in git. Refresh
 * with `pnpm --filter docs test:visual:update` after intentional visual
 * changes. CI uploads `playwright-report/` as an artifact on diff failure.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

interface RegistryItem {
	name: string;
	displayName: string;
}

interface RegistryIndex {
	items: RegistryItem[];
}

const REGISTRY_PATH = path.resolve(__dirname, "../../../registry/registry.json");
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8")) as RegistryIndex;

/**
 * Some registry items ship intentionally without a live demo:
 *   - motion-pro   — peer-deps motion@^11; a demo would crash at import time
 *   - transition   — pure type/token bag, nothing to render visually
 *   - track        — label-only context provider, no DOM of its own
 *
 * The component page renders no `<ComponentPreview>` for these, so the
 * screenshot target wouldn't exist. Skipping them here is intentional —
 * the items still get an axe-scan via the a11y audit.
 */
const NO_VISUAL_DEMO = new Set([
	"motion-pro",
	"transition",
	"track",
	// Composed page-section blocks: they need real content + sibling context to
	// render meaningfully, so they ship no isolated /docs/components preview.
	// They're visually pinned in-context by the showcase snapshots below
	// (/landing, /app, /store) and a11y-scanned there.
	"marketing-header",
	"marketing-hero",
	"marketing-logo-cloud",
	"marketing-feature-grid",
	"marketing-pricing",
	"marketing-testimonial",
	"marketing-cta",
	"marketing-footer",
	"app-shell",
	"app-sidebar-nav",
	"app-stats",
	"app-settings",
	"app-data-table",
	"commerce-product-grid",
	"commerce-product-detail",
	"commerce-reviews",
	"commerce-cart",
	"commerce-checkout",
]);

const themes = [
	{ name: "light", html: "" },
	{ name: "dark", html: "dark" },
] as const;

// Freezes anything time-based that would churn screenshots: animations,
// transitions, caret blink, smooth scroll. CSS-level only — no React state
// changes — so the rendered tree stays semantically identical.
const FREEZE_CSS = `
*, *::before, *::after {
	animation-duration: 0s !important;
	animation-delay: 0s !important;
	transition-duration: 0s !important;
	transition-delay: 0s !important;
	caret-color: transparent !important;
	scroll-behavior: auto !important;
}
`;

for (const { name: slug, displayName } of registry.items) {
	if (NO_VISUAL_DEMO.has(slug)) continue;
	for (const theme of themes) {
		test(`${slug} (${theme.name})`, async ({ page }) => {
			// Set the theme class BEFORE the page renders to avoid a flash.
			// next-themes reads localStorage on hydrate, so seeding it there
			// is the most reliable way to lock the rendered theme.
			await page.addInitScript((themeClass) => {
				try {
					localStorage.setItem("theme", themeClass || "light");
				} catch {
					// localStorage may be unavailable in some test contexts; the
					// classList fallback below covers it.
				}
			}, theme.html);

			await page.goto(`/docs/components/${slug}`, { waitUntil: "networkidle" });
			await page.addStyleTag({ content: FREEZE_CSS });
			await page.evaluate((cls) => {
				const html = document.documentElement;
				if (cls) html.classList.add(cls);
				else html.classList.remove("dark");
			}, theme.html);

			// Most pages render multiple <ComponentPreview /> instances — one
			// inline preview at the top of the page, plus one per additional
			// example below. We screenshot only the first (the inline preview)
			// so baselines stay deterministic per component, regardless of how
			// many examples a future docs author adds.
			const preview = page.getByTestId("component-preview").first();
			await expect(preview).toBeVisible({ timeout: 30_000 });

			await expect(preview).toHaveScreenshot(`${slug}-${theme.name}.png`, {
				maxDiffPixelRatio: 0.01,
				animations: "disabled",
			});

			// Echo a stable label so logs are greppable per slug.
			test.info().annotations.push({ type: "component", description: `${displayName} (${theme.name})` });
		});
	}
}

/**
 * Page-level showcase snapshots. The composed section blocks (excluded from
 * the per-component loop above) are rendered in real context here — a full
 * landing page, app dashboard, and storefront — so a visual diff catches any
 * regression in how the blocks compose, not just how they render in isolation.
 */
const SHOWCASES = [
	{ slug: "showcase-landing", route: "/landing" },
	{ slug: "showcase-app", route: "/app" },
	{ slug: "showcase-store", route: "/store" },
] as const;

for (const { slug, route } of SHOWCASES) {
	for (const theme of themes) {
		test(`${slug} (${theme.name})`, async ({ page }) => {
			await page.addInitScript((themeClass) => {
				try {
					localStorage.setItem("theme", themeClass || "light");
				} catch {
					/* classList fallback below */
				}
			}, theme.html);

			await page.goto(route, { waitUntil: "networkidle" });
			await page.addStyleTag({ content: FREEZE_CSS });
			await page.evaluate((cls) => {
				const html = document.documentElement;
				if (cls) html.classList.add(cls);
				else html.classList.remove("dark");
			}, theme.html);

			await expect(page).toHaveScreenshot(`${slug}-${theme.name}.png`, {
				fullPage: true,
				maxDiffPixelRatio: 0.01,
				animations: "disabled",
			});
		});
	}
}
