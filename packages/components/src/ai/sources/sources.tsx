"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn, safeUrl } from "../../lib/utils.js";
import { Citation } from "../citation/citation.js";

/**
 * Bordered card listing 1–N citation chips for a RAG response.
 *
 * Header reads "N sources" and is a clickable Radix Collapsible trigger;
 * body renders one `<Citation>` per source (re-using the in-house chip).
 * Defaults to open so consumers don't have to expand to see what was
 * cited.
 *
 * @example
 * <Sources
 *   sources={[
 *     { title: "Auth research", url: "https://example.com/auth", page: 3 },
 *     { title: "OAuth 2.1 spec", url: "https://oauth.net/2.1" },
 *   ]}
 * />
 */
export interface SourcesProps {
	/** Citation rows. Each becomes a `<Citation>` chip. */
	sources: SourceRef[];
	/** Whether the list is expanded by default. */
	defaultOpen?: boolean;
	className?: string;
}

/** Per-source data passed to a Citation chip. */
export interface SourceRef {
	title: string;
	url?: string;
	page?: number;
	/** Optional 1-based index. Falls back to array position. Use to keep
	 * the inline `<InlineCitation>` index aligned with the panel row when
	 * the model emits non-1-based numbering. */
	index?: number;
}

/**
 * Render a sources panel for an LLM response. Returns null when the
 * sources array is empty — consumers don't get a "0 sources" empty
 * card; they just don't render the panel at all.
 *
 * @param props - The list of sources + open-state default.
 * @returns A Collapsible wrapping a Citation cluster, or null if empty.
 */
function Sources({ sources, defaultOpen = true, className }: SourcesProps) {
	if (sources.length === 0) return null;
	const count = sources.length;
	const headerLabel = count === 1 ? "1 source" : `${count} sources`;

	return (
		<CollapsiblePrimitive.Root
			defaultOpen={defaultOpen}
			className={cn(
				"overflow-hidden rounded-md border border-border bg-card text-card-foreground",
				className,
			)}
		>
			<CollapsiblePrimitive.Trigger
				className={cn(
					"group flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-muted-foreground",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:text-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<DocStackGlyph />
				<span className="font-medium">{headerLabel}</span>
				<Chevron />
			</CollapsiblePrimitive.Trigger>
			<CollapsiblePrimitive.Content className="overflow-hidden border-t border-foreground/[0.06]">
				<div className="flex flex-wrap items-center gap-1.5 p-2">
					{sources.map((s, i) => (
						<Citation
							key={`${s.url ?? s.title}-${i}`}
							title={s.title}
							// Gate the URL even though markdown-path callers already
							// route through `safeUrl` — direct-JSX consumers can hand
							// us anything.
							url={safeUrl(s.url)}
							page={s.page}
							index={s.index ?? i + 1}
						/>
					))}
				</div>
			</CollapsiblePrimitive.Content>
		</CollapsiblePrimitive.Root>
	);
}

function DocStackGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0"
		>
			<path d="M5 3h7l1.5 1.5V13H5V3z" />
			<path d="M3 5v8.5L4.5 15H11" />
		</svg>
	);
}

function Chevron() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
		>
			<path d="M4 6l4 4 4-4" />
		</svg>
	);
}

export { Sources };
