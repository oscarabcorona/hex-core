import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link MarketingContact}. */
export interface MarketingContactProps {
	/** Section heading. */
	title: React.ReactNode;
	/** The contact form — pass your own `<form>` with fields + submit. */
	form: React.ReactNode;
	/** Supporting subcopy below the title. */
	description?: React.ReactNode;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Optional left-column content (address / email / phone / hours) for the split layout. */
	details?: React.ReactNode;
	/** `split` (default, ≥lg) renders details left + form right; `stacked` is single-column. */
	layout?: "split" | "stacked";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Contact section: heading + supporting copy + optional details column +
 * caller-supplied form. `split` shows details left and form right on ≥lg;
 * `stacked` is single-column. Presentational and theme-driven — submission
 * lives in the form you pass.
 */
export function MarketingContact({
	title,
	form,
	description,
	eyebrow,
	details,
	layout = "split",
	className,
}: MarketingContactProps) {
	const heading = (
		<div className="flex flex-col gap-3">
			{eyebrow ? (
				<p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
			) : null}
			<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
				{title}
			</h2>
			{description ? (
				<p className="text-pretty text-lg text-muted-foreground">{description}</p>
			) : null}
		</div>
	);

	if (layout === "stacked") {
		return (
			<section className={cn("bg-background py-24 sm:py-32", className)}>
				<div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 lg:px-8">
					{heading}
					{details ? <div>{details}</div> : null}
					<div>{form}</div>
				</div>
			</section>
		);
	}

	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
				<div className="flex flex-col gap-6">
					{heading}
					{details ? <div className="text-sm text-muted-foreground">{details}</div> : null}
				</div>
				<div>{form}</div>
			</div>
		</section>
	);
}
