"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { TimelineContext, type ClipDescriptor, type TimelineContextValue } from "./context.js";
import { useMotionContext } from "../react/MotionConfig.js";
import { shouldReduceMotion } from "../engine/reduced-motion.js";
import type { RunningAnimation } from "../engine/driver.js";

export interface TimelineProps {
	duration: number;
	autoPlay?: boolean;
	loop?: boolean;
	onTick?(t: number): void;
	children?: ReactNode;
}

/**
 * Drives a deterministic seekable timeline. Children register themselves
 * via `useTimeline().register(...)`; on play/seek we (re)issue WAAPI
 * animations on each clip's target with `delay = clip.t0 - currentT`,
 * so a fresh play and a play-then-seek both render identically at any
 * given t.
 * @param props - Timeline window + child clips.
 * @param props.duration - Total length of the timeline in ms.
 * @param props.autoPlay - Start playing on mount. Defaults to `false`.
 * @param props.loop - Restart at 0 after reaching `duration`. Defaults to `false`.
 * @param props.onTick - Called with the current time on every clock tick.
 * @param props.children - `Scene`s, `Track`s, and `Clip`s scheduled in this timeline.
 * @returns A `TimelineContext.Provider` exposing play/pause/seek/register.
 */
export function Timeline({
	duration,
	autoPlay = false,
	loop = false,
	onTick,
	children,
}: TimelineProps) {
	const motion = useMotionContext();
	const [isPlaying, setPlaying] = useState(autoPlay);
	const [t, setT] = useState(0);
	const tRef = useRef(0);
	tRef.current = t;
	const clipsRef = useRef<Map<string, ClipDescriptor>>(new Map());
	const runningRef = useRef<Map<string, RunningAnimation>>(new Map());

	const reduce = shouldReduceMotion(motion.reducedMotion);

	const cancelAll = useCallback(() => {
		for (const anim of runningRef.current.values()) anim.cancel();
		runningRef.current.clear();
	}, []);

	const issueClips = useCallback(
		(currentT: number, playing: boolean) => {
			cancelAll();
			for (const clip of clipsRef.current.values()) {
				const el = document.querySelector(clip.target);
				if (!el) continue;
				const localOffset = currentT - clip.t0;
				if (currentT >= clip.t1) {
					motion.driver.animate(el, clip.to, clip.to, { duration: 0 }, { reduce });
					continue;
				}
				const delay = -Math.max(0, localOffset);
				const anim = motion.driver.animate(
					el,
					clip.from,
					clip.to,
					{
						duration: clip.transition.duration,
						delay,
						easing: clip.transition.easing,
						fill: "both",
					},
					{ reduce },
				);
				if (!playing) anim.pause();
				runningRef.current.set(clip.id, anim);
			}
		},
		[cancelAll, motion.driver, reduce],
	);

	// Live ref over closure values the effects below read. The play loop
	// re-fires on play/pause/duration/loop changes only — driver / clock /
	// onTick swaps mid-flight read through this ref so the loop's `tick`
	// closure stays valid without forcing re-fires that would break rAF
	// scheduling. The mount effect reads issueClips/isPlaying via the
	// same ref so its deps array stays empty.
	const liveRef = useRef({ issueClips, motionClock: motion.clock, onTick, isPlaying });
	liveRef.current = { issueClips, motionClock: motion.clock, onTick, isPlaying };

	useEffect(() => {
		if (!isPlaying) {
			for (const anim of runningRef.current.values()) anim.pause();
			return;
		}
		for (const anim of runningRef.current.values()) anim.play();
		let cancelled = false;
		const motionClock = liveRef.current.motionClock;
		const start = motionClock.now();
		const startT = tRef.current;
		const tick = (now: number) => {
			if (cancelled) return;
			const elapsed = now - start;
			let next = startT + elapsed;
			if (next >= duration) {
				if (loop) {
					next = next % duration;
					liveRef.current.issueClips(next, true);
				} else {
					next = duration;
					setPlaying(false);
				}
			}
			setT(next);
			liveRef.current.onTick?.(next);
			motionClock.schedule(tick);
		};
		const cancel = motionClock.schedule(tick);
		return () => {
			cancelled = true;
			cancel();
		};
	}, [isPlaying, duration, loop]);

	useEffect(() => {
		const { issueClips, isPlaying } = liveRef.current;
		issueClips(tRef.current, isPlaying);
	}, []);

	const value = useMemo<TimelineContextValue>(
		() => ({
			clock: motion.clock,
			t,
			duration,
			isPlaying,
			play: () => setPlaying(true),
			pause: () => setPlaying(false),
			seek: (next: number) => {
				const clamped = Math.max(0, Math.min(duration, next));
				setT(clamped);
				tRef.current = clamped;
				issueClips(clamped, isPlaying);
			},
			register(clip) {
				clipsRef.current.set(clip.id, clip);
				return () => {
					clipsRef.current.delete(clip.id);
					const running = runningRef.current.get(clip.id);
					running?.cancel();
					runningRef.current.delete(clip.id);
				};
			},
		}),
		[motion.clock, t, duration, isPlaying, issueClips],
	);

	return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}
