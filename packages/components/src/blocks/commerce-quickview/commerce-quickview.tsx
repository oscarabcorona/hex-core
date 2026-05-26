import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link CommerceQuickview}. */
export interface CommerceQuickviewProps {
	/** Product name. */
	name: React.ReactNode;
	/** Display price. */
	price: React.ReactNode;
	/** Single product image — a `ReactNode` (`<img>` or media). */
	media: React.ReactNode;
	/** Optional eyebrow above the name (brand / category). */
	eyebrow?: React.ReactNode;
	/** Optional short body — abbreviated vs the full detail page. */
	description?: React.ReactNode;
	/** Option selectors (size, color, quantity) — pass your own controls. */
	options?: React.ReactNode;
	/** Primary actions (add-to-cart). */
	actions?: React.ReactNode;
	/** Optional "see full details" link (typically to the PDP). */
	detailsLink?: React.ReactNode;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/**
 * Quick-look product body — composable into a consumer's `<Dialog>` or
 * `<Sheet>` to preview a product without leaving the listing. Distinct from
 * the full `commerce-product-detail` (which is the standalone PDP layout):
 * compact two-column (media left, info right) with the essentials and a
 * "see full details" link to the PDP.
 */
export function CommerceQuickview({
	name,
	price,
	media,
	eyebrow,
	description,
	options,
	actions,
	detailsLink,
	className,
}: CommerceQuickviewProps) {
	return (
		<div className={cn("grid gap-6 sm:grid-cols-2 sm:gap-8", className)}>
			<div className="overflow-hidden rounded-xl bg-muted [&_img]:size-full [&_img]:object-cover">
				{media}
			</div>
			<div className="flex flex-col gap-5">
				<div className="flex flex-col gap-2">
					{eyebrow ? (
						<p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
					) : null}
					<h2 className="text-xl font-semibold tracking-tight text-foreground">{name}</h2>
					<p className="text-lg font-semibold text-foreground">{price}</p>
				</div>
				{description ? (
					<p className="text-pretty text-sm text-muted-foreground">{description}</p>
				) : null}
				{options ? <div className="flex flex-col gap-4">{options}</div> : null}
				{actions ? <div className="flex flex-col gap-2">{actions}</div> : null}
				{detailsLink ? (
					<div className="mt-auto text-sm">{detailsLink}</div>
				) : null}
			</div>
		</div>
	);
}
