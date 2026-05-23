"use client";

import { useEffect, useRef } from "react";
import { useMotionContext } from "./MotionConfig.js";
import { useMotionValue, type MotionValue } from "./useMotionValue.js";
import type { Transition } from "../engine/keyframes.js";
import { tokenEasing } from "../engine/easing.js";
import { shouldReduceMotion } from "../engine/reduced-motion.js";

/**
 * Parse a CSS cubic-bezier string into its four control points so we
 * can interpolate manually. Returns `null` for `linear` (handled by the
 * identity path). Anything else (`ease-in-out` keyword, named CSS easing)
 * also returns `null` — consumers fall back to linear interpolation,
 * which is good enough for numeric tween display contexts (count-up).
 */
function parseCubicBezier(easing: string): [number, number, number, number] | null {
	if (easing === "linear") return null;
	const match = easing.match(
		/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
	);
	if (!match) return null;
	return [
		Number.parseFloat(match[1]),
		Number.parseFloat(match[2]),
		Number.parseFloat(match[3]),
		Number.parseFloat(match[4]),
	];
}

/**
 * Evaluate a cubic-bezier easing at progress `t` ∈ [0, 1]. Newton's method
 * inverts the parametric x(t) curve to find the t for the requested x,
 * then returns y(t). Six iterations are enough for visual fidelity.
 */
function bezierEasing([x1, y1, x2, y2]: [number, number, number, number], t: number): number {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
	const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
	const sampleDX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
	let s = t;
	for (let i = 0; i < 6; i++) {
		const x = sampleX(s) - t;
		const dx = sampleDX(s);
		if (Math.abs(dx) < 1e-6) break;
		s -= x / dx;
	}
	return sampleY(Math.max(0, Math.min(1, s)));
}

/**
 * Numeric interpolator driven by the active `MotionConfig` clock. Returns
 * a `MotionValue<number>` that starts at `from`, eases toward `to` over
 * `transition.duration` (ms), and stays pinned at `to` once finished.
 *
 * Honors `prefers-reduced-motion` (snaps directly to `to`) and respects
 * the configured easing token. Subscribers re-render only when the value
 * meaningfully changes — `useMotionValueRender(value)` is the React-side
 * read.
 *
 * Used by `<CountUp>`; orthogonal to the WAAPI driver because count-ups
 * are rendered as text, not as a CSS-animated property.
 */
export function useTween(
	from: number,
	to: number,
	transition?: Transition,
): MotionValue<number> {
	const ctx = useMotionContext();
	const value = useMotionValue(from);
	// Pin the latest from/to/transition in refs so re-running the effect
	// only triggers on meaningful changes (the deps array drives that),
	// not on every render that re-creates an equivalent transition object.
	const fromRef = useRef(from);
	const toRef = useRef(to);
	const txnRef = useRef(transition);
	fromRef.current = from;
	toRef.current = to;
	txnRef.current = transition;

	// Depend on primitive transition fields rather than the merged object so
	// a parent re-rendering with an inline `transition` literal doesn't bust
	// the effect every render. The merge happens fresh inside the effect.
	const defaultsDuration = ctx.defaults.duration;
	const defaultsDelay = ctx.defaults.delay;
	const defaultsEasing = ctx.defaults.easing;
	const txnDuration = transition?.duration;
	const txnDelay = transition?.delay;
	const txnEasing = transition?.easing;

	useEffect(() => {
		const reduce = shouldReduceMotion(ctx.reducedMotion);
		const merged: Transition = { ...ctx.defaults, ...txnRef.current };
		const duration = merged.duration ?? 200;
		const delay = merged.delay ?? 0;
		const easing = tokenEasing(merged.easing);
		const bezier = parseCubicBezier(easing);
		if (reduce || duration <= 0) {
			value.set(toRef.current);
			return;
		}
		const start = ctx.clock.now() + delay;
		const fromV = fromRef.current;
		const toV = toRef.current;
		let cancelled = false;
		const tick = (now: number) => {
			if (cancelled) return;
			const elapsed = now - start;
			if (elapsed < 0) {
				ctx.clock.schedule(tick);
				return;
			}
			const t = Math.min(1, elapsed / duration);
			const eased = bezier ? bezierEasing(bezier, t) : t;
			value.set(fromV + (toV - fromV) * eased);
			if (t < 1) ctx.clock.schedule(tick);
		};
		const cancel = ctx.clock.schedule(tick);
		return () => {
			cancelled = true;
			cancel();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		ctx.clock,
		ctx.reducedMotion,
		defaultsDuration,
		defaultsDelay,
		defaultsEasing,
		txnDuration,
		txnDelay,
		txnEasing,
		from,
		to,
		value,
	]);

	return value;
}
