"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Single-line streaming placeholder. Used during the dead-time between
 * a user submitting a prompt and the first stream token arriving — a
 * gradient sweep across a flat bar that signals "the model is thinking
 * but hasn't started speaking yet."
 *
 * Wider than `<Loading>` (which is a multi-row skeleton) and narrower
 * than `<Skeleton>` (which is a sized placeholder block); use Shimmer
 * for the conversation pane, Loading for whole-screen states, Skeleton
 * for arbitrary placeholder shapes.
 *
 * @example
 * {isStreaming && <Shimmer width="80%" />}
 */
export interface ShimmerProps {
	/** CSS width — accepts any width value (e.g. `"60%"`, `"24rem"`). Defaults to full width. */
	width?: string;
	/** Override the default 1.5rem height for taller streaming bars. */
	height?: string;
	/** Sweep duration in ms. Defaults to 1500. */
	durationMs?: number;
	/** Accessible label announced to screen readers. */
	label?: string;
	className?: string;
}

/**
 * Render a streaming placeholder bar.
 *
 * Uses Tailwind's `animate-pulse` for the loading effect — same
 * approach as `<Skeleton>` so consumers don't need extra global CSS or
 * keyframes. The `durationMs` prop scales the pulse cycle via a CSS
 * variable so the animation stays in pulse's vertical-opacity family
 * rather than introducing a custom sweep keyframe (which would
 * conflict with React 19's stricter style-tag handling).
 *
 * @param props - Optional sizing + duration + label overrides.
 * @returns A pulsing placeholder bar.
 */
function Shimmer({
	width = "100%",
	height = "1.5rem",
	durationMs = 1500,
	label = "Loading…",
	className,
}: ShimmerProps) {
	return (
		<div
			role="status"
			aria-label={label}
			aria-live="polite"
			className={cn(
				// `motion-safe:` gates the pulse on `prefers-reduced-motion: no-preference` —
				// users with reduce-motion get a static bar.
				"motion-safe:animate-pulse rounded-md border border-foreground/[0.06] bg-muted",
				className,
			)}
			style={{
				width,
				height,
				animationDuration: `${durationMs}ms`,
			}}
		/>
	);
}

export { Shimmer };
