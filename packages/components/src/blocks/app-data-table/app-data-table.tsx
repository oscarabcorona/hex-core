import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link AppDataTable}. */
export interface AppDataTableProps {
	/** Section title above the table. */
	title?: React.ReactNode;
	/** Optional copy under the title. */
	description?: React.ReactNode;
	/** Toolbar region (search field, filters, "Add" button) aligned right of the title. */
	toolbar?: React.ReactNode;
	/** The table itself — typically a `<DataTable>` or `<Table>`. */
	children: React.ReactNode;
	/** Footer region under the table (pagination, row count). */
	footer?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Page-level data-table view: a header row (title + description and a toolbar),
 * a bordered table surface, and an optional footer for pagination. Layout only
 * — supply the actual table as `children`. Presentational and theme-driven.
 */
export function AppDataTable({
	title,
	description,
	toolbar,
	children,
	footer,
	className,
}: AppDataTableProps) {
	const hasHeader = Boolean(title || description || toolbar);
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			{hasHeader ? (
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					{title || description ? (
						<div>
							{title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
							{description ? (
								<p className="mt-1 text-sm text-muted-foreground">{description}</p>
							) : null}
						</div>
					) : null}
					{toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
				</div>
			) : null}

			<div className="overflow-hidden rounded-xl border border-border bg-card">{children}</div>

			{footer ? (
				<div className="flex flex-col items-center justify-between gap-3 sm:flex-row">{footer}</div>
			) : null}
		</section>
	);
}
