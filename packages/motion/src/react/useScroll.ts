"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "./useMotionValue.js";

export interface UseScrollResult {
	scrollY: MotionValue<number>;
	scrollYProgress: MotionValue<number>;
}

/**
 * Window-scoped scroll motion values. Returns subscribable values so
 * downstream components can either drive imperative animations off them
 * (no re-render storm) or `useMotionValueRender` to read the current
 * value during render.
 * @returns `{ scrollY, scrollYProgress }` motion values tracking the
 *          window's vertical scroll. Both update on scroll + resize.
 */
export function useScroll(): UseScrollResult {
	const scrollY = useMotionValue(0);
	const scrollYProgress = useMotionValue(0);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const update = () => {
			const y = window.scrollY;
			const max = Math.max(
				1,
				document.documentElement.scrollHeight - window.innerHeight,
			);
			scrollY.set(y);
			scrollYProgress.set(Math.min(1, Math.max(0, y / max)));
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, [scrollY, scrollYProgress]);

	return { scrollY, scrollYProgress };
}
