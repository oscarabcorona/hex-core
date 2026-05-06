"use client";

import { useCallback, useRef } from "react";
import type { AnimateProps, Transition } from "../engine/keyframes.js";
import type { RunningAnimation } from "../engine/driver.js";
import { useMotionContext } from "./MotionConfig.js";
import { shouldReduceMotion } from "../engine/reduced-motion.js";

export type AnimateFn = (
	target: Element | null,
	to: AnimateProps,
	transition?: Transition,
) => RunningAnimation;

/**
 * Imperative animate hook. Returns a `[scope, animate]` tuple — `scope`
 * is a ref you attach to a wrapper, `animate` runs an animation against
 * any element under that scope (or any element passed by reference).
 */
export function useAnimate<T extends Element = HTMLElement>(): [
	React.RefObject<T | null>,
	AnimateFn,
] {
	const scopeRef = useRef<T | null>(null);
	const ctx = useMotionContext();

	const animate = useCallback<AnimateFn>(
		(target, to, transition) => {
			const element = target ?? scopeRef.current;
			if (!element) {
				return {
					finished: Promise.resolve(),
					pause: () => {},
					play: () => {},
					cancel: () => {},
					seek: () => {},
				};
			}
			const reduce = shouldReduceMotion(ctx.reducedMotion);
			const merged: Transition = { ...ctx.defaults, ...transition };
			return ctx.driver.animate(element, {}, to, merged, { reduce });
		},
		[ctx],
	);

	return [scopeRef, animate];
}
