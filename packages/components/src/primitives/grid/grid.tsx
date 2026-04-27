import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import { flexAlignVariants, gapVariants } from "../_shared/layout-variants.js";

/**
 * CVA variants for Grid — CSS grid with column-count presets and shared `gap`.
 * `cols` accepts 1/2/3/4/6 fixed columns or `"auto-fit"` for responsive auto-sizing
 * (in which case the consumer should pass `minColWidth` for the min track size).
 *
 * `cols` keys are TypeScript numeric literals (`cols={3}`) at the type level;
 * the schema's `enumValues` serializes them as strings for JSON-shape parity.
 */
const gridVariants = cva("grid", {
	variants: {
		cols: {
			1: "grid-cols-1",
			2: "grid-cols-2",
			3: "grid-cols-3",
			4: "grid-cols-4",
			6: "grid-cols-6",
			"auto-fit": "",
		},
		gap: gapVariants,
		align: flexAlignVariants,
	},
	defaultVariants: {
		cols: 3,
		gap: "md",
		align: "stretch",
	},
});

/** Props for the Grid component. */
export interface GridProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof gridVariants> {
	/**
	 * Minimum column width for `cols="auto-fit"`. Tracks repeat to fill the container,
	 * never shrinking below this value. Ignored when `cols` is a fixed integer.
	 * @default "16rem"
	 */
	minColWidth?: string;
}

/**
 * CSS grid with column-count presets and consistent gap. Use for card grids,
 * dashboards, image galleries, and any layout where children should align to
 * shared row/column tracks.
 *
 * Pass `cols="auto-fit"` and `minColWidth` for responsive grids that fit as
 * many columns as the viewport allows without media queries.
 *
 * @param props - Grid props including `cols`, `gap`, `align`, and `minColWidth`.
 * @returns A CSS grid container.
 * @example
 * ```tsx
 * <Grid cols={3} gap="md">
 *   {items.map((i) => <Card key={i.id}>{i.title}</Card>)}
 * </Grid>
 * <Grid cols="auto-fit" minColWidth="20rem" gap="lg">
 *   {responsiveItems.map(...)}
 * </Grid>
 * ```
 */
function Grid({ className, cols, gap, align, minColWidth = "16rem", style, ...props }: GridProps) {
	// Consumer's inline `style` is spread last so a passed `gridTemplateColumns`
	// overrides our auto-fit default. That's the right precedence: explicit wins.
	const inlineStyle =
		cols === "auto-fit"
			? { gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`, ...style }
			: style;
	return (
		<div
			className={cn(gridVariants({ cols, gap, align }), className)}
			style={inlineStyle}
			{...props}
		/>
	);
}

export { Grid, gridVariants };
