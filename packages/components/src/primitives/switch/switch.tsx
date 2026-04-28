"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils.js";

/**
 * An accessible toggle switch built on Radix UI.
 * Use for instant on/off settings that take effect immediately.
 */
export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(
	({ className, ...props }, ref) => (
		<SwitchPrimitive.Root
			className={cn(
				"peer inline-flex h-6 w-[var(--control-height-lg,2.75rem)] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
				"transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
				// Unchecked track shares --color-input with form borders (~1.27:1 vs white) so
				// add an inset ring to make the track visible on flat surfaces.
				"data-[state=unchecked]:inset-ring-1 data-[state=unchecked]:inset-ring-foreground/[0.08]",
				"hover:shadow-md",
				className,
			)}
			{...props}
			ref={ref}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
					"transition-transform duration-[var(--duration-normal,200ms)] ease-out",
					"data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
				)}
			/>
		</SwitchPrimitive.Root>
	),
);
Switch.displayName = "Switch";

export { Switch };
