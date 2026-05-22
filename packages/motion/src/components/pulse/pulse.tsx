"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";
import type { EasingName } from "../../engine/easing.js";
import { tokenEasing } from "../../engine/easing.js";

export interface PulseProps {
	/** Scale delta at the apex. 0.05 = pulses to 105% then back. */
	intensity?: number;
	/** Single-cycle duration in milliseconds. Defaults to 1500. */
	duration?: number;
	easing?: EasingName | string;
	className?: string;
	children?: ReactNode;
}

/**
 * Infinite scale pulse. Used for "draws attention" UI: a notification
 * dot, a hint button before first interaction, a beating call-to-action
 * heart icon. WAAPI animation runs with `iterations: Infinity` and
 * `direction: alternate` so the host returns to scale 1 every cycle.
 *
 * Honors `prefers-reduced-motion` — the animation simply isn't started
 * when reduce is active.
 */
export function Pulse({
	intensity = 0.05,
	duration = 1500,
	easing = "standard",
	className,
	children,
}: PulseProps) {
	const ctx = useMotionContext();
	const ref = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (shouldReduceMotion(ctx.reducedMotion)) return;
		const anim = el.animate(
			[
				{ transform: "scale(1)" },
				{ transform: `scale(${1 + intensity})` },
				{ transform: "scale(1)" },
			],
			{
				duration,
				easing: tokenEasing(easing),
				iterations: Infinity,
			},
		);
		return () => anim.cancel();
	}, [ctx.reducedMotion, intensity, duration, easing]);
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
