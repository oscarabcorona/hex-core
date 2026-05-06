"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

export interface ShimmerProps {
	/** Width of the highlight band as a percentage of the element. */
	width?: number;
	/** Single sweep duration in milliseconds. */
	duration?: number;
	/**
	 * Highlight color. Defaults to a translucent CSS `color-mix` against the
	 * current foreground so the sweep is visible on both light- and dark-
	 * themed backgrounds without consumer config. Pass a fixed color for
	 * brand-tinted shimmers.
	 */
	color?: string;
	className?: string;
	children?: ReactNode;
}

const DEFAULT_HIGHLIGHT = "color-mix(in srgb, currentColor 18%, transparent)";

/**
 * Skeleton loader sweep — a translucent gradient band travels left to
 * right across the host. Layers over `bg-muted` to give "still loading"
 * affordance without animating layout-affecting properties.
 *
 * Default highlight uses `color-mix(... currentColor)` so it adapts to
 * whichever theme is active without consumer config. CSS `color-mix`
 * is widely supported in evergreen browsers; consumers targeting older
 * browsers should pass an explicit `color`.
 */
export function Shimmer({
	width = 30,
	duration = 1800,
	color = DEFAULT_HIGHLIGHT,
	className,
	children,
}: ShimmerProps) {
	const ctx = useMotionContext();
	const ref = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (shouldReduceMotion(ctx.reducedMotion)) return;
		const anim = el.animate(
			[
				{ backgroundPosition: "-100% 0" },
				{ backgroundPosition: "200% 0" },
			],
			{
				duration,
				easing: "linear",
				iterations: Infinity,
			},
		);
		return () => anim.cancel();
	}, [ctx.reducedMotion, duration]);
	return (
		<div
			ref={ref}
			className={className}
			style={{
				backgroundImage: `linear-gradient(90deg, transparent, ${color}, transparent)`,
				backgroundSize: `${width}% 100%`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "-100% 0",
			}}
		>
			{children}
		</div>
	);
}
