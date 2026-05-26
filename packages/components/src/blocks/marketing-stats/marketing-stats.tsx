import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One headline statistic in {@link MarketingStats}. */
export interface MarketingStat {
	/** The big number — e.g. "12,480", "$48M", "99.9%". */
	value: React.ReactNode;
	/** Short label under the value. */
	label: React.ReactNode;
	/** Optional one-line context under the label. */
	description?: React.ReactNode;
}

/** Props for {@link MarketingStats}. */
export interface MarketingStatsProps {
	/** Stats to display. */
	stats: ReadonlyArray<MarketingStat>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Tiles per row on ≥lg: `three` (default) or `four`. */
	columns?: "three" | "four";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<MarketingStatsProps["columns"]>, string> = {
	three: "sm:grid-cols-3",
	four: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * A marketing stats band: optional heading above a grid of big-number tiles
 * (value, label, optional context). Distinct from `app-stats` — no change
 * deltas, larger typography, designed for landing-page "by the numbers"
 * sections. Presentational and theme-driven.
 */
export function MarketingStats({
	stats,
	eyebrow,
	title,
	description,
	columns = "three",
	className,
}: MarketingStatsProps) {
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
				<dl
					className={cn(
						"grid grid-cols-1 gap-8",
						COLUMN_CLASS[columns],
						hasHeading && "mt-16",
					)}
				>
					{stats.map((stat, index) => (
						<div key={index} className="flex flex-col items-start gap-2">
							<dt className="text-sm font-medium text-muted-foreground">{stat.label}</dt>
							<dd className="order-first text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
								{stat.value}
							</dd>
							{stat.description ? (
								<p className="text-sm text-muted-foreground">{stat.description}</p>
							) : null}
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
