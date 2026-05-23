"use client";

import { useState } from "react";
import { CountUp } from "@hex-core/motion";

export function CountUpDemo() {
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
			<div className="grid grid-cols-3 gap-3">
				<div className="rounded-md border bg-card p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						<CountUp key={`a-${key}`} to={117} duration={1000} />
					</div>
					<div className="mt-1 text-xs text-muted-foreground">Components</div>
				</div>
				<div className="rounded-md border bg-card p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						<CountUp key={`b-${key}`} to={26} duration={900} />
					</div>
					<div className="mt-1 text-xs text-muted-foreground">Motion items</div>
				</div>
				<div className="rounded-md border bg-card p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						<CountUp key={`c-${key}`} to={9} duration={800} />
					</div>
					<div className="mt-1 text-xs text-muted-foreground">Skills</div>
				</div>
			</div>
		</div>
	);
}
