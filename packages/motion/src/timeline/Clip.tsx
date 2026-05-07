"use client";

import { useEffect, useId, useRef } from "react";
import { useTimeline } from "./context.js";
import { useSceneContext } from "./Scene.js";
import { useTrackName } from "./Track.js";
import type { AnimateProps } from "../engine/keyframes.js";
import type { EasingName } from "../engine/easing.js";

export interface ClipProps {
	target: string;
	from?: AnimateProps;
	to: AnimateProps;
	start?: number;
	duration?: number;
	track?: string;
	easing?: EasingName | string;
}

/**
 * A single segment of an animation against a CSS-selector-addressed
 * target. Registers with the enclosing Timeline so play/seek/pause go
 * through one clock. Track resolution: an explicit `track` prop wins,
 * otherwise the closest `<Track name>` context is inherited so labelling
 * stays automatic for grouped clips. Returns null — Clips are pure
 * metadata, the Timeline owns the rendering.
 *
 * React 19 strict-mode double-mounts the effect; the cleanup deregisters
 * the first mount before the second registers, so the descriptor map
 * holds at most one entry per `useId` at any time. Verified by the
 * timeline determinism snapshot test.
 * @param props - Clip target + (from/to) state + scheduling overrides.
 * @returns Always `null` — Clip is pure metadata; the Timeline renders.
 */
export function Clip(props: ClipProps) {
	const tl = useTimeline();
	const scene = useSceneContext();
	const trackFromContext = useTrackName();
	const id = useId();
	const propsRef = useRef(props);
	propsRef.current = props;
	const contextTrackRef = useRef(trackFromContext);
	contextTrackRef.current = trackFromContext;

	useEffect(() => {
		const cur = propsRef.current;
		const t0 = scene.t0 + (cur.start ?? 0);
		const explicitDuration = cur.duration;
		const sceneDuration = scene.duration === Infinity ? tl.duration : scene.duration;
		const duration = explicitDuration ?? sceneDuration;
		const t1 = t0 + duration;
		return tl.register({
			id,
			target: cur.target,
			// Explicit prop wins; fall back to <Track name> context.
			track: cur.track ?? contextTrackRef.current,
			from: cur.from ?? {},
			to: cur.to,
			t0,
			t1,
			transition: {
				duration,
				easing: cur.easing,
			},
		});
	}, [
		id,
		scene.t0,
		scene.duration,
		tl.duration,
		props.target,
		props.start,
		props.duration,
		props.track,
		trackFromContext,
		props.easing,
		JSON.stringify(props.from),
		JSON.stringify(props.to),
	]);

	return null;
}
