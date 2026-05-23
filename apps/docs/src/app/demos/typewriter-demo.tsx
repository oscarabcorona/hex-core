"use client";

import { useState } from "react";
import { Typewriter } from "@hex-core/motion";

export function TypewriterDemo() {
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
			<div className="rounded-md border bg-card p-4 text-base font-medium text-foreground">
				<Typewriter
					key={key}
					text="Spec-driven UI for AI agents."
					speed={45}
				/>
			</div>
		</div>
	);
}
