import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * CVA variants for Spacer — declarative whitespace.
 * `size` sets `--spacer-size` to a `--space-*` token (with inline fallback);
 * `axis` consumes that var via `h-[var(...)]` / `w-[var(...)]` in the bracket
 * form used everywhere else in the package, so the height/width can never
 * collapse to zero if the size variant is dropped.
 */
const spacerVariants = cva("shrink-0", {
	variants: {
		size: {
			xs: "[--spacer-size:var(--space-1,0.25rem)]",
			sm: "[--spacer-size:var(--space-2,0.5rem)]",
			md: "[--spacer-size:var(--space-4,1rem)]",
			lg: "[--spacer-size:var(--space-8,2rem)]",
			xl: "[--spacer-size:var(--space-16,4rem)]",
		},
		axis: {
			vertical: "h-[var(--spacer-size)] w-0",
			horizontal: "w-[var(--spacer-size)] h-0",
			both: "h-[var(--spacer-size)] w-[var(--spacer-size)]",
		},
	},
	defaultVariants: {
		size: "md",
		axis: "vertical",
	},
});

/** Props for the Spacer component. */
export interface SpacerProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
		VariantProps<typeof spacerVariants> {}

/**
 * A declarative whitespace block. Use when you want to insert space between two
 * siblings without relying on margin or gap (e.g. inside a flex container that
 * doesn't own the spacing decision).
 *
 * Renders an empty `<div>` with `aria-hidden` since it has no semantic content.
 *
 * @param props - Spacer props including `size` and `axis` variant keys.
 * @returns An empty div with the requested dimension.
 * @example
 * ```tsx
 * <h1>Title</h1>
 * <Spacer size="lg" />
 * <p>Body</p>
 * ```
 */
function Spacer({ className, size, axis, ...props }: SpacerProps) {
	return (
		<div
			aria-hidden="true"
			className={cn(spacerVariants({ size, axis }), className)}
			{...props}
		/>
	);
}

export { Spacer, spacerVariants };
