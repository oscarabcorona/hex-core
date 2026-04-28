"use client";

import * as MenubarPrimitive from "@radix-ui/react-menubar";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Top-level menu bar (File / Edit / View style). */
const Menubar = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Root
		ref={ref}
		className={cn(
			"flex h-[var(--control-height-md,2.5rem)] items-center space-x-1 rounded-md border border-foreground/[0.08] bg-background p-[var(--space-1,0.25rem)]",
			className,
		)}
		{...props}
	/>
));
Menubar.displayName = "Menubar";

// The explicit `as typeof ...Primitive.X` casts below are load-bearing: without them,
// tsup's dts build fails with TS2742 "The inferred type of X cannot be named without a
// reference to @radix-ui/react-context" on direct re-exports of Radix primitives. Do not
// remove without verifying `pnpm --filter @hex-core/components build` still succeeds.

/** A top-level menu in the bar (e.g. "File"). */
const MenubarMenu = MenubarPrimitive.Menu as typeof MenubarPrimitive.Menu;

/** Groups related items inside a menu content. */
const MenubarGroup = MenubarPrimitive.Group as typeof MenubarPrimitive.Group;

/** Portals menu content into the body. */
const MenubarPortal = MenubarPrimitive.Portal as typeof MenubarPrimitive.Portal;

/** Group for checkable radio items. */
const MenubarRadioGroup = MenubarPrimitive.RadioGroup as typeof MenubarPrimitive.RadioGroup;

/** The clickable menu label in the bar. */
const MenubarTrigger = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex cursor-default select-none items-center rounded-sm px-[var(--space-3,0.75rem)] py-1.5 text-sm font-medium outline-none",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"focus:bg-accent focus:text-accent-foreground",
			"data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
			className,
		)}
		{...props}
	/>
));
MenubarTrigger.displayName = "MenubarTrigger";

/** The menu panel shown when a trigger opens. */
const MenubarContent = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
	<MenubarPrimitive.Portal>
		<MenubarPrimitive.Content
			ref={ref}
			align={align}
			alignOffset={alignOffset}
			sideOffset={sideOffset}
			className={cn(
				"z-50 min-w-[12rem] overflow-hidden rounded-md border border-foreground/[0.08] bg-popover p-[var(--space-1,0.25rem)] text-popover-foreground shadow-md",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				className,
			)}
			{...props}
		/>
	</MenubarPrimitive.Portal>
));
MenubarContent.displayName = "MenubarContent";

/** A clickable menu item. */
const MenubarItem = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
	<MenubarPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center gap-[var(--gap-sm,0.5rem)] rounded-sm px-[var(--space-2,0.5rem)] py-1.5 text-sm outline-none",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			inset && "pl-[var(--space-8,2rem)]",
			className,
		)}
		{...props}
	/>
));
MenubarItem.displayName = "MenubarItem";

/** A non-interactive heading label. */
const MenubarLabel = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
	<MenubarPrimitive.Label
		ref={ref}
		className={cn("px-[var(--space-2,0.5rem)] py-1.5 text-sm font-semibold", inset && "pl-[var(--space-8,2rem)]", className)}
		{...props}
	/>
));
MenubarLabel.displayName = "MenubarLabel";

/** Horizontal divider. */
const MenubarSeparator = React.forwardRef<
	React.ComponentRef<typeof MenubarPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Separator
		ref={ref}
		className={cn("-mx-[var(--space-1,0.25rem)] my-[var(--space-1,0.25rem)] h-px bg-foreground/[0.12]", className)}
		{...props}
	/>
));
MenubarSeparator.displayName = "MenubarSeparator";

/**
 * Right-aligned keyboard shortcut text.
 * @returns A span with muted typography
 */
function MenubarShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarSeparator,
	MenubarShortcut,
	MenubarGroup,
	MenubarPortal,
	MenubarRadioGroup,
};
