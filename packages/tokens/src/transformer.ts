import type { Theme } from "@hex-core/registry";

interface TokenLike {
	value: string;
	type?: string;
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
	for (const [key, token] of Object.entries(theme.tokens.light)) {
		lines.push(`    --${key}: ${extractValue(token)};`);
	}
	lines.push("  }");
	lines.push("");
	lines.push("  .dark {");
	for (const [key, token] of Object.entries(theme.tokens.dark)) {
		lines.push(`    --${key}: ${extractValue(token)};`);
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
 * Generates a complete globals.css content with theme tokens and Tailwind directives.
 * @param theme - The theme to generate CSS for
 * @returns A full globals.css string including Tailwind imports, theme tokens, and base layer styles
 */
export function generateGlobalsCss(theme: Theme): string {
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
