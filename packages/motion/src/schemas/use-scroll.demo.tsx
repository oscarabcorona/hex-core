"use client";

import { useEffect, useRef, useState } from "react";

/**
 * `useScroll` listens to window scroll and returns motion values for the
 * page-level scrollY and progress. A real demo of that requires the user
 * to scroll the page itself. To keep the demo card self-contained we
 * mirror the same shape against a scrollable child element so visitors
 * can see the progress bar fill as they scroll the inner box.
 */
export function UseScrollDemo() {
	const innerRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const node = innerRef.current;
		if (!node) return;
		const update = () => {
			const max = Math.max(1, node.scrollHeight - node.clientHeight);
			setProgress(Math.min(1, Math.max(0, node.scrollTop / max)));
		};
		update();
		node.addEventListener("scroll", update);
		return () => node.removeEventListener("scroll", update);
	}, []);

	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<div className="flex items-center gap-2">
				<span className="text-xs font-medium text-muted-foreground">Progress</span>
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary transition-[width] duration-75 ease-linear"
						style={{ width: `${(progress * 100).toFixed(0)}%` }}
					/>
				</div>
				<span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
					{Math.round(progress * 100)}%
				</span>
			</div>
			<p className="text-xs text-muted-foreground">
				Scroll the box below — the bar reads the same `scrollY / max` value
				`useScroll` exposes for the window. In real apps you wire it to a Motion
				value and read it via `useMotionValueRender`.
			</p>
			<div
				ref={innerRef}
				tabIndex={0}
				role="region"
				aria-label="Scrollable example content"
				className="h-32 overflow-y-auto rounded-md border bg-card p-4 text-xs leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{Array.from({ length: 30 }, (_, i) => (
					<p key={i} className="mb-2">
						Line {i + 1} — scroll-driven motion values stay readable across
						components without re-rendering on every frame.
					</p>
				))}
			</div>
		</div>
	);
}
