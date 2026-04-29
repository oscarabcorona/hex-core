import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const errorStateVariants = cva(
	[
		"flex flex-col items-center justify-center text-center",
		"rounded-md border px-[var(--space-6,1.5rem)] py-[var(--space-8,2rem)] gap-[var(--space-3,0.75rem)]",
	].join(" "),
	{
		variants: {
			variant: {
				default: "border-border bg-muted/30",
				destructive: "border-destructive/30 bg-destructive/5",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

const errorIconWrapperVariants = cva(
	"flex h-12 w-12 shrink-0 items-center justify-center rounded-full [&_svg]:size-6",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				destructive: "bg-destructive/10 text-destructive",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface ErrorStateProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
		VariantProps<typeof errorStateVariants> {
	/** Forwarded ref onto the alert region. */
	ref?: React.Ref<HTMLDivElement>;
	/** Optional icon (typically an alert / x-circle SVG). */
	icon?: React.ReactNode;
	/** Optional heading copy. Falls back to a generic "Something went wrong" if omitted. */
	title?: React.ReactNode;
	/** Required body copy explaining what failed. */
	message: React.ReactNode;
	/**
	 * Optional call-to-action — typically a `<Button>` with `onClick={refetch}`.
	 * Slot pattern (matching `Empty.action`) so consumers control the button's
	 * variant / loading state / asChild composition without ErrorState
	 * re-implementing those concerns.
	 */
	action?: React.ReactNode;
}

/**
 * A surface for rendering a failed-fetch / failed-action state. Visually
 * similar to {@link Empty} but ships with a destructive-tone bias and
 * mounts with `role="alert"` so screen readers announce the failure on
 * first render.
 *
 * Distinct from {@link Empty} (request returned, no items) and
 * {@link Loading} (request still in flight). For inline form-field
 * errors, use Form's `<FormMessage>` instead. For blocking destructive
 * confirmations, use AlertDialog.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   icon={<AlertCircleIcon />}
 *   title="Couldn't load messages"
 *   message="The server didn't respond. Check your connection and try again."
 *   action={<Button onClick={refetch}>Retry</Button>}
 * />
 * ```
 *
 * @returns A `role="alert"` region with an optional action slot.
 */
function ErrorState({
	className,
	variant,
	icon,
	title = "Something went wrong",
	message,
	action,
	ref,
	...props
}: ErrorStateProps) {
	return (
		<div
			ref={ref}
			role="alert"
			className={cn(errorStateVariants({ variant }), className)}
			{...props}
		>
			{icon ? (
				<div className={errorIconWrapperVariants({ variant })} aria-hidden="true">
					{icon}
				</div>
			) : null}
			<div className="font-semibold text-foreground">{title}</div>
			<div className="max-w-md text-sm text-muted-foreground">{message}</div>
			{action ? <div className="mt-[var(--space-2,0.5rem)]">{action}</div> : null}
		</div>
	);
}

export { ErrorState, errorStateVariants };
