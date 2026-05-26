import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link CommercePromo}. */
export interface CommercePromoProps {
	/** Promo headline. */
	title: React.ReactNode;
	/** Supporting subcopy below the title. */
	description?: React.ReactNode;
	/** Call-to-action buttons. Pass one or more `<Button>` elements. */
	actions?: React.ReactNode;
	/** Promo media (illustration / screenshot / lifestyle image). */
	media?: React.ReactNode;
	/** Optional eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** `image-right` (default) renders the media on the right; `image-left` flips it; `overlay` layers copy over the media full-bleed. */
	variant?: "image-right" | "image-left" | "overlay";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Featured-deal promo banner: heading + subcopy + CTA + media, with
 * `image-left`, `image-right`, or `overlay` layouts. Drop it between catalog
 * sections to surface a sale, new collection, or seasonal campaign.
 * Presentational and theme-driven.
 */
export function CommercePromo({
	title,
	description,
	actions,
	media,
	eyebrow,
	variant = "image-right",
	className,
}: CommercePromoProps) {
	const copy = (
		<div className={cn("flex flex-col gap-4", variant === "overlay" && "text-primary-foreground")}>
			{eyebrow ? (
				<p
					className={cn(
						"text-sm font-semibold uppercase tracking-wide",
						variant === "overlay" ? "text-primary-foreground/80" : "text-primary",
					)}
				>
					{eyebrow}
				</p>
			) : null}
			<h2
				className={cn(
					"text-balance text-3xl font-semibold tracking-tight sm:text-4xl",
					variant === "overlay" ? "text-primary-foreground" : "text-foreground",
				)}
			>
				{title}
			</h2>
			{description ? (
				<p
					className={cn(
						"max-w-xl text-pretty text-base",
						variant === "overlay" ? "text-primary-foreground/80" : "text-muted-foreground",
					)}
				>
					{description}
				</p>
			) : null}
			{actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
		</div>
	);

	if (variant === "overlay") {
		return (
			<section className={cn("bg-background py-16 sm:py-20", className)}>
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="relative overflow-hidden rounded-3xl bg-primary [&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover [&_img]:opacity-50">
						{media ? <div className="absolute inset-0">{media}</div> : null}
						<div className="relative px-6 py-16 sm:px-12 sm:py-20">{copy}</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={cn("bg-background py-16 sm:py-20", className)}>
			<div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
				{variant === "image-left" && media ? (
					<div className="overflow-hidden rounded-2xl bg-muted [&_img]:size-full [&_img]:object-cover">
						{media}
					</div>
				) : null}
				{copy}
				{variant === "image-right" && media ? (
					<div className="overflow-hidden rounded-2xl bg-muted [&_img]:size-full [&_img]:object-cover">
						{media}
					</div>
				) : null}
			</div>
		</section>
	);
}
