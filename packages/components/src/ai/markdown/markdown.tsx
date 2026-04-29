"use client";

import * as React from "react";
import { Streamdown } from "streamdown";
import { cn } from "../../lib/utils.js";

/**
 * Streaming-safe markdown renderer. Wraps Vercel's `streamdown` so partial
 * input mid-stream — unclosed code fences, half-typed tags, dangling
 * brackets — renders gracefully instead of throwing or flashing raw text.
 *
 * Public prop surface is intentionally minimal (`children` + `className`)
 * so this primitive's DTS doesn't drag in `streamdown`'s full type graph.
 * Doing so would transitively pull Shiki's 600-literal `BundledLanguage`
 * union into the rollup-dts pass and exhaust heap. For per-element
 * overrides (custom `pre`, `code`, `a`, `img`, mermaid, math, line
 * numbers, plugins, etc.) drop down to `Streamdown` directly:
 *
 * ```tsx
 * import { Streamdown } from "streamdown";
 * import { CodeBlock } from "@hex-core/components";
 * <Streamdown components={{ pre: (p) => <CodeBlock {...p} /> }}>{md}</Streamdown>
 * ```
 *
 * @example
 * <Message role="assistant">
 *   <Markdown>{streamingText}</Markdown>
 * </Message>
 */
export interface MarkdownProps {
	/** Raw markdown. May be a partial chunk during streaming. */
	children: string;
	className?: string;
}

/**
 * Renders streaming-safe markdown.
 * @param props - children string + optional Streamdown overrides
 * @returns A Streamdown root scoped with prose styles
 */
function Markdown({ children, className }: MarkdownProps) {
	return (
		<Streamdown
			className={cn(
				"prose prose-sm max-w-none text-foreground",
				"prose-headings:text-foreground prose-strong:text-foreground",
				"prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline",
				"prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
				className,
			)}
		>
			{children}
		</Streamdown>
	);
}

export { Markdown };
