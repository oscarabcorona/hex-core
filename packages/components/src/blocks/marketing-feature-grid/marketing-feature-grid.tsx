import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A single feature cell in {@link MarketingFeatureGrid}. */
export interface MarketingFeature {
	/** Optional leading icon (a `ReactNode` so any icon set works — none is bundled). */
	icon?: React.ReactNode;
	/** Feature name. */
	title: React.ReactNode;
	/** One-to-two sentence explanation. */
	description: React.ReactNode;
}

/** Props for {@link MarketingFeatureGrid}. */
export interface MarketingFeatureGridProps {
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** The features to render. */
	features: ReadonlyArray<MarketingFeature>;
	/** Grid width on ≥lg: `two` or `three` (default) columns. */
	columns?: "two" | "three";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * A marketing feature grid: an optional heading block above a responsive grid
 * of icon + title + description cells. Presentational and theme-driven. See the
 * schema's `examples` for usage.
 */
export function MarketingFeatureGrid({
	eyebrow,
	title,
	description,
	features,
	columns = "three",
	className,
}: MarketingFeatureGridProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{hasHeading ? (
					<div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
						{eyebrow ? (
							<p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
						) : null}
						{title ? (
							<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="text-pretty text-lg text-muted-foreground">{description}</p>
						) : null}
					</div>
				) : null}
				<div
					className={cn(
						"grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2",
						columns === "three" ? "lg:grid-cols-3" : "lg:grid-cols-2",
						hasHeading && "mt-16",
					)}
				>
					{features.map((feature, index) => (
						<div key={index} className="flex flex-col items-start gap-3">
							{feature.icon ? (
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-5">
									{feature.icon}
								</div>
							) : null}
							<h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
							<p className="text-pretty text-sm text-muted-foreground">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
