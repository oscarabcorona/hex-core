"use client";

import { useState } from "react";
import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

/**
 * A two-clip timeline. The Replay button remounts the Timeline so the
 * sequence runs again from t=0 — useful for inspecting the deterministic
 * seek behavior.
 */
export function MotionTimelineDemo() {
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
				<div
					id={`tl-title-${key}`}
					style={{ transform: "translateY(8px)" }}
					className="text-lg font-semibold text-foreground"
				>
					Ship spec-driven UI.
				</div>
				<div
					id={`tl-cta-${key}`}
					style={{ transform: "translateY(24px)" }}
					className="inline-flex rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				>
					Get started
				</div>
			</div>
			<Timeline key={key} duration={1100} autoPlay>
				<Scene start={0} duration={400}>
					<Clip
						target={`#tl-title-${key}`}
						from={{ y: 8 }}
						to={{ y: 0 }}
					/>
				</Scene>
				<Scene start={500} duration={500}>
					<Clip
						target={`#tl-cta-${key}`}
						from={{ y: 24 }}
						to={{ y: 0 }}
						easing="emphasized"
					/>
				</Scene>
			</Timeline>
		</div>
	);
}
