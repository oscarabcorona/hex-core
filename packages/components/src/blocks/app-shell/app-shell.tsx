"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for {@link AppShell}. */
export interface AppShellProps {
	/** Sidebar content — typically an `<AppSidebarNav>`. Fixed on ≥lg, a drawer on mobile. */
	sidebar: React.ReactNode;
	/** Top-bar content (breadcrumbs, search, account menu) shown right of the mobile menu button. */
	header?: React.ReactNode;
	/** Main page content. */
	children: React.ReactNode;
	/** Additional classes applied to the root wrapper. */
	className?: string;
}

/** Decorative hamburger / close glyphs. `aria-hidden` — the button carries the label. */
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
 * Application layout frame: a fixed left sidebar on ≥lg, a sticky top bar, and
 * a scrollable main region. On mobile the sidebar collapses behind a menu
 * button and slides in as an overlay drawer. Client Component (owns the
 * drawer state). Theme-driven; pass your own nav and header content.
 */
export function AppShell({ sidebar, header, children, className }: AppShellProps) {
	const [open, setOpen] = React.useState(false);
	return (
		<div className={cn("min-h-screen bg-background", className)}>
			{/* Mobile drawer */}
			{open ? (
				<div className="relative z-40 lg:hidden">
					<button
						type="button"
						aria-label="Close menu"
						className="fixed inset-0 bg-foreground/40"
						onClick={() => setOpen(false)}
					/>
					<aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card">
						{sidebar}
					</aside>
				</div>
			) : null}

			{/* Desktop sidebar */}
			<aside className="hidden border-r border-border bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
				{sidebar}
			</aside>

			<div className="lg:pl-64">
				<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
						aria-label="Open menu"
						aria-expanded={open}
						onClick={() => setOpen(true)}
					>
						<MenuGlyph open={false} />
					</button>
					<div className="flex flex-1 items-center justify-between gap-4">{header}</div>
				</header>
				<main className="p-4 sm:p-6 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
