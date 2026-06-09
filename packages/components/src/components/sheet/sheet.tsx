"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container controlling open state of a side sheet. */
const Sheet = SheetPrimitive.Root;

/** The element (usually a button) that opens the sheet. */
const SheetTrigger = SheetPrimitive.Trigger;

/** Closes the sheet when rendered inside SheetContent. */
const SheetClose = SheetPrimitive.Close;

/** Portals the sheet overlay and content into the body. */
const SheetPortal = SheetPrimitive.Portal;

/** Dimmed backdrop rendered behind the sheet content. */
const SheetOverlay = React.forwardRef<
	React.ComponentRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Overlay
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
SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
	cn(
		"fixed z-50 gap-[var(--gap-md,1rem)] bg-background p-[var(--space-6,1.5rem)] shadow-lg",
		"border-foreground/[0.08]",
		"transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
		"data-[state=closed]:duration-[var(--duration-slow,300ms)] data-[state=open]:duration-500",
	),
	{
		variants: {
			side: {
				top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
				bottom:
					"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
				left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
				right:
					"inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

interface SheetContentProps
	extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
		VariantProps<typeof sheetVariants> {}

/** The sheet content panel that slides in from a side of the viewport. */
const SheetContent = React.forwardRef<
	React.ComponentRef<typeof SheetPrimitive.Content>,
	SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
	<SheetPortal>
		<SheetOverlay />
		<SheetPrimitive.Content
			ref={ref}
			className={cn(sheetVariants({ side }), className)}
			{...props}
		>
			{children}
			<SheetPrimitive.Close
				className={cn(
					"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out hover:opacity-100",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-50",
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
			</SheetPrimitive.Close>
		</SheetPrimitive.Content>
	</SheetPortal>
));
SheetContent.displayName = "SheetContent";

/**
 * Header container inside SheetContent; stacks title and description.
 * @returns A div with vertical rhythm.
 */
function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

/**
 * Footer container inside SheetContent; aligns action buttons.
 * @returns A div that stacks buttons on mobile and right-aligns on desktop.
 */
function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

/** Accessible sheet title; Radix wires it to aria-labelledby automatically. */
const SheetTitle = React.forwardRef<
	React.ComponentRef<typeof SheetPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold text-foreground", className)}
		{...props}
	/>
));
SheetTitle.displayName = "SheetTitle";

/** Accessible sheet description; Radix wires it to aria-describedby automatically. */
const SheetDescription = React.forwardRef<
	React.ComponentRef<typeof SheetPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
SheetDescription.displayName = "SheetDescription";

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
