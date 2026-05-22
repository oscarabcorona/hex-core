"use client";

import { useTween } from "../../react/useTween.js";
import { useMotionValueRender } from "../../react/useMotionValue.js";
import type { Transition } from "../../engine/keyframes.js";
import type { EasingName } from "../../engine/easing.js";

export interface CountUpProps {
	/** Starting number. Defaults to 0. */
	from?: number;
	/** Target number — required. */
	to: number;
	duration?: number;
	delay?: number;
	easing?: EasingName | string;
	/** Custom formatter for the displayed number (e.g. `Intl.NumberFormat`). */
	format?: (value: number) => string;
	/** Decimal places when no `format` is supplied. Defaults to 0. */
	decimals?: number;
	className?: string;
	/** Render-as tag for the surrounding span. */
	as?: "span" | "div" | "strong" | "b";
}

const integerFormat = new Intl.NumberFormat();

/**
 * Tweens a number from `from` (default 0) to `to` over `duration`. Uses
 * the engine's `useTween` so the active `MotionConfig.clock` drives
 * progress — including `manualClock` in tests. Honors
 * `prefers-reduced-motion` (snaps to `to`).
 *
 * Pass a `format` callback for currency, percent, or compact units;
 * defaults to locale-grouped integer rendering. The component renders
 * a span by default; switch via `as` for headings/strong contexts.
 */
export function CountUp({
	from = 0,
	to,
	duration,
	delay,
	easing,
	format,
	decimals = 0,
	className,
	as: Tag = "span",
}: CountUpProps) {
	const transition: Transition = { duration, delay, easing };
	const value = useTween(from, to, transition);
	const current = useMotionValueRender(value);
	const display = format
		? format(current)
		: decimals === 0
			? integerFormat.format(Math.round(current))
			: current.toFixed(decimals);
	return <Tag className={className}>{display}</Tag>;
}
