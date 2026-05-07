"use client";

import {
	createElement,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
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

export type MotionComponentProps<T extends keyof HTMLElementTagNameMap> = HTMLAttributes<
	HTMLElementTagNameMap[T]
> &
	MotionExtraProps;

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
 * @param a - One animate-prop snapshot.
 * @param b - The other animate-prop snapshot.
 * @returns `true` when every closed key compares equal under `===`.
 */
function shallowEqualAnimate(a: AnimateProps, b: AnimateProps): boolean {
	for (const k of ANIMATE_KEYS) if (a[k] !== b[k]) return false;
	return true;
}

/**
 * Coerce one of the polymorphic animate-state inputs to a plain
 * `AnimateProps` object. Strings are looked up against the variants map;
 * `false`/`undefined` short-circuit to undefined (no animation).
 * @param state - The raw `initial` / `animate` / `whileX` value.
 * @param variants - Optional variants map for string-keyed states.
 * @returns Resolved props, or undefined when no animation should run.
 */
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
 * @param tag - HTML tag name (e.g. `"div"`, `"button"`) the produced
 *              component renders. The output forwards refs to the
 *              corresponding `HTMLElementTagNameMap[T]` element.
 * @returns A `forwardRef` component bound to that tag with motion props.
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
			// version (state, not ref) when a structural diff is detected.
			// State is what makes the effect below reactive — refs alone
			// wouldn't trigger a re-render, so exhaustive-deps would warn
			// (correctly: mutating a ref doesn't queue a render).
			const prevAnimateRef = useRef<AnimateProps | undefined>(undefined);
			const [animateVersion, setAnimateVersion] = useState(0);
			if (animateState !== prevAnimateRef.current) {
				const changed =
					!prevAnimateRef.current ||
					!animateState ||
					!shallowEqualAnimate(prevAnimateRef.current, animateState);
				prevAnimateRef.current = animateState;
				if (changed) setAnimateVersion((v) => v + 1);
			}
			const firstMountRef = useRef(true);

			// Live closure-values bag. Updated every render so effects below
			// can read the latest `run`/`animateState` without listing every
			// upstream dep (which would defeat their mount-only and
			// version-keyed semantics). exhaustive-deps treats refs as exempt,
			// so the empty / single-value dep arrays stay valid.
			const liveRef = useRef({
				run,
				initialState,
				animateState,
				dataAttrRaw: rest["data-hex-motion"],
			});
			liveRef.current = {
				run,
				initialState,
				animateState,
				dataAttrRaw: rest["data-hex-motion"],
			};

			useLayoutEffect(() => {
				const { run, initialState, animateState, dataAttrRaw } = liveRef.current;
				const dataAttr = parseMotionDataAttr(dataAttrRaw);
				if (dataAttr) {
					run(dataAttr.from, dataAttr.to, dataAttr.transition);
					return;
				}
				if (animateState) run(initialState, animateState, undefined);
				return () => currentAnim.current?.cancel();
			}, []);

			// The mount layout-effect already issued the initial → animate
			// pair. Skip the first run of this effect so we don't double-
			// fire on mount; subsequent renders that bump `animateVersion`
			// re-issue the animation against the new target. `animateVersion`
			// is state, so it satisfies exhaustive-deps and triggers re-renders.
			useEffect(() => {
				if (firstMountRef.current) {
					firstMountRef.current = false;
					return;
				}
				const { run, animateState } = liveRef.current;
				if (animateState) run(undefined, animateState, undefined);
			}, [animateVersion]);

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
