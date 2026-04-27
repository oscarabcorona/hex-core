/**
 * Single source of truth for layout-primitive CVA variant maps.
 *
 * Stack, Cluster, Grid all share `gap` and `justify` value sets; align values
 * differ slightly (`stretch` for column-like flows, `baseline` for row flows).
 * Centralizing the maps here keeps token names and Tailwind classes in one
 * file — when the gap scale changes (renamed token, new step, etc.), all
 * three components update together.
 */

/** Gap scale bound to `--gap-*` tokens. Used by Stack, Cluster, Grid. */
export const gapVariants = {
	xs: "gap-[var(--gap-xs,0.25rem)]",
	sm: "gap-[var(--gap-sm,0.5rem)]",
	md: "gap-[var(--gap-md,1rem)]",
	lg: "gap-[var(--gap-lg,1.5rem)]",
	xl: "gap-[var(--gap-xl,2rem)]",
} as const;

/** `justify-content` values shared by Stack and Cluster. */
export const justifyVariants = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
} as const;

/** Cross-axis `align-items` values for vertical/grid flows (column-like). */
export const flexAlignVariants = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
} as const;

/** Cross-axis `align-items` values for horizontal flows. Includes `baseline`. */
export const clusterAlignVariants = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
	baseline: "items-baseline",
} as const;
