import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * A styled multi-line text input with smooth focus transitions and shadow effects.
 * Extends the native HTML textarea element with Hex UI styling.
 */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"flex min-h-[80px] w-full rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
					"placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"focus-visible:shadow-md focus-visible:border-ring/50",
					"hover:border-ring/30 hover:shadow-md",
					"disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
