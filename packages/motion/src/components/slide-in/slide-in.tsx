"use client";

import type { ReactNode } from "react";
import { Motion, type MotionExtraProps } from "../../react/Motion.js";
import type { EasingName } from "../../engine/easing.js";
import type { AnimateProps } from "../../engine/keyframes.js";

export type SlideDirection = "top" | "right" | "bottom" | "left";

export interface SlideInProps {
	/** Side the element slides in from. Defaults to `bottom`. */
	direction?: SlideDirection;
	/** Travel distance in pixels. Defaults to 24. */
	distance?: number;
	/** Animation duration in milliseconds. */
	duration?: number;
	/** Delay before the animation starts, in milliseconds. */
	delay?: number;
	/** Named easing token or any CSS easing string. */
	easing?: EasingName | string;
	/** Whether to fade in alongside the slide. Defaults to true. */
	fade?: boolean;
	className?: string;
	as?: keyof HTMLElementTagNameMap;
	children?: ReactNode;
}

/**
 * Slides a child into place from a given side. Subtle fade is on by
 * default — disable with `fade={false}` for choreographed sequences
 * where another wrapper owns the opacity dimension.
 */
export function SlideIn({
	direction = "bottom",
	distance = 24,
	duration,
	delay,
	easing,
	fade = true,
	className,
	as = "div",
	children,
}: SlideInProps) {
	const Tag = Motion[as] as React.ComponentType<MotionExtraProps & { className?: string; children?: ReactNode }>;
	const initial: AnimateProps = {};
	const animate: AnimateProps = {};
	if (direction === "top") {
		initial.y = -distance;
		animate.y = 0;
	} else if (direction === "bottom") {
		initial.y = distance;
		animate.y = 0;
	} else if (direction === "left") {
		initial.x = -distance;
		animate.x = 0;
	} else if (direction === "right") {
		initial.x = distance;
		animate.x = 0;
	}
	if (fade) {
		initial.opacity = 0;
		animate.opacity = 1;
	}
	return (
		<Tag
			initial={initial}
			animate={animate}
			transition={{ duration, delay, easing }}
			className={className}
		>
			{children}
		</Tag>
	);
}
