/**
 * `emit_app_context` tool — assemble a deterministic markdown payload that
 * describes the user's chosen theme, components, and recipes. Designed for
 * paste-into-LLM workflows: a downstream agent reads this once and has
 * enough surface to implement against the exact Hex UI stack the user
 * picked, without having to re-discover any of it.
 *
 * Pure function — no I/O. The tool handler in `index.ts` resolves slugs
 * via `getTheme` / `loadRegistryItem` / `loadRecipe`, then passes the
 * looked-up objects in. This keeps the function snapshot-testable.
 */

import type { Recipe } from "./recipe-loader.js";
import { internalDepToSlug, type RegistryItem } from "./registry-loader.js";

/**
 * One token entry: a value plus a category type for non-color tokens.
 */
export interface AppContextToken {
	value: string;
	type: string;
}

/**
 * Subset of theme fields surfaced in the markdown payload. Both palettes are
 * required so the `## globals.css` block can emit a `:root {}` + `.dark {}` pair.
 */
export interface AppContextTheme {
	name: string;
	displayName: string;
	description: string;
	tokens: {
		light: Record<string, AppContextToken>;
		dark: Record<string, AppContextToken>;
	};
}

/** One component slot in the input — the item is null when the slug was unknown. */
export interface AppContextComponentSlot {
	slug: string;
	item: RegistryItem | null;
}

/** One recipe slot in the input — the recipe is null when the slug was unknown. */
export interface AppContextRecipeSlot {
	slug: string;
	recipe: Recipe | null;
}

/**
 * Density preset — controls `--space-*` / `--gap-*` / `--control-height-*` vars
 * spliced into the `globals.css` block.
 */
export type AppContextDensity = "compact" | "comfortable" | "spacious";

/**
 * Inputs to `buildAppContext`. Theme can be null when the requested slug was unknown.
 */
export interface AppContextInput {
	theme: { requested: string; resolved: AppContextTheme | null };
	components: AppContextComponentSlot[];
	recipes: AppContextRecipeSlot[];
	/**
	 * Per-token override map (e.g. `{ primary: "230 45% 55%" }`) merged onto
	 * the resolved theme's light palette before the `globals.css` block is rendered.
	 */
	overrides?: Record<string, string>;
	/** Density preset spliced into the `:root {}` rule of `globals.css`. */
	density?: AppContextDensity;
}

const HIGHLIGHTED_TOKENS = [
	"background",
	"foreground",
	"primary",
	"primary-foreground",
	"destructive",
	"radius",
] as const;

/**
 * Per-density CSS-variable map. Values lifted from Hex Studio's canonical
 * `DENSITY_VARS` (`hex-ui-platform/apps/docs/src/app/studio/_lib/url-state.ts`)
 * so the MCP tool's `globals.css` block matches what Studio's "Copy for LLM"
 * button used to splice client-side. Comfortable matches the `@hex-core/tokens`
 * defaults and is treated as a no-op (omitted from the rendered block).
 */
const DENSITY_VARS: Record<AppContextDensity, Record<string, string>> = {
	compact: {
		"--space-1": "0.125rem",
		"--space-2": "0.375rem",
		"--space-3": "0.5rem",
		"--space-4": "0.75rem",
		"--space-6": "1rem",
		"--space-8": "1.5rem",
		"--gap-xs": "0.125rem",
		"--gap-sm": "0.375rem",
		"--gap-md": "0.5rem",
		"--gap-lg": "0.75rem",
		"--gap-xl": "1.5rem",
		"--control-height-sm": "2rem",
		"--control-height-md": "2.25rem",
		"--control-height-lg": "2.5rem",
	},
	comfortable: {
		"--space-1": "0.25rem",
		"--space-2": "0.5rem",
		"--space-3": "0.75rem",
		"--space-4": "1rem",
		"--space-6": "1.5rem",
		"--space-8": "2rem",
		"--gap-xs": "0.25rem",
		"--gap-sm": "0.5rem",
		"--gap-md": "0.75rem",
		"--gap-lg": "1rem",
		"--gap-xl": "2rem",
		"--control-height-sm": "2.25rem",
		"--control-height-md": "2.5rem",
		"--control-height-lg": "2.75rem",
	},
	spacious: {
		"--space-1": "0.375rem",
		"--space-2": "0.625rem",
		"--space-3": "0.875rem",
		"--space-4": "1.25rem",
		"--space-6": "1.75rem",
		"--space-8": "2.5rem",
		"--gap-xs": "0.375rem",
		"--gap-sm": "0.625rem",
		"--gap-md": "1rem",
		"--gap-lg": "1.5rem",
		"--gap-xl": "2.5rem",
		"--control-height-sm": "2.5rem",
		"--control-height-md": "2.75rem",
		"--control-height-lg": "3rem",
	},
};

/**
 * Apply per-token overrides onto a palette. Keys absent from the palette are
 * still injected (lets a consumer add a token the base theme doesn't carry,
 * e.g. a brand-specific one). Values are written verbatim — no validation.
 * @param palette - Source palette (typically `theme.tokens.light`)
 * @param overrides - Map of token name → new value (raw HSL triplet)
 * @returns New palette with overrides applied; original is untouched
 */
function applyOverrides(
	palette: Record<string, AppContextToken>,
	overrides: Record<string, string>,
): Record<string, AppContextToken> {
	const out: Record<string, AppContextToken> = { ...palette };
	for (const [key, value] of Object.entries(overrides)) {
		const existing = palette[key];
		out[key] = { value, type: existing?.type ?? "color" };
	}
	return out;
}

/**
 * Render a single `:root` / `.dark` rule block.
 * @param selector - CSS selector for the rule (e.g. `:root`, `.dark`)
 * @param tokens - Token map keyed by short name (no `--` prefix)
 * @returns Indented CSS rule string (no `@layer` wrapper)
 */
function renderRule(selector: string, tokens: Record<string, AppContextToken>): string {
	const lines: string[] = [];
	lines.push(`  ${selector} {`);
	for (const [key, token] of Object.entries(tokens)) {
		lines.push(`    --${key}: ${token.value};`);
	}
	lines.push("  }");
	return lines.join("\n");
}

/**
 * Fold a density preset into a palette as token entries. Density values WIN over
 * any pre-existing theme tokens with the same name (last-write spread). Without
 * this fold, `renderRule` would emit two declarations for the same key in the
 * same `:root` rule and the theme's value would win via CSS cascade — silently
 * defeating density for any token the base theme already carries (e.g. `--space-4`
 * is in `@hex-core/tokens`'s `sharedTokens`).
 * @param palette - Light-palette token map (post-overrides)
 * @param densityVars - Density preset map keyed by `--<token>` (e.g. `--space-4`)
 * @returns New palette with density entries injected; density wins on conflict
 */
function foldDensityIntoPalette(
	palette: Record<string, AppContextToken>,
	densityVars: Record<string, string>,
): Record<string, AppContextToken> {
	const out: Record<string, AppContextToken> = { ...palette };
	for (const [varName, value] of Object.entries(densityVars)) {
		// Density-preset keys are written as `--<token>`; strip the `--` to match
		// palette keys, which are bare token names (e.g. `space-4`).
		const key = varName.replace(/^--/, "");
		const existing = palette[key];
		out[key] = { value, type: existing?.type ?? "spacing" };
	}
	return out;
}

/**
 * Produce the `## globals.css` body — full `@layer base { :root {} .dark {} }`
 * block with overrides applied to light and density vars folded into the
 * light palette so density wins on key conflicts.
 *
 * Density intentionally applies only to `:root`; `.dark` inherits the spacing
 * cascade from the `:root` rule above. Apps using class-based dark mode keep
 * the same spacing scale across light/dark — matches Studio's runtime canvas.
 * @param theme - Resolved theme with both light + dark palettes
 * @param overrides - Per-token tweaks merged onto light palette only
 * @param density - Spacing-density preset (`comfortable` is treated as no-op)
 * @returns CSS string ready to embed inside a fenced `css` code block
 */
function buildLightPalette(
	theme: AppContextTheme,
	overrides?: Record<string, string>,
	density?: AppContextDensity,
): Record<string, AppContextToken> {
	const withOverrides = overrides ? applyOverrides(theme.tokens.light, overrides) : theme.tokens.light;
	if (density && density !== "comfortable") {
		return foldDensityIntoPalette(withOverrides, DENSITY_VARS[density]);
	}
	return withOverrides;
}

/**
 * Render the full `## globals.css` body.
 * @param light - Light palette already merged with overrides + density
 * @param dark - Dark palette (untouched — overrides + density apply to light only)
 * @returns CSS string ready to embed inside a fenced `css` code block
 */
function buildGlobalsCss(
	light: Record<string, AppContextToken>,
	dark: Record<string, AppContextToken>,
): string {
	const lines: string[] = [];
	lines.push("@layer base {");
	lines.push(renderRule(":root", light));
	lines.push("");
	lines.push(renderRule(".dark", dark));
	lines.push("}");
	return lines.join("\n");
}

/**
 * Tailwind config object keys with hyphens need quoting; bare identifiers don't.
 * @param key - Object literal key candidate
 * @returns Identifier verbatim, or `JSON.stringify`-quoted string
 */
function quoteKey(key: string): string {
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

/**
 * Group palette tokens into Tailwind `theme.extend` buckets by `type`. Mirrors
 * the `themeToTailwindConfig` shape from `@hex-core/tokens` so consumers see
 * the same Tailwind config surface from either source. Inlined here (no runtime
 * dep on `@hex-core/tokens`) because the MCP package treats the tokens package
 * as a sibling, not a dep — the registry is the cross-package contract.
 * @param palette - Token map keyed by short name (e.g. `theme.tokens.light` or
 *   the override-applied + density-folded view from `buildLightPalette`)
 * @returns Six buckets keyed by Tailwind config field
 */
function groupForTailwind(palette: Record<string, AppContextToken>): {
	colors: Record<string, string>;
	borderRadius: Record<string, string>;
	spacing: Record<string, string>;
	fontSize: Record<string, string>;
	transitionDuration: Record<string, string>;
	height: Record<string, string>;
} {
	const colors: Record<string, string> = {};
	const borderRadius: Record<string, string> = {};
	const spacing: Record<string, string> = {};
	const fontSize: Record<string, string> = {};
	const transitionDuration: Record<string, string> = {};
	const height: Record<string, string> = {};

	for (const [key, token] of Object.entries(palette)) {
		if (token.type === "color") {
			colors[key] = `hsl(var(--${key}))`;
		} else if (token.type === "radius") {
			borderRadius[key] = `var(--${key})`;
		} else if (token.type === "spacing") {
			spacing[key.replace(/^(space-|gap-)/, "")] = `var(--${key})`;
		} else if (token.type === "font") {
			fontSize[key.replace(/^text-/, "")] = `var(--${key})`;
		} else if (token.type === "duration") {
			transitionDuration[key.replace(/^duration-/, "")] = `var(--${key})`;
		} else if (token.type === "dimension") {
			height[key.replace(/^control-/, "")] = `var(--${key})`;
		}
	}

	return { colors, borderRadius, spacing, fontSize, transitionDuration, height };
}

/**
 * Produce the `## tailwind.config.ts` body — TS export with `theme.extend`
 * mapping every CSS variable to a utility-class entry. Empty buckets are
 * omitted so consumers don't paste no-op blocks.
 * @param palette - Token palette to source names + types from (typically the
 *   override-applied + density-folded view, so brand-new keys appear here too)
 * @returns TypeScript source ready to embed inside a fenced `ts` code block
 */
function buildTailwindConfig(palette: Record<string, AppContextToken>): string {
	const buckets = groupForTailwind(palette);
	const renderBucket = (entries: Record<string, string>): string =>
		Object.entries(entries)
			.map(([k, v]) => `        ${quoteKey(k)}: ${JSON.stringify(v)},`)
			.join("\n");
	const order: Array<[string, Record<string, string>]> = [
		["colors", buckets.colors],
		["borderRadius", buckets.borderRadius],
		["spacing", buckets.spacing],
		["fontSize", buckets.fontSize],
		["transitionDuration", buckets.transitionDuration],
		["height", buckets.height],
	];

	const lines: string[] = [];
	lines.push("export default {");
	lines.push("  theme: {");
	lines.push("    extend: {");
	for (const [name, entries] of order) {
		if (Object.keys(entries).length === 0) continue;
		lines.push(`      ${name}: {`);
		lines.push(renderBucket(entries));
		lines.push("      },");
	}
	lines.push("    },");
	lines.push("  },");
	lines.push("};");
	return lines.join("\n");
}

/**
 * Produce the `## Context prompt` body — LLM rules + scoped components +
 * user-ask placeholder.
 *
 * Adapted from Hex Studio's `buildContextPrompt`
 * (`hex-ui-platform/apps/docs/src/app/studio/_lib/payload.ts`).
 * Two intentional divergences vs Studio:
 * - Empty-state install hint uses `npx` (broad compatibility) instead of
 *   Studio's `pnpm dlx` (pnpm-monorepo-specific). The MCP tool's audience is
 *   every package manager; Studio's audience is its own pnpm consumer.
 * - Rule 3 elevates layout primitives unconditionally — they shipped in
 *   `components@1.2.1`, so Studio's "once they ship" hedge is now stale.
 *   Studio will catch up on its next sync.
 * @param componentSlugs - Slugs the agent should consider in scope; an empty
 *   list renders an "(none selected)" placeholder
 * @returns Multi-line prompt body (no surrounding `## Context prompt` header)
 */
function buildContextPrompt(componentSlugs: string[]): string {
	const inScope =
		componentSlugs.length > 0
			? componentSlugs.join(", ")
			: "(none selected — pull components on demand via `npx @hex-core/cli@latest add <slug>`)";
	return [
		"You are building a Next.js 16 (App Router, Turbopack) app using @hex-core components.",
		"",
		"Rules you must follow:",
		"",
		"1. Use the exact tokens defined in `globals.css` above. Do not introduce new colors or spacing values that aren't in the token set.",
		"2. Use `@hex-core/components` imports for all UI primitives — never re-implement Button / Card / Dialog / etc. in plain HTML.",
		"3. For layout, prefer the layout primitives (`Stack`, `Cluster`, `Container`, `Grid`); fall back to Tailwind utilities mapped to spacing tokens (`p-4`, `gap-2`, etc.) when a primitive isn't a fit.",
		"4. Honor the AI guidance in each component's `.schema.ts` — `whenToUse`, `whenNotToUse`, `commonMistakes`, `accessibilityNotes`.",
		'5. Default to React Server Components; only add `"use client"` when needed (event handlers, hooks, browser APIs).',
		"6. All interactive elements get `transition-all duration-normal ease-out` and `focus-visible:ring-2`.",
		"",
		`Components in scope for this app: ${inScope}.`,
		"",
		'Now: <your ask here, e.g. "build me a pricing page with three tiers">.',
	].join("\n");
}

/**
 * Build a deterministic markdown payload describing the chosen Hex UI stack.
 * @param input - Resolved theme + component + recipe records (nulls signal "not found"),
 *   plus optional `overrides` (per-token tweaks) and `density` (compact/comfortable/spacious).
 * @returns Markdown string suitable for pasting as LLM context
 */
export function buildAppContext(input: AppContextInput): string {
	const lines: string[] = [];

	lines.push("# App context — Hex UI");
	lines.push("");
	lines.push("Generated by `emit_app_context`. Paste this into your LLM chat as project context.");
	lines.push("");

	// ─── Theme ───
	lines.push("## Theme");
	lines.push("");
	if (input.theme.resolved) {
		const t = input.theme.resolved;
		lines.push(`**${t.displayName}** (\`${t.name}\`) — ${t.description}`);
		lines.push("");
		lines.push("| Token | Value |");
		lines.push("|---|---|");
		for (const key of HIGHLIGHTED_TOKENS) {
			const overridden = input.overrides?.[key];
			const tok = t.tokens.light[key];
			const value = overridden ?? tok?.value;
			if (value === undefined) continue;
			const marker = overridden !== undefined ? " *(override)*" : "";
			lines.push(`| \`--${key}\` | \`${value}\`${marker} |`);
		}
		lines.push("");
		lines.push(
			"_Values are raw — wrap in `hsl(...)` when consuming via Tailwind v4 `@theme`._",
		);
	} else {
		lines.push(
			`**Unknown theme** \`${input.theme.requested}\` — fall back to \`default\` and notify the user.`,
		);
	}
	lines.push("");

	// ─── globals.css + tailwind.config.ts (only when theme resolved) ───
	// Build the merged light palette ONCE — both sections consume the same
	// override-applied + density-folded view so a brand-new override key (e.g.
	// `accent`) flows into BOTH the rendered :root rule and the Tailwind
	// `colors` bucket. Without this, the Tailwind config would silently lag
	// behind globals.css.
	if (input.theme.resolved) {
		const mergedLight = buildLightPalette(
			input.theme.resolved,
			input.overrides,
			input.density,
		);

		lines.push("## globals.css");
		lines.push("");
		lines.push(
			"Replace your `app/globals.css` (or paste this into it) so every component reads the tokens above.",
		);
		lines.push("");
		lines.push("```css");
		lines.push(buildGlobalsCss(mergedLight, input.theme.resolved.tokens.dark));
		lines.push("```");
		lines.push("");

		lines.push("## tailwind.config.ts");
		lines.push("");
		lines.push(
			"Add to your `theme.extend` so utility classes like `p-4` resolve to your tokens:",
		);
		lines.push("");
		lines.push("```ts");
		lines.push(buildTailwindConfig(mergedLight));
		lines.push("```");
		lines.push("");
	}

	// ─── Components ───
	const found = input.components.filter((c) => c.item !== null);
	const missing = input.components.filter((c) => c.item === null).map((c) => c.slug);
	lines.push(`## Components (${found.length})`);
	lines.push("");
	if (missing.length > 0) {
		lines.push(`> Missing: ${missing.map((s) => `\`${s}\``).join(", ")}.`);
		lines.push("");
	}
	for (const slot of found) {
		const item = slot.item as RegistryItem;
		lines.push(`### ${item.displayName} \`${item.name}\``);
		lines.push("");
		lines.push(item.description);
		// Resolve raw dep paths ("components/popover/popover") to clean slugs
		// ("popover"). Non-component deps like "lib/utils" return null and drop
		// out so the LLM context lists only navigable component slugs.
		const internal = (item.dependencies?.internal ?? [])
			.map((d) => internalDepToSlug(d))
			.filter((s): s is string => s !== null);
		if (internal.length > 0) {
			lines.push("");
			lines.push(`Depends on: ${internal.map((d) => `\`${d}\``).join(", ")}.`);
		}
		lines.push("");
	}

	// ─── Recipes ───
	if (input.recipes.length > 0) {
		const foundRecipes = input.recipes.filter((r) => r.recipe !== null);
		const missingRecipes = input.recipes.filter((r) => r.recipe === null).map((r) => r.slug);
		lines.push(`## Recipes (${foundRecipes.length})`);
		lines.push("");
		if (missingRecipes.length > 0) {
			lines.push(`> Missing: ${missingRecipes.map((s) => `\`${s}\``).join(", ")}.`);
			lines.push("");
		}
		for (const slot of foundRecipes) {
			const r = slot.recipe as Recipe;
			lines.push(`### ${r.title} \`${r.slug}\``);
			lines.push("");
			lines.push(r.summary);
			lines.push("");
			lines.push("**Steps:**");
			for (let i = 0; i < r.steps.length; i++) {
				const s = r.steps[i];
				lines.push(`${i + 1}. \`${s.component}\` — ${s.reason} _(${s.role})_`);
			}
			if (r.checklist.length > 0) {
				lines.push("");
				lines.push("**Checklist:**");
				for (const c of r.checklist) {
					lines.push(`- [ ] ${c.check} _(${c.severity})_`);
				}
			}
			lines.push("");
		}
	}

	// ─── Install ───
	// `npx` (not `pnpm dlx`) — the broad-compat path. Studio uses `pnpm dlx`
	// because it's a pnpm-monorepo consumer; the OSS MCP tool serves every
	// package manager. Aligning Studio with `npx` is a follow-up in that repo.
	const installSlugs = found.map((c) => (c.item as RegistryItem).name);
	lines.push("## Install");
	lines.push("");
	lines.push("```bash");
	lines.push("npx @hex-core/cli@latest init");
	if (installSlugs.length > 0) {
		lines.push(`npx @hex-core/cli@latest add ${installSlugs.join(" ")}`);
	}
	lines.push("```");

	// ─── Context prompt ───
	lines.push("");
	lines.push("## Context prompt");
	lines.push("");
	lines.push(buildContextPrompt(installSlugs));

	return lines.join("\n");
}
