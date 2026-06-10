"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container for a context menu (right-click menu). */
const ContextMenu = ContextMenuPrimitive.Root;

/** The element that triggers the context menu on right-click. */
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

/** Groups related items for a11y. */
const ContextMenuGroup = ContextMenuPrimitive.Group;

/** Portals content into the body. */
const ContextMenuPortal = ContextMenuPrimitive.Portal;

/** Group for checkable radio items. */
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

/** The menu panel shown when the trigger is right-clicked. */
const ContextMenuContent = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			ref={ref}
			className={cn(
				"z-50 min-w-[8rem] overflow-hidden rounded-md border border-foreground/[0.08] bg-popover p-[var(--space-1,0.25rem)] text-popover-foreground shadow-md",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				className,
			)}
			{...props}
		/>
	</ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

/** A clickable menu item. */
const ContextMenuItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
	<ContextMenuPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center gap-[var(--gap-sm,0.5rem)] rounded-sm px-[var(--space-2,0.5rem)] py-1.5 text-sm outline-none",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			inset && "pl-[var(--space-8,2rem)]",
			className,
		)}
		{...props}
	/>
));
ContextMenuItem.displayName = "ContextMenuItem";

/** A checkable menu item. */
const ContextMenuCheckboxItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
	<ContextMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-[var(--space-8,2rem)] pr-[var(--space-2,0.5rem)] text-sm outline-none",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

/** A radio menu item. */
const ContextMenuRadioItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
	<ContextMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-[var(--space-8,2rem)] pr-[var(--space-2,0.5rem)] text-sm outline-none",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<svg viewBox="0 0 24 24" className="h-2 w-2 fill-current" aria-hidden="true">
					<circle cx="12" cy="12" r="10" />
				</svg>
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

/** A non-interactive heading label. */
const ContextMenuLabel = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
	<ContextMenuPrimitive.Label
		ref={ref}
		className={cn("px-[var(--space-2,0.5rem)] py-1.5 text-sm font-semibold text-foreground", inset && "pl-[var(--space-8,2rem)]", className)}
		{...props}
	/>
));
ContextMenuLabel.displayName = "ContextMenuLabel";

/** Horizontal divider. */
const ContextMenuSeparator = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Separator
		ref={ref}
		className={cn("-mx-[var(--space-1,0.25rem)] my-[var(--space-1,0.25rem)] h-px bg-foreground/[0.12]", className)}
		{...props}
	/>
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

/**
 * Right-aligned shortcut text (e.g. ⌘⇧N).
 * @returns A span with muted typography
 */
function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuRadioGroup,
};
