import { cn } from "@hex-core/components/utils";
import type { TocSection } from "./on-this-page";

/**
 * Compact "On this page" nav for the `lg` breakpoint (1024–1279px), where the
 * right-rail TOC is too cramped. Renders a wrapping row of anchor links —
 * server-rendered, browser-native hash navigation, keyboard + right-click
 * friendly (no JS state). The responsive range is baked into the default so
 * callers can't silently hide it by forgetting the override class.
 */
export function OnThisPageCompact({
	sections,
	className,
}: {
	sections: readonly TocSection[];
	className?: string;
}) {
	if (sections.length === 0) return null;

	return (
		<nav
			aria-label="On this page"
			className={cn(
				"hidden rounded-md border bg-muted/30 px-3 py-2 lg:block xl:hidden",
				className,
			)}
		>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
				<span className="font-semibold uppercase tracking-wider text-foreground/70">
					On this page
				</span>
				{sections.map((s) => (
					<a
						key={s.id}
						href={`#${s.id}`}
						className="text-muted-foreground transition-all duration-200 ease-out hover:text-foreground"
					>
						{s.title}
					</a>
				))}
			</div>
		</nav>
	);
}
