"use client";

import { Shimmer } from "@hex-core/motion";

export function ShimmerDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<p className="text-xs font-medium text-muted-foreground">
				Skeleton loader sweep — pair with bg-muted on cards/rows.
			</p>
			<Shimmer className="h-20 rounded-md bg-muted" />
			<Shimmer className="h-4 w-2/3 rounded-md bg-muted" />
			<Shimmer className="h-4 w-1/2 rounded-md bg-muted" />
		</div>
	);
}
