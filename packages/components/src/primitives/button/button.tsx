import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
	[
		// Tokens consumed (fall back to Tailwind defaults when no theme is loaded):
		// --gap-sm, --duration-normal, --control-height-{sm,md,lg}, --space-{2,3,4,8}
		"inline-flex items-center justify-center gap-[var(--gap-sm,0.5rem)] whitespace-nowrap rounded-md text-sm font-medium",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"active:scale-[0.98]",
		"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	].join(" "),
	{
		variants: {
			variant: {
				default: [
					"bg-primary text-primary-foreground",
					"shadow-sm shadow-primary/20",
					"hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
				].join(" "),
				destructive: [
					"bg-destructive text-destructive-foreground",
					"shadow-sm shadow-destructive/20",
					"hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/25",
				].join(" "),
				outline: [
					"border border-input bg-background",
					"shadow-sm",
					"hover:bg-accent hover:text-accent-foreground hover:shadow-md",
				].join(" "),
				secondary: [
					"bg-secondary text-secondary-foreground",
					"shadow-sm",
					"hover:bg-secondary/80 hover:shadow-md",
				].join(" "),
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default:
					"h-[var(--control-height-md,2.5rem)] px-[var(--space-4,1rem)] py-[var(--space-2,0.5rem)]",
				sm: "h-[var(--control-height-sm,2.25rem)] rounded-md px-[var(--space-3,0.75rem)]",
				lg: "h-[var(--control-height-lg,2.75rem)] rounded-md px-[var(--space-8,2rem)] text-base",
				icon: "h-[var(--control-height-md,2.5rem)] w-[var(--control-height-md,2.5rem)]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant, size, asChild = false, loading = false, children, disabled, ...props },
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={disabled || loading}
				aria-busy={loading || undefined}
				{...props}
			>
				{loading ? (
					<>
						<svg
							className="animate-spin h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						{children}
					</>
				) : (
					children
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
