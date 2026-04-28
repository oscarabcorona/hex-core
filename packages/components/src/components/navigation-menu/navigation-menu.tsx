"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container for a navigation menu. Renders a viewport for content panels. */
const NavigationMenu = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
	<NavigationMenuPrimitive.Root
		ref={ref}
		className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
		{...props}
	>
		{children}
		<NavigationMenuViewport />
	</NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = "NavigationMenu";

/** List of top-level NavigationMenu items. */
const NavigationMenuList = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.List
		ref={ref}
		className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
		{...props}
	/>
));
NavigationMenuList.displayName = "NavigationMenuList";

/** A single top-level item (wraps trigger + content). */
const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
	"group inline-flex h-[var(--control-height-md,2.5rem)] w-max items-center justify-center rounded-md bg-background px-[var(--space-4,1rem)] py-[var(--space-2,0.5rem)] text-sm font-medium transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

/** The clickable trigger that opens a nav-menu content panel. */
const NavigationMenuTrigger = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<NavigationMenuPrimitive.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle(), "group", className)}
		{...props}
	>
		{children}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="relative top-[1px] ml-[var(--space-1,0.25rem)] h-3 w-3 transition duration-[var(--duration-normal,200ms)] group-data-[state=open]:rotate-180"
			aria-hidden="true"
		>
			<polyline points="6 9 12 15 18 9" />
		</svg>
	</NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

/** The content panel (e.g. mega-menu). */
const NavigationMenuContent = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Content
		ref={ref}
		className={cn(
			"left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
			className,
		)}
		{...props}
	/>
));
NavigationMenuContent.displayName = "NavigationMenuContent";

/** A direct link (no content panel). */
const NavigationMenuLink = NavigationMenuPrimitive.Link;

/** The viewport that hosts the active content panel. Rendered inside NavigationMenu. */
const NavigationMenuViewport = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
	<div className="absolute left-0 top-full flex justify-center">
		<NavigationMenuPrimitive.Viewport
			className={cn(
				"origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border border-foreground/[0.08] bg-popover text-popover-foreground shadow-lg",
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
				"md:w-[var(--radix-navigation-menu-viewport-width)]",
				className,
			)}
			ref={ref}
			{...props}
		/>
	</div>
));
NavigationMenuViewport.displayName = "NavigationMenuViewport";

/** Visual indicator (arrow) pointing at the active trigger. */
const NavigationMenuIndicator = React.forwardRef<
	React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Indicator
		ref={ref}
		className={cn(
			"top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
			className,
		)}
		{...props}
	>
		<div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-foreground/[0.12] shadow-md" />
	</NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
	navigationMenuTriggerStyle,
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
};
