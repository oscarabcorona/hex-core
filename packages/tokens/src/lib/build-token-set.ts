import type { ColorToken, TokenSet } from "@hex-core/registry";
import {
	COLOR_MODE_BANDS,
	type ColorMode,
	deriveForegroundFor,
	deriveSecondaryFromPrimary,
} from "./derive.js";

/**
 * Five-seed input that fully determines a coherent {@link TokenSet}.
 *
 * Mirrors the seed shape the interactive `hex theme init -i` flow asks
 * for, plus the seed shape the brand-derived preset import script
 * (`scripts/import-voltagent.ts`) extracts from a markdown brief. Both
 * paths share this helper so the rendered token sets are identical
 * given identical seeds.
 *
 * @property primary - HSL-triplet ("<H> <S>% <L>%"). The brand color.
 * @property foreground - HSL-triplet. Page text default. Drives
 *   `muted-foreground`, `border`, and `input` lightness.
 * @property background - HSL-triplet. Page canvas. Mirrored to
 *   `card` and `popover`.
 * @property destructive - HSL-triplet. Error / delete CTA color.
 *   Pairs with a derived `destructive-foreground`.
 * @property radius - rem string (`"0.375rem"`, `"0.625rem"`, ...).
 *   Single radius preset; consumers can override per-component via
 *   the standard `--radius-*` overrides.
 */
export interface TokenSetSeeds {
	primary: string;
	foreground: string;
	background: string;
	destructive: string;
	radius: string;
}

/**
 * Build a full 19-required-slot {@link TokenSet} from a small seed
 * bag. Both the CLI authoring flow and the brand-derived preset
 * import script call this helper so output is consistent across
 * authoring surfaces.
 *
 * The mode flag picks the right surface/framing band so derived
 * neutrals (`secondary` / `muted` / `accent` / `border` / `input`)
 * land at light-mode lightness on a light surface and dark-mode
 * lightness on a dark surface.
 *
 * @param seeds - The five seed values; see {@link TokenSetSeeds}
 * @param mode - `"light"` or `"dark"` — drives band selection
 * @returns A {@link TokenSet} carrying every required color slot + radius
 */
export function buildTokenSet(seeds: TokenSetSeeds, mode: ColorMode): TokenSet {
	const { surface, framing } = COLOR_MODE_BANDS[mode];

	const primary: ColorToken = { value: seeds.primary, type: "color" };
	const primaryForeground = deriveForegroundFor(seeds.primary);
	const foreground: ColorToken = { value: seeds.foreground, type: "color" };
	const background: ColorToken = { value: seeds.background, type: "color" };
	const destructive: ColorToken = { value: seeds.destructive, type: "color" };
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
		"muted-foreground": {
			value: shiftLightnessTo(seeds.foreground, mode === "light" ? 0.38 : 0.7),
			type: "color",
		},
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
 * Shift a token's lightness to a target value (0–1) while preserving
 * hue and capping saturation at 8% so derived neutrals read as
 * "intentional tint" rather than "achromatic gray." Used internally
 * by `buildTokenSet` for `muted-foreground` / `border` / `input`.
 *
 * @param value - HSL-triplet input
 * @param lightness - Target lightness in `[0, 1]`
 * @returns A new HSL-triplet at the requested lightness, or the input
 *   unchanged if it doesn't parse
 */
function shiftLightnessTo(value: string, lightness: number): string {
	const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(value.trim());
	if (!match) return value;
	const h = Number(match[1]);
	const s = Math.min(Number(match[2]), 8);
	const l = Math.round(lightness * 1000) / 10;
	return `${h} ${s.toFixed(1).replace(/\.0$/, "")}% ${l}%`;
}
