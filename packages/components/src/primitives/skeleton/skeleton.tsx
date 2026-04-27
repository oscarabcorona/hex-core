import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * A placeholder shimmer element shown while content is loading.
 * Pair with explicit width/height via className.
 * @returns A div with pulsing muted background
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md border border-foreground/[0.06] bg-muted", className)}
			{...props}
		/>
	);
}

export { Skeleton };
