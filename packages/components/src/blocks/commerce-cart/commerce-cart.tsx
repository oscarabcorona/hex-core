import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A line item in {@link CommerceCart}. */
export interface CommerceCartItem {
	/** Product name. */
	name: React.ReactNode;
	/** Line price, e.g. "$48". */
	price: React.ReactNode;
	/** Quantity (rendered as text; pass your own stepper via `controls` for editing). */
	quantity: React.ReactNode;
	/** Optional thumbnail — a `ReactNode` (`<img>`); none is bundled. */
	image?: React.ReactNode;
	/** Optional secondary line (variant, color, size). */
	meta?: React.ReactNode;
	/** Optional per-row controls (quantity stepper, remove button). */
	controls?: React.ReactNode;
}

/** Props for {@link CommerceCart}. */
export interface CommerceCartProps {
	/** The cart line items. */
	items: ReadonlyArray<CommerceCartItem>;
	/** Order summary rows (subtotal, shipping, total) — pass your own markup. */
	summary?: React.ReactNode;
	/** Primary action(s) (proceed to checkout) — pass a `<Button>`. */
	actions?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Shopping cart layout: a list of line items on the left and a sticky order
 * summary on the right (stacked on mobile). Presentational and theme-driven —
 * pass quantity steppers / remove buttons as per-item `controls` and the
 * totals as `summary`.
 */
export function CommerceCart({ items, summary, actions, className }: CommerceCartProps) {
	return (
		<section className={cn("bg-background py-12 sm:py-16", className)}>
			<div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-3 lg:gap-12 lg:px-8">
				<ul className="divide-y divide-border lg:col-span-2">
					{items.map((item, index) => (
						<li key={index} className="flex gap-4 py-6 first:pt-0">
							{item.image ? (
								<div className="size-24 flex-none overflow-hidden rounded-lg bg-muted [&_img]:size-full [&_img]:object-cover">
									{item.image}
								</div>
							) : null}
							<div className="flex flex-1 flex-col gap-1">
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-sm font-medium text-foreground">{item.name}</h3>
									<span className="flex-none text-sm font-medium text-foreground">{item.price}</span>
								</div>
								{item.meta ? <p className="text-sm text-muted-foreground">{item.meta}</p> : null}
								<div className="mt-auto flex items-center justify-between gap-3 pt-2">
									<span className="text-sm text-muted-foreground">Qty {item.quantity}</span>
									{item.controls ? <div className="flex items-center gap-2">{item.controls}</div> : null}
								</div>
							</div>
						</li>
					))}
				</ul>

				{summary || actions ? (
					<div className="lg:col-span-1">
						<div className="rounded-2xl border border-border bg-card p-6 text-card-foreground lg:sticky lg:top-6">
							{summary ? <div className="flex flex-col gap-3">{summary}</div> : null}
							{actions ? <div className="mt-6 [&_button]:w-full [&>*]:w-full">{actions}</div> : null}
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}
