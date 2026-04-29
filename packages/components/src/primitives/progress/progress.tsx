"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * A horizontal progress bar from 0–100%.
 * Built on Radix UI Progress for aria-valuenow/max wiring.
 */
const Progress = React.forwardRef<
	React.ComponentRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max = 100, ...props }, ref) => {
	const pct = Math.max(0, Math.min(100, ((value ?? 0) / max) * 100));
	return (
		<ProgressPrimitive.Root
			ref={ref}
			// Clamp undefined → 0 so ARIA (aria-valuenow) matches the visual fill.
			// Consumers who want an indeterminate loading bar should use <Skeleton />.
			value={value ?? 0}
			max={max}
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full border border-foreground/[0.08] bg-secondary",
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className="h-full w-full flex-1 bg-primary transition-transform duration-500 ease-out"
				style={{ transform: `translateX(-${100 - pct}%)` }}
			/>
		</ProgressPrimitive.Root>
	);
});
Progress.displayName = "Progress";

export { Progress };
