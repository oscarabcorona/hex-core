"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A primary nav link in {@link MarketingHeader}. */
export interface MarketingNavLink {
	/** Visible label. */
	label: React.ReactNode;
	/** Destination href. */
	href: string;
}

/** Props for {@link MarketingHeader}. */
export interface MarketingHeaderProps {
	/** Brand mark — a logo / wordmark node, ideally wrapping a link to "/". */
	logo: React.ReactNode;
	/** Primary navigation links shown inline on ≥md and stacked in the mobile panel. */
	links?: ReadonlyArray<MarketingNavLink>;
	/** Trailing actions (sign-in / CTA buttons). */
	actions?: React.ReactNode;
	/** Additional classes applied to the root `<header>`. */
	className?: string;
}

/** Decorative menu / close glyphs. `aria-hidden` — the button carries the label. */
function MenuGlyph({ open }: { open: boolean }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-5">
			{open ? (
				<path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
			) : (
				<path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
			)}
		</svg>
	);
}

/**
 * A marketing site header: brand mark, inline primary nav on desktop, and a
 * collapsible panel on mobile. Client Component (it owns the open/close state).
 * Theme-driven; supply your own logo and action buttons.
 */
export function MarketingHeader({ logo, links = [], actions, className }: MarketingHeaderProps) {
	const [open, setOpen] = React.useState(false);
	return (
		<header className={cn("border-b border-border bg-background", className)}>
			<nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
				<div className="flex-none">{logo}</div>

				{links.length > 0 ? (
					<ul className="hidden items-center gap-8 md:flex">
						{links.map((link, index) => (
							<li key={index}>
								<a
									href={link.href}
									className="text-sm font-medium text-muted-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:text-foreground"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				) : null}

				<div className="hidden items-center gap-3 md:flex">{actions}</div>

				{(links.length > 0 || actions) ? (
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
						aria-expanded={open}
						aria-controls="marketing-header-mobile"
						aria-label={open ? "Close menu" : "Open menu"}
						onClick={() => setOpen((value) => !value)}
					>
						<MenuGlyph open={open} />
					</button>
				) : null}
			</nav>

			{open ? (
				<div id="marketing-header-mobile" className="border-t border-border md:hidden">
					<div className="space-y-1 px-6 py-4">
						{links.map((link, index) => (
							<a
								key={index}
								href={link.href}
								className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted hover:text-foreground"
							>
								{link.label}
							</a>
						))}
						{actions ? (
							<div className="flex flex-col gap-3 pt-4 [&_button]:w-full [&>*]:w-full">{actions}</div>
						) : null}
					</div>
				</div>
			) : null}
		</header>
	);
}
