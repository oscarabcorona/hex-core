import { type Hsl, hsl, parse, wcagContrast, wcagLuminance } from "culori";
import type { ColorToken, TokenSet } from "@hex-core/registry";

/**
 * Color-math helpers shared by the CLI (`hex theme init -i`) and Studio
 * (`hex-ui-platform`'s React sliders). Pure functions over the canonical
 * HSL-triplet token-value shape (`"<H> <S>% <L>%"`); no I/O, no UI, no
 * framework deps. Both shells (terminal + web) wrap these with their own
 * input pickers and feed the same shape back in.
 *
 * Keeping these in `@hex-core/tokens` (rather than `@hex-core/cli`) means
 * Studio reuses the same logic web-side without bundling commander or
 * '@inquirer/prompts', AND any future theme tooling lands on a single
 * source of truth for "what should a derived foreground / dark variant /
 * secondary look like."
 *
 * Each helper accepts an optional opts bag so Studio's web sliders can
 * expose the magic numbers as user-tunable controls without breaking the
 * CLI's call sites. Defaults preserve the canonical Hex Core look.
 */

/**
 * Parse a hex-core HSL-triplet token value (`"240 10% 3.9%"`) into a
 * culori `Hsl` record. Throws on malformed input — token values that
 * already passed `tokenValueSchema` validation should never throw here.
 *
 * @param value - HSL-triplet string (`"<H> <S>% <L>%"`)
 * @returns A culori `Hsl` color record with `s` and `l` normalized to 0–1.
 */
function parseTokenHsl(value: string): Hsl {
	const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(value.trim());
	if (!match) {
		throw new Error(
			`Invalid HSL triplet: "${value}". Expected "<H> <S>% <L>%" (e.g. "240 10% 3.9%").`,
		);
	}
	return {
		mode: "hsl",
		h: Number(match[1]),
		s: Number(match[2]) / 100,
		l: Number(match[3]) / 100,
	};
}

/**
 * Format a culori Hsl record back into a hex-core token value
 * (`"240 10% 3.9%"`). Inverse of `parseTokenHsl`.
 *
 * Hue is rounded to the nearest integer because hex-core themes
 * traditionally ship integer hues (the human eye doesn't distinguish
 * sub-degree hue shifts in the same lightness band). Saturation and
 * lightness are kept at 1-decimal precision because the difference
 * between 4.8% and 5.2% saturation IS visible (especially on hover
 * states + borders).
 *
 * @param color - culori `Hsl` record
 * @returns Hex-core HSL-triplet string
 */
function formatTokenHsl(color: Hsl): string {
	const h = Math.round(color.h ?? 0);
	const s = ((color.s ?? 0) * 100).toFixed(1).replace(/\.0$/, "");
	const l = ((color.l ?? 0) * 100).toFixed(1).replace(/\.0$/, "");
	return `${h} ${s}% ${l}%`;
}

const NEAR_WHITE: ColorToken = { value: "0 0% 98%", type: "color" };
const NEAR_BLACK: ColorToken = { value: "240 10% 3.9%", type: "color" };

/**
 * Options for `deriveForegroundFor`. Pass custom `light` / `dark`
 * anchors when your theme uses non-canonical near-white / near-black
 * shades (e.g. a warm cream on a cool charcoal).
 */
export interface DeriveForegroundOptions {
	/** Pole used for backgrounds darker than the pole's luminance. Defaults to `"0 0% 98%"`. */
	light?: ColorToken;
	/** Pole used for backgrounds lighter than the pole's luminance. Defaults to `"240 10% 3.9%"`. */
	dark?: ColorToken;
}

/**
 * Pick the foreground that hits the highest WCAG contrast against
 * `bg`. Returns either the `light` or `dark` anchor (defaults: the
 * canonical near-white / near-black; pass `opts` to override). Always
 * achieves the best of the two anchors against the input.
 *
 * @param bgValue - HSL-triplet token value of the background color
 * @param opts - Optional anchor override; see {@link DeriveForegroundOptions}
 * @returns A `ColorToken` for the chosen foreground
 *
 * @example
 * deriveForegroundFor("240 10% 3.9%")  // → near-white { value: "0 0% 98%", type: "color" }
 * deriveForegroundFor("0 0% 100%")     // → near-black { value: "240 10% 3.9%", type: "color" }
 */
export function deriveForegroundFor(
	bgValue: string,
	opts: DeriveForegroundOptions = {},
): ColorToken {
	const light = opts.light ?? NEAR_WHITE;
	const dark = opts.dark ?? NEAR_BLACK;
	const bg = parseTokenHsl(bgValue);
	const contrastLight = wcagContrast(bg, parseTokenHsl(light.value));
	const contrastDark = wcagContrast(bg, parseTokenHsl(dark.value));
	return contrastLight >= contrastDark ? light : dark;
}

/**
 * Options for `deriveDarkFromLight`. Studio's sliders expose these so
 * users can dial back the saturation cut for richer dark palettes, or
 * shift the inversion pivot to match a non-symmetric lightness curve.
 */
export interface DeriveDarkOptions {
	/**
	 * Saturation multiplier applied during inversion (default `0.75`).
	 * HSL's perceptual non-uniformity makes fully-saturated bright
	 * colors read as neon-toxic when flipped to low lightness — the
	 * 25% cut compensates. Pass `1` to keep saturation; pass `0.5` for
	 * a more muted dark mode.
	 */
	saturationFactor?: number;
	/**
	 * Inversion pivot (default `0.5`). Lightness gets mirrored around
	 * this point — `pivot=0.5` gives `0.95L → 0.05L`. A pivot above 0.5
	 * yields a "lighter dark mode"; below 0.5 yields a "darker dark
	 * mode." Range `[0, 1]`.
	 */
	pivotLightness?: number;
}

/**
 * Slot names that store a "base" color (not a foreground-of-something).
 * `*-foreground` slots get re-derived from the inverted base via
 * `deriveForegroundFor` so AA contrast survives the round-trip.
 */
const BASE_SLOT_REGEX = /-foreground$/;

/**
 * Mirror a light-mode TokenSet into a coherent dark-mode TokenSet.
 *
 * For each base color slot (e.g. `primary`, `card`, `destructive`,
 * `background`, `border`), invert the lightness around `pivotLightness`
 * and reduce saturation by `saturationFactor` (default 0.75).
 *
 * For each `*-foreground` slot, re-derive against the inverted base
 * via `deriveForegroundFor`. **This is critical** — naïvely inverting
 * `primary-foreground` lightness produces sub-AA contrast against the
 * inverted `primary` (the foreground was previously chosen with the
 * light primary in mind). See the AA-invariant tests in
 * `derive.test.ts`.
 *
 * Authors who want a curated dark palette should pick `author-now` in
 * the CLI's dark-mode prompt and re-walk the surface seeds. This
 * helper is the "good-enough" default for the `auto-derive` path.
 *
 * @param light - Light-mode TokenSet (must contain all `REQUIRED_COLOR_TOKENS`)
 * @param opts - Optional saturation / pivot overrides; see {@link DeriveDarkOptions}
 * @returns A new TokenSet with bases inverted + foregrounds re-derived for AA
 */
export function deriveDarkFromLight(
	light: TokenSet,
	opts: DeriveDarkOptions = {},
): TokenSet {
	const saturationFactor = opts.saturationFactor ?? 0.75;
	const pivot = opts.pivotLightness ?? 0.5;

	// First pass: invert every BASE color (skip `*-foreground` and
	// non-color tokens). Foregrounds get re-derived in pass 2.
	const dark: TokenSet = {};
	for (const [name, token] of Object.entries(light)) {
		if (token.type !== "color") {
			dark[name] = token;
			continue;
		}
		if (BASE_SLOT_REGEX.test(name)) continue;
		const color = parseTokenHsl(token.value);
		const inverted: Hsl = {
			mode: "hsl",
			h: color.h ?? 0,
			s: Math.max(0, (color.s ?? 0) * saturationFactor),
			l: Math.max(0, Math.min(1, 2 * pivot - (color.l ?? 0))),
		};
		dark[name] = { value: formatTokenHsl(inverted), type: "color" };
	}

	// Second pass: for each `*-foreground` slot, find the matching base
	// in the dark set and re-derive a contrast-safe foreground. Falls
	// back to a naive inversion if the base isn't in the set (defensive;
	// shouldn't happen for a strict-validated TokenSet).
	for (const [name, token] of Object.entries(light)) {
		if (token.type !== "color" || !BASE_SLOT_REGEX.test(name)) continue;
		const baseName = name.replace(BASE_SLOT_REGEX, "");
		const darkBase = dark[baseName];
		if (darkBase && darkBase.type === "color") {
			dark[name] = deriveForegroundFor(darkBase.value);
		} else {
			const color = parseTokenHsl(token.value);
			dark[name] = {
				value: formatTokenHsl({ ...color, l: Math.max(0, Math.min(1, 2 * pivot - (color.l ?? 0))) }),
				type: "color",
			};
		}
	}

	return dark;
}

/**
 * Options for `deriveSecondaryFromPrimary`. Studio's sliders expose
 * the lightness band + saturation cap so users can author a richer or
 * more muted secondary fill.
 */
export interface DeriveSecondaryOptions {
	/**
	 * Target lightness for the derived secondary (default `0.959`).
	 * The canonical Hex Core secondary lightness band — keeps button
	 * surfaces flush with `--muted` and `--accent` in light mode. Range `[0, 1]`.
	 */
	lightness?: number;
	/**
	 * Maximum saturation kept from the primary (default `0.05`). The
	 * derived secondary should feel related but recede; capping
	 * saturation at 5% gives the "almost-gray with a hint of brand"
	 * effect.
	 */
	saturationCap?: number;
}

/**
 * Derive a `secondary` color from `primary` by desaturating + shifting
 * lightness toward a near-neutral. Produces the muted-but-related fill
 * Cancel/Save-Draft buttons want next to a primary CTA.
 *
 * The derived secondary preserves the primary's hue so the pairing
 * reads as intentional. Foreground pairing is the caller's job — feed
 * the result through `deriveForegroundFor` to get a contrast-safe text
 * color.
 *
 * @param primaryValue - HSL-triplet token value of the primary color
 * @param opts - Optional lightness / saturation-cap overrides; see {@link DeriveSecondaryOptions}
 * @returns A `ColorToken` for the derived secondary
 */
export function deriveSecondaryFromPrimary(
	primaryValue: string,
	opts: DeriveSecondaryOptions = {},
): ColorToken {
	const lightness = opts.lightness ?? 0.959;
	const saturationCap = opts.saturationCap ?? 0.05;
	const primary = parseTokenHsl(primaryValue);
	const secondary: Hsl = {
		mode: "hsl",
		h: primary.h ?? 0,
		s: Math.min(saturationCap, primary.s ?? 0),
		l: lightness,
	};
	return { value: formatTokenHsl(secondary), type: "color" };
}

/**
 * Compute the WCAG contrast ratio between a foreground / background
 * token pair. Use as an authoring-time guard, not a runtime gate —
 * themes that ship with sub-AA pairs are caller's responsibility. AA
 * threshold is 4.5:1 for body text, 3:1 for large/UI text per WCAG 1.4.3.
 *
 * @param fgValue - foreground HSL-triplet
 * @param bgValue - background HSL-triplet
 * @returns The contrast ratio (≥4.5 means AA-pass for body text)
 */
export function contrastRatio(fgValue: string, bgValue: string): number {
	const fg = parseTokenHsl(fgValue);
	const bg = parseTokenHsl(bgValue);
	return wcagContrast(fg, bg);
}

/**
 * Convenience: parse a freeform color string (`"#1e293b"`, `"navy"`,
 * `"hsl(220 13% 18%)"`) into a hex-core token value. Used by the CLI's
 * interactive prompt so the user can paste a hex from their design tool
 * directly without manual HSL conversion.
 *
 * Note: only standard CSS named colors (`navy`, `rebeccapurple`,
 * `tomato`, etc.) parse — Tailwind palette names like `slate` or
 * `zinc` are not in the CSS spec and return `null`.
 *
 * @param input - Anything culori's `parse` accepts (hex, CSS named,
 *   `hsl()`, `rgb()`, `oklch()`, etc.)
 * @returns HSL-triplet string ready to feed back into a `ColorToken`,
 *   or `null` if the input doesn't parse.
 */
export function colorInputToTokenValue(input: string): string | null {
	const parsed = parse(input.trim());
	if (!parsed) return null;
	const asHsl = hsl(parsed);
	if (!asHsl) return null;
	return formatTokenHsl(asHsl);
}

/**
 * Compute the perceptual luminance of a token value. Useful when a UI
 * needs to pick an overlay tint dynamically (e.g. "darker shimmer for
 * a light surface, lighter shimmer for a dark surface").
 *
 * @param value - HSL-triplet token value
 * @returns The perceptual luminance (0 = absolute black, 1 = absolute white)
 */
export function tokenLuminance(value: string): number {
	return wcagLuminance(parseTokenHsl(value));
}

/**
 * Canonical radius presets shared between `@hex-core/cli`'s interactive
 * authoring and `hex-ui-platform`'s Studio sliders. Authors who pick
 * outside the presets enter a custom `rem` string.
 *
 * - `sharp` (`0.25rem`) — Linear-style precision, tight chrome
 * - `balanced` (`0.625rem`) — versatile default, current shadcn-canon
 * - `soft` (`0.875rem`) — friendly / consumer, reads as approachable
 */
export const RADIUS_PRESETS = {
	sharp: "0.25rem",
	balanced: "0.625rem",
	soft: "0.875rem",
} as const;

export type RadiusPreset = keyof typeof RADIUS_PRESETS;

/**
 * Surface and framing lightness bands for the two color modes. Used by
 * both the CLI (`buildTokenSet`) and Studio (its preview pane) to
 * derive secondary / muted / accent / border / input slots that fit
 * the chosen background instead of always landing in the light band.
 *
 * Each mode pins `surface` (the lightness of `secondary` / `muted` /
 * `accent` button fills) and `framing` (the lightness of `border` /
 * `input` lines). Light surfaces want near-white fills with low-contrast
 * lines; dark surfaces want near-black fills with mid-contrast lines.
 */
export const COLOR_MODE_BANDS = {
	light: { surface: 0.959, framing: 0.9 },
	dark: { surface: 0.159, framing: 0.16 },
} as const;

export type ColorMode = keyof typeof COLOR_MODE_BANDS;
