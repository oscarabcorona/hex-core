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

/**
 * Read the active motion configuration from React context.
 * Falls back to the default (realtime clock + WAAPI driver + 200ms standard
 * easing) when no `<MotionConfig>` ancestor is present.
 * @returns The currently-active `MotionContextValue`.
 */
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
 * Provider that overrides `MotionContext` for its subtree. Any field left
 * undefined inherits from the nearest ancestor `MotionConfig` (or the
 * package default at the root).
 * @param props - Per-field overrides plus children.
 * @param props.clock - Time source for animations + timeline scheduling.
 * @param props.driver - Animation backend (WAAPI by default; cssVarDriver mirrors).
 * @param props.reducedMotion - Reduced-motion policy: user/always/never.
 * @param props.defaults - Default transition merged into every animation.
 * @param props.children - React subtree that will read this config.
 * @returns A `MotionContext.Provider` wrapping the children.
 */
export function MotionConfig({
	clock,
	driver,
	reducedMotion,
	defaults,
	children,
}: MotionConfigProps) {
	const parent = useContext(MotionContext);
	const value = useMemo<MotionContextValue>(
		() => ({
			clock: clock ?? parent.clock,
			driver: driver ?? parent.driver,
			reducedMotion: reducedMotion ?? parent.reducedMotion,
			defaults: { ...parent.defaults, ...defaults },
		}),
		[clock, driver, reducedMotion, defaults, parent],
	);
	return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
