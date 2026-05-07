"use client";

import { createContext, useContext, type ReactNode } from "react";

const TrackContext = createContext<string | undefined>(undefined);

/**
 * Read the active Track name from React context.
 * @returns The closest `<Track name>`, or `undefined` if none.
 */
export function useTrackName(): string | undefined {
	return useContext(TrackContext);
}

export interface TrackProps {
	name: string;
	children?: ReactNode;
}

/**
 * Optional grouping for parallel clips on a named track (e.g.
 * `<Track name="opacity">`). Clips don't rely on tracks for ordering
 * — they're a labelling/inspection convenience for tooling and
 * readability.
 * @param props - Track name + children.
 * @param props.name - Track label propagated to descendant Clips.
 * @param props.children - Clips (and optionally nested Scenes/Tracks).
 * @returns A `TrackContext.Provider` wrapping the children.
 */
export function Track({ name, children }: TrackProps) {
	return <TrackContext.Provider value={name}>{children}</TrackContext.Provider>;
}
