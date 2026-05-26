import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One incentive in {@link CommerceIncentives}. */
export interface CommerceIncentive {
	/** Incentive title (e.g. "Free shipping over $50"). */
	title: React.ReactNode;
	/** Short body under the title. */
	description?: React.ReactNode;
	/** Optional leading icon (a `ReactNode` — no icon set bundled). */
	icon?: React.ReactNode;
}

/** Props for {@link CommerceIncentives}. */
export interface CommerceIncentivesProps {
	/** Incentives to render. */
	incentives: ReadonlyArray<CommerceIncentive>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Items per row on ≥lg: `three` (default) or `four`. */
	columns?: "three" | "four";
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<CommerceIncentivesProps["columns"]>, string> = {
	three: "sm:grid-cols-3",
	four: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Value-prop band: a row of incentives (free shipping, returns, support,
 * secure checkout) — each with an optional icon, title, and short body.
 * Presentational and theme-driven. Sits well below the product grid or
 * in the footer area of a storefront.
 */
export function CommerceIncentives({
	incentives,
	eyebrow,
	title,
	description,
	columns = "three",
	className,
}: CommerceIncentivesProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("bg-background py-16 sm:py-20", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{hasHeading ? (
					<div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
						{eyebrow ? (
							<p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
						) : null}
						{title ? (
							<h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="text-pretty text-base text-muted-foreground">{description}</p>
						) : null}
					</div>
				) : null}
				<div
					className={cn(
						"grid grid-cols-1 gap-8",
						COLUMN_CLASS[columns],
						hasHeading && "mt-12",
					)}
				>
					{incentives.map((incentive, index) => (
						<div key={index} className="flex flex-col items-start gap-2">
							{incentive.icon ? (
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-5">
									{incentive.icon}
								</div>
							) : null}
							<h3 className="text-sm font-semibold text-foreground">{incentive.title}</h3>
							{incentive.description ? (
								<p className="text-sm text-muted-foreground">{incentive.description}</p>
							) : null}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
