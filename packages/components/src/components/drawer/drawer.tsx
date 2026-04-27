import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "../../lib/utils.js";

type DrawerRootProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>;

/**
 * Root container for a bottom drawer (vaul). Manages open state, drag, and snap points.
 * @returns A drawer root that coordinates overlay, content, and dismiss behavior.
 */
function Drawer({ shouldScaleBackground = true, ...props }: DrawerRootProps) {
	return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}
Drawer.displayName = "Drawer";

/** The element that opens the drawer when clicked. */
const DrawerTrigger = DrawerPrimitive.Trigger;

/** Portals drawer overlay and content into the body. */
const DrawerPortal = DrawerPrimitive.Portal;

/** Closes the drawer when rendered inside DrawerContent. */
const DrawerClose = DrawerPrimitive.Close;

/** Dimmed backdrop behind the drawer content. */
const DrawerOverlay = React.forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
			className,
		)}
		{...props}
	/>
));
DrawerOverlay.displayName = "DrawerOverlay";

/** The drawer content panel. Slides up from the bottom and can be dragged down to dismiss. */
const DrawerContent = React.forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DrawerPortal>
		<DrawerOverlay />
		<DrawerPrimitive.Content
			ref={ref}
			className={cn(
				"fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border border-foreground/[0.08] bg-background",
				className,
			)}
			{...props}
		>
			<div className="mx-auto mt-[var(--space-4,1rem)] h-2 w-[100px] rounded-full bg-muted" aria-hidden="true" />
			{children}
		</DrawerPrimitive.Content>
	</DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

/**
 * Header container inside DrawerContent; stacks title and description.
 * @returns A div with vertical rhythm.
 */
function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("grid gap-1.5 p-[var(--space-4,1rem)] text-center sm:text-left", className)}
			{...props}
		/>
	);
}

/**
 * Footer container inside DrawerContent; stacks action buttons.
 * @returns A div that stacks buttons vertically with consistent gutters.
 */
function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("mt-auto flex flex-col gap-[var(--gap-sm,0.5rem)] p-[var(--space-4,1rem)]", className)} {...props} />;
}

/** Accessible drawer title; vaul wires it to aria-labelledby automatically. */
const DrawerTitle = React.forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
DrawerTitle.displayName = "DrawerTitle";

/** Accessible drawer description; vaul wires it to aria-describedby automatically. */
const DrawerDescription = React.forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DrawerDescription.displayName = "DrawerDescription";

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
