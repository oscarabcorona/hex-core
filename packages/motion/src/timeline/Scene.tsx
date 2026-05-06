"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface SceneContextValue {
	t0: number;
	duration: number;
}

export const SceneContext = createContext<SceneContextValue>({ t0: 0, duration: Infinity });

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
 */
export function Scene({ start, duration, children }: SceneProps) {
	const parent = useSceneContext();
	const value = useMemo<SceneContextValue>(
		() => ({ t0: parent.t0 + start, duration }),
		[parent.t0, start, duration],
	);
	return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}
