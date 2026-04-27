import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import {
	flexAlignVariants,
	gapVariants,
	justifyVariants,
} from "../_shared/layout-variants.js";

/**
 * CVA variants for Stack — vertical flex flow. `gap`, `align`, and `justify`
 * pull from the shared layout-variant maps so any change to the gap scale
 * propagates to Cluster and Grid simultaneously.
 */
const stackVariants = cva("flex flex-col", {
	variants: {
		gap: gapVariants,
		align: flexAlignVariants,
		justify: justifyVariants,
	},
	defaultVariants: {
		gap: "md",
		align: "stretch",
		justify: "start",
	},
});

/** Props for the Stack component. */
export interface StackProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof stackVariants> {}

/**
 * Vertical flex flow with token-bound gap. Children stack top-to-bottom.
 * @param props - Stack props including `gap`, `align`, and `justify` variant keys.
 * @returns A flex column with consistent vertical spacing.
 * @example
 * ```tsx
 * <Stack gap="lg">
 *   <h2>Section title</h2>
 *   <p>Paragraph one.</p>
 *   <p>Paragraph two.</p>
 * </Stack>
 * ```
 */
function Stack({ className, gap, align, justify, ...props }: StackProps) {
	return (
		<div className={cn(stackVariants({ gap, align, justify }), className)} {...props} />
	);
}

export { Stack, stackVariants };
