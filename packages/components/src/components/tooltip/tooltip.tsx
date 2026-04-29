"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Provider required at the root of the app or tree where tooltips are used. */
const TooltipProvider = TooltipPrimitive.Provider;

/** Root container for a single tooltip. */
const Tooltip = TooltipPrimitive.Root;

/** The element that shows the tooltip on hover/focus. */
const TooltipTrigger = TooltipPrimitive.Trigger;

/** The floating tooltip content (small, hover-reveal info). */
const TooltipContent = React.forwardRef<
	React.ComponentRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				"z-50 overflow-hidden rounded-md bg-primary px-[var(--space-3,0.75rem)] py-1.5 text-xs text-primary-foreground shadow-md",
				"animate-in fade-in-0 zoom-in-95",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
