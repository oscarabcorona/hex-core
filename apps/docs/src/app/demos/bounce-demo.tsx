"use client";

import { useState } from "react";
import { Bounce } from "@hex-core/motion";

export function BounceDemo() {
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
			<Bounce key={key} intensity={0.15}>
				<div className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
					🎉 Achievement unlocked
				</div>
			</Bounce>
		</div>
	);
}
