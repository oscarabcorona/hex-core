"use client";

import { Motion } from "@hex-core/motion";

/**
 * Declarative Motion.div: mount fade-in plus hover lift and tap squeeze.
 * The outer card animates on mount; the inner button reacts to pointer
 * events without consumer-side state.
 */
export function MotionDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Mount fade + slide
				</p>
				<Motion.div
					initial={{ y: 12 }}
					animate={{ y: 0 }}
					transition={{ duration: 300, easing: "emphasized" }}
					className="rounded-md border bg-card p-4 text-sm text-foreground"
				>
					This card slid up when you opened the page.
				</Motion.div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Hover lift + tap squeeze
				</p>
				<Motion.button
					whileHover={{ y: -4 }}
					whileTap={{ scale: 0.97 }}
					transition={{ duration: 150, easing: "standard" }}
					className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				>
					Hover or click me
				</Motion.button>
			</div>
		</div>
	);
}
