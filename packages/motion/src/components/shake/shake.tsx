"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

export interface ShakeProps {
	/** Any value change re-fires the shake (e.g. a counter that bumps on error). */
	trigger?: unknown;
	/** Translation amplitude in pixels. */
	intensity?: number;
	/** Total shake duration in milliseconds. */
	duration?: number;
	className?: string;
	children?: ReactNode;
}

/**
 * Shake-on-trigger primitive — typical use is form-error feedback. Pass
 * a `trigger` value that bumps when you want the shake to fire (an
 * error count, a timestamp, a boolean toggle). The wrapper runs a
 * 5-keyframe horizontal jitter and settles back to 0.
 *
 * Reduced-motion mode no-ops — the trigger is silently ignored so
 * keyboard users with motion sensitivities don't get jolted.
 */
export function Shake({
	trigger,
	intensity = 6,
	duration = 400,
	className,
	children,
}: ShakeProps) {
	const ctx = useMotionContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const firstRender = useRef(true);
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		const el = ref.current;
		if (!el) return;
		if (shouldReduceMotion(ctx.reducedMotion)) return;
		const a = intensity;
		const anim = el.animate(
			[
				{ transform: "translateX(0)" },
				{ transform: `translateX(${-a}px)` },
				{ transform: `translateX(${a}px)` },
				{ transform: `translateX(${-a / 2}px)` },
				{ transform: `translateX(${a / 2}px)` },
				{ transform: "translateX(0)" },
			],
			{ duration, easing: "linear", fill: "none" },
		);
		return () => anim.cancel();
	}, [trigger, ctx.reducedMotion, intensity, duration]);
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
