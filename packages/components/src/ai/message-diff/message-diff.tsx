"use client";

import * as React from "react";
import { Message } from "../message/message.js";
import { cn } from "../../lib/utils.js";

/**
 * Speaker of a message. Mirrors the canonical `Role` union from
 * `@hex-core/components` exactly — kept inline (rather than imported
 * from `../types.js`) so the registry CLI distribution path (`npx hex
 * add message-diff`) ships a self-contained file. Same precedent as
 * `task.tsx` and `conversation.tsx`.
 *
 * KEEP IN SYNC with `packages/components/src/ai/types.ts` — if a new
 * role is added there, mirror it here (and in the other AI components
 * that inline this union).
 */
type Role = "user" | "assistant" | "system" | "tool";

/**
 * Side-by-side comparison of two assistant turns. The canonical eval
 * UX: render two candidate responses next to each other so a human (or
 * an automated grader) can pick the better one or capture a preference.
 *
 * Each side renders a header label + a `<Message>` with the response.
 * Sides scroll independently — no synchronized scroll. For inline diff
 * highlighting (changed tokens) compose `<Markdown>` content with your
 * own diff transform, since meaningful diff requires tokenization the
 * presentational primitive doesn't own.
 *
 * @example
 * <MessageDiff
 *   left={{ label: "GPT-5", role: "assistant", content: <Markdown>{a}</Markdown> }}
 *   right={{ label: "Claude Sonnet 4.6", role: "assistant", content: <Markdown>{b}</Markdown> }}
 * />
 */
export interface MessageDiffProps {
	/** Left-hand candidate. */
	left: MessageDiffSide;
	/** Right-hand candidate. */
	right: MessageDiffSide;
	/** Wraps to a single column below this Tailwind breakpoint. Default: `md`. */
	collapseBelow?: "sm" | "md" | "lg";
	className?: string;
}

/** One side of a message diff. */
export interface MessageDiffSide {
	/** Header label (e.g. "GPT-5", "Run #3", "Before"). */
	label: React.ReactNode;
	/** Speaker. Drives the `<Message>` styling. */
	role: Role;
	/** Message body — string or any node (typically `<Markdown>`). */
	content: React.ReactNode;
	/** Optional metadata shown alongside the label (e.g. timing, score). */
	meta?: React.ReactNode;
}

/**
 * Render a side-by-side message comparison.
 * @param props - left/right sides + responsive breakpoint.
 * @returns A grid that wraps to a single column at narrow widths.
 */
function MessageDiff({
	left,
	right,
	collapseBelow = "md",
	className,
}: MessageDiffProps) {
	return (
		<div
			role="group"
			aria-label="Message comparison"
			className={cn(
				"grid grid-cols-1 gap-3",
				collapseBelow === "sm" && "sm:grid-cols-2",
				collapseBelow === "md" && "md:grid-cols-2",
				collapseBelow === "lg" && "lg:grid-cols-2",
				className,
			)}
		>
			<DiffSide side={left} testId="left" />
			<DiffSide side={right} testId="right" />
		</div>
	);
}

interface DiffSideProps {
	side: MessageDiffSide;
	testId: "left" | "right";
}

function DiffSide({ side, testId }: DiffSideProps) {
	return (
		<div
			data-side={testId}
			className="flex min-w-0 flex-col overflow-hidden rounded-md border border-border"
		>
			<div className="flex items-baseline justify-between gap-2 border-b border-foreground/[0.06] bg-muted/30 px-3 py-1.5 text-xs">
				<span className="font-medium text-foreground">{side.label}</span>
				{side.meta ? (
					<span className="font-mono tabular-nums text-muted-foreground">{side.meta}</span>
				) : null}
			</div>
			<Message role={side.role} className="min-w-0">
				{side.content}
			</Message>
		</div>
	);
}

export { MessageDiff };
