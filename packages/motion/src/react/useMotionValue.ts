"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export interface MotionValue<T> {
	get(): T;
	set(value: T): void;
	subscribe(listener: (value: T) => void): () => void;
}

/**
 * Build a `MotionValue<T>` backed by a closure variable + listener set.
 * Notification is `Object.is`-gated so identical writes are no-ops.
 * @param initial - Starting scalar value.
 * @returns A `MotionValue<T>` exposing `get`/`set`/`subscribe`.
 */
function createMotionValue<T>(initial: T): MotionValue<T> {
	let current = initial;
	const listeners = new Set<(value: T) => void>();
	return {
		get: () => current,
		set(value) {
			if (Object.is(value, current)) return;
			current = value;
			for (const l of [...listeners]) l(current);
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

/**
 * Subscribable scalar. Components consume the current value via
 * `useSyncExternalStore` so React's concurrent renderer stays in sync.
 * Mutations don't trigger re-renders unless something subscribes —
 * that's intentional, lets imperative animation loops keep writing
 * without blowing up the render budget.
 * @param initial - Starting value, captured on first render only.
 * @returns A stable `MotionValue<T>` for the component's lifetime.
 */
export function useMotionValue<T>(initial: T): MotionValue<T> {
	const ref = useRef<MotionValue<T> | null>(null);
	if (!ref.current) ref.current = createMotionValue(initial);
	return ref.current;
}

/**
 * Re-render-on-change subscription to a `MotionValue`. Wraps
 * `useSyncExternalStore` so updates to `value` trigger a render of the
 * calling component without manual subscribe/unsubscribe boilerplate.
 * @param value - The motion value to read reactively.
 * @returns The current value; the component re-renders on every change.
 */
export function useMotionValueRender<T>(value: MotionValue<T>): T {
	const subscribe = useCallback((cb: () => void) => value.subscribe(cb), [value]);
	const getSnapshot = useCallback(() => value.get(), [value]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
