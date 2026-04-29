"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Collapsible "thinking" block. Designed for Anthropic-style reasoning
 * traces or Chain-of-Thought scratchpads — content the user can optionally
 * inspect without it dominating the response. Header shows a label and the
 * thinking duration if provided.
 *
 * Headless on content: pass any `children`. Pair with `Markdown` if the
 * reasoning is markdown-formatted.
 *
 * @example
 * <Reasoning durationMs={4200}>
 *   <Markdown>{thinking}</Markdown>
 * </Reasoning>
 */
export interface ReasoningProps {
	children: React.ReactNode;
	defaultOpen?: boolean;
	/** Time spent thinking, in milliseconds. Renders as "Thought for 4.2s". */
	durationMs?: number;
	/** Override the default "Thinking" / "Thought for X" label. */
	label?: string;
	className?: string;
}

/**
 * Renders a collapsible thinking-trace block.
 * @param props - children + optional duration
 * @returns A Collapsible with a labelled header and content body
 */
function Reasoning({
	children,
	defaultOpen = false,
	durationMs,
	label,
	className,
}: ReasoningProps) {
	const headerLabel =
		label ?? (typeof durationMs === "number" ? formatThoughtFor(durationMs) : "Thinking");

	return (
		<CollapsiblePrimitive.Root
			defaultOpen={defaultOpen}
			className={cn("overflow-hidden rounded-md border-l-2 border-foreground/15 bg-muted/20", className)}
		>
			<CollapsiblePrimitive.Trigger
				className={cn(
					"group flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-muted-foreground",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:text-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<SparkleGlyph />
				<span className="font-medium italic">{headerLabel}</span>
				<Chevron />
			</CollapsiblePrimitive.Trigger>
			<CollapsiblePrimitive.Content className="overflow-hidden border-t border-foreground/[0.06] px-3 py-2 text-sm text-muted-foreground">
				{children}
			</CollapsiblePrimitive.Content>
		</CollapsiblePrimitive.Root>
	);
}

function formatThoughtFor(ms: number): string {
	if (ms < 1000) return `Thought for ${ms}ms`;
	const seconds = ms / 1000;
	const formatted = seconds >= 10 ? Math.round(seconds).toString() : seconds.toFixed(1);
	return `Thought for ${formatted}s`;
}

function SparkleGlyph() {
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
			<path d="M8 1.5l1.5 4 4 1.5-4 1.5L8 12.5 6.5 8.5l-4-1.5 4-1.5L8 1.5z" />
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

export { Reasoning };
