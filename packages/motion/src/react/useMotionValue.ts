"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export interface MotionValue<T> {
	get(): T;
	set(value: T): void;
	subscribe(listener: (value: T) => void): () => void;
}

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
 */
export function useMotionValue<T>(initial: T): MotionValue<T> {
	const ref = useRef<MotionValue<T> | null>(null);
	if (!ref.current) ref.current = createMotionValue(initial);
	return ref.current;
}

export function useMotionValueRender<T>(value: MotionValue<T>): T {
	const subscribe = useCallback((cb: () => void) => value.subscribe(cb), [value]);
	const getSnapshot = useCallback(() => value.get(), [value]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
