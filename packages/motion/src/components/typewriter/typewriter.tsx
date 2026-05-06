"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

const BLINK_KEYFRAME_ID = "hex-motion-blink-keyframe";
const BLINK_CSS = `@keyframes hex-motion-blink { from { opacity: 1; } to { opacity: 0; } }`;

/**
 * Inject the cursor-blink keyframe into the document head once per page.
 * The package doesn't ship a CSS file — instead the first <Typewriter>
 * mount appends a `<style>` tag with a stable id, and subsequent mounts
 * are no-ops. SSR-safe (guarded by `typeof document`).
 */
function ensureBlinkKeyframe(): void {
	if (typeof document === "undefined") return;
	if (document.getElementById(BLINK_KEYFRAME_ID)) return;
	const style = document.createElement("style");
	style.id = BLINK_KEYFRAME_ID;
	style.textContent = BLINK_CSS;
	document.head.appendChild(style);
}

export interface TypewriterProps {
	/** Full text to reveal. Required. */
	text: string;
	/** Milliseconds per character. Defaults to 40. */
	speed?: number;
	/** Delay before the first character appears. */
	delay?: number;
	/** Show a blinking cursor while typing. Defaults to true. */
	cursor?: boolean;
	/** Cursor character. Defaults to a thin block. */
	cursorChar?: string;
	/** Called once when typing reaches the end. */
	onDone?: () => void;
	className?: string;
	as?: "span" | "div" | "p" | "strong";
}

/**
 * Reveals text character-by-character using the active MotionConfig
 * clock. Doesn't go through the WAAPI driver (the animation is text
 * content, not a CSS property), but uses the same clock abstraction so
 * tests can advance with `manualClock`.
 *
 * Reduced-motion collapses to the full string immediately, still firing
 * `onDone` so callers waiting on completion don't stall.
 */
export function Typewriter({
	text,
	speed = 40,
	delay = 0,
	cursor = true,
	cursorChar = "▍",
	onDone,
	className,
	as: Tag = "span",
}: TypewriterProps) {
	const ctx = useMotionContext();
	const [shown, setShown] = useState("");
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		if (cursor) ensureBlinkKeyframe();
	}, [cursor]);

	useEffect(() => {
		if (shouldReduceMotion(ctx.reducedMotion) || speed <= 0) {
			setShown(text);
			onDoneRef.current?.();
			return;
		}
		setShown("");
		const start = ctx.clock.now() + delay;
		let cancelled = false;
		let lastIndex = -1;
		const tick = (now: number) => {
			if (cancelled) return;
			const elapsed = now - start;
			if (elapsed < 0) {
				ctx.clock.schedule(tick);
				return;
			}
			// `speed` is "ms per character measured from start". At elapsed=0
			// nothing is shown; the first character appears at elapsed=speed.
			const target = Math.min(text.length, Math.floor(elapsed / speed));
			if (target !== lastIndex) {
				lastIndex = target;
				setShown(text.slice(0, target));
			}
			if (target < text.length) ctx.clock.schedule(tick);
			else onDoneRef.current?.();
		};
		const cancel = ctx.clock.schedule(tick);
		return () => {
			cancelled = true;
			cancel();
		};
	}, [ctx.clock, ctx.reducedMotion, text, speed, delay]);

	const isComplete = shown.length === text.length;
	return (
		<Tag className={className}>
			{shown}
			{cursor && !isComplete ? (
				<span
					aria-hidden="true"
					style={{ display: "inline-block", animation: "hex-motion-blink 1s steps(2) infinite" }}
				>
					{cursorChar}
				</span>
			) : null}
		</Tag>
	);
}
