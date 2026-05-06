"use client";

import { useState } from "react";
import { SlideIn, type SlideDirection } from "@hex-core/motion";

const DIRS: SlideDirection[] = ["bottom", "top", "left", "right"];

export function SlideInDemo() {
	const [direction, setDirection] = useState<SlideDirection>("bottom");
	const [key, setKey] = useState(0);
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				{DIRS.map((d) => (
					<button
						type="button"
						key={d}
						onClick={() => {
							setDirection(d);
							setKey((k) => k + 1);
						}}
						className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
							direction === d
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground"
						}`}
					>
						{d}
					</button>
				))}
			</div>
			<SlideIn
				key={key}
				direction={direction}
				distance={32}
				duration={400}
				easing="emphasized"
				className="rounded-md border bg-card p-4 text-sm text-foreground"
			>
				Slides in from <strong>{direction}</strong>.
			</SlideIn>
		</div>
	);
}
