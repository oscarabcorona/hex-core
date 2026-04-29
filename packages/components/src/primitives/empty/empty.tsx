import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const emptyVariants = cva(
	[
		"flex flex-col items-center justify-center text-center",
		"rounded-md border border-dashed border-border bg-muted/30",
	].join(" "),
	{
		variants: {
			size: {
				sm: "gap-[var(--space-2,0.5rem)] px-[var(--space-4,1rem)] py-[var(--space-6,1.5rem)] text-sm",
				default: "gap-[var(--space-3,0.75rem)] px-[var(--space-6,1.5rem)] py-[var(--space-8,2rem)]",
				lg: "gap-[var(--space-4,1rem)] px-[var(--space-8,2rem)] py-[var(--space-12,3rem)]",
			},
		},
		defaultVariants: { size: "default" },
	},
);

const emptyIconWrapperVariants = cva(
	"flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5",
	{
		variants: {
			size: {
				sm: "h-9 w-9",
				default: "h-12 w-12 [&_svg]:size-6",
				lg: "h-16 w-16 [&_svg]:size-7",
			},
		},
		defaultVariants: { size: "default" },
	},
);

const emptyTitleVariants = cva("font-semibold text-foreground", {
	variants: {
		size: {
			sm: "text-sm",
			default: "text-base",
			lg: "text-lg",
		},
	},
	defaultVariants: { size: "default" },
});

const emptyDescriptionVariants = cva("max-w-md text-muted-foreground", {
	variants: {
		size: {
			sm: "text-xs",
			default: "text-sm",
			lg: "text-base",
		},
	},
	defaultVariants: { size: "default" },
});

/** Heading element used to render the Empty title. Defaults to `h3`. */
type EmptyTitleAs = "h2" | "h3" | "h4" | "h5" | "h6" | "p";

export interface EmptyProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
		VariantProps<typeof emptyVariants> {
	/** Forwarded ref onto the root region element. */
	ref?: React.Ref<HTMLDivElement>;
	/** Optional icon (typically an `<svg>`) rendered in a circular muted container. */
	icon?: React.ReactNode;
	/** Required heading copy. Becomes the region's accessible name via `aria-labelledby`. */
	title: React.ReactNode;
	/** Optional supporting copy that explains why the slot is empty + what to do next. */
	description?: React.ReactNode;
	/** Optional call-to-action — typically a `<Button>` that creates the missing record. */
	action?: React.ReactNode;
	/** Heading level for the title — pick to match surrounding hierarchy (default `h3`). */
	titleAs?: EmptyTitleAs;
}

/**
 * A "zero-state" surface for lists, dashboards, and search results that have
 * no content to show. Use to explain *why* the slot is empty and *what to do*
 * next; pair the `action` slot with a button that creates the missing record.
 *
 * Distinct from {@link Loading} (transient, has a measurable wait) and
 * {@link ErrorState} (something failed and may need a retry). If you're
 * thinking "show a message because the request just hasn't returned yet,"
 * reach for `Loading` — Empty is for "the request returned, and there's
 * nothing to show."
 *
 * @example
 * ```tsx
 * <Empty
 *   icon={<InboxIcon />}
 *   title="No messages yet"
 *   description="When someone sends you a message, it'll show up here."
 *   action={<Button>Compose</Button>}
 * />
 * ```
 *
 * @returns A region landmark labeled by the title.
 */
function Empty({
	className,
	size,
	icon,
	title,
	description,
	action,
	titleAs = "h3",
	ref,
	...props
}: EmptyProps) {
	const titleId = React.useId();
	const TitleComp = titleAs;
	return (
		<div
			ref={ref}
			role="region"
			aria-labelledby={titleId}
			className={cn(emptyVariants({ size }), className)}
			{...props}
		>
			{icon ? (
				<div className={emptyIconWrapperVariants({ size })} aria-hidden="true">
					{icon}
				</div>
			) : null}
			<TitleComp id={titleId} className={emptyTitleVariants({ size })}>
				{title}
			</TitleComp>
			{description ? (
				<div className={emptyDescriptionVariants({ size })}>{description}</div>
			) : null}
			{action ? <div className="mt-[var(--space-2,0.5rem)]">{action}</div> : null}
		</div>
	);
}

export { Empty, emptyVariants };
