"use client";

import { useState } from "react";
import { Stagger, FadeIn } from "@hex-core/motion";

const ITEMS = ["Discover components", "Resolve from a brief", "Install + verify"];

export function StaggerDemo() {
	const [key, setKey] = useState(0);
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<button
				type="button"
				onClick={() => setKey((k) => k + 1)}
				className="self-start rounded-md border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
			>
				Replay
			</button>
			<Stagger key={key} gap={120} className="flex flex-col gap-2">
				{ITEMS.map((label) => (
					<FadeIn
						key={label}
						duration={300}
						className="rounded-md border bg-card px-3 py-2 text-sm text-foreground"
					>
						{label}
					</FadeIn>
				))}
			</Stagger>
		</div>
	);
}
