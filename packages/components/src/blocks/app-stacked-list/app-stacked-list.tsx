import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One row in {@link AppStackedList}. */
export interface AppStackedListItem {
	/** Row title — primary identifier (name, subject, etc.). */
	title: React.ReactNode;
	/** Optional short body under the title. */
	description?: React.ReactNode;
	/** Optional right-aligned meta on the title line (timestamp, count, status). */
	meta?: React.ReactNode;
	/** Optional leading element (avatar / icon / status dot). */
	leading?: React.ReactNode;
	/** Optional trailing action region (button / menu / kebab). */
	actions?: React.ReactNode;
	/** Optional href — makes the whole row a single linked surface. */
	href?: string;
}

/** Props for {@link AppStackedList}. */
export interface AppStackedListProps {
	/** Items to render. */
	items: ReadonlyArray<AppStackedListItem>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Show dividers between rows. Defaults to `true`. */
	divided?: boolean;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/** Row body shared by linked and unlinked variants. */
function RowBody({ item }: { item: AppStackedListItem }) {
	return (
		<>
			{item.leading ? <div className="flex-none">{item.leading}</div> : null}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-center justify-between gap-3">
					<h3 className="truncate text-sm font-medium text-foreground">{item.title}</h3>
					{item.meta ? (
						<span className="flex-none text-xs text-muted-foreground">{item.meta}</span>
					) : null}
				</div>
				{item.description ? (
					<p className="truncate text-sm text-muted-foreground">{item.description}</p>
				) : null}
			</div>
			{item.actions ? <div className="flex-none">{item.actions}</div> : null}
		</>
	);
}

/**
 * Labeled stacked list of items (members, inbox, threads, notifications).
 * Each row: leading element + title + meta + description + trailing actions.
 * Rows become a single linked surface when `href` is set. Distinct from
 * `app-data-table` (no columns / no header). Presentational and theme-driven.
 */
export function AppStackedList({
	items,
	eyebrow,
	title,
	description,
	divided = true,
	className,
}: AppStackedListProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			{hasHeading ? (
				<div className="flex flex-col gap-1">
					{eyebrow ? (
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
					) : null}
					{title ? (
						<h2 className="text-lg font-semibold text-foreground">{title}</h2>
					) : null}
					{description ? (
						<p className="text-sm text-muted-foreground">{description}</p>
					) : null}
				</div>
			) : null}
			<ul
				className={cn(
					"flex flex-col overflow-hidden rounded-xl border border-border bg-card",
					divided && "divide-y divide-border",
				)}
			>
				{items.map((item, index) =>
					item.href ? (
						<li key={index}>
							<a
								href={item.href}
								className="flex items-center gap-4 px-4 py-3 text-card-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
							>
								<RowBody item={item} />
							</a>
						</li>
					) : (
						<li
							key={index}
							className="flex items-center gap-4 px-4 py-3 text-card-foreground"
						>
							<RowBody item={item} />
						</li>
					),
				)}
			</ul>
		</section>
	);
}
