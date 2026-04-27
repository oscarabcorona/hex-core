import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container controlling open state of a modal dialog. */
const Dialog = DialogPrimitive.Root;

/** The element (usually a button) that opens the dialog when clicked. */
const DialogTrigger = DialogPrimitive.Trigger;

/** Portals the dialog overlay and content into the body. */
const DialogPortal = DialogPrimitive.Portal;

/** Closes the dialog when rendered inside DialogContent. */
const DialogClose = DialogPrimitive.Close;

/** Dimmed backdrop rendered behind the dialog content. */
const DialogOverlay = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
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
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
	/**
	 * When `true` (the default), DialogContent caps its height at viewport-2rem
	 * and renders children inside a padded inner scroll container. The Close
	 * button stays anchored to the (non-scrolling) outer panel so it remains
	 * visible even when the user scrolls long content.
	 *
	 * Pass `scrollable={false}` to opt out — useful when the consumer manages
	 * its own scroll surface (e.g. CommandDialog defers scroll to cmdk's
	 * internal CommandList).
	 */
	scrollable?: boolean;
}

/** The dialog content panel, centered on the overlay. Includes a close button by default. */
const DialogContent = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Content>,
	DialogContentProps
>(({ className, children, scrollable = true, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
				scrollable
					? "max-h-[calc(100vh-2rem)] border bg-background shadow-lg rounded-lg"
					: "gap-[var(--gap-md,1rem)] border bg-background p-[var(--space-6,1.5rem)] shadow-lg rounded-lg",
				"duration-[var(--duration-normal,200ms)] data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				className,
			)}
			{...props}
		>
			{scrollable ? (
				<div className="grid gap-[var(--gap-md,1rem)] overflow-y-auto p-[var(--space-6,1.5rem)]">
					{children}
				</div>
			) : (
				children
			)}
			<DialogPrimitive.Close
				className={cn(
					"absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background bg-background/80 backdrop-blur-sm",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out hover:opacity-100",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:pointer-events-none",
				)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
				<span className="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPortal>
));
DialogContent.displayName = "DialogContent";

export type { DialogContentProps };

/**
 * Header container inside DialogContent; stacks title and description.
 * @returns A div wrapping title/description with vertical rhythm
 */
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

/**
 * Footer container inside DialogContent; aligns action buttons.
 * @returns A div that stacks buttons on mobile and right-aligns on desktop
 */
function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

/** Accessible dialog title; Radix wires it to aria-labelledby automatically. */
const DialogTitle = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

/** Accessible dialog description; Radix wires it to aria-describedby automatically. */
const DialogDescription = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = "DialogDescription";

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
