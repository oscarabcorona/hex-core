import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Inline action row beneath a message — typically holds copy / regenerate /
 * thumbs-up / thumbs-down buttons. Pure container: it sets the layout and
 * leaves the buttons (and their handlers) to the consumer.
 *
 * Renders below the message body with subtle hover-reveal styling — the
 * row is dimmed by default and brightens when the parent hovers.
 *
 * @example
 * <Message role="assistant">
 *   <Markdown>{text}</Markdown>
 *   <MessageActions>
 *     <Button variant="ghost" size="icon" onClick={() => copy(text)}><CopyIcon /></Button>
 *     <Button variant="ghost" size="icon" onClick={onRegenerate}><RetryIcon /></Button>
 *   </MessageActions>
 * </Message>
 */
export interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

/**
 * Renders the action-button row.
 * @param props - children buttons
 * @returns A flex container styled for in-message actions
 */
function MessageActions({ className, children, ...props }: MessageActionsProps) {
	return (
		<div
			className={cn(
				"mt-2 flex items-center gap-1 opacity-60",
				"transition-opacity duration-[var(--duration-normal,200ms)] ease-out",
				"group-hover/message:opacity-100 hover:opacity-100 focus-within:opacity-100",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { MessageActions };
