// Re-export theme functionality for the MCP server
// We inline the theme data to avoid runtime dependency on @hex-core/tokens

interface TokenEntry {
	value: string;
	type: string;
}

interface Theme {
	name: string;
	displayName: string;
	description: string;
	tokens: {
		light: Record<string, TokenEntry>;
		dark: Record<string, TokenEntry>;
	};
}

// ─── Inline Theme Definitions ───
// These are inlined to make the MCP server self-contained (no workspace dependency at runtime)

const defaultTheme: Theme = {
	name: "default",
	displayName: "Default",
	description: "A refined, neutral theme with subtle depth. Professional and versatile.",
	tokens: {
		light: {
			background: { value: "0 0% 100%", type: "color" },
			foreground: { value: "240 10% 3.9%", type: "color" },
			card: { value: "0 0% 100%", type: "color" },
			"card-foreground": { value: "240 10% 3.9%", type: "color" },
			popover: { value: "0 0% 100%", type: "color" },
			"popover-foreground": { value: "240 10% 3.9%", type: "color" },
			primary: { value: "240 5.9% 10%", type: "color" },
			"primary-foreground": { value: "0 0% 98%", type: "color" },
			secondary: { value: "240 4.8% 95.9%", type: "color" },
			"secondary-foreground": { value: "240 5.9% 10%", type: "color" },
			muted: { value: "240 4.8% 95.9%", type: "color" },
			"muted-foreground": { value: "240 3.8% 46.1%", type: "color" },
			accent: { value: "240 4.8% 95.9%", type: "color" },
			"accent-foreground": { value: "240 5.9% 10%", type: "color" },
			destructive: { value: "0 84.2% 60.2%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "240 5.9% 90%", type: "color" },
			input: { value: "240 5.9% 90%", type: "color" },
			ring: { value: "240 5.9% 10%", type: "color" },
			radius: { value: "0.625rem", type: "radius" },
		},
		dark: {
			background: { value: "240 10% 3.9%", type: "color" },
			foreground: { value: "0 0% 98%", type: "color" },
			card: { value: "240 10% 3.9%", type: "color" },
			"card-foreground": { value: "0 0% 98%", type: "color" },
			popover: { value: "240 10% 3.9%", type: "color" },
			"popover-foreground": { value: "0 0% 98%", type: "color" },
			primary: { value: "0 0% 98%", type: "color" },
			"primary-foreground": { value: "240 5.9% 10%", type: "color" },
			secondary: { value: "240 3.7% 15.9%", type: "color" },
			"secondary-foreground": { value: "0 0% 98%", type: "color" },
			muted: { value: "240 3.7% 15.9%", type: "color" },
			"muted-foreground": { value: "240 5% 64.9%", type: "color" },
			accent: { value: "240 3.7% 15.9%", type: "color" },
			"accent-foreground": { value: "0 0% 98%", type: "color" },
			destructive: { value: "0 62.8% 30.6%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "240 3.7% 15.9%", type: "color" },
			input: { value: "240 3.7% 15.9%", type: "color" },
			ring: { value: "240 4.9% 83.9%", type: "color" },
			radius: { value: "0.625rem", type: "radius" },
		},
	},
};

const midnightTheme: Theme = {
	name: "midnight",
	displayName: "Midnight",
	description:
		"A dark-first theme with deep blues and electric accents. Built for focus-heavy interfaces.",
	tokens: {
		light: {
			background: { value: "220 23% 97%", type: "color" },
			foreground: { value: "224 71% 4%", type: "color" },
			card: { value: "220 23% 99%", type: "color" },
			"card-foreground": { value: "224 71% 4%", type: "color" },
			popover: { value: "220 23% 99%", type: "color" },
			"popover-foreground": { value: "224 71% 4%", type: "color" },
			primary: { value: "226 70% 55%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "220 14% 92%", type: "color" },
			"secondary-foreground": { value: "224 71% 4%", type: "color" },
			muted: { value: "220 14% 94%", type: "color" },
			"muted-foreground": { value: "220 9% 43%", type: "color" },
			accent: { value: "220 14% 92%", type: "color" },
			"accent-foreground": { value: "224 71% 4%", type: "color" },
			destructive: { value: "0 84% 60%", type: "color" },
			"destructive-foreground": { value: "0 0% 100%", type: "color" },
			border: { value: "220 13% 88%", type: "color" },
			input: { value: "220 13% 88%", type: "color" },
			ring: { value: "226 70% 55%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
		},
		dark: {
			background: { value: "224 71% 4%", type: "color" },
			foreground: { value: "220 23% 95%", type: "color" },
			card: { value: "224 50% 7%", type: "color" },
			"card-foreground": { value: "220 23% 95%", type: "color" },
			popover: { value: "224 50% 7%", type: "color" },
			"popover-foreground": { value: "220 23% 95%", type: "color" },
			primary: { value: "226 70% 55%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "224 30% 13%", type: "color" },
			"secondary-foreground": { value: "220 23% 95%", type: "color" },
			muted: { value: "224 30% 13%", type: "color" },
			"muted-foreground": { value: "220 9% 55%", type: "color" },
			accent: { value: "224 30% 15%", type: "color" },
			"accent-foreground": { value: "220 23% 95%", type: "color" },
			destructive: { value: "0 62% 30%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "224 20% 14%", type: "color" },
			input: { value: "224 20% 14%", type: "color" },
			ring: { value: "226 70% 55%", type: "color" },
			radius: { value: "0.5rem", type: "radius" },
		},
	},
};

const emberTheme: Theme = {
	name: "ember",
	displayName: "Ember",
	description:
		"A warm theme with terracotta and amber tones. Ideal for creative and lifestyle applications.",
	tokens: {
		light: {
			background: { value: "30 33% 98%", type: "color" },
			foreground: { value: "20 14% 10%", type: "color" },
			card: { value: "30 33% 99%", type: "color" },
			"card-foreground": { value: "20 14% 10%", type: "color" },
			popover: { value: "30 33% 99%", type: "color" },
			"popover-foreground": { value: "20 14% 10%", type: "color" },
			primary: { value: "16 65% 48%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "30 20% 92%", type: "color" },
			"secondary-foreground": { value: "20 14% 10%", type: "color" },
			muted: { value: "30 20% 94%", type: "color" },
			"muted-foreground": { value: "20 6% 43%", type: "color" },
			accent: { value: "36 60% 90%", type: "color" },
			"accent-foreground": { value: "20 14% 10%", type: "color" },
			destructive: { value: "0 84% 60%", type: "color" },
			"destructive-foreground": { value: "0 0% 100%", type: "color" },
			border: { value: "30 15% 87%", type: "color" },
			input: { value: "30 15% 87%", type: "color" },
			ring: { value: "16 65% 48%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
		},
		dark: {
			background: { value: "20 14% 6%", type: "color" },
			foreground: { value: "30 20% 94%", type: "color" },
			card: { value: "20 14% 8%", type: "color" },
			"card-foreground": { value: "30 20% 94%", type: "color" },
			popover: { value: "20 14% 8%", type: "color" },
			"popover-foreground": { value: "30 20% 94%", type: "color" },
			primary: { value: "16 65% 52%", type: "color" },
			"primary-foreground": { value: "0 0% 100%", type: "color" },
			secondary: { value: "20 12% 14%", type: "color" },
			"secondary-foreground": { value: "30 20% 94%", type: "color" },
			muted: { value: "20 12% 14%", type: "color" },
			"muted-foreground": { value: "20 6% 55%", type: "color" },
			accent: { value: "20 20% 16%", type: "color" },
			"accent-foreground": { value: "30 20% 94%", type: "color" },
			destructive: { value: "0 62% 30%", type: "color" },
			"destructive-foreground": { value: "0 0% 98%", type: "color" },
			border: { value: "20 10% 16%", type: "color" },
			input: { value: "20 10% 16%", type: "color" },
			ring: { value: "16 65% 52%", type: "color" },
			radius: { value: "0.75rem", type: "radius" },
		},
	},
};

// ─── Theme API ───

export const themes: Record<string, Theme> = {
	default: defaultTheme,
	midnight: midnightTheme,
	ember: emberTheme,
};

/**
 * Retrieve a theme by name.
 * @param name - The theme identifier (e.g. "default", "midnight", "ember")
 * @returns The matching Theme object, or undefined if not found
 */
export function getTheme(name: string): Theme | undefined {
	return themes[name];
}

/**
 * List all available themes with their display metadata.
 * @returns An array of theme summaries containing name, displayName, and description
 */
export function listThemes(): Array<{ name: string; displayName: string; description: string }> {
	return Object.values(themes).map((t) => ({
		name: t.name,
		displayName: t.displayName,
		description: t.description,
	}));
}

// ─── Transformers ───

/**
 * Extract the value string from a token entry.
 * @param token - The token entry to extract from
 * @returns The token's value string
 */
function extractValue(token: TokenEntry): string {
	return token.value;
}

/**
 * Transform a theme's token set into CSS custom properties.
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
 * Transform a theme into a flat JSON map for AI consumption.
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
 * Transform a theme into a Tailwind CSS config extension.
 * @param theme - The theme to transform
 * @returns An object with `colors` and `borderRadius` maps suitable for Tailwind's `theme.extend`
 */
export function themeToTailwindConfig(theme: Theme): Record<string, Record<string, string>> {
	const colors: Record<string, string> = {};
	const borderRadius: Record<string, string> = {};

	for (const [key, token] of Object.entries(theme.tokens.light)) {
		if (token.type === "color") {
			colors[key] = `hsl(var(--${key}))`;
		} else if (token.type === "radius") {
			borderRadius[key] = `var(--${key})`;
		}
	}

	return { colors, borderRadius };
}

/**
 * Generate a complete globals.css content with theme tokens and Tailwind directives.
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
