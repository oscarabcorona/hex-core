import * as fs from "node:fs";
import * as path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import pc from "picocolors";
import { strictThemeSchema, type Theme, type TokenSet } from "@hex-core/registry";
import {
	type ColorMode,
	colorInputToTokenValue,
	COLOR_MODE_BANDS,
	contrastRatio,
	deriveDarkFromLight,
	deriveForegroundFor,
	deriveSecondaryFromPrimary,
	generateGlobalsCss,
	RADIUS_PRESETS,
	type RadiusPreset,
	sharedTokens,
	themeToFlatJson,
} from "@hex-core/tokens";
import { contrastPreview, swatch, swatchGrid } from "../lib/swatch.js";

/**
 * Interactive theme authoring (`hex theme init -i`). Walks the user
 * through the canonical color slots, derives the rest, validates
 * through `strictThemeSchema`, and writes the chosen format.
 *
 * The flow is structured so each prompt's answer informs the next —
 * primary seeds primary-foreground via WCAG contrast; foreground seeds
 * background and the muted/border family via lightness bands; destructive
 * seeds destructive-foreground. Authors who want a fully hand-curated
 * palette can run `theme edit -i` after to override individual slots.
 *
 * Designed to be the OSS substrate for the same workflow Studio
 * (hex-ui-platform) provides via React sliders — color math lives in
 * `@hex-core/tokens` so both shells share one source of truth.
 */

interface InteractiveInitOptions {
	out: string;
	format: "css" | "json" | "ts";
	overwrite: boolean;
}

interface SeedColors {
	primary: string;
	foreground: string;
	background: string;
	destructive: string;
	radius: string;
}

/**
 * Prompt for a color and return the parsed HSL-triplet token value.
 * Accepts hex (`#1e293b`), CSS hsl()/rgb()/named colors, or raw
 * `"<H> <S>% <L>%"` triplets. Loops until parseable. Each accepted value
 * is echoed back as an inline ANSI swatch so the user can see what they
 * picked.
 *
 * @param label - Token slot name shown in the prompt (e.g. "primary")
 * @param defaultValue - HSL-triplet pre-filled into the prompt
 * @returns The parsed HSL-triplet token value
 */
export async function promptColor(label: string, defaultValue: string): Promise<string> {
	while (true) {
		const raw = await input({
			message: `${label} ${pc.dim(`(hex / hsl() / triplet — default: ${defaultValue})`)}`,
			default: defaultValue,
		});
		// Already-correct triplet: pass through unchanged.
		if (/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(raw.trim())) {
			console.log(`  ${swatch(raw.trim(), label)}`);
			return raw.trim();
		}
		// Anything else culori parses (hex, named, hsl(), rgb()): convert.
		const parsed = colorInputToTokenValue(raw);
		if (parsed) {
			console.log(`  ${swatch(parsed, label)}`);
			return parsed;
		}
		console.log(pc.red(`  Couldn't parse "${raw}" as a color. Try again (hex like #1e293b, hsl(220 13% 18%), or "220 13% 18%").`));
	}
}

/**
 * Loop the foreground/background prompt until the WCAG-AA contrast
 * floor is cleared, OR the user explicitly opts to ship sub-AA. The
 * canonical fix for the M3 finding: instead of aborting the whole
 * flow, re-render the warning and let the user adjust just those two
 * seeds without losing the rest of their choices.
 *
 * @returns The accepted background + foreground HSL-triplet pair
 */
async function promptSurfaceWithContrastGate(): Promise<{ background: string; foreground: string }> {
	let background = "0 0% 100%";
	let foreground = "240 10% 3.9%";

	while (true) {
		background = await promptColor("background", background);
		foreground = await promptColor("foreground", foreground);

		const ratio = contrastRatio(foreground, background);
		if (ratio >= 4.5) return { background, foreground };

		console.log(pc.yellow(`  ⚠ foreground/background contrast is ${ratio.toFixed(2)}:1 (sub-AA, fails WCAG 1.4.3 for body text).`));
		const choice = await select<"retry" | "accept">({
			message: "What now?",
			choices: [
				{ name: "Re-enter foreground + background (recommended)", value: "retry" },
				{ name: `Accept the sub-AA pair anyway (${ratio.toFixed(2)}:1)`, value: "accept" },
			],
			default: "retry",
		});
		if (choice === "accept") return { background, foreground };
		// retry → loop
	}
}

/**
 * Slot the appropriate per-mode lightness bands for derived neutrals.
 * `surface` (used by `secondary` / `muted` / `accent`) collapses to a
 * near-base lightness; `framing` (used by `border` / `input`) sits one
 * step toward `foreground`.
 *
 * @param mode - `"light"` or `"dark"` — picks the band pair from
 *   `COLOR_MODE_BANDS`.
 * @returns Lightness values in `[0, 1]`
 */
function bandsFor(mode: ColorMode): { surface: number; framing: number } {
	return COLOR_MODE_BANDS[mode];
}

/**
 * Build a complete TokenSet from a small set of seeds + the per-mode
 * lightness bands. Light and dark modes are symmetric: the only
 * difference is which lightness band the surface/framing slots collapse
 * to (configured via `mode`).
 *
 * Doesn't prompt — returns a value object the caller can preview before
 * committing.
 *
 * @param seeds - The user-picked HSL-triplet values for primary,
 *   foreground, background, destructive, plus a radius rem string.
 * @param mode - Whether the seeds describe a light or dark surface.
 *   Drives surface/framing band selection so derived neutrals fit the
 *   chosen background.
 * @returns A TokenSet with all 19 required color slots + radius
 *   populated.
 */
function buildTokenSet(seeds: SeedColors, mode: ColorMode): TokenSet {
	const { surface, framing } = bandsFor(mode);

	const primary = { value: seeds.primary, type: "color" as const };
	const primaryForeground = deriveForegroundFor(seeds.primary);
	const foreground = { value: seeds.foreground, type: "color" as const };
	const background = { value: seeds.background, type: "color" as const };
	const destructive = { value: seeds.destructive, type: "color" as const };
	const destructiveForeground = deriveForegroundFor(seeds.destructive);
	const secondary = deriveSecondaryFromPrimary(seeds.primary, { lightness: surface });
	const secondaryForeground = deriveForegroundFor(secondary.value);

	return {
		background,
		foreground,
		card: background,
		"card-foreground": foreground,
		popover: background,
		"popover-foreground": foreground,
		primary,
		"primary-foreground": primaryForeground,
		secondary,
		"secondary-foreground": secondaryForeground,
		muted: secondary,
		"muted-foreground": { value: shiftLightnessTo(seeds.foreground, mode === "light" ? 0.38 : 0.7), type: "color" },
		accent: secondary,
		"accent-foreground": secondaryForeground,
		destructive,
		"destructive-foreground": destructiveForeground,
		border: { value: shiftLightnessTo(seeds.foreground, framing), type: "color" },
		input: { value: shiftLightnessTo(seeds.foreground, framing), type: "color" },
		ring: primary,
		radius: { value: seeds.radius, type: "radius" },
	};
}

/**
 * Shift a token's lightness to a specific value (0–1) while preserving
 * hue + reducing saturation proportionally. Used for derived neutrals
 * where keeping the seed color's hue tint at low saturation reads as
 * "intentional" rather than "achromatic gray."
 *
 * @param value - HSL-triplet input
 * @param lightness - Target lightness in `[0, 1]`
 * @returns A new HSL-triplet at the requested lightness
 */
function shiftLightnessTo(value: string, lightness: number): string {
	const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(value.trim());
	if (!match) return value;
	const h = Number(match[1]);
	const s = Math.min(Number(match[2]), 8); // cap saturation at 8% for derived neutrals
	const l = Math.round(lightness * 1000) / 10;
	return `${h} ${s.toFixed(1).replace(/\.0$/, "")}% ${l}%`;
}

/**
 * Render a Theme as a self-contained TS file. Inlines `sharedTokens`
 * (rather than importing from `./shared.js`) so the output is portable
 * — runs inside the OSS repo (dogfood path: `packages/tokens/src/themes/`)
 * AND inside any consumer project that doesn't have `shared.ts`. The
 * one trade-off: dogfood-merged files contain a big inlined block
 * instead of the canonical `import { sharedTokens } …` line. That's a
 * one-line post-edit when needed.
 *
 * @param theme - A Theme that's already passed `strictThemeSchema`
 * @returns A string containing a complete `.ts` module
 */
export function renderThemeAsTs(theme: Theme): string {
	const renderTokenLine = (name: string, token: { value: string; type: string }): string => {
		const key = /^[a-z][a-z0-9]*$/i.test(name) ? name : `"${name}"`;
		return `\t\t\t${key}: { value: ${JSON.stringify(token.value)}, type: ${JSON.stringify(token.type)} },`;
	};

	// Strip sharedTokens from the per-mode dicts so the output's "color +
	// radius" section stays readable, then append a `...sharedTokens`
	// reference to the inlined object.
	const sharedKeys = new Set(Object.keys(sharedTokens));
	const splitOutShared = (set: TokenSet): TokenSet => {
		const out: TokenSet = {};
		for (const [name, token] of Object.entries(set)) {
			if (!sharedKeys.has(name)) out[name] = token;
		}
		return out;
	};

	const lightUnique = splitOutShared(theme.tokens.light);
	const darkUnique = splitOutShared(theme.tokens.dark);

	const sharedInline = Object.entries(sharedTokens)
		.map(([name, token]) => `\t${/^[a-z][a-z0-9]*$/i.test(name) ? name : `"${name}"`}: { value: ${JSON.stringify(token.value)}, type: ${JSON.stringify(token.type)} },`)
		.join("\n");

	const renderUniqueBlock = (set: TokenSet): string =>
		Object.entries(set)
			.map(([name, token]) => renderTokenLine(name, token))
			.join("\n");

	return `import type { Theme, TokenValue } from "@hex-core/registry";

/**
 * Layout + typography tokens — the cross-mode "shared" set. Inlined here
 * so this file stays self-contained outside the @hex-core/tokens repo.
 */
const sharedTokens: Record<string, TokenValue> = {
${sharedInline}
};

export const ${theme.name}Theme: Theme = {
\tname: ${JSON.stringify(theme.name)},
\tdisplayName: ${JSON.stringify(theme.displayName)},
\tdescription: ${JSON.stringify(theme.description)},
\ttokens: {
\t\tlight: {
${renderUniqueBlock(lightUnique)}
\t\t\t...sharedTokens,
\t\t},
\t\tdark: {
${renderUniqueBlock(darkUnique)}
\t\t\t...sharedTokens,
\t\t},
\t},
};
`;
}

/**
 * Run the interactive `theme init` flow. Prompts the user through the
 * canonical seeds, derives the rest of the TokenSet, validates, and
 * writes to `options.out`.
 *
 * @param options - Output destination, output format (css/json/ts), and
 *   overwrite policy.
 * @returns Resolves once the file is written and a success summary is
 *   printed.
 */
export async function themeInitInteractive(options: InteractiveInitOptions): Promise<void> {
	const outPath = path.resolve(process.cwd(), options.out);
	if (fs.existsSync(outPath) && !options.overwrite) {
		console.error(pc.red(`${options.out} already exists. Pass --overwrite to replace.`));
		process.exit(1);
	}

	console.log(pc.bold("\n  Hex Core — interactive theme authoring\n"));
	console.log(pc.dim("  Pick seed colors; we'll derive the rest. You can override anything later via `hex theme edit -i`.\n"));

	// ─── Identity ───
	const name = await input({
		message: "Theme name (slug, e.g. 'midnight')",
		validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || "Lowercase letters, digits, and hyphens only",
	});
	const displayName = await input({
		message: "Display name",
		default: name.charAt(0).toUpperCase() + name.slice(1),
	});
	const description = await input({
		message: "Description (one sentence)",
		default: `A custom Hex Core theme.`,
	});

	// ─── Color seeds ───
	console.log(pc.bold("\n  Brand"));
	const primary = await promptColor("primary", "217 91% 60%");

	console.log(pc.bold("\n  Surface"));
	const { background, foreground } = await promptSurfaceWithContrastGate();

	console.log(pc.bold("\n  Destructive"));
	const destructive = await promptColor("destructive", "0 72% 45%");

	// ─── Radius ───
	console.log(pc.bold("\n  Shape"));
	const radiusChoice = await select<RadiusPreset | "custom">({
		message: "Corner radius",
		choices: [
			{ name: `sharp (${RADIUS_PRESETS.sharp}) — Linear-style precision`, value: "sharp" },
			{ name: `balanced (${RADIUS_PRESETS.balanced}) — versatile default`, value: "balanced" },
			{ name: `soft (${RADIUS_PRESETS.soft}) — friendly / consumer`, value: "soft" },
			{ name: "custom (enter your own rem value)", value: "custom" },
		],
	});
	const radius = radiusChoice === "custom"
		? await input({ message: "Radius value (e.g. 0.5rem)", validate: (v) => /^\d*\.?\d+rem$/.test(v) || "Must be a rem value (e.g. 0.5rem)" })
		: RADIUS_PRESETS[radiusChoice];

	// ─── Build light + derive dark ───
	const light = buildTokenSet({ primary, foreground, background, destructive, radius }, "light");

	console.log(pc.bold("\n  Dark mode"));
	const darkMode = await select<"derive" | "clone" | "author">({
		message: "How should dark mode be authored?",
		choices: [
			{ name: "auto-derive (invert lightness, keep hue+saturation)", value: "derive" },
			{ name: "clone-light (same palette in both modes)", value: "clone" },
			{ name: "author-now (re-walk surface + destructive seeds for dark)", value: "author" },
		],
	});

	let dark: TokenSet;
	if (darkMode === "derive") {
		dark = deriveDarkFromLight(light);
	} else if (darkMode === "clone") {
		// I3 fix: spread so the dark TokenSet is a separate object —
		// future code that mutates one mode's set won't surprise the other.
		dark = { ...light };
	} else {
		console.log(pc.bold("\n  Dark surface"));
		const darkSurface = await promptSurfaceWithContrastGate();
		console.log(pc.bold("\n  Dark destructive"));
		const darkDestructive = await promptColor("destructive (dark)", "0 75% 65%");
		// B1 fix: build with mode="dark" so secondary/muted/accent
		// collapse to dark-band lightness instead of the light band.
		dark = buildTokenSet(
			{
				primary,
				foreground: darkSurface.foreground,
				background: darkSurface.background,
				destructive: darkDestructive,
				radius,
			},
			"dark",
		);
	}

	// ─── Preview ───
	const theme: Theme = { name, displayName, description, tokens: { light, dark } };
	console.log(pc.bold("\n  Preview (light)"));
	console.log(swatchGrid(
		Object.entries(light)
			.filter(([, t]) => t.type === "color")
			.map(([k, t]) => [k, t.value]),
	));
	console.log(pc.bold("\n  Critical contrast"));
	console.log(contrastPreview(foreground, background, contrastRatio(foreground, background)));

	const proceed = await confirm({ message: "\nWrite theme to disk?", default: true });
	if (!proceed) {
		console.log(pc.dim("Aborted. No file written."));
		process.exit(0);
	}

	// ─── Validate + write ───
	// I1: defensive validation — `buildTokenSet` should produce a valid
	// strict theme by construction. This belt-and-suspenders catches
	// regressions if a future extra prompt bypasses the helper.
	const parsed = strictThemeSchema.safeParse(theme);
	if (!parsed.success) {
		console.error(pc.red(`Validation failed:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`));
		process.exit(1);
	}

	const content = renderTheme(theme, options.format);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, content, "utf8");

	console.log(pc.green(`\n  ✓ Wrote ${options.out}`));
	console.log(pc.dim(`  Tokens: ${Object.keys(light).length} light, ${Object.keys(dark).length} dark.`));
	if (options.format === "ts") {
		console.log(pc.dim(`  To register: import { ${name}Theme } from "${options.out.replace(/\.ts$/, ".js")}"; pass to consumers.`));
	} else if (options.format === "css") {
		console.log(pc.dim(`  Drop into your app's globals.css; each Hex Core component will reflow.`));
	}
}

/**
 * Render a validated Theme to the requested output format. Extracted
 * so the non-interactive `theme init` path can also emit `--format ts`
 * (closes L6).
 *
 * @param theme - Validated Theme
 * @param format - `"css" | "json" | "ts"`
 * @returns The rendered file contents
 */
export function renderTheme(theme: Theme, format: "css" | "json" | "ts"): string {
	if (format === "ts") return renderThemeAsTs(theme);
	if (format === "json") {
		return JSON.stringify(
			{
				name: theme.name,
				light: themeToFlatJson(theme, "light"),
				dark: themeToFlatJson(theme, "dark"),
			},
			null,
			2,
		);
	}
	return generateGlobalsCss(theme);
}
