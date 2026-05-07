"use client";

import { useState } from "react";
import { Motion, Presence } from "@hex-core/motion";

/**
 * Presence wraps a conditionally rendered Motion child so the exit
 * animation runs before unmount. Toggle the visible state to see the
 * card fade in and out.
 */
export function PresenceDemo() {
	const [open, setOpen] = useState(true);
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="self-start rounded-md border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
			>
				{open ? "Hide" : "Show"} card
			</button>
			<Presence>
				{open && (
					<Motion.div
						key="card"
						initial={{ y: 8 }}
						animate={{ y: 0 }}
						exit={{ y: -8 }}
						transition={{ duration: 200, easing: "standard" }}
						className="rounded-md border bg-card p-4 text-sm text-foreground"
					>
						I unmount only after my exit animation finishes.
					</Motion.div>
				)}
			</Presence>
		</div>
	);
}
