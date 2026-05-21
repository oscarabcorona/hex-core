"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn, safeUrl } from "../../lib/utils.js";

/**
 * Inline footnote-style reference with a hover-preview popover.
 *
 * Pairs with `<Sources>` for the bottom-of-card list. Block-level
 * `<Citation>` chips are too large to embed mid-sentence; this primitive
 * fills the inline-text gap with a `<sup>[N]</sup>` and an
 * Anthropic-style hover preview showing the source title + URL.
 *
 * The Markdown component routes `[N](url)` shapes through this slot —
 * authors don't write the JSX directly in the streaming path.
 *
 * @example
 * The frontier models all publish reasoning evals
 * <InlineCitation index={1} title="Anthropic — Claude Sonnet 4.5"
 *   url="https://anthropic.com/claude" />.
 */
export interface InlineCitationProps {
	/** Footnote number (1-based). Renders inside the visible `<sup>`. */
	index: number;
	/** Source title shown in the hover preview. */
	title: string;
	/** Optional URL — when set, the trigger becomes a focusable anchor. */
	url?: string;
	/** Optional excerpt or context shown under the title in the preview. */
	excerpt?: string;
	/** Open delay in ms (matches Radix default ~700). */
	openDelay?: number;
	className?: string;
}

/**
 * Render an inline citation reference with hover preview.
 * @param props - Index, title, optional url + excerpt.
 * @returns A `<sup>` with a Radix HoverCard popover.
 */
function InlineCitation({
	index,
	title,
	url: rawUrl,
	excerpt,
	openDelay = 200,
	className,
}: InlineCitationProps) {
	// Gate the URL against `javascript:` / `data:` / `vbscript:` schemes
	// before it reaches an `<a href>`. Markdown-path callers already pass
	// rehype-sanitized hrefs, but direct-JSX consumers can hand us anything.
	const url = safeUrl(rawUrl);
	const triggerClasses = cn(
		"inline-flex select-none items-center justify-center rounded-sm bg-primary/10 px-1 py-0.5 text-[0.7em] font-mono font-semibold text-primary leading-none",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		"hover:bg-primary/15",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
		className,
	);

	const trigger = url ? (
		<a
			href={url}
			target="_blank"
			rel="noreferrer noopener external"
			className={triggerClasses}
			aria-label={`Source ${index}: ${title}`}
		>
			[{index}]
		</a>
	) : (
		// No URL → still focusable so keyboard users can open the popover.
		// Real <button type="button"> over a styled span so the trigger
		// honors space/enter activation natively.
		<button
			type="button"
			className={triggerClasses}
			aria-label={`Source ${index}: ${title}`}
		>
			[{index}]
		</button>
	);

	return (
		<HoverCardPrimitive.Root openDelay={openDelay}>
			<HoverCardPrimitive.Trigger asChild>
				<sup className="inline-block leading-none">{trigger}</sup>
			</HoverCardPrimitive.Trigger>
			<HoverCardPrimitive.Portal>
				<HoverCardPrimitive.Content
					side="top"
					align="center"
					sideOffset={4}
					className={cn(
						"z-50 max-w-xs rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md",
						"data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					)}
				>
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[10px] text-muted-foreground">[{index}]</span>
						<span className="text-sm font-medium leading-snug text-foreground">{title}</span>
						{excerpt ? (
							<span className="text-xs leading-relaxed text-muted-foreground">{excerpt}</span>
						) : null}
						{url ? (
							<span className="truncate text-xs text-primary underline-offset-2 hover:underline">
								{inferDisplayUrl(url)}
							</span>
						) : null}
					</div>
				</HoverCardPrimitive.Content>
			</HoverCardPrimitive.Portal>
		</HoverCardPrimitive.Root>
	);
}

function inferDisplayUrl(href: string): string {
	try {
		const url = new URL(href);
		return url.hostname.replace(/^www\./, "") + url.pathname;
	} catch {
		return href;
	}
}

export { InlineCitation };
