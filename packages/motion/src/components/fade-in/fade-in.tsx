"use client";

import type { ReactNode } from "react";
import { Motion, type MotionExtraProps } from "../../react/Motion.js";
import type { EasingName } from "../../engine/easing.js";

export interface FadeInProps {
	/** Animation duration in milliseconds. Defaults to MotionConfig.defaults. */
	duration?: number;
	/** Delay before the animation starts, in milliseconds. */
	delay?: number;
	/** Named easing token or any CSS easing string. */
	easing?: EasingName | string;
	/** Element class name. */
	className?: string;
	/** Optional override of the host tag. Defaults to `div`. */
	as?: keyof HTMLElementTagNameMap;
	children?: ReactNode;
}

/**
 * Mounts its child with an opacity 0 → 1 fade. The wrapper is a thin
 * `<Motion.*>` invocation under the hood — same WAAPI driver, same
 * `prefers-reduced-motion` honoring as the rest of `@hex-core/motion`.
 *
 * Compose with `<Stagger>` to cascade across siblings, or with
 * `<RevealOnScroll>` for visibility-triggered fades. Reach for a raw
 * `<Motion.div initial animate>` when you need finer control.
 */
export function FadeIn({
	duration,
	delay,
	easing,
	className,
	as = "div",
	children,
}: FadeInProps) {
	const Tag = Motion[as] as React.ComponentType<MotionExtraProps & { className?: string; children?: ReactNode }>;
	return (
		<Tag
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration, delay, easing }}
			className={className}
		>
			{children}
		</Tag>
	);
}
