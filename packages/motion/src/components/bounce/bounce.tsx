"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

export interface BounceProps {
	/** Overshoot amount as a scale delta. 0.1 = bounces to 110% before settling. */
	intensity?: number;
	/** Total duration in milliseconds. */
	duration?: number;
	/** Delay before the bounce kicks in. */
	delay?: number;
	className?: string;
	children?: ReactNode;
}

/**
 * Mounts a child with an overshoot bounce — scale goes 0.7 → (1 + intensity)
 * → 1, paired with an opacity fade. Best for items landing into a layout
 * (toast notifications, primary CTA on focus). Distinct from `<Pulse>`
 * (continuous) and `<ScaleIn>` (no overshoot).
 *
 * Reads `prefers-reduced-motion` at render so the initial paint already
 * matches the post-effect state when reduce is active. Without this guard
 * the host briefly renders at opacity:0 before the layout-effect adjusts
 * — visible as a flicker on slow first paint.
 */
export function Bounce({
	intensity = 0.1,
	duration = 600,
	delay = 0,
	className,
	children,
}: BounceProps) {
	const ctx = useMotionContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const reduce = shouldReduceMotion(ctx.reducedMotion);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (reduce) {
			el.style.opacity = "1";
			el.style.transform = "scale(1)";
			return;
		}
		const anim = el.animate(
			[
				{ transform: "scale(0.7)", opacity: 0, offset: 0 },
				{ transform: `scale(${1 + intensity})`, opacity: 1, offset: 0.6 },
				{ transform: "scale(1)", opacity: 1, offset: 1 },
			],
			{
				duration,
				delay,
				easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
				fill: "both",
			},
		);
		return () => anim.cancel();
	}, [reduce, intensity, duration, delay]);
	const initialStyle: CSSProperties = reduce ? { opacity: 1 } : { opacity: 0 };
	return (
		<div ref={ref} className={className} style={initialStyle}>
			{children}
		</div>
	);
}
