import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import {
	clusterAlignVariants,
	gapVariants,
	justifyVariants,
} from "../_shared/layout-variants.js";

/**
 * CVA variants for Cluster — horizontal flex flow with wrap.
 * `gap` and `justify` pull from shared layout-variant maps; `align` adds
 * `baseline` (text-baseline alignment for mixed-size siblings).
 */
const clusterVariants = cva("flex flex-wrap", {
	variants: {
		gap: gapVariants,
		align: clusterAlignVariants,
		justify: justifyVariants,
	},
	defaultVariants: {
		gap: "md",
		align: "center",
		justify: "start",
	},
});

/** Props for the Cluster component. */
export interface ClusterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof clusterVariants> {}

/**
 * Horizontal flex flow with wrap. Children flow left-to-right and wrap to next line as needed.
 * @param props - Cluster props including `gap`, `align`, and `justify` variant keys.
 * @returns A flex row that wraps with consistent gap.
 * @example
 * ```tsx
 * <Cluster gap="sm">
 *   <Badge>react</Badge>
 *   <Badge>typescript</Badge>
 *   <Badge>tailwind</Badge>
 * </Cluster>
 * ```
 */
function Cluster({ className, gap, align, justify, ...props }: ClusterProps) {
	return (
		<div className={cn(clusterVariants({ gap, align, justify }), className)} {...props} />
	);
}

export { Cluster, clusterVariants };
