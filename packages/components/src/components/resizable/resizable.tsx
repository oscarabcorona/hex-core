"use client";

import * as React from "react";
import {
	Group as ResizablePrimitiveGroup,
	Panel as ResizablePrimitivePanel,
	Separator as ResizablePrimitiveSeparator,
} from "react-resizable-panels";
import { cn } from "../../lib/utils.js";

/**
 * Root container for a group of resizable panels.
 * @returns A flex container that coordinates panel sizing.
 */
function ResizablePanelGroup({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitiveGroup>) {
	return (
		<ResizablePrimitiveGroup
			className={cn(
				"flex h-full w-full aria-[orientation=vertical]:flex-col",
				className,
			)}
			{...props}
		/>
	);
}
ResizablePanelGroup.displayName = "ResizablePanelGroup";

/** A single resizable panel. Configure via defaultSize, minSize, maxSize. */
const ResizablePanel = ResizablePrimitivePanel;

interface ResizableHandleProps
	extends React.ComponentPropsWithoutRef<typeof ResizablePrimitiveSeparator> {
	/** Show a grab-grip on the handle for affordance. */
	withHandle?: boolean;
}

/**
 * Draggable separator between panels. Optionally renders a grab-grip dot.
 * @returns A slim, focusable resize handle.
 */
function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
	return (
		<ResizablePrimitiveSeparator
			className={cn(
				"relative flex w-px items-center justify-center bg-foreground/[0.12] transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-ring data-[separator=active]:bg-ring",
				"after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
				"aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0",
				"[&[aria-orientation=horizontal]>div]:rotate-90",
				className,
			)}
			{...props}
		>
			{withHandle && (
				<div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-2.5 w-2.5"
						aria-hidden="true"
					>
						<circle cx="9" cy="5" r="1" />
						<circle cx="9" cy="12" r="1" />
						<circle cx="9" cy="19" r="1" />
						<circle cx="15" cy="5" r="1" />
						<circle cx="15" cy="12" r="1" />
						<circle cx="15" cy="19" r="1" />
					</svg>
				</div>
			)}
		</ResizablePrimitiveSeparator>
	);
}
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
