"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface SceneContextValue {
	t0: number;
	duration: number;
}

export const SceneContext = createContext<SceneContextValue>({ t0: 0, duration: Infinity });

/**
 * Read the active Scene context (start time + duration) from React context.
 * Defaults to `{ t0: 0, duration: Infinity }` when no `<Scene>` ancestor exists.
 * @returns The current Scene's `t0` and `duration`.
 */
export function useSceneContext(): SceneContextValue {
	return useContext(SceneContext);
}

export interface SceneProps {
	start: number;
	duration: number;
	children?: ReactNode;
}

/**
 * Defines an absolute time window inside a Timeline. Clip `start` props
 * are interpreted relative to the enclosing Scene's `start`. Scenes
 * don't render anything themselves — their job is to push a context.
 * @param props - Scene window descriptor + children.
 * @param props.start - Time in ms from the parent Scene's `t0` (or Timeline 0).
 * @param props.duration - Length of the Scene window in ms.
 * @param props.children - Clips (and optionally nested Scenes) to schedule.
 * @returns A `SceneContext.Provider` wrapping `children`.
 */
export function Scene({ start, duration, children }: SceneProps) {
	const parent = useSceneContext();
	const value = useMemo<SceneContextValue>(
		() => ({ t0: parent.t0 + start, duration }),
		[parent.t0, start, duration],
	);
	return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}
