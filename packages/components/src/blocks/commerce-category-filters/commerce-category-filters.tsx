import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One filter group in {@link CommerceCategoryFilters}. */
export interface CommerceFilterGroup {
	/** Group title (e.g. "Price", "Color", "Size"). */
	title: React.ReactNode;
	/** The filter controls — caller composes (checkboxes, radios, range slider, etc.). */
	content: React.ReactNode;
	/** Whether the group starts expanded. Defaults to `true`. */
	defaultOpen?: boolean;
}

/** Props for {@link CommerceCategoryFilters}. */
export interface CommerceCategoryFiltersProps {
	/** Filter groups, each a labeled collapsible fieldset. */
	groups: ReadonlyArray<CommerceFilterGroup>;
	/** Optional sidebar title (e.g. "Filters"). */
	title?: React.ReactNode;
	/** Optional header actions (e.g. a "Clear all" link). */
	actions?: React.ReactNode;
	/** Additional classes applied to the root `<aside>`. */
	className?: string;
}

/**
 * Filter sidebar for a category page: a stack of collapsible filter groups
 * (price, color, size, brand). Uses native `<details>` so no JS is needed
 * for collapse — Server Component friendly. Each group's controls are
 * caller-supplied; state and submission live with the consumer.
 */
export function CommerceCategoryFilters({
	groups,
	title,
	actions,
	className,
}: CommerceCategoryFiltersProps) {
	return (
		<aside className={cn("flex flex-col gap-2", className)} aria-label="Filters">
			{(title || actions) ? (
				<div className="flex items-center justify-between gap-3 pb-2">
					{title ? <h2 className="text-sm font-semibold text-foreground">{title}</h2> : null}
					{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
				</div>
			) : null}
			<div className="flex flex-col divide-y divide-border border-y border-border">
				{groups.map((group, index) => (
					<details
						key={index}
						open={group.defaultOpen ?? true}
						className="group flex flex-col py-3 [&[open]_svg]:rotate-180"
					>
						<summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
							{group.title}
							<svg
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
								className="size-4 text-muted-foreground transition-transform duration-200 ease-out"
							>
								<path
									fillRule="evenodd"
									d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
									clipRule="evenodd"
								/>
							</svg>
						</summary>
						<div className="pt-3">{group.content}</div>
					</details>
				))}
			</div>
		</aside>
	);
}
