import * as React from "react";
import { cn } from "../../lib/utils.js";

/** One order row in {@link CommerceOrderHistory}. */
export interface CommerceOrderRow {
	/** Order identifier. */
	id: React.ReactNode;
	/** Placed-on date. */
	date: React.ReactNode;
	/** Order total. */
	total: React.ReactNode;
	/** Status badge / text. */
	status: React.ReactNode;
	/** Optional link to the order detail page. */
	href?: string;
}

/** Props for {@link CommerceOrderHistory}. */
export interface CommerceOrderHistoryProps {
	/** Orders to render. */
	orders: ReadonlyArray<CommerceOrderRow>;
	/** Optional section heading. */
	title?: React.ReactNode;
	/** Optional subcopy under the heading. */
	description?: React.ReactNode;
	/** Optional empty-state node, rendered when `orders` is empty. */
	emptyState?: React.ReactNode;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/**
 * Customer order history table: each row is an order with id, date, total,
 * status, and an optional link to the order detail page. Distinct from
 * `commerce-order-summary` (a single order's detail card). Presentational and
 * theme-driven.
 */
export function CommerceOrderHistory({
	orders,
	title,
	description,
	emptyState,
	className,
}: CommerceOrderHistoryProps) {
	const hasHeading = Boolean(title || description);
	return (
		<section className={cn("flex flex-col gap-4", className)}>
			{hasHeading ? (
				<div className="flex flex-col gap-1">
					{title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
					{description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
				</div>
			) : null}
			{orders.length === 0 ? (
				emptyState ?? (
					<div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
						No orders yet.
					</div>
				)
			) : (
				<div className="overflow-hidden rounded-xl border border-border bg-card">
					<table className="w-full text-sm text-card-foreground">
						<thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
							<tr>
								<th scope="col" className="px-4 py-3 text-left font-medium">Order</th>
								<th scope="col" className="px-4 py-3 text-left font-medium">Date</th>
								<th scope="col" className="px-4 py-3 text-left font-medium">Total</th>
								<th scope="col" className="px-4 py-3 text-left font-medium">Status</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									<span className="sr-only">View</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{orders.map((order, index) => (
								<tr key={index} className="hover:bg-muted/30">
									<td className="px-4 py-3 font-medium text-foreground">{order.id}</td>
									<td className="px-4 py-3 text-muted-foreground">{order.date}</td>
									<td className="px-4 py-3 text-foreground">{order.total}</td>
									<td className="px-4 py-3">{order.status}</td>
									<td className="px-4 py-3 text-right">
										{order.href ? (
											<a
												href={order.href}
												className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											>
												View<span className="sr-only"> order {order.id}</span>
											</a>
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
