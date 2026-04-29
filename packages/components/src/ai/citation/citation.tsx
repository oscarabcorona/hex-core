import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Source attribution chip — renders a citation for a RAG hit, search
 * result, or any external reference the assistant pulled from. Becomes a
 * clickable anchor when `url` is provided; otherwise a static span.
 *
 * @example
 * <Citation title="auth-overview.md" url={src.url} page={3} />
 * @example
 * <Cluster gap="xs">
 *   {sources.map((s, i) => (
 *     <Citation key={s.id} title={s.title} url={s.url} index={i + 1} />
 *   ))}
 * </Cluster>
 */
export interface CitationProps {
	title: string;
	url?: string;
	page?: number;
	/** Numeric index for inline footnote-style display (e.g. "[1] auth.md"). */
	index?: number;
	className?: string;
	children?: React.ReactNode;
}

/**
 * Renders a source citation chip. Uses an `<a>` when `url` is set so the
 * chip is keyboard-focusable + opens in a new tab; falls back to a
 * non-interactive span otherwise.
 *
 * @param props - title + optional url, page, index
 * @returns An anchor or span styled as a chip
 */
function Citation({ title, url, page, index, className, children }: CitationProps) {
	const baseClasses = cn(
		"inline-flex items-center gap-1.5 rounded-md border border-foreground/15 bg-card px-2 py-0.5 text-xs",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		className,
	);

	const body = (
		<>
			{typeof index === "number" ? (
				<span className="font-mono text-[10px] font-semibold text-muted-foreground">[{index}]</span>
			) : (
				<DocGlyph />
			)}
			<span className="truncate text-foreground">{title}</span>
			{typeof page === "number" ? (
				<span className="text-muted-foreground">p.{page}</span>
			) : null}
			{children}
		</>
	);

	if (url) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noreferrer noopener"
				className={cn(
					baseClasses,
					"hover:border-foreground/30 hover:bg-secondary/40 hover:shadow-sm",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				{body}
			</a>
		);
	}

	return <span className={baseClasses}>{body}</span>;
}

function DocGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="11"
			height="11"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0 text-muted-foreground"
		>
			<path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5z" />
			<path d="M9 1.5V5.5h4" />
		</svg>
	);
}

export { Citation };
