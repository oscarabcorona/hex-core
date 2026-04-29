"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root nav landmark for breadcrumb navigation. */
const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(
	(props, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />,
);
Breadcrumb.displayName = "Breadcrumb";

/** Ordered list of breadcrumb items. */
const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
	({ className, ...props }, ref) => (
		<ol
			ref={ref}
			className={cn(
				"flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-[var(--gap-sm,0.5rem)].5",
				className,
			)}
			{...props}
		/>
	),
);
BreadcrumbList.displayName = "BreadcrumbList";

/** A single breadcrumb list item. */
const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
	({ className, ...props }, ref) => (
		<li
			ref={ref}
			className={cn("inline-flex items-center gap-1.5", className)}
			{...props}
		/>
	),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

/** A link inside a breadcrumb item. Use asChild to render e.g. Next.js Link. */
const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "a";
	return (
		<Comp
			ref={ref}
			className={cn("transition-all duration-[var(--duration-normal,200ms)] ease-out hover:text-foreground", className)}
			{...props}
		/>
	);
});
BreadcrumbLink.displayName = "BreadcrumbLink";

/** The final breadcrumb (current page). Not interactive. */
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
	({ className, ...props }, ref) => (
		<span
			ref={ref}
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn("font-normal text-foreground", className)}
			{...props}
		/>
	),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

/**
 * Visual separator between breadcrumb items (chevron by default).
 * @returns An li rendering a decorative chevron icon
 */
function BreadcrumbSeparator({
	children,
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li role="presentation" aria-hidden="true" className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)} {...props}>
			{children ?? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			)}
		</li>
	);
}

/**
 * Ellipsis for truncated breadcrumb trails.
 * @returns A span containing a decorative SVG (aria-hidden) plus a sr-only "More pages" label for AT.
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
	// Wrapper stays reachable by AT; only the decorative SVG is aria-hidden so the
	// sr-only "More pages" label actually reaches screen readers.
	return (
		<span
			className={cn("flex h-[var(--control-height-sm,2.25rem)] w-[var(--control-height-sm,2.25rem)] items-center justify-center", className)}
			{...props}
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
				<circle cx="12" cy="12" r="1" />
				<circle cx="19" cy="12" r="1" />
				<circle cx="5" cy="12" r="1" />
			</svg>
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};
