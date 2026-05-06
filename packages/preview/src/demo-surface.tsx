import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Props for the {@link DemoSurface} elevated container.
 *
 * Extends the standard div attributes so consumers can pass `id`, `aria-*`,
 * `data-*`, etc. through unchanged.
 */
export interface DemoSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Minimum height for the surface in any CSS unit. Defaults to `200px` to
	 * match the docs preview wrapper. Pass `"auto"` to opt out.
	 */
	minHeight?: string;
}

/**
 * An elevated surface for showcasing Hex Core components.
 *
 * Hex Core components (Button outline/secondary, Input, Card, etc.) are designed
 * to read against a Card-elevated surface. When dropped onto a flat-white page
 * they appear washed out. `<DemoSurface>` provides the same recipe used in the
 * official docs preview wrapper — `bg-muted/30` plus a subtle inset shadow —
 * so consumers (the studio at `hex-ui-platform`, downstream apps, third-party
 * playgrounds) can render demos that look right without copying the markup.
 *
 * @example
 * ```tsx
 * import { DemoSurface } from "@hex-core/preview";
 * import { Button } from "@hex-core/components";
 *
 * <DemoSurface>
 *   <Button variant="outline">Visible on white pages</Button>
 * </DemoSurface>
 * ```
 *
 * @param props - Standard div attributes plus an optional `minHeight`.
 * @returns A flex-centered, elevated surface div.
 */
export const DemoSurface = React.forwardRef<HTMLDivElement, DemoSurfaceProps>(
	({ className, minHeight = "200px", style, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={twMerge(
					clsx(
						"flex w-full items-center justify-center rounded-lg bg-muted/30 p-8",
						"shadow-[inset_0_1px_2px_0_rgb(0_0_0/0.04)]",
						className,
					),
				)}
				style={{ minHeight, ...style }}
				{...props}
			>
				{children}
			</div>
		);
	},
);

DemoSurface.displayName = "DemoSurface";
