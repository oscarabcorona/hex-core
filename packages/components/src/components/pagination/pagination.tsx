import * as React from "react";
import {
	type ButtonVariantsProps,
	buttonVariants,
} from "../../primitives/button/button-variants.js";
import { cn } from "../../lib/utils.js";

/**
 * Root nav landmark for pagination controls.
 * @returns A centered nav element with aria-label='pagination'
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			role="navigation"
			aria-label="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

/** Ordered list wrapper for pagination links. */
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
	({ className, ...props }, ref) => (
		<ul
			ref={ref}
			className={cn("flex flex-row items-center gap-1", className)}
			{...props}
		/>
	),
);
PaginationContent.displayName = "PaginationContent";

/** A pagination list item wrapper. */
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
	({ className, ...props }, ref) => <li ref={ref} className={className} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<ButtonVariantsProps, "size"> &
	React.ComponentProps<"a">;

/**
 * A pagination link styled as a button. Mark the current page with isActive.
 * @returns An anchor element styled via buttonVariants
 */
function PaginationLink({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<a
			aria-current={isActive ? "page" : undefined}
			className={cn(
				buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Previous-page link with chevron-left icon.
 * @returns A PaginationLink with aria-label='Go to previous page'
 */
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn("gap-1 pl-2.5", className)}
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
				<polyline points="15 18 9 12 15 6" />
			</svg>
			<span>Previous</span>
		</PaginationLink>
	);
}

/**
 * Next-page link with chevron-right icon.
 * @returns A PaginationLink with aria-label='Go to next page'
 */
function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn("gap-1 pr-2.5", className)}
			{...props}
		>
			<span>Next</span>
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
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</PaginationLink>
	);
}

/**
 * Ellipsis placeholder for truncated page ranges (e.g. 1 … 5 6 7 … 99).
 * @returns A span containing a decorative SVG (aria-hidden) plus a sr-only "More pages" label for AT.
 */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
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
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
