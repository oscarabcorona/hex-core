import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import type { Role } from "../types.js";

const messageVariants = cva(
	[
		"flex w-full gap-3 px-4 py-3 text-sm",
		"transition-colors duration-[var(--duration-normal,200ms)] ease-out",
	].join(" "),
	{
		variants: {
			role: {
				user: "bg-secondary/40 text-foreground",
				assistant: "bg-card text-card-foreground",
				system: "bg-muted text-muted-foreground italic",
				tool: "bg-accent/15 text-accent-foreground border-l-2 border-accent",
			},
		},
		defaultVariants: {
			role: "assistant",
		},
	},
);

/**
 * Single chat message row. Renders content with role-specific styling and a
 * `data-role` attribute so consumers can target arbitrary roles via CSS.
 *
 * Headless: accepts any `children`. Pair with `Markdown` + `CodeBlock` for
 * assistant turns, with `ToolCall` for agent steps, or with plain strings.
 *
 * @example
 * <Message role="user">What's the weather?</Message>
 * @example
 * <Message role="assistant">
 *   <Markdown>{streamingText}</Markdown>
 *   <ToolCall name="getWeather" state="result" args={...} result={...} />
 * </Message>
 */
export interface MessageProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "role">,
		VariantProps<typeof messageVariants> {
	/** Speaker — drives variant styling and the `data-role` attribute. */
	role: Role;
	children: React.ReactNode;
}

/**
 * Renders a chat-message row scoped to one speaker.
 * @param props - role + content
 * @returns A styled div tagged with `data-role={role}`
 */
function Message({ role, className, children, ...props }: MessageProps) {
	return (
		<div data-role={role} className={cn(messageVariants({ role }), className)} {...props}>
			{children}
		</div>
	);
}

export { Message, messageVariants };
