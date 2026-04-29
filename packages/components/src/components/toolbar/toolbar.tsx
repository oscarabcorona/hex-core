"use client";

import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const toolbarVariants = cva("flex items-center gap-[var(--gap-xs,0.25rem)] rounded-md border border-border bg-card p-[var(--space-1,0.25rem)]", {
	variants: {
		orientation: {
			horizontal: "flex-row",
			vertical: "flex-col items-stretch",
		},
	},
	defaultVariants: { orientation: "horizontal" },
});

const toolbarItemBaseClasses = [
	"inline-flex items-center justify-center gap-[var(--gap-xs,0.25rem)] rounded-sm",
	"px-[var(--space-2,0.5rem)] h-[var(--control-height-sm,2.25rem)] text-sm font-medium",
	"text-foreground/80 hover:text-foreground hover:bg-accent",
	"transition-colors duration-[var(--duration-normal,200ms)] ease-out",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
	"disabled:pointer-events-none disabled:opacity-50",
	"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
	"active:scale-[0.98]",
	"[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

/**
 * Toolbar root props. `aria-label` is required — Radix Toolbar.Root
 * mounts as a `role="toolbar"` landmark, and AT users will hear an
 * unlabelled "toolbar" landmark when no visible heading sits adjacent.
 * If a visible heading IS present, pair it via `aria-labelledby` instead.
 */
export interface ToolbarProps
	extends Omit<
		React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>,
		"aria-label"
	> {
	/** Forwarded ref onto the Radix `Toolbar.Root`. */
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.Root>>;
	/** Required accessible name for the toolbar landmark. */
	"aria-label": string;
}

/**
 * Root toolbar element. Wraps Radix `Toolbar.Root` with the canonical
 * Hex Core token + visual styling. Pass children consisting of
 * `ToolbarButton`, `ToolbarToggleGroup`, `ToolbarSeparator`, and
 * `ToolbarLink` — Radix handles arrow-key roving focus across them
 * automatically.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Editor controls">
 *   <ToolbarButton onClick={onUndo}>Undo</ToolbarButton>
 *   <ToolbarButton onClick={onRedo}>Redo</ToolbarButton>
 *   <ToolbarSeparator />
 *   <ToolbarToggleGroup type="single" defaultValue="left">
 *     <ToolbarToggleItem value="left">Left</ToolbarToggleItem>
 *     <ToolbarToggleItem value="center">Center</ToolbarToggleItem>
 *     <ToolbarToggleItem value="right">Right</ToolbarToggleItem>
 *   </ToolbarToggleGroup>
 * </Toolbar>
 * ```
 */
function Toolbar({ className, orientation = "horizontal", ref, ...props }: ToolbarProps) {
	return (
		<ToolbarPrimitive.Root
			ref={ref}
			orientation={orientation}
			className={cn(toolbarVariants({ orientation }), className)}
			{...props}
		/>
	);
}

/** A push button inside the toolbar. */
function ToolbarButton({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button> & {
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.Button>>;
}) {
	return (
		<ToolbarPrimitive.Button
			ref={ref}
			className={cn(toolbarItemBaseClasses, className)}
			{...props}
		/>
	);
}

/** A link inside the toolbar — renders an `<a>` with toolbar focus semantics. */
function ToolbarLink({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Link> & {
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.Link>>;
}) {
	return (
		<ToolbarPrimitive.Link
			ref={ref}
			className={cn(toolbarItemBaseClasses, "underline-offset-4 hover:underline", className)}
			{...props}
		/>
	);
}

/** A group of mutually-exclusive (`type='single'`) or independent (`type='multiple'`) toggle items. */
function ToolbarToggleGroup({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleGroup> & {
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.ToggleGroup>>;
}) {
	return (
		<ToolbarPrimitive.ToggleGroup
			ref={ref}
			className={cn("flex items-center gap-[var(--gap-xs,0.25rem)]", className)}
			{...props}
		/>
	);
}

/** Individual toggle item — exposes `data-state="on"` for the on style. */
function ToolbarToggleItem({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem> & {
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.ToggleItem>>;
}) {
	return (
		<ToolbarPrimitive.ToggleItem
			ref={ref}
			className={cn(toolbarItemBaseClasses, className)}
			{...props}
		/>
	);
}

/** A vertical (or horizontal, in vertical toolbars) divider. */
function ToolbarSeparator({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator> & {
	ref?: React.Ref<React.ElementRef<typeof ToolbarPrimitive.Separator>>;
}) {
	return (
		<ToolbarPrimitive.Separator
			ref={ref}
			className={cn(
				"shrink-0 bg-border",
				"data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-px data-[orientation=horizontal]:mx-[var(--space-1,0.25rem)]",
				"data-[orientation=vertical]:w-4 data-[orientation=vertical]:h-px data-[orientation=vertical]:my-[var(--space-1,0.25rem)]",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Toolbar,
	ToolbarButton,
	ToolbarLink,
	ToolbarSeparator,
	ToolbarToggleGroup,
	ToolbarToggleItem,
	toolbarVariants,
};
