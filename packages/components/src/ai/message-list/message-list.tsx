"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Auto-scrolling viewport for a stream of chat messages. When `autoScroll`
 * is true (default), the container pins to the bottom whenever its content
 * changes — including during streaming token updates. Detects whether the
 * user has scrolled away from the bottom and pauses auto-scroll until they
 * scroll back, so reading earlier turns doesn't fight the stream.
 *
 * @example
 * <MessageList>
 *   {messages.map((m) => <Message key={m.id} role={m.role}>{m.content}</Message>)}
 * </MessageList>
 */
export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Auto-scroll to bottom on content change (when user is already near the bottom). Default: true. */
	autoScroll?: boolean;
	children: React.ReactNode;
}

const NEAR_BOTTOM_THRESHOLD_PX = 80;

/**
 * Renders the scrolling message viewport.
 * @param props - children + autoScroll toggle
 * @returns A scrollable div that auto-pins to bottom when streaming
 */
function MessageList({
	autoScroll = true,
	className,
	children,
	...props
}: MessageListProps) {
	const ref = React.useRef<HTMLDivElement>(null);
	const stickToBottomRef = React.useRef(true);

	React.useEffect(() => {
		const el = ref.current;
		if (!el || !autoScroll) return;
		if (stickToBottomRef.current) {
			el.scrollTop = el.scrollHeight;
		}
	}, [autoScroll, children]);

	function handleScroll(event: React.UIEvent<HTMLDivElement>) {
		const el = event.currentTarget;
		const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
		stickToBottomRef.current = distance < NEAR_BOTTOM_THRESHOLD_PX;
		props.onScroll?.(event);
	}

	return (
		<div
			ref={ref}
			role="log"
			aria-live="polite"
			aria-relevant="additions"
			className={cn("flex flex-col overflow-y-auto", className)}
			{...props}
			onScroll={handleScroll}
		>
			{children}
		</div>
	);
}

export { MessageList };
