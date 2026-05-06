"use client";

import { createContext, useContext } from "react";
import type { AnimateProps, Transition } from "../engine/keyframes.js";
import type { Clock } from "../engine/clock.js";

export interface ClipDescriptor {
	id: string;
	target: string;
	track?: string;
	from: AnimateProps;
	to: AnimateProps;
	t0: number;
	t1: number;
	transition: Transition;
}

export interface TimelineContextValue {
	clock: Clock;
	t: number;
	duration: number;
	isPlaying: boolean;
	play(): void;
	pause(): void;
	seek(t: number): void;
	register(clip: ClipDescriptor): () => void;
}

export const TimelineContext = createContext<TimelineContextValue | null>(null);

export function useTimeline(): TimelineContextValue {
	const ctx = useContext(TimelineContext);
	if (!ctx) {
		throw new Error(
			"useTimeline() must be called inside a <Timeline> from @hex-core/motion/timeline.",
		);
	}
	return ctx;
}
