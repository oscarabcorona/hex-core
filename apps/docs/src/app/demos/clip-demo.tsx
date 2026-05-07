"use client";

import { useState } from "react";
import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

/**
 * The smallest unit of a Timeline: one Clip animating one selector. This
 * demo shows three clips in one Scene, each with a different easing, so
 * the difference between the named easing tokens is visible side-by-side.
 */
export function ClipDemo() {
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
			<div className="space-y-3">
				{[
					{ id: "standard", label: "standard" },
					{ id: "emphasized", label: "emphasized" },
					{ id: "bounce", label: "bounce" },
				].map((row) => (
					<div key={row.id} className="flex items-center gap-3">
						<span className="w-24 text-xs font-medium text-muted-foreground">
							{row.label}
						</span>
						<div
							id={`clip-${row.id}-${key}`}
							style={{ transform: "translateX(0px)" }}
							className="h-8 w-8 rounded-md border bg-card"
						/>
					</div>
				))}
			</div>
			<Timeline key={key} duration={1000} autoPlay>
				<Scene start={0} duration={1000}>
					<Clip
						target={`#clip-standard-${key}`}
						from={{ x: 0 }}
						to={{ x: 200 }}
						easing="standard"
					/>
					<Clip
						target={`#clip-emphasized-${key}`}
						from={{ x: 0 }}
						to={{ x: 200 }}
						easing="emphasized"
					/>
					<Clip
						target={`#clip-bounce-${key}`}
						from={{ x: 0 }}
						to={{ x: 200 }}
						easing="bounce"
					/>
				</Scene>
			</Timeline>
		</div>
	);
}
