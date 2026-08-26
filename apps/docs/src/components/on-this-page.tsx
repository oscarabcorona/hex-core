"use client";

import { useEffect, useState } from "react";
import { cn } from "@hex-core/components/utils";

/** One entry in the right-rail TOC. `id` must match a DOM element on the page. */
export interface TocSection {
	id: string;
	title: string;
}

/**
 * Right-rail "On This Page" TOC with IntersectionObserver-driven scroll-spy.
 * The currently-visible section is highlighted; clicking a link scroll-jumps
 * and updates the URL hash without triggering a full scroll-spy re-measure.
 */
export function OnThisPage({ sections }: { sections: readonly TocSection[] }) {
	const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

	useEffect(() => {
		if (sections.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					setActiveId(visible[0].target.id);
				}
			},
			{ rootMargin: "-80px 0px -60% 0px", threshold: 0 },
		);
		for (const s of sections) {
			const el = document.getElementById(s.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [sections]);

	return (
		<aside
			aria-label="On this page"
			className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-48 shrink-0 overflow-y-auto py-6 pl-4 xl:block"
		>
			<h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				On This Page
			</h4>
			<ul className="space-y-1.5">
				{sections.map((section) => {
					const isActive = activeId === section.id;
					return (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								className={cn(
									"block text-sm transition-all duration-200 ease-out",
									isActive
										? "font-medium text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{section.title}
							</a>
						</li>
					);
				})}
			</ul>
		</aside>
	);
}
