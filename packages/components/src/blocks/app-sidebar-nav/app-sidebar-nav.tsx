import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A single navigation link in {@link AppSidebarNav}. */
export interface AppNavItem {
	/** Visible label. */
	label: React.ReactNode;
	/** Destination href. */
	href: string;
	/** Optional leading icon (a `ReactNode` — no icon set is bundled). */
	icon?: React.ReactNode;
	/** Marks the current page (applies active styling + `aria-current`). */
	active?: boolean;
}

/** A labelled group of nav items. */
export interface AppNavGroup {
	/** Optional group heading, e.g. "Workspace". */
	title?: React.ReactNode;
	/** The links in this group. */
	items: ReadonlyArray<AppNavItem>;
}

/** Props for {@link AppSidebarNav}. */
export interface AppSidebarNavProps {
	/** Brand block (logo + product name) pinned to the top. */
	brand?: React.ReactNode;
	/** Navigation groups, rendered top to bottom in a scroll region. */
	groups: ReadonlyArray<AppNavGroup>;
	/** Footer block pinned to the bottom (account menu / sign-out). */
	footer?: React.ReactNode;
	/** Additional classes applied to the root `<div>`. */
	className?: string;
}

/**
 * Sidebar navigation for {@link AppShell}: a pinned brand, a scrollable list of
 * grouped links with active states, and a pinned footer. Presentational and
 * theme-driven; drop it into the AppShell `sidebar` slot.
 */
export function AppSidebarNav({ brand, groups, footer, className }: AppSidebarNavProps) {
	return (
		<div className={cn("flex h-full flex-col", className)}>
			{brand ? (
				<div className="flex h-16 flex-none items-center border-b border-border px-4">{brand}</div>
			) : null}

			<nav className="flex-1 overflow-y-auto px-3 py-4">
				{groups.map((group, groupIndex) => (
					<div key={groupIndex} className={cn(groupIndex > 0 && "mt-6")}>
						{group.title ? (
							<p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{group.title}
							</p>
						) : null}
						<ul className="flex flex-col gap-1">
							{group.items.map((item, itemIndex) => (
								<li key={itemIndex}>
									<a
										href={item.href}
										aria-current={item.active ? "page" : undefined}
										className={cn(
											"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-[var(--duration-normal,200ms)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-4 [&_svg]:flex-none",
											item.active
												? "bg-muted text-foreground"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										{item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
										<span>{item.label}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>

			{footer ? <div className="flex-none border-t border-border p-3">{footer}</div> : null}
		</div>
	);
}
