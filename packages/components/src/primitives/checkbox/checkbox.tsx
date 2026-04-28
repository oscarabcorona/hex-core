"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "../../lib/utils.js";

/**
 * An accessible checkbox component built on Radix UI.
 * Supports checked, unchecked, and indeterminate states with smooth animations.
 */
export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

const Checkbox = React.forwardRef<
	React.ComponentRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"group h-4 w-4 shrink-0 rounded-sm border border-input",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
			"hover:border-ring/50 hover:shadow-md",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
			"data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground",
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
			{/* ✓ when checked; dash when indeterminate. The Root has `group`, so each icon
			    shows only when the Root's data-state matches. */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="hidden h-3.5 w-3.5 group-data-[state=checked]:block"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="hidden h-3.5 w-3.5 group-data-[state=indeterminate]:block"
				aria-hidden="true"
			>
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
