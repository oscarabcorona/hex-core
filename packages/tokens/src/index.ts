export {
	generateGlobalsCss,
	generateThemeCssV4,
	type ScopedRuntimeCssOptions,
	themeToCss,
	themeToFlatJson,
	themeToScopedRuntimeCss,
	themeToTailwindConfig,
} from "./transformer.js";
export { defaultTheme } from "./themes/default.js";
export { midnightTheme } from "./themes/midnight.js";
export { emberTheme } from "./themes/ember.js";
export { sharedTokens } from "./themes/shared.js";
export { defaultSemanticTokens, resolveSemanticToken } from "./semantic.js";
export {
	COLOR_MODE_BANDS,
	colorInputToTokenValue,
	contrastRatio,
	deriveDarkFromLight,
	deriveForegroundFor,
	deriveSecondaryFromPrimary,
	RADIUS_PRESETS,
	tokenLuminance,
} from "./lib/derive.js";
export { buildTokenSet } from "./lib/build-token-set.js";
export type { TokenSetSeeds } from "./lib/build-token-set.js";
export type {
	ColorMode,
	DeriveDarkOptions,
	DeriveForegroundOptions,
	DeriveSecondaryOptions,
	RadiusPreset,
} from "./lib/derive.js";

import type { Theme } from "@hex-core/registry";
import { defaultTheme } from "./themes/default.js";
import { emberTheme } from "./themes/ember.js";
import { midnightTheme } from "./themes/midnight.js";

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
