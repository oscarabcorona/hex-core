/**
 * Contract tests for the theme transformer.
 *
 * Locks down what shape themeToTailwindConfig + themeToCss + themeToFlatJson
 * produce so Hex Studio + downstream consumers can rely on the output keys.
 */
import type { Theme } from "@hex-core/registry";
import { describe, expect, it } from "vitest";
import {
	defaultTheme,
	emberTheme,
	generateGlobalsCss,
	getTheme,
	listThemes,
	midnightTheme,
	themeToCss,
	themeToFlatJson,
	themeToScopedRuntimeCss,
	themeToTailwindConfig,
} from "../src/index.js";

const allThemes: Array<[string, Theme]> = [
	["default", defaultTheme],
	["midnight", midnightTheme],
	["ember", emberTheme],
];

describe("themeToTailwindConfig", () => {
	it.each(allThemes)("returns the 6 expected top-level keys for %s", (_name, theme) => {
		const config = themeToTailwindConfig(theme);
		expect(Object.keys(config).sort()).toEqual(
			["borderRadius", "colors", "fontSize", "height", "spacing", "transitionDuration"].sort(),
		);
	});

	it("maps color tokens to hsl(var(--name))", () => {
		const config = themeToTailwindConfig(defaultTheme);
		expect(config.colors.background).toBe("hsl(var(--background))");
		expect(config.colors.primary).toBe("hsl(var(--primary))");
	});

	it("maps radius token to var(--name)", () => {
		const config = themeToTailwindConfig(defaultTheme);
		expect(config.borderRadius.radius).toBe("var(--radius)");
	});

	it("strips space- and gap- prefixes when emitting spacing keys", () => {
		const config = themeToTailwindConfig(defaultTheme);
		// space-4 → spacing.4 (so consumers write `p-4` and it resolves to var(--space-4))
		expect(config.spacing["4"]).toBe("var(--space-4)");
		// gap-md → spacing.md
		expect(config.spacing.md).toBe("var(--gap-md)");
	});

	it("strips text- prefix from typography tokens for Tailwind fontSize", () => {
		const config = themeToTailwindConfig(defaultTheme);
		// text-lg → fontSize.lg
		expect(config.fontSize.lg).toBe("var(--text-lg)");
		expect(config.fontSize["2xl"]).toBe("var(--text-2xl)");
	});

	it("strips control- prefix from dimension tokens for Tailwind height", () => {
		const config = themeToTailwindConfig(defaultTheme);
		// control-height-md → height.height-md
		expect(config.height["height-md"]).toBe("var(--control-height-md)");
	});

	it("strips duration- prefix for transitionDuration", () => {
		const config = themeToTailwindConfig(defaultTheme);
		expect(config.transitionDuration.normal).toBe("var(--duration-normal)");
		expect(config.transitionDuration.fast).toBe("var(--duration-fast)");
	});

	it("ignores tokens without a type", () => {
		// Construct a theme that has a typeless entry — should not appear in output.
		const naked: Theme = {
			...defaultTheme,
			tokens: {
				...defaultTheme.tokens,
				light: {
					...defaultTheme.tokens.light,
					"unknown-token": { value: "anything" } as never,
				},
			},
		};
		const config = themeToTailwindConfig(naked);
		// Doesn't appear under any category.
		const allKeys = Object.values(config).flatMap((cat) => Object.keys(cat));
		expect(allKeys).not.toContain("unknown-token");
	});
});

describe("themeToCss", () => {
	it("emits :root and .dark blocks inside @layer base", () => {
		const css = themeToCss(defaultTheme);
		expect(css).toContain("@layer base");
		expect(css).toContain(":root");
		expect(css).toContain(".dark");
	});

	it("emits every required color token in :root", () => {
		const css = themeToCss(defaultTheme);
		for (const key of [
			"background",
			"foreground",
			"primary",
			"secondary",
			"destructive",
			"border",
			"ring",
		]) {
			expect(css).toContain(`--${key}:`);
		}
	});

	it("emits the new shared tokens (spacing / control-height / duration / typography)", () => {
		const css = themeToCss(defaultTheme);
		expect(css).toContain("--space-4:");
		expect(css).toContain("--gap-md:");
		expect(css).toContain("--control-height-md:");
		expect(css).toContain("--duration-normal:");
		expect(css).toContain("--text-base:");
	});

	it.each(allThemes)("produces a valid block for theme %s", (_name, theme) => {
		const css = themeToCss(theme);
		// Each declaration line ends with a semicolon. The most basic sanity check.
		expect(css).toMatch(/--[a-z-]+:\s*[^;]+;/);
	});
});

describe("themeToFlatJson", () => {
	it("returns a flat record keyed by --token-name in light mode", () => {
		const flat = themeToFlatJson(defaultTheme, "light");
		expect(flat["--background"]).toBe("0 0% 100%");
		expect(flat["--space-4"]).toBe("1rem");
	});

	it("differentiates light and dark color tokens but shares spacing tokens", () => {
		const lightFlat = themeToFlatJson(defaultTheme, "light");
		const darkFlat = themeToFlatJson(defaultTheme, "dark");
		expect(lightFlat["--background"]).not.toBe(darkFlat["--background"]);
		// Spacing tokens are shared across light/dark in the OS presets.
		expect(lightFlat["--space-4"]).toBe(darkFlat["--space-4"]);
	});

	it("defaults to light when no mode is passed", () => {
		const defaultMode = themeToFlatJson(defaultTheme);
		const explicitLight = themeToFlatJson(defaultTheme, "light");
		expect(defaultMode).toEqual(explicitLight);
	});
});

describe("generateGlobalsCss", () => {
	it("includes Tailwind directives + the @theme block + base layer styles", () => {
		const css = generateGlobalsCss(defaultTheme);
		expect(css).toContain("@tailwind base");
		expect(css).toContain("@tailwind components");
		expect(css).toContain("@tailwind utilities");
		expect(css).toContain(":root");
		expect(css).toContain(".dark");
		expect(css).toContain("@apply border-border");
		expect(css).toContain("@apply bg-background text-foreground");
	});
});

describe("getTheme + listThemes", () => {
	it("listThemes returns metadata for all 3 OS presets", () => {
		const themes = listThemes();
		const names = themes.map((t) => t.name).sort();
		expect(names).toEqual(["default", "ember", "midnight"]);
	});

	it("getTheme returns the full theme object for a known preset", () => {
		const theme = getTheme("midnight");
		expect(theme).toBeDefined();
		if (!theme) return;
		expect(theme.name).toBe("midnight");
		expect(theme.tokens.light.background).toBeDefined();
		expect(theme.tokens.dark.background).toBeDefined();
	});

	it("getTheme returns undefined for an unknown preset", () => {
		expect(getTheme("nonexistent")).toBeUndefined();
	});
});

describe("themeToScopedRuntimeCss", () => {
	it("defaults to :root + light when no options are passed", () => {
		const css = themeToScopedRuntimeCss(defaultTheme);
		expect(css.startsWith(":root {")).toBe(true);
		expect(css.endsWith("}")).toBe(true);
	});

	it("emits the raw `--<key>` form for every token (preserves alpha composition)", () => {
		const css = themeToScopedRuntimeCss(defaultTheme);
		// Color token (background) — raw triplet form must be present.
		// Matches integer or decimal HSL components (e.g. "240 5.9% 10%").
		expect(css).toMatch(/--background: [\d.]+ [\d.]+% [\d.]+%;/);
	});

	it("emits the Tailwind v4 `--color-<key>: hsl(...)` bridge for color tokens", () => {
		const css = themeToScopedRuntimeCss(defaultTheme);
		expect(css).toMatch(/--color-background: hsl\([\d.]+ [\d.]+% [\d.]+%\);/);
		expect(css).toMatch(/--color-primary: hsl\([\d.]+ [\d.]+% [\d.]+%\);/);
	});

	it("does NOT wrap non-color tokens in hsl() (radii, durations stay raw)", () => {
		const css = themeToScopedRuntimeCss(defaultTheme);
		// radius-md is a length, not a color — must not appear as --color-radius-md.
		expect(css).not.toContain("--color-radius-md:");
	});

	it("respects a custom scope selector", () => {
		const css = themeToScopedRuntimeCss(defaultTheme, { scope: ".studio-canvas-active" });
		expect(css.startsWith(".studio-canvas-active {")).toBe(true);
		expect(css).not.toContain(":root {");
	});

	it("renders the dark palette when mode='dark'", () => {
		const lightCss = themeToScopedRuntimeCss(defaultTheme, { mode: "light" });
		const darkCss = themeToScopedRuntimeCss(defaultTheme, { mode: "dark" });
		// Background differs between light and dark for every theme — easiest sentinel.
		expect(lightCss).not.toEqual(darkCss);
	});

	it("renders correctly for all 3 OS preset themes", () => {
		for (const [_, theme] of allThemes) {
			const css = themeToScopedRuntimeCss(theme, { scope: ".x", mode: "dark" });
			expect(css).toContain(".x {");
			expect(css).toContain("--background:");
			expect(css).toContain("--color-background: hsl(");
		}
	});
});
