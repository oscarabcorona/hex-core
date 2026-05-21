"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import type { ToolCallState } from "../types.js";

const STATE_LABEL: Record<ToolCallState, string> = {
	pending: "Pending",
	running: "Running",
	result: "Done",
	error: "Error",
};

const STATE_CLASSES: Record<ToolCallState, string> = {
	pending: "bg-muted text-muted-foreground",
	// `text-foreground` (12:1) survives axe's mid-pulse capture; the
	// previous `text-primary` (`#7081a8` on dark `--muted`, 4.28:1) was
	// intermittently flagged below AA 4.5:1 at the 10px badge size when
	// `animate-pulse` caught the scan during a low-opacity frame.
	running: "bg-muted text-foreground font-medium animate-pulse",
	result: "bg-accent/30 text-accent-foreground",
	error: "bg-destructive/15 text-destructive",
};

/**
 * Collapsible card displaying a tool / function invocation. Header shows the
 * tool name and lifecycle state badge; body reveals the JSON-stringified
 * arguments and result on expand.
 *
 * Display-only — the component does not run the tool. Wire it up in the
 * consumer (AI SDK `tool-*` parts → ToolCall props, LangChain
 * `AIMessage.tool_calls` → ToolCall props).
 *
 * @example
 * <ToolCall
 *   name="searchDocs"
 *   state="result"
 *   args={{ query: "auth" }}
 *   result={{ hits: 12 }}
 * />
 */
export interface ToolCallProps {
	name: string;
	state: ToolCallState;
	args?: unknown;
	result?: unknown;
	defaultOpen?: boolean;
	className?: string;
}

/**
 * Renders a tool-invocation card with collapsible details.
 * @param props - tool name, state, optional args/result
 * @returns A Collapsible wrapping a header + JSON body
 */
function ToolCall({
	name,
	state,
	args,
	result,
	defaultOpen = false,
	className,
}: ToolCallProps) {
	return (
		<CollapsiblePrimitive.Root
			defaultOpen={defaultOpen}
			className={cn(
				"overflow-hidden rounded-md border bg-card text-card-foreground",
				"transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"data-[state=open]:shadow-sm",
				className,
			)}
		>
			<CollapsiblePrimitive.Trigger
				className={cn(
					"group flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
					"hover:bg-muted/40",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<span className="flex min-w-0 items-center gap-2">
					<ToolGlyph />
					<span className="truncate font-mono text-xs text-foreground">{name}</span>
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
							STATE_CLASSES[state],
						)}
					>
						{STATE_LABEL[state]}
					</span>
				</span>
				<Chevron />
			</CollapsiblePrimitive.Trigger>
			<CollapsiblePrimitive.Content className="overflow-hidden border-t bg-muted/20 px-3 py-2 text-xs">
				{args !== undefined ? <CodeSection label="Arguments" value={args} /> : null}
				{result !== undefined ? <CodeSection label="Result" value={result} /> : null}
				{args === undefined && result === undefined ? (
					<p className="text-muted-foreground">No arguments or result yet.</p>
				) : null}
			</CollapsiblePrimitive.Content>
		</CollapsiblePrimitive.Root>
	);
}

function CodeSection({ label, value }: { label: string; value: unknown }) {
	const text = typeof value === "string" ? value : safeStringify(value);
	return (
		<div className="space-y-1 py-1">
			<div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
			<pre className="overflow-x-auto rounded bg-background/60 p-2 font-mono text-[11px] leading-snug">
				{text}
			</pre>
		</div>
	);
}

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function ToolGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0 text-muted-foreground"
		>
			<path d="M11.5 1.5l3 3-2.5 2.5-3-3 2.5-2.5z" />
			<path d="M9 4l-7 7v3h3l7-7" />
		</svg>
	);
}

function Chevron() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
		>
			<path d="M4 6l4 4 4-4" />
		</svg>
	);
}

export { ToolCall };
