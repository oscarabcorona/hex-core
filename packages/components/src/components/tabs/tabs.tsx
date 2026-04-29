"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils.js";

/** Root container for a tabbed interface. */
const Tabs = TabsPrimitive.Root;

/** A horizontal list of tab triggers. */
const TabsList = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex h-[var(--control-height-md,2.5rem)] items-center justify-center rounded-md border border-foreground/[0.06] bg-muted p-[var(--space-1,0.25rem)] text-muted-foreground",
			className,
		)}
		{...props}
	/>
));
TabsList.displayName = "TabsList";

/** A clickable tab trigger that activates its associated content panel. */
const TabsTrigger = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-[var(--space-3,0.75rem)] py-1.5 text-sm font-medium",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out",
			"ring-offset-background hover:text-foreground",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:pointer-events-none disabled:opacity-50",
			"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = "TabsTrigger";

/** The content panel associated with a tab trigger. */
const TabsContent = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-[var(--space-2,0.5rem)] ring-offset-background",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
