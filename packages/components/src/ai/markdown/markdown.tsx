"use client";

import * as React from "react";
import { Streamdown, type StreamdownProps } from "streamdown";
import { cn } from "../../lib/utils.js";

/**
 * Streaming-safe markdown renderer. Wraps Vercel's `streamdown` so partial
 * input mid-stream — unclosed code fences, half-typed tags, dangling
 * brackets — renders gracefully instead of throwing or flashing raw text.
 *
 * For per-element overrides (e.g. plug in a `<CodeBlock />` for `pre`/`code`
 * blocks, or a custom `<Citation />` for footnote-style links), pass
 * `components`. Exposes the underlying StreamdownProps so consumers can opt
 * into mermaid, math, line numbers, etc. without us mirroring the API.
 *
 * @example
 * <Message role="assistant">
 *   <Markdown>{streamingText}</Markdown>
 * </Message>
 * @example
 * <Markdown components={{ pre: ({ children }) => <CodeBlock code={extractCode(children)} /> }}>
 *   {markdown}
 * </Markdown>
 */
export interface MarkdownProps extends Omit<StreamdownProps, "children"> {
	/** Raw markdown. May be a partial chunk during streaming. */
	children: string;
	className?: string;
}

/**
 * Renders streaming-safe markdown.
 * @param props - children string + optional Streamdown overrides
 * @returns A Streamdown root scoped with prose styles
 */
function Markdown({ children, className, ...rest }: MarkdownProps) {
	return (
		<Streamdown
			className={cn(
				"prose prose-sm max-w-none text-foreground",
				"prose-headings:text-foreground prose-strong:text-foreground",
				"prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline",
				"prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
				className,
			)}
			{...rest}
		>
			{children}
		</Streamdown>
	);
}

export { Markdown };
