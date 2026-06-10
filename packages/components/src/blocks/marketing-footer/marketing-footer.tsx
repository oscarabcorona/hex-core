import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A link inside a footer column. */
export interface MarketingFooterLink {
	/** Visible label. */
	label: React.ReactNode;
	/** Destination href. */
	href: string;
}

/** A labelled column of links in {@link MarketingFooter}. */
export interface MarketingFooterColumn {
	/** Column heading, e.g. "Product". */
	title: React.ReactNode;
	/** The links in this column. */
	links: ReadonlyArray<MarketingFooterLink>;
}

/** Props for {@link MarketingFooter}. */
export interface MarketingFooterProps {
	/** Brand block (logo + tagline) shown in the lead column. */
	brand?: React.ReactNode;
	/** Link columns rendered beside the brand. */
	columns?: ReadonlyArray<MarketingFooterColumn>;
	/** Social / external icon links shown in the bottom bar. */
	social?: React.ReactNode;
	/** Copyright / legal line in the bottom bar. */
	copyright?: React.ReactNode;
	/** Additional classes applied to the root `<footer>`. */
	className?: string;
}

/**
 * A marketing site footer: a brand block, several columns of links, and a
 * bottom bar with social links and a copyright line. Presentational and
 * theme-driven.
 */
export function MarketingFooter({
	brand,
	columns = [],
	social,
	copyright,
	className,
}: MarketingFooterProps) {
	return (
		<footer className={cn("border-t border-border bg-background", className)}>
			<div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
					{brand ? <div className="col-span-2 lg:col-span-2">{brand}</div> : null}
					{columns.map((column, index) => (
						<div key={index}>
							<h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
							<ul className="mt-4 space-y-3">
								{column.links.map((link, linkIndex) => (
									<li key={linkIndex}>
										<a
											href={link.href}
											className="rounded-sm text-sm text-muted-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{(social || copyright) ? (
					<div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
						{copyright ? <p className="text-sm text-muted-foreground">{copyright}</p> : null}
						{social ? <div className="flex items-center gap-4">{social}</div> : null}
					</div>
				) : null}
			</div>
		</footer>
	);
}
