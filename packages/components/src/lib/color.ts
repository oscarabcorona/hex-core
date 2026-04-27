/**
 * Color conversion utilities for the HSL-triplet token format used across
 * `@hex-core/tokens` themes (`H S% L%`, e.g. `"240 5.9% 10%"` — no `hsl()`
 * wrapper, no commas).
 *
 * The triplet is the round-trip-safe serialization for Hex UI: tokens flow
 * triplet → CSS `hsl(var(--token))` → rendered color, and the ColorPicker
 * component edits triplets directly. Hex/RGB conversions are display
 * adapters, not the source of truth.
 */

/** Parsed HSL components. `h` is degrees (0–360); `s` and `l` are percentages (0–100). */
export interface HslTriplet {
	h: number;
	s: number;
	l: number;
}

/** Parsed RGB components. Each channel is 0–255. */
export interface RgbColor {
	r: number;
	g: number;
	b: number;
}

/**
 * Parse an HSL triplet string into numeric components.
 *
 * Note: malformed input silently coerces to `{0,0,0}` (pure black) rather than
 * returning an error signal. Callers that need to distinguish "user typed
 * black" from "user typed garbage" should validate the input format first.
 * `hexToHslTriplet` returns `null` for malformed hex; this asymmetry is
 * intentional — triplets feed CSS variables where any non-color value would
 * already break rendering.
 *
 * @param triplet - String in the form `"<H> <S>% <L>%"` (e.g. `"240 5.9% 10%"`).
 * @returns Numeric components, or `{0,0,0}` if the input is malformed.
 */
export function parseHslTriplet(triplet: string): HslTriplet {
	const parts = triplet.trim().split(/\s+/);
	return {
		h: Number.parseFloat(parts[0]) || 0,
		s: Number.parseFloat(parts[1]) || 0,
		l: Number.parseFloat(parts[2]) || 0,
	};
}

/**
 * Format HSL components into an HSL triplet string (the canonical token format).
 * @param hsl - Numeric components.
 * @returns Triplet in the form `"<H> <S>% <L>%"`.
 */
export function formatHslTriplet({ h, s, l }: HslTriplet): string {
	// Tolerant integer check: rgbToHsl can produce values like 5.0000000001 due
	// to float arithmetic; format those as "5" rather than "5.0".
	const round = (n: number) =>
		Math.abs(n - Math.round(n)) < 1e-6 ? `${Math.round(n)}` : n.toFixed(1);
	return `${Math.round(h)} ${round(s)}% ${round(l)}%`;
}

/**
 * Convert HSL components to RGB.
 * @param h - Hue (0–360).
 * @param s - Saturation (0–100).
 * @param l - Lightness (0–100).
 * @returns RGB channels (0–255, rounded).
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor {
	const sN = s / 100;
	const lN = l / 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = sN * Math.min(lN, 1 - lN);
	const f = (n: number) => lN - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
	return {
		r: Math.round(255 * f(0)),
		g: Math.round(255 * f(8)),
		b: Math.round(255 * f(4)),
	};
}

/**
 * Convert RGB components to HSL.
 * @param r - Red (0–255).
 * @param g - Green (0–255).
 * @param b - Blue (0–255).
 * @returns HSL components (h: 0–360, s: 0–100, l: 0–100).
 */
export function rgbToHsl(r: number, g: number, b: number): HslTriplet {
	const rN = r / 255;
	const gN = g / 255;
	const bN = b / 255;
	const max = Math.max(rN, gN, bN);
	const min = Math.min(rN, gN, bN);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === rN) h = (gN - bN) / d + (gN < bN ? 6 : 0);
		else if (max === gN) h = (bN - rN) / d + 2;
		else h = (rN - gN) / d + 4;
		h /= 6;
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert an HSL triplet to a 6-digit hex string.
 * @param triplet - HSL triplet (e.g. `"240 5.9% 10%"`).
 * @returns Lowercase hex string with leading `#` (e.g. `"#181a1f"`).
 */
export function hslTripletToHex(triplet: string): string {
	const { h, s, l } = parseHslTriplet(triplet);
	const { r, g, b } = hslToRgb(h, s, l);
	const toHex = (n: number) => n.toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert a hex string to an HSL triplet.
 * Accepts 3-digit (`#abc`) or 6-digit (`#aabbcc`) hex with optional `#`.
 * @param hex - Hex color string.
 * @returns HSL triplet, or `null` if the input is malformed.
 */
export function hexToHslTriplet(hex: string): string | null {
	const clean = hex.trim().replace(/^#/, "");
	let normalized: string;
	if (/^[0-9a-fA-F]{3}$/.test(clean)) {
		normalized = clean
			.split("")
			.map((c) => c + c)
			.join("");
	} else if (/^[0-9a-fA-F]{6}$/.test(clean)) {
		normalized = clean;
	} else {
		return null;
	}
	const r = Number.parseInt(normalized.slice(0, 2), 16);
	const g = Number.parseInt(normalized.slice(2, 4), 16);
	const b = Number.parseInt(normalized.slice(4, 6), 16);
	return formatHslTriplet(rgbToHsl(r, g, b));
}
