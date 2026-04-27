"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

interface SidebarContextValue {
	/** Current open/collapsed state. */
	open: boolean;
	/** Toggle or set open state. */
	setOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/**
 * Reads sidebar state from context. Throws if used outside SidebarProvider.
 * @returns `{ open, setOpen }` bound to the nearest SidebarProvider.
 */
function useSidebar(): SidebarContextValue {
	const ctx = React.useContext(SidebarContext);
	if (!ctx) {
		throw new Error("useSidebar must be used inside <SidebarProvider>");
	}
	return ctx;
}

interface SidebarProviderProps {
	/** Controlled open state. */
	open?: boolean;
	/** Uncontrolled initial open state (defaults to true). */
	defaultOpen?: boolean;
	/** Callback fired when open state changes. */
	onOpenChange?: (open: boolean) => void;
	/** Children — typically a Sidebar + app content sibling. */
	children: React.ReactNode;
	/** Extra class names on the provider wrapper. */
	className?: string;
}

/**
 * Hosts sidebar state. Wrap your app shell (Sidebar + main content) in this.
 * @returns A flex container with a SidebarContext provider.
 */
function SidebarProvider({
	open: openProp,
	defaultOpen = true,
	onOpenChange,
	children,
	className,
}: SidebarProviderProps) {
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const isControlled = openProp !== undefined;
	const open = isControlled ? openProp : internalOpen;

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) {
				setInternalOpen(next);
			}
			onOpenChange?.(next);
		},
		[isControlled, onOpenChange],
	);

	const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

	return (
		<SidebarContext.Provider value={value}>
			<div
				data-state={open ? "open" : "closed"}
				className={cn("flex min-h-screen w-full", className)}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	);
}
SidebarProvider.displayName = "SidebarProvider";

const sidebarVariants = cva(
	cn(
		"flex h-full shrink-0 flex-col border-foreground/[0.08] border-r bg-background text-foreground",
		"transition-[width] duration-[var(--duration-normal,200ms)] ease-out",
	),
	{
		variants: {
			side: {
				left: "border-r",
				right: "order-last border-l border-r-0",
			},
			state: {
				open: "w-64",
				closed: "w-0 overflow-hidden border-r-0",
			},
		},
		defaultVariants: {
			side: "left",
			state: "open",
		},
	},
);

interface SidebarProps
	extends React.HTMLAttributes<HTMLElement>,
		Pick<VariantProps<typeof sidebarVariants>, "side"> {}

/**
 * App-shell sidebar. Reads open state from SidebarProvider and animates width.
 * @returns An aside element that expands/collapses.
 */
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
	({ className, side = "left", children, ...props }, ref) => {
		const { open } = useSidebar();
		return (
			<aside
				ref={ref}
				data-state={open ? "open" : "closed"}
				aria-hidden={!open || undefined}
				inert={!open}
				className={cn(sidebarVariants({ side, state: open ? "open" : "closed" }), className)}
				{...props}
			>
				{children}
			</aside>
		);
	},
);
Sidebar.displayName = "Sidebar";

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Render as the child element (Button, etc.) using Radix Slot. */
	asChild?: boolean;
}

/**
 * Toggles the sidebar open/closed. Renders a button by default; use asChild to style.
 * @returns A button that flips SidebarProvider state.
 */
const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
	({ asChild, className, onClick, "aria-label": ariaLabel, ...props }, ref) => {
		const { open, setOpen } = useSidebar();
		const Comp = asChild ? Slot : "button";
		// When asChild, prefer the consumer's aria-label (or visible text) — don't force ours.
		const resolvedAriaLabel =
			ariaLabel ?? (asChild ? undefined : open ? "Collapse sidebar" : "Expand sidebar");
		return (
			<Comp
				ref={ref}
				type={asChild ? undefined : "button"}
				aria-label={resolvedAriaLabel}
				aria-expanded={open}
				onClick={(event: React.MouseEvent<HTMLElement>) => {
					onClick?.(event as React.MouseEvent<HTMLButtonElement>);
					if (!event.defaultPrevented) {
						setOpen(!open);
					}
				}}
				className={cn(
					"inline-flex h-[var(--control-height-sm,2.25rem)] w-[var(--control-height-sm,2.25rem)] items-center justify-center rounded-md text-muted-foreground",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-accent hover:text-accent-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					className,
				)}
				{...props}
			>
				{asChild ? null : (
					<>
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
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<line x1="9" y1="3" x2="9" y2="21" />
						</svg>
						<span className="sr-only">Toggle sidebar</span>
					</>
				)}
			</Comp>
		);
	},
);
SidebarTrigger.displayName = "SidebarTrigger";

/** Header container at the top of the sidebar. */
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex items-center gap-[var(--gap-sm,0.5rem)] border-b border-b-foreground/[0.08] p-[var(--space-4,1rem)]", className)}
			{...props}
		/>
	),
);
SidebarHeader.displayName = "SidebarHeader";

/** Scrollable main area of the sidebar. */
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex-1 overflow-auto p-[var(--space-2,0.5rem)]", className)}
			{...props}
		/>
	),
);
SidebarContent.displayName = "SidebarContent";

/** Footer container at the bottom of the sidebar. */
const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("mt-auto border-t border-t-foreground/[0.08] p-[var(--space-4,1rem)]", className)}
			{...props}
		/>
	),
);
SidebarFooter.displayName = "SidebarFooter";

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Render as the child element (next/link, etc.) via Slot. */
	asChild?: boolean;
	/** Mark as the current/selected item. */
	active?: boolean;
}

/**
 * Single selectable row inside SidebarContent. Compose icon + label in children.
 * @returns An accessible button (or Slot) styled as a sidebar row.
 */
const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
	({ asChild, active, className, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				type={asChild ? undefined : "button"}
				aria-current={active ? "page" : undefined}
				data-active={active ? "" : undefined}
				className={cn(
					"inline-flex w-full items-center gap-[var(--gap-sm,0.5rem)] rounded-md px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm font-medium",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:bg-accent hover:text-accent-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"data-[active]:bg-accent data-[active]:text-accent-foreground",
					className,
				)}
				{...props}
			/>
		);
	},
);
SidebarItem.displayName = "SidebarItem";

export {
	SidebarProvider,
	Sidebar,
	SidebarTrigger,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarItem,
	useSidebar,
};
