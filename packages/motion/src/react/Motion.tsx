"use client";

import {
	createElement,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	type ComponentType,
	type CSSProperties,
	type HTMLAttributes,
	type ReactElement,
	type Ref,
} from "react";
import type { AnimateProps, Transition } from "../engine/keyframes.js";
import type { RunningAnimation } from "../engine/driver.js";
import { useMotionContext } from "./MotionConfig.js";
import { shouldReduceMotion } from "../engine/reduced-motion.js";
import { resolveVariant, type Variants } from "./variants.js";
import { parseMotionDataAttr } from "./data-attr.js";

export interface MotionExtraProps {
	initial?: AnimateProps | string | false;
	animate?: AnimateProps | string;
	exit?: AnimateProps | string;
	transition?: Transition;
	variants?: Variants;
	whileHover?: AnimateProps;
	whileTap?: AnimateProps;
	"data-hex-motion"?: string;
}

export type MotionComponentProps<T extends keyof HTMLElementTagNameMap> =
	HTMLAttributes<HTMLElementTagNameMap[T]> & MotionExtraProps;

const ANIMATE_KEYS: ReadonlyArray<keyof AnimateProps> = [
	"x",
	"y",
	"scale",
	"rotate",
	"opacity",
	"backgroundColor",
	"color",
];

/**
 * Shallow structural compare over the closed `AnimateProps` key set.
 * Used to decide whether the `animate` prop's value actually changed
 * between renders, so the effect that re-runs the animation only fires
 * on real structural changes — not on every re-render that happened to
 * reconstruct an equivalent object literal.
 */
function shallowEqualAnimate(a: AnimateProps, b: AnimateProps): boolean {
	for (const k of ANIMATE_KEYS) if (a[k] !== b[k]) return false;
	return true;
}

function resolve(
	state: AnimateProps | string | false | undefined,
	variants: Variants | undefined,
): AnimateProps | undefined {
	if (state === undefined || state === false) return undefined;
	if (typeof state === "string") return resolveVariant(variants, state);
	return state;
}

/**
 * Per-tag Motion factory. The `Motion` proxy at the bottom of the file
 * memoizes one of these per tag the first time it's accessed.
 *
 * Animation lifecycle:
 *   - Mount:   if `initial` differs from `animate`, run animate.
 *   - Update:  if `animate` value changes, run a new animation.
 *   - Hover:   on pointer enter run `whileHover`, on leave restore animate.
 *   - Press:   on pointer down run `whileTap`, on up restore animate.
 *
 * `useLayoutEffect` schedules mount animations after commit so React
 * concurrent transitions that get discarded never leak a stray
 * `el.animate()` call. Cleanups cancel the running animation.
 */
function makeMotionComponent<T extends keyof HTMLElementTagNameMap>(
	tag: T,
): ComponentType<MotionComponentProps<T>> {
	const Component = forwardRef<HTMLElementTagNameMap[T], MotionComponentProps<T>>(
		function MotionComponent(props, forwardedRef) {
			const {
				initial,
				animate,
				exit: _exit,
				transition,
				variants,
				whileHover,
				whileTap,
				style,
				onPointerEnter,
				onPointerLeave,
				onPointerDown,
				onPointerUp,
				...rest
			} = props;
			const ctx = useMotionContext();
			const elementRef = useRef<HTMLElementTagNameMap[T] | null>(null);
			useImperativeHandle(forwardedRef, () => elementRef.current as HTMLElementTagNameMap[T]);
			const currentAnim = useRef<RunningAnimation | null>(null);

			const run = (
				from: AnimateProps | undefined,
				to: AnimateProps | undefined,
				txn: Transition | undefined,
			) => {
				const el = elementRef.current;
				if (!el || !to) return;
				currentAnim.current?.cancel();
				const reduce = shouldReduceMotion(ctx.reducedMotion);
				const merged: Transition = { ...ctx.defaults, ...transition, ...txn };
				currentAnim.current = ctx.driver.animate(el, from ?? {}, to, merged, { reduce });
			};

			const initialState = resolve(initial, variants);
			const animateState = resolve(animate, variants);

			// Cache the last AnimateProps we ran against and bump a numeric
			// version when a structural diff is detected. The version is what
			// `useEffect` depends on — primitive-comparable, no per-render
			// JSON.stringify, no allocation when `animate` is referentially
			// stable (the common case after memoization upstream).
			const prevAnimateRef = useRef<AnimateProps | undefined>(undefined);
			const animateVersionRef = useRef(0);
			if (animateState !== prevAnimateRef.current) {
				if (
					!prevAnimateRef.current ||
					!animateState ||
					!shallowEqualAnimate(prevAnimateRef.current, animateState)
				) {
					animateVersionRef.current += 1;
					prevAnimateRef.current = animateState;
				}
			}
			const firstMountRef = useRef(true);

			useLayoutEffect(() => {
				const dataAttr = parseMotionDataAttr(rest["data-hex-motion"]);
				if (dataAttr) {
					run(dataAttr.from, dataAttr.to, dataAttr.transition);
					return;
				}
				if (animateState) run(initialState, animateState, undefined);
				return () => currentAnim.current?.cancel();
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, []);

			// The mount layout-effect already issued the initial → animate
			// pair. Skip the first run of this effect so we don't double-
			// fire on mount; subsequent renders that bump animateVersionRef
			// re-issue the animation against the new target.
			useEffect(() => {
				if (firstMountRef.current) {
					firstMountRef.current = false;
					return;
				}
				if (animateState) run(undefined, animateState, undefined);
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [animateVersionRef.current]);

			const initialStyle: CSSProperties | undefined = (() => {
				if (!initialState) return style;
				const merged: CSSProperties = { ...style };
				if (initialState.opacity !== undefined) merged.opacity = initialState.opacity;
				return merged;
			})();

			return createElement(tag, {
				...rest,
				ref: elementRef,
				style: initialStyle,
				onPointerEnter: (e: React.PointerEvent<HTMLElementTagNameMap[T]>) => {
					if (whileHover) run(undefined, whileHover, undefined);
					onPointerEnter?.(e);
				},
				onPointerLeave: (e: React.PointerEvent<HTMLElementTagNameMap[T]>) => {
					if (whileHover && animateState) run(undefined, animateState, undefined);
					onPointerLeave?.(e);
				},
				onPointerDown: (e: React.PointerEvent<HTMLElementTagNameMap[T]>) => {
					if (whileTap) run(undefined, whileTap, undefined);
					onPointerDown?.(e);
				},
				onPointerUp: (e: React.PointerEvent<HTMLElementTagNameMap[T]>) => {
					if (whileTap && animateState) run(undefined, animateState, undefined);
					onPointerUp?.(e);
				},
			});
		},
	) as ComponentType<MotionComponentProps<T>>;
	(Component as { displayName?: string }).displayName = `Motion.${tag}`;
	return Component;
}

type MotionProxy = {
	[K in keyof HTMLElementTagNameMap]: ComponentType<
		MotionComponentProps<K> & { ref?: Ref<HTMLElementTagNameMap[K]> }
	>;
};

/**
 * Lazy proxy: each accessed tag (`Motion.div`, `Motion.button`, ...) is
 * built and cached on first use. Avoids generating 100+ components up
 * front when most apps only animate a handful of tags.
 */
const cache = new Map<string, ComponentType<unknown>>();

export const Motion: MotionProxy = new Proxy({} as MotionProxy, {
	get(_target, key: string) {
		if (typeof key !== "string") return undefined;
		const cached = cache.get(key);
		if (cached) return cached;
		const built = makeMotionComponent(key as keyof HTMLElementTagNameMap);
		cache.set(key, built as ComponentType<unknown>);
		return built;
	},
});

/** Convenience for typed authoring: `<MotionDiv ... />`. */
export type MotionElement = ReactElement;
