"use client";

import { useState } from "react";
import { ScaleIn } from "@hex-core/motion";

export function ScaleInDemo() {
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
			<ScaleIn
				key={key}
				from={0.9}
				duration={350}
				easing="emphasized"
				className="rounded-md border bg-card p-4 text-sm text-foreground"
			>
				Modal-style entrance — subtle pop with synced fade.
			</ScaleIn>
		</div>
	);
}
