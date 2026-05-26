import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link MarketingNewsletter}. */
export interface MarketingNewsletterProps {
	/** Section heading. */
	title: React.ReactNode;
	/** Supporting subcopy below the title. */
	description?: React.ReactNode;
	/** The signup form — pass your own `<form>` with email Input + Button. */
	form: React.ReactNode;
	/** Optional fine-print disclaimer below the form (privacy / unsubscribe). */
	disclaimer?: React.ReactNode;
	/** `centered` (default) for a hero-style centered band, `split` for copy + form side-by-side on ≥lg. */
	layout?: "centered" | "split";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Newsletter signup band: heading + subcopy + a caller-supplied form, with an
 * optional disclaimer line. Two layouts: centered single column (default) or
 * copy-left + form-right on ≥lg. Presentational and theme-driven — the form
 * (with submit handling) is your responsibility.
 */
export function MarketingNewsletter({
	title,
	description,
	form,
	disclaimer,
	layout = "centered",
	className,
}: MarketingNewsletterProps) {
	if (layout === "split") {
		return (
			<section className={cn("bg-background py-24 sm:py-32", className)}>
				<div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
					<div className="flex flex-col gap-4">
						<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							{title}
						</h2>
						{description ? (
							<p className="text-pretty text-lg text-muted-foreground">{description}</p>
						) : null}
					</div>
					<div className="flex flex-col gap-3">
						{form}
						{disclaimer ? (
							<p className="text-xs text-muted-foreground">{disclaimer}</p>
						) : null}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center lg:px-8">
				<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
					{title}
				</h2>
				{description ? (
					<p className="text-pretty text-lg text-muted-foreground">{description}</p>
				) : null}
				<div className="flex w-full max-w-md flex-col gap-3">
					{form}
					{disclaimer ? (
						<p className="text-xs text-muted-foreground">{disclaimer}</p>
					) : null}
				</div>
			</div>
		</section>
	);
}
