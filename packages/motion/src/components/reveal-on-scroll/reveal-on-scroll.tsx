"use client";

import type { ReactNode } from "react";
import { Motion } from "../../react/Motion.js";
import { useInView } from "../../react/useInView.js";
import type { EasingName } from "../../engine/easing.js";
import type { AnimateProps } from "../../engine/keyframes.js";

export interface RevealOnScrollProps {
	/** Animate only on the first intersection. Defaults to true. */
	once?: boolean;
	/** Intersection threshold (0..1). Defaults to 0 (any visibility). */
	threshold?: number;
	/** Initial state before reveal. Defaults to fade + slide-up. */
	from?: AnimateProps;
	/** Reveal animation duration in milliseconds. */
	duration?: number;
	easing?: EasingName | string;
	className?: string;
	children?: ReactNode;
}

const DEFAULT_FROM: AnimateProps = { opacity: 0, y: 24 };
const REVEALED: AnimateProps = { opacity: 1, y: 0 };

/**
 * Wraps children in a Motion.div that animates from `from` to a fully
 * revealed state when the element first enters the viewport. Defaults
 * are a fade + slide-up — the most common "scroll reveal" pattern.
 *
 * Internally uses `useInView({ once })` so the IntersectionObserver
 * disconnects after the first intersection when `once` is true.
 */
export function RevealOnScroll({
	once = true,
	threshold = 0,
	from = DEFAULT_FROM,
	duration,
	easing,
	className,
	children,
}: RevealOnScrollProps) {
	const [ref, inView] = useInView<HTMLDivElement>({ once, threshold });
	return (
		<Motion.div
			ref={ref}
			initial={from}
			animate={inView ? REVEALED : from}
			transition={{ duration, easing }}
			className={className}
		>
			{children}
		</Motion.div>
	);
}
