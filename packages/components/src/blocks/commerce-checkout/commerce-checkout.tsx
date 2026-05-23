import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link CommerceCheckout}. */
export interface CommerceCheckoutProps {
	/** The checkout form (contact, shipping, payment fields) — pass your own form. */
	children: React.ReactNode;
	/** Order summary (line items + totals) shown in the right column on ≥lg. */
	summary: React.ReactNode;
	/** Optional page heading above the two columns. */
	title?: React.ReactNode;
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * Checkout layout: the form on the left and a sticky order summary on the
 * right (stacked on mobile). Layout only — supply the form (with its own
 * fieldsets and submit handling) as `children` and the order review as
 * `summary`. Presentational and theme-driven.
 */
export function CommerceCheckout({ children, summary, title, className }: CommerceCheckoutProps) {
	return (
		<section className={cn("bg-background py-12 sm:py-16", className)}>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{title ? (
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
				) : null}
				<div className={cn("grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12", title && "mt-8")}>
					<div className="flex flex-col gap-8">{children}</div>
					<aside aria-label="Order summary">
						<div className="rounded-2xl border border-border bg-card p-6 text-card-foreground lg:sticky lg:top-6">
							{summary}
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
}
