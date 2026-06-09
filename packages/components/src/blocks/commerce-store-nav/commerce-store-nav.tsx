"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A primary category in {@link CommerceStoreNav}. */
export interface CommerceStoreCategory {
	/** Visible label. */
	label: React.ReactNode;
	/** Destination href. */
	href: string;
}

/** Props for {@link CommerceStoreNav}. */
export interface CommerceStoreNavProps {
	/** Brand mark — a logo / wordmark node, ideally wrapping a link to "/". */
	logo: React.ReactNode;
	/** Primary categories shown inline on ≥md and stacked in the mobile panel. */
	categories?: ReadonlyArray<CommerceStoreCategory>;
	/** Optional search region (an `<Input>` or composed search affordance). */
	search?: React.ReactNode;
	/** Trailing actions — typically a cart link/button, sign-in link. */
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
 * Storefront top navigation: brand + primary categories + search slot +
 * trailing actions (cart, sign-in). Desktop inline nav; mobile collapses
 * to a hamburger panel. Client Component (owns the open/close state).
 * Theme-driven; supply your own logo and action buttons.
 */
export function CommerceStoreNav({
	logo,
	categories = [],
	search,
	actions,
	className,
}: CommerceStoreNavProps) {
	const [open, setOpen] = React.useState(false);
	return (
		<header className={cn("border-b border-border bg-background", className)}>
			<nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
				<div className="flex-none">{logo}</div>

				{categories.length > 0 ? (
					<ul className="hidden items-center gap-6 md:flex">
						{categories.map((category, index) => (
							<li key={index}>
								<a
									href={category.href}
									className="text-sm font-medium text-muted-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:text-foreground"
								>
									{category.label}
								</a>
							</li>
						))}
					</ul>
				) : null}

				{search ? <div className="hidden flex-1 md:flex md:max-w-xs md:justify-end">{search}</div> : null}
				<div className="hidden items-center gap-3 md:flex">{actions}</div>

				<button
					type="button"
					className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
					aria-expanded={open}
					aria-controls="commerce-store-nav-mobile"
					aria-label={open ? "Close menu" : "Open menu"}
					onClick={() => setOpen((value) => !value)}
				>
					<MenuGlyph open={open} />
				</button>
			</nav>

			{open ? (
				<div id="commerce-store-nav-mobile" className="border-t border-border md:hidden">
					<div className="space-y-1 px-6 py-4">
						{search ? <div className="pb-4">{search}</div> : null}
						{categories.map((category, index) => (
							<a
								key={index}
								href={category.href}
								className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted hover:text-foreground"
							>
								{category.label}
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
