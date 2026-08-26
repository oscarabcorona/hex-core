"use client";

import { useState } from "react";
import { Motion, variants } from "@hex-core/motion";

const PANEL = variants({
	closed: { opacity: 0, y: -8 },
	open: { opacity: 1, y: 0 },
});

/**
 * Two-state animation driven by named `variants`. The component swaps
 * between `open` and `closed` by passing a string to `animate`.
 */
export function VariantsDemo() {
	const [open, setOpen] = useState(false);
	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="self-start rounded-md border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
			>
				Toggle panel
			</button>
			{open && (
				<Motion.div
					variants={PANEL}
					initial="closed"
					animate="open"
					transition={{ duration: 200, easing: "standard" }}
					className="rounded-md border bg-card p-4 text-sm"
				>
					Two named states. No inline keyframes.
				</Motion.div>
			)}
		</div>
	);
}
