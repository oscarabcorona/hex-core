"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

export interface MarqueeProps {
	/** Travel direction. Defaults to "left" (RTL scroll). */
	direction?: "left" | "right" | "up" | "down";
	/** Duration of one full cycle in milliseconds. Lower = faster. */
	speed?: number;
	/** Pause when the user hovers the marquee. Defaults to true. */
	pauseOnHover?: boolean;
	/** Gap between the duplicated track halves, in pixels. */
	gap?: number;
	className?: string;
	children?: ReactNode;
}

/**
 * Infinite marquee. Duplicates children once and translates the inner
 * track so the seam between the two copies stays invisible. WAAPI
 * animation runs with `iterations: Infinity`. Pauses when hovered (via
 * `Animation.pause()` / `play()`) so users can read the content.
 *
 * Reduced-motion mode renders both copies static (no animation
 * scheduled) — the content is still readable, just not scrolling.
 */
export function Marquee({
	direction = "left",
	speed = 20000,
	pauseOnHover = true,
	gap = 0,
	className,
	children,
}: MarqueeProps) {
	const ctx = useMotionContext();
	const trackRef = useRef<HTMLDivElement | null>(null);
	// Hold the running animation in a ref, not state — pause/play handlers
	// only need the imperative reference, not a re-render trigger. State
	// would have churned a render on every mount/cancel cycle.
	const animationRef = useRef<Animation | null>(null);
	const isHorizontal = direction === "left" || direction === "right";
	useEffect(() => {
		const el = trackRef.current;
		if (!el) return;
		if (shouldReduceMotion(ctx.reducedMotion)) return;
		const axis = isHorizontal ? "X" : "Y";
		const startsAtNegative = direction === "left" || direction === "up";
		const from = `translate${axis}(0)`;
		const to = `translate${axis}(${startsAtNegative ? "-50%" : "50%"})`;
		const anim = el.animate([{ transform: from }, { transform: to }], {
			duration: speed,
			easing: "linear",
			iterations: Infinity,
		});
		animationRef.current = anim;
		return () => {
			animationRef.current = null;
			anim.cancel();
		};
	}, [ctx.reducedMotion, direction, speed, isHorizontal]);
	return (
		<div
			className={className}
			style={{ overflow: "hidden" }}
			onMouseEnter={pauseOnHover ? () => animationRef.current?.pause() : undefined}
			onMouseLeave={pauseOnHover ? () => animationRef.current?.play() : undefined}
		>
			<div
				ref={trackRef}
				style={{
					display: "flex",
					flexDirection: isHorizontal ? "row" : "column",
					gap,
					width: isHorizontal ? "max-content" : undefined,
					height: !isHorizontal ? "max-content" : undefined,
				}}
			>
				<div style={{ display: "flex", flexDirection: isHorizontal ? "row" : "column", gap }}>
					{children}
				</div>
				<div
					style={{ display: "flex", flexDirection: isHorizontal ? "row" : "column", gap }}
					aria-hidden="true"
				>
					{children}
				</div>
			</div>
		</div>
	);
}
