import type { Theme } from "@hex-core/registry";

interface TokenLike {
	value: string;
	type?: string;
	ref?: string;
}

/**
 * Extract the palette key a token was drawn from.
 * @param token - A token object potentially carrying a `ref`
 * @returns The palette key, or undefined when the token holds a literal
 */
function extractRef(token: unknown): string | undefined {
	if (typeof token === "object" && token !== null && "ref" in token) {
		const { ref } = token;
		return typeof ref === "string" ? ref : undefined;
	}
	return undefined;
}

/**
 * Render a token for CSS, pointing at its ramp entry when it has one.
 *
 * A token drawn from the palette emits `var(--slate-900)` rather than the
 * triplet it resolves to. That indirection is the point of a two-tier
 * palette: `--primary` and `--ring` come from one graphite entry, so a
 * consumer re-tints everything downstream by overriding `--slate-900` in
 * their own stylesheet.
 *
 * Tokens without a `ref` — every one of the 143 imported brand presets —
 * emit their literal value unchanged.
 * @param token - The token to render
 * @returns CSS-ready value text
 */
function renderTokenValue(token: unknown): string {
	const key = extractRef(token);
	return key === undefined ? extractValue(token) : `var(--${key})`;
}

/**
 * Extract the value string from a token-like object or primitive.
 * @param token - A token object with a `value` property, or a primitive
 * @returns The token's value as a string
 */
function extractValue(token: unknown): string {
	if (typeof token === "object" && token !== null && "value" in token) {
		return String((token as TokenLike).value);
	}
	return String(token);
}

/**
 * Extract the type annotation from a token-like object.
 * @param token - A token object potentially containing a `type` property
 * @returns The token type string, or undefined if not present
 */
function extractType(token: unknown): string | undefined {
	if (typeof token === "object" && token !== null && "type" in token) {
		return (token as TokenLike).type;
	}
	return undefined;
}

/**
 * Transforms a theme's token set into CSS custom properties.
 *
 * Output uses the **raw `--<key>` namespace** — value verbatim, no `hsl()`
 * wrapper, no `--color-` prefix. Colors land as triplets (e.g. `0 0% 100%`)
 * to enable alpha composition like `hsl(var(--background) / 0.5)`. Consumers
 * on Tailwind v4 also need a `@theme` block in the `--color-<key>` namespace;
 * see the "CSS variable namespaces" section in ./README.md for the bridge.
 *
 * @param theme - The theme to transform
 * @returns A CSS string with `:root` and `.dark` custom property declarations inside a `@layer base` block
 */
export function themeToCss(theme: Theme): string {
	const lines: string[] = [];

	lines.push("@layer base {");
	lines.push("  :root {");
	for (const [key, value] of Object.entries(theme.palette ?? {})) {
		lines.push(`    --${key}: ${value};`);
	}
	for (const [key, token] of Object.entries(theme.tokens.light)) {
		lines.push(`    --${key}: ${renderTokenValue(token)};`);
	}
	lines.push("  }");
	lines.push("");
	lines.push("  .dark {");
	for (const [key, token] of Object.entries(theme.tokens.dark)) {
		lines.push(`    --${key}: ${renderTokenValue(token)};`);
	}
	lines.push("  }");
	lines.push("}");

	return lines.join("\n");
}

/**
 * Transforms a theme into a flat JSON map for AI consumption.
 * This is the most token-efficient format for LLMs.
 * @param theme - The theme to transform
 * @param mode - Color mode to extract tokens for (defaults to "light")
 * @returns A flat record mapping CSS variable names to their values
 */
export function themeToFlatJson(
	theme: Theme,
	mode: "light" | "dark" = "light",
): Record<string, string> {
	const flat: Record<string, string> = {};
	const tokens = mode === "light" ? theme.tokens.light : theme.tokens.dark;

	for (const [key, token] of Object.entries(tokens)) {
		flat[`--${key}`] = extractValue(token);
	}

	return flat;
}

/**
 * Transforms a theme into Tailwind CSS config extension.
 * @param theme - The theme to transform
 * @returns An object with maps for colors, borderRadius, spacing, fontSize,
 * transitionDuration, and height — suitable for Tailwind's `theme.extend`.
 */
export function themeToTailwindConfig(theme: Theme): Record<string, Record<string, string>> {
	const colors: Record<string, string> = {};
	const borderRadius: Record<string, string> = {};
	const spacing: Record<string, string> = {};
	const fontSize: Record<string, string> = {};
	const transitionDuration: Record<string, string> = {};
	const height: Record<string, string> = {};

	for (const [key, token] of Object.entries(theme.tokens.light)) {
		const type = extractType(token);
		if (!type) continue;

		if (type === "color") {
			colors[key] = `hsl(var(--${key}))`;
		} else if (type === "radius") {
			borderRadius[key] = `var(--${key})`;
		} else if (type === "spacing") {
			// Strip "space-" / "gap-" prefix for cleaner Tailwind usage (e.g. `p-4` vs `p-space-4`).
			const stripped = key.replace(/^(space-|gap-)/, "");
			spacing[stripped] = `var(--${key})`;
		} else if (type === "dimension") {
			// control-height-md → height.control-md
			height[key.replace(/^control-/, "")] = `var(--${key})`;
		} else if (type === "font") {
			fontSize[key.replace(/^text-/, "")] = `var(--${key})`;
		} else if (type === "duration") {
			transitionDuration[key.replace(/^duration-/, "")] = `var(--${key})`;
		}
	}

	return { colors, borderRadius, spacing, fontSize, transitionDuration, height };
}

/**
 * Options for {@link themeToScopedRuntimeCss}.
 */
export interface ScopedRuntimeCssOptions {
	/**
	 * CSS selector that the generated rule targets. Defaults to `":root"`.
	 *
	 * Pass a class selector (e.g. `".studio-canvas-active"` or `".theme-vivid"`)
	 * to scope the override to a subtree — useful when an app needs to flip
	 * themes at runtime without round-tripping through `globals.css`. The vars
	 * cascade to every descendant of an element matching the selector, so the
	 * subtree's Tailwind utilities resolve against the new values automatically.
	 */
	scope?: string;
	/**
	 * Which palette to render. Defaults to `"light"`. Pass `"dark"` to emit the
	 * theme's dark token set (typically used in combination with a `.dark` scope
	 * applied by the consumer's theme provider).
	 */
	mode?: "light" | "dark";
}

/**
 * Render a theme as scoped runtime CSS for the Tailwind v4 `--color-*` namespace.
 *
 * Unlike {@link themeToCss} (which emits at `:root` for static `globals.css`),
 * this targets a configurable selector so the override applies only to that
 * subtree. The output emits **both** namespaces so the result drops in cleanly
 * regardless of how the consumer's `globals.css` is wired:
 *
 * - `--<key>: <value>;` (raw triplet) — preserves alpha-composition utilities
 *   like `bg-background/50` that read the variable as bare `H S% L%`.
 * - `--color-<key>: hsl(<value>);` (full `hsl()` string) — feeds Tailwind v4's
 *   `@theme` block so generated utilities like `bg-background` / `text-primary`
 *   resolve against the override.
 *
 * Non-color tokens (radii, durations, spacing, font sizes) only emit the raw
 * `--<key>` form since they don't go through `@theme`'s color machinery.
 *
 * @param theme - The theme to render
 * @param options - Scope selector + light/dark mode (see {@link ScopedRuntimeCssOptions}).
 * @returns A CSS string with one rule wrapping all the token declarations.
 *
 * @example
 * ```ts
 * import { defaultTheme, themeToScopedRuntimeCss } from "@hex-core/tokens";
 *
 * // Default: emits at :root for the light palette.
 * const css = themeToScopedRuntimeCss(defaultTheme);
 *
 * // Subtree-scoped runtime override (e.g. a theme studio's canvas):
 * const scoped = themeToScopedRuntimeCss(defaultTheme, {
 *   scope: ".studio-canvas-active",
 *   mode: "light",
 * });
 *
 * // Inject via a <style> tag:
 * // <style dangerouslySetInnerHTML={{ __html: scoped }} />
 * ```
 */
export function themeToScopedRuntimeCss(
	theme: Theme,
	options: ScopedRuntimeCssOptions = {},
): string {
	const { scope = ":root", mode = "light" } = options;
	const tokens = mode === "light" ? theme.tokens.light : theme.tokens.dark;

	const lines: string[] = [];
	lines.push(`${scope} {`);
	for (const [key, token] of Object.entries(tokens)) {
		const value = extractValue(token);
		const type = extractType(token);
		// Always emit the raw `--<key>` form. For colors, also emit the
		// Tailwind v4 `--color-<key>` bridge wrapped in hsl() so `@theme`
		// blocks resolve correctly without the consumer hand-authoring the
		// bridge layer.
		lines.push(`  --${key}: ${value};`);
		if (type === "color") {
			lines.push(`  --color-${key}: hsl(${value});`);
		}
	}
	lines.push("}");

	return lines.join("\n");
}

/**
 * Options for {@link generateGlobalsCss}.
 */
export interface GenerateGlobalsCssOptions {
	/**
	 * Tailwind major to target.
	 * - `"v3"` (default, backward compatible): emits `@tailwind base/components/utilities`
	 *   plus `@layer base { :root {} .dark {} }` blocks. Pair with a `tailwind.config.ts`
	 *   that maps the raw `--<key>` CSS variables to color/radius utilities.
	 * - `"v4"`: emits `@import "tailwindcss"` + `@theme { --color-<key>: hsl(...) }` so
	 *   utilities like `bg-background` resolve directly. No `tailwind.config.ts` needed.
	 */
	target?: "v3" | "v4";
	/**
	 * Explicit content globs for Tailwind v4 to scan, relative to the CSS file.
	 *
	 * When set, the import becomes `@import "tailwindcss" source(none)` followed
	 * by one `@source` rule per glob — automatic detection is turned off.
	 *
	 * Pass this for an app generated *inside* an existing repository. Tailwind's
	 * automatic scan walks up past the app to the enclosing git root and reads
	 * whatever it finds — including binary files, whose bytes become class
	 * candidates and emit unparseable utilities. Scoping the scan to the app's
	 * own directories is the fix. Omit it for an app at the root of its own
	 * repository, where automatic detection is correct.
	 *
	 * Ignored when `target` is `"v3"`, which has no `@source` rule.
	 */
	sources?: readonly string[];
}

/**
 * Generates a complete globals.css content with theme tokens and Tailwind directives.
 *
 * @param theme - The theme to generate CSS for
 * @param options - Output target (Tailwind v3 vs v4). Defaults to v3 for backward compatibility.
 * @returns A full globals.css string ready to drop into `app/globals.css`.
 */
export function generateGlobalsCss(theme: Theme, options: GenerateGlobalsCssOptions = {}): string {
	const { target = "v3", sources } = options;
	if (target === "v4") return generateGlobalsCssV4(theme, sources);
	return generateGlobalsCssV3(theme);
}

function generateGlobalsCssV3(theme: Theme): string {
	const lines: string[] = [];

	lines.push("@tailwind base;");
	lines.push("@tailwind components;");
	lines.push("@tailwind utilities;");
	lines.push("");
	lines.push(themeToCss(theme));
	lines.push("");
	lines.push("@layer base {");
	lines.push("  * {");
	lines.push("    @apply border-border;");
	lines.push("  }");
	lines.push("  body {");
	lines.push("    @apply bg-background text-foreground;");
	lines.push("  }");
	lines.push("}");

	return lines.join("\n");
}

/**
 * Emit only the token layer — the raw ramp, the semantic tokens, and the
 * Tailwind `--color-*` bridge.
 *
 * Split out of {@link generateGlobalsCss} so a consumer that already owns
 * its `@import`s, custom variants and non-colour `@theme` block can
 * generate just the colours. The docs site does exactly that: its
 * `globals.css` used to hand-copy this output four times over and carried
 * a "KEEP IN SYNC" comment to prove it.
 *
 * @param theme - The theme to emit
 * @returns The `:root` / `.dark` / `@theme inline` blocks, plus the base
 *   `body` and border rules
 */
export function generateThemeCssV4(theme: Theme): string {
	const lines: string[] = [];
	// Bridge pattern: raw `H S% L%` triplets live in :root / .dark, and the
	// @theme inline block aliases each `--color-<key>` to `hsl(var(--<key>))`.
	// This shape is deliberate:
	//   1. Keeps the raw `--<key>` triplet that `hex theme edit` searches for —
	//      direct values inside @theme would silently break that command.
	//   2. Keeps alpha-modifier utilities (bg-primary/50) cheap because the
	//      `<H S% L%>` triplet composes via Tailwind v4's color-mix() machinery
	//      with no per-utility re-derivation.
	lines.push("/*");
	lines.push(" * Raw token triplets (H S% L%) — the source of truth that `hex theme edit`");
	lines.push(" * mutates, and that the @theme inline block below aliases into Tailwind's");
	lines.push(" * --color-<key> namespace.");
	if (theme.palette) {
		lines.push(" *");
		lines.push(" * Tier 1 is the raw ramp; the semantic tokens below point at it with");
		lines.push(" * var(). Re-tint the whole theme by overriding a ramp entry — every");
		lines.push(" * semantic token that references it follows.");
	}
	lines.push(" */");
	lines.push(":root {");
	for (const [key, value] of Object.entries(theme.palette ?? {})) {
		lines.push(`  --${key}: ${value};`);
	}
	for (const [key, token] of Object.entries(theme.tokens.light)) {
		lines.push(`  --${key}: ${renderTokenValue(token)};`);
	}
	lines.push("}");
	lines.push("");
	lines.push(".dark {");
	for (const [key, token] of Object.entries(theme.tokens.dark)) {
		lines.push(`  --${key}: ${renderTokenValue(token)};`);
	}
	lines.push("}");
	lines.push("");
	lines.push("/*");
	lines.push(" * Tailwind v4 namespace bridge — generated utilities like bg-background");
	lines.push(" * resolve var(--color-background) here, which in turn reads var(--background)");
	lines.push(" * from the blocks above.");
	lines.push(" */");
	lines.push("@theme inline {");
	for (const [key, token] of Object.entries(theme.tokens.light)) {
		if (extractType(token) !== "color") continue;
		lines.push(`  --color-${key}: hsl(var(--${key}));`);
	}
	lines.push("}");
	lines.push("");
	lines.push("body {");
	lines.push("  background: var(--color-background);");
	lines.push("  color: var(--color-foreground);");
	lines.push("}");
	lines.push("");
	lines.push("* {");
	lines.push("  border-color: var(--color-border);");
	lines.push("}");

	return lines.join("\n");
}

function generateGlobalsCssV4(theme: Theme, sources?: readonly string[]): string {
	const lines: string[] = [];

	const scoped = sources !== undefined && sources.length > 0;
	if (scoped) {
		lines.push("/*");
		lines.push(" * `source(none)` turns off Tailwind's automatic content detection, which");
		lines.push(" * would otherwise walk up past this app to the enclosing repository and read");
		lines.push(" * binary files as class candidates, emitting utilities that fail to parse.");
		lines.push(" * The @source rules below name this app's own files instead.");
		lines.push(" */");
		lines.push(`@import "tailwindcss" source(none);`);
		for (const source of sources) lines.push(`@source "${source}";`);
	} else {
		lines.push(`@import "tailwindcss";`);
	}
	// tw-animate-css ports tailwindcss-animate's animate-in/out, fade-*, slide-*,
	// zoom-* utilities to v4 as a pure CSS import. Every Hex component that
	// transitions (dialog, dropdown-menu, popover, accordion, ...) depends on
	// these classes, so it's not optional.
	lines.push(`@import "tw-animate-css";`);
	lines.push("");
	lines.push("/* Class-based dark mode — set `.dark` on <html> via next-themes or your own provider. */");
	lines.push("@custom-variant dark (&:is(.dark *));");
	lines.push("");
	lines.push(generateThemeCssV4(theme));
	return lines.join("\n");
}
