import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link MarketingCta}. */
export interface MarketingCtaProps {
	/** The closing headline. Required. */
	title: React.ReactNode;
	/** Supporting subcopy below the title. */
	description?: React.ReactNode;
	/** Call-to-action buttons. Pass one or more `<Button>` elements. */
	actions?: React.ReactNode;
	/** `simple` (default) sits on the page background; `panel` wraps the copy in a primary-filled card. */
	variant?: "simple" | "panel";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * A closing call-to-action band. `simple` reads as plain centered copy on the
 * page background; `panel` lifts it into a primary-filled rounded card for a
 * stronger end-of-page push. Presentational and theme-driven. See the schema's
 * `examples` for usage.
 */
export function MarketingCta({
	title,
	description,
	actions,
	variant = "simple",
	className,
}: MarketingCtaProps) {
	const panel = variant === "panel";
	return (
		<section className={cn("bg-background", panel ? "py-24 sm:py-32" : "py-16 sm:py-24", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div
					className={cn(
						"flex flex-col items-center gap-6 text-center",
						panel && "rounded-3xl bg-primary px-6 py-16 sm:px-16 sm:py-20",
					)}
				>
					<h2
						className={cn(
							"text-balance text-3xl font-semibold tracking-tight sm:text-4xl",
							panel ? "text-primary-foreground" : "text-foreground",
						)}
					>
						{title}
					</h2>
					{description ? (
						<p
							className={cn(
								"max-w-2xl text-pretty text-lg",
								panel ? "text-primary-foreground/80" : "text-muted-foreground",
							)}
						>
							{description}
						</p>
					) : null}
					{actions ? (
						<div className="flex flex-wrap items-center justify-center gap-4">{actions}</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
