import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ScrollAreaProps
	extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
	/**
	 * tabIndex applied to the scroll viewport so keyboard users can scroll
	 * without a pointer. Defaults to `0` (focusable) — pass `-1` to skip the
	 * viewport in the tab order when ScrollArea wraps purely decorative or
	 * already-keyboard-reachable content.
	 */
	viewportTabIndex?: number;
}

/** A scrollable area with custom-styled scrollbars. Content must be explicitly sized. */
const ScrollArea = React.forwardRef<
	React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
	ScrollAreaProps
>(({ className, children, viewportTabIndex = 0, ...props }, ref) => (
	<ScrollAreaPrimitive.Root
		ref={ref}
		className={cn("relative overflow-hidden", className)}
		{...props}
	>
		<ScrollAreaPrimitive.Viewport
			tabIndex={viewportTabIndex}
			className={cn(
				"h-full w-full rounded-[inherit]",
				viewportTabIndex >= 0 &&
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			)}
		>
			{children}
		</ScrollAreaPrimitive.Viewport>
		{/* Both orientations mount unconditionally; Radix paints each only when content
		    overflows on that axis, so there's no cost for single-axis content. */}
		<ScrollBar orientation="vertical" />
		<ScrollBar orientation="horizontal" />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = "ScrollArea";

/** Styled scrollbar track + thumb. Rendered inside ScrollArea automatically. */
const ScrollBar = React.forwardRef<
	React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={cn(
			"flex touch-none select-none transition-all duration-[var(--duration-normal,200ms)] ease-out",
			orientation === "vertical" &&
				"h-full w-2.5 border-l border-l-transparent p-[1px]",
			orientation === "horizontal" &&
				"h-2.5 flex-col border-t border-t-transparent p-[1px]",
			className,
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
export type { ScrollAreaProps };
