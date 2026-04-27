import * as React from "react";
import { cn } from "../../lib/utils.js";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-[var(--control-height-md,2.5rem)] w-full rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					// inset-ring gives a self-borne edge so the input field is visible on flat
					// surfaces (token border alone is too low-contrast on bg-background=white).
					"shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
					"file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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
Input.displayName = "Input";

export { Input };
