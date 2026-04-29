"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const toggleVariants = cva(
	[
		"inline-flex items-center justify-center rounded-md text-sm font-medium",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		"hover:bg-muted hover:text-muted-foreground",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
		"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	].join(" "),
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline:
					"border border-input bg-transparent shadow-sm inset-ring-1 inset-ring-foreground/[0.06] hover:bg-accent hover:text-accent-foreground",
			},
			size: {
				default: "h-[var(--control-height-md,2.5rem)] px-[var(--space-3,0.75rem)] min-w-[var(--control-height-md,2.5rem)]",
				sm: "h-[var(--control-height-sm,2.25rem)] px-2.5 min-w-[var(--control-height-sm,2.25rem)]",
				lg: "h-[var(--control-height-lg,2.75rem)] px-5 min-w-[var(--control-height-lg,2.75rem)]",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

/**
 * A two-state button. Stays pressed when toggled on.
 * @returns A styled Radix Toggle root
 */
const Toggle = React.forwardRef<
	React.ComponentRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size, className }))}
		{...props}
	/>
));
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
