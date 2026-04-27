import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container for a destructive-action confirmation dialog. */
const AlertDialog = AlertDialogPrimitive.Root;

/** The element that opens the alert dialog. */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/** Portals alert dialog content into the body. */
const AlertDialogPortal = AlertDialogPrimitive.Portal;

/** Dimmed backdrop behind the alert dialog. */
const AlertDialogOverlay = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
			"data-[state=open]:animate-in data-[state=closed]:animate-out",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

/** Content panel for the alert dialog. No close button — user must choose action or cancel. */
const AlertDialogContent = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			className={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-[var(--gap-md,1rem)]",
				"border border-foreground/[0.08] bg-background p-[var(--space-6,1.5rem)] shadow-lg rounded-lg",
				"duration-[var(--duration-normal,200ms)] data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				className,
			)}
			{...props}
		/>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

/**
 * Header container for title + description.
 * @returns A div wrapping title/description with vertical rhythm
 */
function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

/**
 * Footer container for Cancel/Action buttons.
 * @returns A div stacking buttons on mobile and right-aligning on desktop
 */
function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	);
}

/** Accessible title for the alert dialog. */
const AlertDialogTitle = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold", className)}
		{...props}
	/>
));
AlertDialogTitle.displayName = "AlertDialogTitle";

/** Accessible description for the alert dialog. */
const AlertDialogDescription = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = "AlertDialogDescription";

/** The destructive action button (e.g. Delete). Receives focus by default. */
const AlertDialogAction = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Action>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(
			"inline-flex h-[var(--control-height-md,2.5rem)] items-center justify-center rounded-md px-[var(--space-4,1rem)] py-[var(--space-2,0.5rem)] text-sm font-medium",
			"bg-destructive text-destructive-foreground shadow-sm",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"hover:bg-destructive/90 hover:shadow-md",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:pointer-events-none disabled:opacity-50",
			"active:scale-[0.98]",
			className,
		)}
		{...props}
	/>
));
AlertDialogAction.displayName = "AlertDialogAction";

/** The cancel button. Closes the dialog. */
const AlertDialogCancel = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(
			"inline-flex h-[var(--control-height-md,2.5rem)] items-center justify-center rounded-md px-[var(--space-4,1rem)] py-[var(--space-2,0.5rem)] text-sm font-medium",
			"border border-input bg-background shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:inset-ring-foreground/12",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"mt-[var(--space-2,0.5rem)] sm:mt-0",
			"active:scale-[0.98]",
			className,
		)}
		{...props}
	/>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
};
