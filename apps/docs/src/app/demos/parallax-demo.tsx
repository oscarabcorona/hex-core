"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Parallax reads the global window scroll. To make the demo observable
 * inside a docs card (without forcing the whole page to scroll) we mirror
 * the same `scrollYProgress` math against a local scrollable container —
 * conceptually identical, just a smaller scroll context. Real apps use
 * `<Parallax>` directly with the page scroll.
 */
export function ParallaxDemo() {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		const node = scrollerRef.current;
		if (!node) return;
		const update = () => {
			const max = Math.max(1, node.scrollHeight - node.clientHeight);
			setProgress(Math.min(1, Math.max(0, node.scrollTop / max)));
		};
		update();
		node.addEventListener("scroll", update, { passive: true });
		return () => node.removeEventListener("scroll", update);
	}, []);
	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<p className="text-xs text-muted-foreground">
				Scroll the box below — the headline drifts upward as the card scrolls.
				In a real app <code>&lt;Parallax&gt;</code> is tied to the page scroll.
			</p>
			<div
				ref={scrollerRef}
				tabIndex={0}
				role="region"
				aria-label="Scrollable parallax demo"
				className="h-48 overflow-y-auto rounded-md border bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<div className="sticky top-3 z-10 px-6">
					<div
						className="rounded-md border bg-card p-4 shadow-sm"
						style={{ transform: `translateY(${progress * -30}px)`, willChange: "transform" }}
					>
						<h3 className="text-base font-semibold text-foreground">
							Drifts upward as you scroll
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							Same math as the real <code>&lt;Parallax&gt;</code>, scoped to this card.
						</p>
					</div>
				</div>
				<div className="space-y-3 p-6 pt-32 text-sm text-muted-foreground">
					{Array.from({ length: 8 }, (_, i) => (
						<p key={i}>Body paragraph {i + 1} — scroll to drift.</p>
					))}
				</div>
			</div>
		</div>
	);
}
