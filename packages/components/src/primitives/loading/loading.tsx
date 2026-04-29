import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import { Skeleton } from "../skeleton/skeleton.js";

const loadingVariants = cva("flex w-full", {
	variants: {
		variant: {
			list: "flex-col gap-[var(--space-3,0.75rem)]",
			card: "flex-col gap-[var(--space-2,0.5rem)] rounded-md border border-border bg-card p-[var(--space-4,1rem)]",
			stack: "flex-col gap-[var(--space-4,1rem)]",
		},
	},
	defaultVariants: { variant: "list" },
});

export interface LoadingProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "role">,
		VariantProps<typeof loadingVariants> {
	/** Forwarded ref onto the status region. */
	ref?: React.Ref<HTMLDivElement>;
	/**
	 * Number of placeholder rows to render. Each row may contain multiple
	 * Skeleton elements depending on `variant` — `list` emits 1 Skeleton
	 * per row; `card` emits 3 (heading + 2 body lines); `stack` emits 3
	 * (avatar + 2 text lines). Default 3.
	 */
	rows?: number;
	/** Optional sr-only label that screen readers announce. Default "Loading…". */
	label?: string;
}

/**
 * A composed loading-placeholder pattern for lists, cards, and stacks.
 * Renders N {@link Skeleton} rows pre-arranged for the chosen layout —
 * Skeleton is the atom (one shaped pulse), Loading is the molecule
 * (the canonical pattern most surfaces want).
 *
 * Distinct from {@link Empty} (request returned, no items) and
 * {@link ErrorState} (request failed). If you need a single shaped
 * pulse for a specific element (an avatar circle, a heading line),
 * reach for `Skeleton` directly. If the wait has a measurable
 * percent-done, reach for `Progress` instead.
 *
 * @example
 * ```tsx
 * <Loading rows={5} variant="list" />
 * ```
 *
 * @returns A `role="status"` region with `aria-live="polite"` and the
 *   announced label (default "Loading…") rendered sr-only.
 */
function Loading({
	className,
	variant = "list",
	rows = 3,
	label = "Loading…",
	ref,
	...props
}: LoadingProps) {
	return (
		<div
			ref={ref}
			role="status"
			aria-live="polite"
			className={cn(loadingVariants({ variant }), className)}
			{...props}
		>
			<span className="sr-only">{label}</span>
			{Array.from({ length: rows }, (_, i) => (
				// `variant` can be `null` per CVA's VariantProps shape — the
				// destructured default only catches undefined. The fallback
				// here narrows to the LoadingRow's "list" | "card" | "stack"
				// signature.
				<LoadingRow key={i} variant={variant ?? "list"} />
			))}
		</div>
	);
}

/**
 * One placeholder row inside `Loading`. Layout-specific shape per variant.
 *
 * @param variant - Layout family the row belongs to (`list` / `card` / `stack`).
 */
function LoadingRow({ variant }: { variant: "list" | "card" | "stack" }) {
	if (variant === "card") {
		return (
			<>
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-5/6" />
			</>
		);
	}
	if (variant === "stack") {
		return (
			<div className="flex items-center gap-[var(--space-3,0.75rem)]">
				<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
				<div className="flex flex-1 flex-col gap-[var(--space-2,0.5rem)]">
					<Skeleton className="h-4 w-1/3" />
					<Skeleton className="h-3 w-2/3" />
				</div>
			</div>
		);
	}
	// list (default)
	return <Skeleton className="h-4 w-full" />;
}

export { Loading, loadingVariants };
