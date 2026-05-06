"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { realtimeClock, type Clock } from "../engine/clock.js";
import { waapiDriver, type Driver } from "../engine/driver.js";
import type { Transition } from "../engine/keyframes.js";
import type { ReducedMotionMode } from "../engine/reduced-motion.js";

export interface MotionContextValue {
	clock: Clock;
	driver: Driver;
	reducedMotion: ReducedMotionMode;
	defaults: Transition;
}

const DEFAULT_CTX: MotionContextValue = {
	clock: realtimeClock,
	driver: waapiDriver,
	reducedMotion: "user",
	defaults: { duration: 200, easing: "standard" },
};

const MotionContext = createContext<MotionContextValue>(DEFAULT_CTX);

export function useMotionContext(): MotionContextValue {
	return useContext(MotionContext);
}

export interface MotionConfigProps {
	clock?: Clock;
	driver?: Driver;
	reducedMotion?: ReducedMotionMode;
	defaults?: Transition;
	children?: ReactNode;
}

/**
 * Stable key for a `Transition` object. Memoized children depend on the
 * fields, not the reference, so a parent that constructs `{ duration: 200 }`
 * inline on every render doesn't bust descendant `useEffect`s. Cheap;
 * called once per MotionConfig render.
 */
function transitionKey(t: Transition | undefined): string {
	if (!t) return "";
	return `${t.duration ?? ""}|${t.delay ?? ""}|${t.easing ?? ""}|${t.iterations ?? ""}|${t.fill ?? ""}`;
}

export function MotionConfig({
	clock,
	driver,
	reducedMotion,
	defaults,
	children,
}: MotionConfigProps) {
	const parent = useContext(MotionContext);
	const parentDefaultsKey = transitionKey(parent.defaults);
	const ownDefaultsKey = transitionKey(defaults);
	// Memoize on the structural-key string of `defaults` (and the parent's)
	// rather than the object reference. Inline `defaults={{ duration: 200 }}`
	// in a parent render no longer churns the context value, which in turn
	// keeps `useTween` / `useEffect` consumers stable across renders.
	const value = useMemo<MotionContextValue>(
		() => ({
			clock: clock ?? parent.clock,
			driver: driver ?? parent.driver,
			reducedMotion: reducedMotion ?? parent.reducedMotion,
			defaults: { ...parent.defaults, ...defaults },
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			clock,
			driver,
			reducedMotion,
			ownDefaultsKey,
			parent.clock,
			parent.driver,
			parent.reducedMotion,
			parentDefaultsKey,
		],
	);
	return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
