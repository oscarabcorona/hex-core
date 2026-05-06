"use client";

import { createContext, useContext, type ReactNode } from "react";

const TrackContext = createContext<string | undefined>(undefined);

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
 */
export function Track({ name, children }: TrackProps) {
	return <TrackContext.Provider value={name}>{children}</TrackContext.Provider>;
}
