/**
 * Categorical chart palette for diagram primitives that encode categorical
 * data (sunburst, treemap, sankey, chord, funnel, pyramid, venn, matrix).
 * Cycled by an integer key — node index, leaf index, depth-1 ancestor, etc.
 *
 * The values reach into `--chart-1` through `--chart-6`, the dedicated
 * diagram-encoding tokens added in `@hex-core/tokens` 1.4. Each token has a
 * `var(--primary)` fallback so consumers on theme presets that haven't been
 * updated to ship `--chart-N` (or who run a custom theme without the chart
 * family) still see a coherent monochrome rendering instead of black SVG
 * fills.
 *
 * Why a chart palette and not the semantic tokens: `--primary`, `--accent`,
 * `--secondary`, and `--muted` collapse to a single hue family in the
 * default monochrome theme — adjacent segments of a chart end up
 * indistinguishable. Chart tokens are tuned for perceptual differentiation.
 */
export const CHART_PALETTE = [
	"hsl(var(--chart-1, var(--primary)))",
	"hsl(var(--chart-2, var(--primary)))",
	"hsl(var(--chart-3, var(--primary)))",
	"hsl(var(--chart-4, var(--primary)))",
	"hsl(var(--chart-5, var(--primary)))",
	"hsl(var(--chart-6, var(--primary)))",
] as const;

/**
 * Return the chart hue at a stable index. Cycles modulo `CHART_PALETTE.length`
 * so the caller doesn't have to range-check.
 *
 * @param index - Integer key (node index, leaf index, depth-1 ancestor index, …).
 * @returns A `hsl(var(...))` string suitable for SVG `fill` / `stroke`.
 */
export function pickChartHue(index: number): string {
	const safe = ((index % CHART_PALETTE.length) + CHART_PALETTE.length) % CHART_PALETTE.length;
	// `safe` is provably 0..CHART_PALETTE.length-1 — the assertion documents that.
	return CHART_PALETTE[safe] as string;
}
