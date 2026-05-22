"use client";

import type { ReactNode } from "react";
import { Motion, type MotionExtraProps } from "../../react/Motion.js";
import type { EasingName } from "../../engine/easing.js";

export interface ScaleInProps {
	/** Starting scale (0.95 by default — subtle pop). 1 = no scale change. */
	from?: number;
	/** Whether to fade in alongside the scale. Defaults to true. */
	fade?: boolean;
	duration?: number;
	delay?: number;
	easing?: EasingName | string;
	className?: string;
	as?: keyof HTMLElementTagNameMap;
	children?: ReactNode;
}

/**
 * Scales a child from `from` (default 0.95) up to 1, with an optional
 * opacity fade. Use for modals, toasts, primary CTAs landing on the
 * page. `easing="emphasized"` gives a more deliberate landing.
 */
export function ScaleIn({
	from = 0.95,
	fade = true,
	duration,
	delay,
	easing,
	className,
	as = "div",
	children,
}: ScaleInProps) {
	const Tag = Motion[as] as React.ComponentType<MotionExtraProps & { className?: string; children?: ReactNode }>;
	return (
		<Tag
			initial={{ scale: from, opacity: fade ? 0 : 1 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration, delay, easing }}
			className={className}
		>
			{children}
		</Tag>
	);
}
