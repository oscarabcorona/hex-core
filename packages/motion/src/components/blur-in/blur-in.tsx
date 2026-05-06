"use client";

import type { ReactNode } from "react";
import { Motion, type MotionExtraProps } from "../../react/Motion.js";
import type { EasingName } from "../../engine/easing.js";

export interface BlurInProps {
	/** Initial blur radius in pixels. Defaults to 8. */
	from?: number;
	/** Whether to fade in alongside the blur. Defaults to true. */
	fade?: boolean;
	duration?: number;
	delay?: number;
	easing?: EasingName | string;
	className?: string;
	as?: keyof HTMLElementTagNameMap;
	children?: ReactNode;
}

/**
 * Mounts a child with a CSS `filter: blur()` that decays to 0. Pairs
 * with `fade` for a layered focus-in effect. Filter is the only
 * non-compositor-friendly prop the engine animates by design — keep
 * blur radii small (≤16px) to stay GPU-accelerated.
 */
export function BlurIn({
	from = 8,
	fade = true,
	duration,
	delay,
	easing,
	className,
	as = "div",
	children,
}: BlurInProps) {
	const Tag = Motion[as] as React.ComponentType<MotionExtraProps & { className?: string; children?: ReactNode }>;
	return (
		<Tag
			initial={{ filter: `blur(${from}px)`, opacity: fade ? 0 : 1 }}
			animate={{ filter: "blur(0px)", opacity: 1 }}
			transition={{ duration, delay, easing }}
			className={className}
		>
			{children}
		</Tag>
	);
}
