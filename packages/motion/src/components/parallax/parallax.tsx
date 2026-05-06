"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScroll } from "../../react/useScroll.js";
import { useMotionContext } from "../../react/MotionConfig.js";
import { shouldReduceMotion } from "../../engine/reduced-motion.js";

export interface ParallaxProps {
	/** Maximum displacement in pixels at full scroll. Negative reverses direction. */
	offset?: number;
	/** Translation axis. Defaults to vertical. */
	axis?: "x" | "y";
	className?: string;
	children?: ReactNode;
}

/**
 * Translates its child with the page scroll position. Subscribes to
 * `useScroll().scrollYProgress` so the displacement scales between 0
 * and `offset` across the full document height. Lighter than a true
 * relative-to-viewport parallax (no IntersectionObserver) but covers
 * the headline-on-hero use case.
 *
 * For per-element parallax (track each card independently), wrap each
 * card in its own Parallax with smaller `offset` values.
 *
 * Honors `prefers-reduced-motion`: when reduce is active the displacement
 * pins to 0, so vestibular-sensitive users don't get scroll-tied content
 * drift. Override per-tree with `<MotionConfig reducedMotion="never">`
 * (only for screenshot tests).
 */
export function Parallax({ offset = 50, axis = "y", className, children }: ParallaxProps) {
	const ctx = useMotionContext();
	const reduce = shouldReduceMotion(ctx.reducedMotion);
	const { scrollYProgress } = useScroll();
	const [translate, setTranslate] = useState(0);
	const rafRef = useRef<number | null>(null);
	useEffect(() => {
		if (reduce) {
			setTranslate(0);
			return;
		}
		const update = (progress: number) => {
			if (rafRef.current !== null) return;
			rafRef.current = requestAnimationFrame(() => {
				rafRef.current = null;
				setTranslate(progress * offset);
			});
		};
		const unsubscribe = scrollYProgress.subscribe(update);
		update(scrollYProgress.get());
		return () => {
			unsubscribe();
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [scrollYProgress, offset, reduce]);
	const transform = axis === "x" ? `translateX(${translate}px)` : `translateY(${translate}px)`;
	return (
		<div className={className} style={{ transform, willChange: "transform" }}>
			{children}
		</div>
	);
}
