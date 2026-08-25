"use client";

import { useState } from "react";
import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

/**
 * A Scene groups Clips into an absolute time window. Two scenes back-to-
 * back animate two boxes sequentially. The Replay button remounts the
 * Timeline to restart from t=0.
 */
export function SceneDemo() {
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
			<div className="flex items-center gap-3">
				<div
					id={`scene-a-${key}`}
					style={{ transform: "scale(0.85)" }}
					className="flex h-16 w-16 items-center justify-center rounded-md border bg-card text-xs font-medium text-foreground"
				>
					Scene A
				</div>
				<div
					id={`scene-b-${key}`}
					style={{ transform: "scale(0.85)" }}
					className="flex h-16 w-16 items-center justify-center rounded-md border bg-card text-xs font-medium text-foreground"
				>
					Scene B
				</div>
			</div>
			<Timeline key={key} duration={1200} autoPlay>
				<Scene start={0} duration={500}>
					<Clip target={`#scene-a-${key}`} from={{ scale: 0.85 }} to={{ scale: 1 }} />
				</Scene>
				<Scene start={500} duration={500}>
					<Clip target={`#scene-b-${key}`} from={{ scale: 0.85 }} to={{ scale: 1 }} />
				</Scene>
			</Timeline>
		</div>
	);
}
