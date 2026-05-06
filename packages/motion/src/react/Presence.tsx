"use client";

import {
	Children,
	cloneElement,
	isValidElement,
	useEffect,
	useRef,
	useState,
	type ReactElement,
	type ReactNode,
	type Ref,
} from "react";
import type { AnimateProps, Transition } from "../engine/keyframes.js";
import { useMotionContext } from "./MotionConfig.js";
import { shouldReduceMotion } from "../engine/reduced-motion.js";

interface MotionLikeProps {
	exit?: AnimateProps | string;
	transition?: Transition;
	ref?: Ref<HTMLElement>;
	"data-hex-motion-presence-leaving"?: boolean;
}

interface TrackedChild {
	key: string;
	element: ReactElement<MotionLikeProps>;
	leaving: boolean;
}

/**
 * Merge refs from a forwardRef'd child with our own callback ref so
 * cloneElement doesn't drop the consumer-supplied ref. The list is
 * applied left-to-right; nulls are tolerated.
 */
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (value: T | null) => void {
	return (value) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(value);
			} else if (ref != null && typeof ref === "object" && "current" in ref) {
				(ref as { current: T | null }).current = value;
			}
		}
	};
}

/**
 * Tracks keyed children and defers unmount until the per-child `exit`
 * animation finishes. Children must carry `key` props (the standard
 * React lists rule), otherwise we can't tell adds from removals.
 *
 * Exit lifecycle:
 *   1. Child disappears from `incoming`. Presence clones the previous
 *      element with a callback ref + `data-hex-motion-presence-leaving`.
 *   2. When the cloned element mounts in the leaving state, the callback
 *      ref fires the exit animation through the active MotionConfig
 *      driver and awaits the `RunningAnimation.finished` Promise.
 *   3. After `.finished` resolves (or `reducedMotion` short-circuits),
 *      Presence drops the leaver from state and React unmounts it.
 *
 * A safety timer (2× the requested duration, min 1s) covers the case
 * where the child renders no DOM (returns null) — without it the leaver
 * would never unmount.
 */
export function Presence({ children }: { children?: ReactNode }) {
	const ctx = useMotionContext();
	const [tracked, setTracked] = useState<TrackedChild[]>([]);
	const trackedRef = useRef(tracked);
	trackedRef.current = tracked;

	useEffect(() => {
		const incoming: TrackedChild[] = [];
		Children.forEach(children, (child) => {
			if (!isValidElement(child) || child.key == null) return;
			incoming.push({
				key: String(child.key),
				element: child as ReactElement<MotionLikeProps>,
				leaving: false,
			});
		});
		const incomingKeys = new Set(incoming.map((t) => t.key));
		const reduce = shouldReduceMotion(ctx.reducedMotion);

		const cleanups: Array<() => void> = [];
		const next: TrackedChild[] = [];

		for (const prev of trackedRef.current) {
			if (incomingKeys.has(prev.key)) continue;
			if (prev.leaving) {
				next.push(prev);
				continue;
			}
			const props = prev.element.props as MotionLikeProps;
			const exit = props.exit;
			const txn = props.transition;
			const remove = () => {
				setTracked((cur) => cur.filter((c) => c.key !== prev.key));
			};
			// No exit prop OR reduced-motion → unmount on the next tick.
			// Microtask is enough; setTimeout(0) would race React's scheduler.
			if (!exit || reduce) {
				queueMicrotask(remove);
				continue;
			}
			const exitState: AnimateProps | undefined =
				typeof exit === "string" ? undefined : exit;
			if (!exitState) {
				// Variant strings would need the variants map; we don't have
				// access here. Treat string-keyed exits as "unmount cleanly"
				// for v0.1; the variants escape hatch is to pass an object.
				queueMicrotask(remove);
				continue;
			}
			const merged: Transition = { ...ctx.defaults, ...txn };
			const expectedDur = (merged.duration ?? 200) + (merged.delay ?? 0);
			let safety: ReturnType<typeof setTimeout> | undefined;
			let finished = false;
			const callbackRef = (el: HTMLElement | null) => {
				if (!el || finished) return;
				const anim = ctx.driver.animate(el, {}, exitState, merged, { reduce });
				anim.finished
					.then(() => {
						if (finished) return;
						finished = true;
						if (safety) clearTimeout(safety);
						remove();
					})
					.catch(() => {
						// `.cancel()` rejects the finished Promise. Treat as
						// "no longer leaving" — don't unmount; the consumer
						// (Presence cleanup or a re-add of the same key)
						// owns the next state transition.
					});
				cleanups.push(() => anim.cancel());
			};
			const originalRef = (prev.element as ReactElement & { ref?: Ref<HTMLElement> }).ref;
			const exitClone = cloneElement(prev.element, {
				"data-hex-motion-presence-leaving": true,
				ref: mergeRefs(originalRef, callbackRef),
			} as Partial<MotionLikeProps>);
			next.push({ ...prev, element: exitClone, leaving: true });
			// Safety: if the child renders nothing (null) or the driver never
			// resolves (e.g. WAAPI shim missing in a non-browser env), force
			// unmount after a generous timeout. 2× expected with a 1s floor
			// keeps real animations safe but never strands a leaver.
			safety = setTimeout(
				() => {
					if (finished) return;
					finished = true;
					remove();
				},
				Math.max(1000, expectedDur * 2),
			);
			cleanups.push(() => {
				if (safety) clearTimeout(safety);
			});
		}

		for (const t of incoming) {
			const existing = next.find((n) => n.key === t.key && !n.leaving);
			if (existing) existing.element = t.element;
			else next.push(t);
		}
		setTracked(next);
		return () => {
			for (const c of cleanups) c();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [children]);

	return (
		<>
			{tracked.map((t) => (
				<Item key={t.key}>{t.element}</Item>
			))}
		</>
	);
}

function Item({ children }: { children: ReactElement }) {
	return children;
}
