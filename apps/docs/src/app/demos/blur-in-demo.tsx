"use client";

import { useState } from "react";
import { BlurIn } from "@hex-core/motion";

export function BlurInDemo() {
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
			<BlurIn
				key={key}
				from={6}
				duration={500}
				className="rounded-md border bg-card p-4 text-2xl font-semibold text-foreground"
			>
				Spec-driven UI
			</BlurIn>
		</div>
	);
}
