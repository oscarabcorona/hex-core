"use client";

import {
	Children,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

export interface StaggerProps {
	/** Per-child delay step in milliseconds. Defaults to 60. */
	gap?: number;
	/** Initial delay for the first child. Defaults to 0. */
	initialDelay?: number;
	/** Reverse the cascade direction (last child first). */
	reverse?: boolean;
	className?: string;
	children?: ReactNode;
}

interface DelayableChildProps {
	delay?: number;
}

/**
 * Cascades the delays of motion-aware children. Each direct child receives
 * a `delay = initialDelay + index * gap` prop. Children's pre-existing
 * `delay` props are summed (consumer's intent wins on top of the cascade).
 *
 * Stagger injects via the **`delay` prop** rather than `transition.delay`
 * because every Phase 2 entry wrapper (FadeIn, SlideIn, ScaleIn, BlurIn,
 * Bounce, …) constructs its own `transition` from its individual props —
 * a cloned `transition` would be discarded. Wrappers that don't accept
 * a `delay` prop pass through unchanged (no warning — graceful).
 */
export function Stagger({
	gap = 60,
	initialDelay = 0,
	reverse = false,
	className,
	children,
}: StaggerProps) {
	const arr = Children.toArray(children);
	const total = arr.length;
	const cloned = arr.map((child, i) => {
		if (!isValidElement(child)) return child;
		const idx = reverse ? total - 1 - i : i;
		const offset = initialDelay + idx * gap;
		const props = child.props as DelayableChildProps;
		const baseDelay = props.delay ?? 0;
		return cloneElement(child as ReactElement<DelayableChildProps>, {
			delay: baseDelay + offset,
		});
	});
	return <div className={className}>{cloned}</div>;
}
