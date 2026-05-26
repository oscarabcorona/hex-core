import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One line item in {@link CommerceOrderSummary}. */
export interface CommerceOrderItem {
	/** Product name. */
	name: React.ReactNode;
	/** Line price. */
	price: React.ReactNode;
	/** Quantity. */
	quantity: React.ReactNode;
	/** Optional thumbnail. */
	image?: React.ReactNode;
	/** Optional secondary line (variant / size). */
	meta?: React.ReactNode;
}

/** One total row in {@link CommerceOrderSummary} (subtotal, shipping, tax, total). */
export interface CommerceOrderTotal {
	label: React.ReactNode;
	value: React.ReactNode;
	/** Visually emphasize the row (e.g. the final Total). */
	emphasized?: boolean;
}

/** Props for {@link CommerceOrderSummary}. */
export interface CommerceOrderSummaryProps {
	/** Order identifier (number / hash). */
	orderId: React.ReactNode;
	/** Line items. */
	items: ReadonlyArray<CommerceOrderItem>;
	/** Totals rows (subtotal, shipping, tax, total). */
	totals: ReadonlyArray<CommerceOrderTotal>;
	/** Optional status badge / text. */
	status?: React.ReactNode;
	/** Optional meta panel (placed date, shipping address, payment method). */
	meta?: React.ReactNode;
	/** Optional trailing actions (download invoice, contact support). */
	actions?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Read-only order detail card: header (order id + status) + line items +
 * totals breakdown + optional meta panel + optional actions. Distinct from
 * `commerce-cart` (which is editable). Use on order confirmation /
 * order-detail pages. Presentational and theme-driven.
 */
export function CommerceOrderSummary({
	orderId,
	items,
	totals,
	status,
	meta,
	actions,
	className,
}: CommerceOrderSummaryProps) {
	return (
		<section className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-wrap items-baseline justify-between gap-3">
				<h2 className="text-lg font-semibold text-foreground">Order {orderId}</h2>
				{status ? <div className="flex-none">{status}</div> : null}
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
				<ul className="divide-y divide-border">
					{items.map((item, index) => (
						<li key={index} className="flex gap-4 p-4">
							{item.image ? (
								<div className="size-16 flex-none overflow-hidden rounded-lg bg-muted [&_img]:size-full [&_img]:object-cover">
									{item.image}
								</div>
							) : null}
							<div className="flex flex-1 flex-col gap-1">
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-sm font-medium text-foreground">{item.name}</h3>
									<span className="flex-none text-sm font-medium text-foreground">{item.price}</span>
								</div>
								{item.meta ? <p className="text-sm text-muted-foreground">{item.meta}</p> : null}
								<p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
							</div>
						</li>
					))}
				</ul>
				<dl className="flex flex-col gap-2 border-t border-border bg-card p-4">
					{totals.map((total, index) => (
						<div
							key={index}
							className={cn(
								"flex items-center justify-between",
								total.emphasized
									? "border-t border-border pt-2 text-base font-semibold text-foreground"
									: "text-sm text-muted-foreground",
							)}
						>
							<dt>{total.label}</dt>
							<dd>{total.value}</dd>
						</div>
					))}
				</dl>
			</div>

			{meta ? (
				<div className="rounded-xl border border-border bg-card p-4 text-sm text-card-foreground">
					{meta}
				</div>
			) : null}

			{actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
		</section>
	);
}
