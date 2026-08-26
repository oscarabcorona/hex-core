"use client";

import { useEffect, useState } from "react";
import { Progress } from "@hex-core/components";

/**
 * Progress patterns: animated value (ticks up), multiple fixed states
 * side-by-side, and a taller bar with a numeric readout.
 */
export function ProgressDemo() {
	const [value, setValue] = useState(13);

	useEffect(() => {
		const timer = setTimeout(() => setValue(66), 500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<div className="mb-2 flex items-center justify-between text-xs">
					<span className="font-medium text-muted-foreground">Uploading</span>
					<span className="text-muted-foreground">{value}%</span>
				</div>
				<Progress value={value} aria-label="Upload progress" />
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Fixed values</p>
				<div className="grid gap-2">
					{[25, 50, 75, 100].map((v) => (
						<div key={v} className="flex items-center gap-3">
							<Progress
								value={v}
								aria-label={`Progress ${v}%`}
								className="flex-1"
							/>
							<span className="w-10 text-right text-xs text-muted-foreground">{v}%</span>
						</div>
					))}
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Taller bar (custom height)
				</p>
				<Progress value={42} aria-label="Quota used" className="h-3" />
			</div>
		</div>
	);
}
