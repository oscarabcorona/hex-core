"use client";

import { Pulse } from "@hex-core/motion";

export function PulseDemo() {
	return (
		<div className="flex w-full max-w-md flex-col items-start gap-4">
			<p className="text-xs font-medium text-muted-foreground">
				A pulsing notification dot — draws attention without taking focus.
			</p>
			<Pulse intensity={0.12} duration={1400} className="inline-flex items-center gap-2">
				<span className="size-2 rounded-full bg-destructive" aria-hidden="true" />
				<span className="text-sm font-medium text-foreground">3 unread</span>
			</Pulse>
		</div>
	);
}
