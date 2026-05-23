"use client";

import { useState } from "react";
import { FadeIn } from "@hex-core/motion";

export function FadeInDemo() {
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
			<FadeIn
				key={key}
				duration={400}
				easing="standard"
				className="rounded-md border bg-card p-4 text-sm text-foreground"
			>
				The thinnest possible fade — same Motion.div under the hood.
			</FadeIn>
		</div>
	);
}
