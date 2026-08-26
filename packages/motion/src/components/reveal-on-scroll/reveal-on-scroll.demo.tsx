"use client";

import { RevealOnScroll } from "@hex-core/motion";

const ITEMS = Array.from({ length: 6 }, (_, i) => `Section ${i + 1}`);

export function RevealOnScrollDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<p className="text-xs font-medium text-muted-foreground">
				Each card fades + slides up the first time it enters the viewport.
			</p>
			<div
				tabIndex={0}
				role="region"
				aria-label="Scrollable example list"
				className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-md border bg-muted/40 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{ITEMS.map((label) => (
					<RevealOnScroll
						key={label}
						className="rounded-md border bg-card px-4 py-6 text-sm text-foreground"
					>
						{label}
					</RevealOnScroll>
				))}
			</div>
		</div>
	);
}
