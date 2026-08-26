/**
 * Contract tests for the theme transformer.
 *
 * Locks down what shape themeToTailwindConfig + themeToCss + themeToFlatJson
 * produce so Hex Studio + downstream consumers can rely on the output keys.
 */
import { strictThemeSchema, type Theme } from "@hex-core/registry";
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

/**
 * Read one custom-property declaration out of a CSS block.
 * @param block - A `:root { … }` or `.dark { … }` block
 * @param key - Token name without the `--` prefix
 * @returns The declared value, or undefined when the key is absent
 */
function declaration(block: string, key: string): string | undefined {
	return new RegExp(`--${key}:\\s*([^;]+);`).exec(block)?.[1]?.trim();
}

/**
 * Read a declaration and follow one level of `var()` indirection.
 *
 * A palette-backed theme writes `--primary: var(--slate-900)` and puts the
 * triplet on the ramp entry, so asserting on the literal means resolving
 * through the ramp — which always lives in `:root`, for both modes.
 * @param block - The block the token is declared in
 * @param key - Token name without the `--` prefix
 * @param rampBlock - Where ramp entries live; defaults to `block` itself
 * @returns The resolved literal value
 */
function resolveDeclaration(block: string, key: string, rampBlock = block): string | undefined {
	const raw = declaration(block, key);
	const via = raw === undefined ? null : /^var\(--([a-z0-9-]+)\)$/.exec(raw);
	return via ? declaration(rampBlock, via[1]) : raw;
}

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
		// `--background` is theme-specific and shifts when the default
		// palette changes (e.g. v1.3 moved off the shadcn-canon `0 0% 100%`
		// to a cool-tinted `210 20% 98%`). Assert against the live theme
		// value rather than a literal — this catches transformer drift
		// without breaking on intentional palette swaps.
		expect(flat["--background"]).toBe(defaultTheme.tokens.light.background?.value);
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

describe("generateGlobalsCss target option", () => {
	it("defaults to v3 — unchanged from the legacy single-arg signature", () => {
		const v3Default = generateGlobalsCss(defaultTheme);
		const v3Explicit = generateGlobalsCss(defaultTheme, { target: "v3" });
		expect(v3Default).toBe(v3Explicit);
		expect(v3Default).toContain("@tailwind base;");
		expect(v3Default).toContain("@layer base {");
		expect(v3Default).toContain(":root {");
		expect(v3Default).toContain(".dark {");
	});

	it("v4 emits @import tailwindcss + tw-animate-css", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		expect(css.startsWith(`@import "tailwindcss";`)).toBe(true);
		expect(css).toContain(`@import "tw-animate-css";`);
	});

	it("v4 emits @custom-variant for class-based dark mode", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		expect(css).toContain("@custom-variant dark (&:is(.dark *));");
	});

	it("v4 resolves every :root token to a raw triplet, directly or through the ramp", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const rootBlock = css.match(/:root \{[\s\S]+?\n\}/);
		expect(rootBlock).not.toBeNull();
		// A palette-backed theme points semantic tokens at their ramp entry;
		// the triplet `hex theme edit` mutates lives one level down. Either
		// way every token bottoms out in an `H S% L%` value.
		expect(resolveDeclaration(rootBlock?.[0] ?? "", "background")).toMatch(
			/^[\d.]+ [\d.]+% [\d.]+%$/,
		);
		expect(resolveDeclaration(rootBlock?.[0] ?? "", "primary")).toMatch(
			/^[\d.]+ [\d.]+% [\d.]+%$/,
		);
	});

	it("v4 draws `primary` and `ring` from one ramp entry so re-tinting is a single edit", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const rootBlock = css.match(/:root \{[\s\S]+?\n\}/)?.[0] ?? "";
		expect(rootBlock).toMatch(/--primary: var\(--[a-z0-9-]+\);/);
		expect(declaration(rootBlock, "primary")).toBe(declaration(rootBlock, "ring"));
	});

	it("v4 without `sources` keeps automatic content detection", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		expect(css).toContain(`@import "tailwindcss";`);
		expect(css).not.toContain("source(none)");
		expect(css).not.toContain("@source");
	});

	it("v4 with `sources` turns detection off and names each glob", () => {
		// The scan is scoped because Tailwind's automatic detection walks up
		// past a generated app to the enclosing repo and reads binary files as
		// class candidates — which emitted unparseable utilities and 500'd
		// every route of a POC scaffolded inside this monorepo.
		const css = generateGlobalsCss(defaultTheme, {
			target: "v4",
			sources: ["../app/**/*.{ts,tsx}", "../components/**/*.{ts,tsx}"],
		});
		expect(css).toContain(`@import "tailwindcss" source(none);`);
		expect(css).not.toMatch(/@import "tailwindcss";/);
		expect(css).toContain(`@source "../app/**/*.{ts,tsx}";`);
		expect(css).toContain(`@source "../components/**/*.{ts,tsx}";`);
	});

	it("v4 `sources` orders @source rules after the import so they apply", () => {
		const css = generateGlobalsCss(defaultTheme, {
			target: "v4",
			sources: ["../app/**/*.tsx"],
		});
		expect(css.indexOf("source(none)")).toBeLessThan(css.indexOf("@source"));
	});

	it("v4 treats an empty `sources` array as unscoped rather than scanning nothing", () => {
		// `source(none)` with no @source rule would emit zero utilities — a
		// blank-looking app. Falling back to automatic detection is the safer
		// reading of "no globs given".
		const css = generateGlobalsCss(defaultTheme, { target: "v4", sources: [] });
		expect(css).toContain(`@import "tailwindcss";`);
		expect(css).not.toContain("source(none)");
	});

	it("v3 ignores `sources` — it has no @source rule", () => {
		const withSources = generateGlobalsCss(defaultTheme, {
			target: "v3",
			sources: ["../app/**/*.tsx"],
		});
		expect(withSources).toBe(generateGlobalsCss(defaultTheme, { target: "v3" }));
		expect(withSources).not.toContain("@source");
	});

	it("v4 bridges raw triplets into Tailwind's --color-* namespace via @theme inline", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		expect(css).toContain("@theme inline {");
		expect(css).toContain("--color-background: hsl(var(--background));");
		expect(css).toContain("--color-primary: hsl(var(--primary));");
	});

	it("v4 dark block flips every token so .dark cascades through the bridge", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		const darkBlockMatch = css.match(/\.dark \{[\s\S]+?\n\}/);
		expect(darkBlockMatch).not.toBeNull();
		const root = css.match(/:root \{[\s\S]+?\n\}/)?.[0] ?? "";
		for (const key of ["background", "foreground"]) {
			// The dark value must differ from light, and must still bottom out
			// in a triplet — the ramp entries live in :root for both modes.
			expect(declaration(darkBlockMatch?.[0] ?? "", key)).not.toBe(declaration(root, key));
			expect(resolveDeclaration(darkBlockMatch?.[0] ?? "", key, root)).toMatch(
				/^[\d.]+ [\d.]+% [\d.]+%$/,
			);
		}
	});

	it("v4 does NOT inline color values directly into @theme (would break alpha utilities + hex theme edit)", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		// The non-inline `@theme {` would inline values directly; we only emit `@theme inline {`.
		// Negative-look guard: there must be NO `@theme {` that isn't `@theme inline {`.
		expect(css).not.toMatch(/@theme \{(?![\s\S]*?inline)/);
	});

	it("v4 emits body/border-color rules so the page renders against the theme", () => {
		const css = generateGlobalsCss(defaultTheme, { target: "v4" });
		expect(css).toContain("background: var(--color-background)");
		expect(css).toContain("color: var(--color-foreground)");
		expect(css).toContain("border-color: var(--color-border)");
	});

	it("v4 works for every OS preset theme — bridge shape", () => {
		for (const [_, theme] of allThemes) {
			const css = generateGlobalsCss(theme, { target: "v4" });
			expect(css).toContain(`@import "tailwindcss";`);
			expect(css).toContain("@theme inline {");
			expect(css).toContain("--color-background: hsl(var(--background));");
			const rootBlock = css.match(/:root \{[\s\S]+?\n\}/)?.[0] ?? "";
			expect(resolveDeclaration(rootBlock, "background")).toMatch(/^[\d.]+ [\d.]+% [\d.]+%$/);
		}
	});
});

describe("@hex-core/registry@0.3.0 strict-schema parity", () => {
	// Regression gate for the Theme B follow-up — the three OSS preset themes
	// must continue to satisfy `strictThemeSchema` (the typed version added
	// in registry@0.3.0). If a future theme drifts (e.g. the `primary` slot
	// ends up carrying a non-color token, or a required canonical token gets
	// removed), this test fails BEFORE the bad shape reaches the published
	// tarball.
	it.each(allThemes)(`%s theme satisfies strictThemeSchema`, (_name, theme) => {
		const result = strictThemeSchema.safeParse(theme);
		if (!result.success) {
			throw new Error(
				`strictThemeSchema rejected theme: ${JSON.stringify(result.error.issues, null, 2)}`,
			);
		}
		expect(result.success).toBe(true);
	});
});
