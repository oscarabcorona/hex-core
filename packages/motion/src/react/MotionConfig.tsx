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
