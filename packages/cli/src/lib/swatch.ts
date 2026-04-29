import { type Hsl, hsl } from "culori";
import pc from "picocolors";

/**
 * Render hex-core token values as ANSI swatches in the terminal. Used
 * by the interactive `theme init -i` / `theme edit -i` flows so authors
 * can see what they're picking without leaving the terminal.
 *
 * **24-bit truecolor** is preferred (most modern terminals — iTerm2,
 * Alacritty, kitty, recent VS Code, recent Windows Terminal). Falls
 * back to a labeled hex string when:
 *   - `process.env.NO_COLOR` is set (the cross-tool standard)
 *   - `picocolors.isColorSupported` reports false (CI / dumb terminals)
 *
 * Pure (returns a string); caller does the I/O.
 */

/**
 * Parse a hex-core HSL-triplet (`"240 10% 3.9%"`) into a culori Hsl
 * record. Returns null on invalid input — swatch rendering is
 * best-effort, never throws.
 */
function parseTripletStrict(value: string): Hsl | null {
	const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(value.trim());
	if (!match) return null;
	return {
		mode: "hsl",
		h: Number(match[1]),
		s: Number(match[2]) / 100,
		l: Number(match[3]) / 100,
	};
}

/** Quantize a 0–1 channel to 0–255 for ANSI escape sequences. */
function chan8(n: number): number {
	const v = Math.round((n ?? 0) * 255);
	return Math.max(0, Math.min(255, v));
}

/**
 * Render one ANSI 24-bit color cell containing two block characters
 * (▀▀) — wide enough to read, narrow enough to fit ~10 cells per
 * terminal row. The escape sequence sets both foreground (the block)
 * and background to the same color so the cell is solid even on
 * terminals that overlay foreground on dim backgrounds.
 */
function ansiCell(color: Hsl, glyph = "  "): string {
	const rgb = hsl({ ...color, mode: "hsl" });
	if (!rgb) return glyph;
	const r = chan8(rgb.r ?? 0);
	const g = chan8(rgb.g ?? 0);
	const b = chan8(rgb.b ?? 0);
	const ESC = "\x1b[";
	return `${ESC}48;2;${r};${g};${b}m${glyph}${ESC}0m`;
}

/**
 * Render a single token-value swatch as an ANSI block followed by the
 * value string for readability. NO_COLOR / unsupported terminals get
 * the bare value with `(swatch unavailable)` annotation so the data
 * is still legible.
 *
 * @param value - HSL-triplet token value
 * @param label - optional label printed before the swatch (e.g. "primary")
 * @returns A single line ready to `console.log`
 */
export function swatch(value: string, label?: string): string {
	const colorOk = pc.isColorSupported && !process.env.NO_COLOR;
	const color = parseTripletStrict(value);

	if (!color || !colorOk) {
		return label ? `${label}: ${value} (swatch unavailable)` : value;
	}

	const block = ansiCell(color, "  ");
	const labelPart = label ? `${pc.dim(label.padEnd(20))} ` : "";
	return `${labelPart}${block} ${pc.dim(value)}`;
}

/**
 * Render a multi-token grid for previewing a whole TokenSet. Emits
 * one swatch per line, sorted by the input order so the preview
 * mirrors the canonical token order from `REQUIRED_COLOR_TOKENS`.
 *
 * @param entries - `[label, value]` tuples in display order
 * @returns A multi-line string ready to `console.log`
 */
export function swatchGrid(entries: Array<[string, string]>): string {
	return entries.map(([label, value]) => swatch(value, label)).join("\n");
}

/**
 * Render a contrast pairing as two stacked swatches with the ratio
 * computed via `wcagContrast` (caller passes the ratio so this stays
 * dependency-free vs. derive.ts; keeps swatch.ts a pure render layer).
 *
 * @param fgValue - foreground HSL-triplet
 * @param bgValue - background HSL-triplet
 * @param ratio - precomputed contrast (use `contrastRatio` from `@hex-core/tokens`)
 * @returns A 2-line preview: foreground swatch + bg swatch + AA verdict
 */
export function contrastPreview(fgValue: string, bgValue: string, ratio: number): string {
	const verdict = ratio >= 4.5 ? pc.green(`✓ ${ratio.toFixed(2)}:1 (AA)`) : pc.red(`✗ ${ratio.toFixed(2)}:1 (sub-AA)`);
	const fg = swatch(fgValue, "fg");
	const bg = swatch(bgValue, "bg");
	return `${fg}\n${bg}\n${verdict}`;
}

