import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One card in {@link AppGridList}. */
export interface AppGridListItem {
	/** Card title. */
	title: React.ReactNode;
	/** Optional body under the title. */
	description?: React.ReactNode;
	/** Optional small meta below the title (timestamp, count, status). */
	meta?: React.ReactNode;
	/** Optional leading media region (avatar / icon / preview image). */
	leading?: React.ReactNode;
	/** Optional trailing action region (button / menu). */
	actions?: React.ReactNode;
	/** Optional href — makes the whole card a single linked surface. */
	href?: string;
}

/** Props for {@link AppGridList}. */
export interface AppGridListProps {
	/** Items to render as cards. */
	items: ReadonlyArray<AppGridListItem>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Cards per row on ≥lg: `two` or `three` (default). */
	columns?: "two" | "three";
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<AppGridListProps["columns"]>, string> = {
	two: "sm:grid-cols-2",
	three: "sm:grid-cols-2 lg:grid-cols-3",
};

/** Card body shared by linked and unlinked variants. */
function CardBody({ item }: { item: AppGridListItem }) {
	return (
		<>
			{item.leading ? <div className="flex-none">{item.leading}</div> : null}
			<div className="flex flex-1 flex-col gap-1">
				<h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
				{item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
				{item.description ? (
					<p className="text-pretty text-sm text-muted-foreground">{item.description}</p>
				) : null}
			</div>
			{item.actions ? <div className="mt-auto flex items-center gap-2 pt-2">{item.actions}</div> : null}
		</>
	);
}

/**
 * Grid variant of {@link AppStackedList} — same item shape, rendered as cards
 * in a 2- or 3-column grid. Each card: optional leading media + title + meta
 * + description + actions. Cards become a single linked surface when `href`
 * is set. Presentational and theme-driven.
 */
export function AppGridList({
	items,
	eyebrow,
	title,
	description,
	columns = "three",
	className,
}: AppGridListProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			{hasHeading ? (
				<div className="flex flex-col gap-1">
					{eyebrow ? (
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
					) : null}
					{title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
					{description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
				</div>
			) : null}
			<div className={cn("grid grid-cols-1 gap-4", COLUMN_CLASS[columns])}>
				{items.map((item, index) =>
					item.href ? (
						<a
							key={index}
							href={item.href}
							className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors duration-200 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<CardBody item={item} />
						</a>
					) : (
						<article
							key={index}
							className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
						>
							<CardBody item={item} />
						</article>
					),
				)}
			</div>
		</section>
	);
}
