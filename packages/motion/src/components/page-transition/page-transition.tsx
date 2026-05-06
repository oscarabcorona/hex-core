"use client";

import type { ReactNode } from "react";
import { Motion } from "../../react/Motion.js";
import { Presence } from "../../react/Presence.js";
import type { AnimateProps, Transition } from "../../engine/keyframes.js";
import type { EasingName } from "../../engine/easing.js";

export interface PageTransitionProps {
	/** Stable key for the current page — typically a pathname or route id. */
	pageKey: string;
	/** Initial state for entering pages. Defaults to fade + slight slide-up. */
	initial?: AnimateProps;
	/** Animate target. Defaults to fully visible at rest. */
	animate?: AnimateProps;
	/** Exit state for leaving pages. Defaults to fade + slide-down. */
	exit?: AnimateProps;
	duration?: number;
	easing?: EasingName | string;
	className?: string;
	children?: ReactNode;
}

const DEFAULT_INITIAL: AnimateProps = { opacity: 0, y: 8 };
const DEFAULT_ANIMATE: AnimateProps = { opacity: 1, y: 0 };
const DEFAULT_EXIT: AnimateProps = { opacity: 0, y: -8 };

/**
 * Wraps the current page tree in a keyed Motion.div inside Presence —
 * adds enter/exit transitions for client-side route changes. Uses a
 * caller-supplied `pageKey` (typically the pathname) so React can tell
 * old vs new routes apart.
 *
 * Designed for any router that re-renders the page tree on navigation
 * (Next.js App Router, React Router, TanStack Router). The Presence
 * wrapper ensures the leaving page's exit animation fully runs before
 * the new one mounts.
 *
 * The wrapper is unconditional — every render wraps `children` in a
 * keyed `<Motion.div>`. We deliberately don't try to detect a pre-wrapped
 * Motion child via `cloneElement`: the `displayName.startsWith("Motion.")`
 * heuristic was both fragile (false positives on consumer components
 * happening to be named `Motion-foo`) and incomplete (false negatives on
 * catalog wrappers like `<FadeIn>` whose displayName is `FadeIn`).
 * Consumers who want to skip the wrapper can write
 * `<Presence>{<Motion.div key={pageKey} initial={...} animate={...} exit={...} />}</Presence>`
 * directly.
 */
export function PageTransition({
	pageKey,
	initial = DEFAULT_INITIAL,
	animate = DEFAULT_ANIMATE,
	exit = DEFAULT_EXIT,
	duration = 200,
	easing = "standard",
	className,
	children,
}: PageTransitionProps) {
	const transition: Transition = { duration, easing };
	return (
		<Presence>
			<Motion.div
				key={pageKey}
				initial={initial}
				animate={animate}
				exit={exit}
				transition={transition}
				className={className}
			>
				{children}
			</Motion.div>
		</Presence>
	);
}
