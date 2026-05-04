"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Lifecycle of a Task step. Mirrors `@hex-core/components`'
 * `ToolCallState` exactly — kept inline (rather than imported from
 * `../types.js`) so the registry CLI distribution path (`npx hex add
 * task`) ships a self-contained file. ToolCall has the same enum
 * imported from `../types.js` for backwards-compat with its earlier
 * shape; new consumers should treat the two unions as one vocabulary.
 */
type ToolCallState = "pending" | "running" | "result" | "error";

/**
 * Multi-step task progress for an AI workflow.
 *
 * Each step's `state` re-uses the canonical `ToolCallState` enum
 * (`pending` / `running` / `result` / `error`) so the vocabulary stays
 * consistent across the AI surface. The header tracks aggregate
 * progress ("3 of 5 steps", or "Done in X.Xs" once `durationMs` is
 * set).
 *
 * Composes well with `<Reasoning>` for in-step thinking traces and
 * `<ToolCall>` for individual tool invocations.
 *
 * @example
 * <Task
 *   label="Refactoring auth"
 *   steps={[
 *     { id: "read", label: "Read existing auth", state: "result" },
 *     { id: "write", label: "Apply changes", state: "running" },
 *     { id: "test", label: "Run tests", state: "pending" },
 *   ]}
 *   durationMs={12_400}
 * />
 */
export interface TaskProps {
	/** Optional title shown above the step list. Skipped if absent. */
	label?: string;
	/** Ordered list of steps. Each carries an id, label, and state. */
	steps: TaskStep[];
	/** Time spent on the task in milliseconds. Renders "Done in X.Xs" when set. */
	durationMs?: number;
	/** Whether the step list is expanded by default. */
	defaultOpen?: boolean;
	className?: string;
}

/** A single row in a Task. */
export interface TaskStep {
	/** Stable identifier — used for the React key and any consumer tracking. */
	id: string;
	/** Human-readable step label. */
	label: string;
	/** Lifecycle status — same vocabulary as `<ToolCall>`'s `state`. */
	state: ToolCallState;
	/** Optional detail line shown beneath the label. */
	detail?: string;
}

/**
 * Render a multi-step task progress card.
 * @param props - The task label, steps, and optional duration.
 * @returns A Collapsible wrapping a step list.
 */
function Task({ label, steps, durationMs, defaultOpen = true, className }: TaskProps) {
	const summary = summarize(steps, durationMs);

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
					"group flex w-full items-center gap-2 px-3 py-2 text-left",
					"transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"hover:bg-muted/30",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<div className="flex min-w-0 flex-col gap-0.5">
					{label ? (
						<span className="text-sm font-medium text-foreground">{label}</span>
					) : null}
					<span className="text-xs text-muted-foreground">{summary}</span>
				</div>
				<Chevron />
			</CollapsiblePrimitive.Trigger>
			<CollapsiblePrimitive.Content className="overflow-hidden border-t border-foreground/[0.06]">
				<ol className="my-0 ml-0 flex list-none flex-col pl-0">
					{steps.map((step) => (
						<li
							key={step.id}
							className="flex items-start gap-3 px-3 py-2 text-sm before:content-none last:pb-3"
						>
							<StepIcon state={step.state} />
							<div className="flex min-w-0 flex-col gap-0.5">
								<span
									className={cn(
										"leading-snug",
										step.state === "result" && "text-muted-foreground line-through decoration-muted-foreground/50",
										step.state === "running" && "text-foreground font-medium",
										step.state === "error" && "text-destructive",
										step.state === "pending" && "text-muted-foreground",
									)}
								>
									{step.label}
								</span>
								{step.detail ? (
									<span className="text-xs text-muted-foreground">{step.detail}</span>
								) : null}
							</div>
						</li>
					))}
				</ol>
			</CollapsiblePrimitive.Content>
		</CollapsiblePrimitive.Root>
	);
}

function summarize(steps: TaskStep[], durationMs: number | undefined): string {
	const total = steps.length;
	const done = steps.filter((s) => s.state === "result").length;
	const running = steps.some((s) => s.state === "running");
	const errored = steps.some((s) => s.state === "error");
	if (errored) return `${done} of ${total} steps · failed`;
	if (running) return `${done} of ${total} steps`;
	if (done === total && total > 0 && typeof durationMs === "number") {
		return `Done in ${formatDuration(durationMs)}`;
	}
	if (done === total && total > 0) return "Done";
	return `${done} of ${total} steps`;
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const seconds = ms / 1000;
	const formatted = seconds >= 10 ? Math.round(seconds).toString() : seconds.toFixed(1);
	return `${formatted}s`;
}

function StepIcon({ state }: { state: ToolCallState }) {
	const cls = "mt-0.5 shrink-0";
	if (state === "result") {
		return (
			<svg
				aria-label="Done"
				role="img"
				viewBox="0 0 16 16"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn(cls, "text-emerald-500")}
			>
				<circle cx="8" cy="8" r="6" />
				<path d="M5 8.25l2.25 2.25L11 6" />
			</svg>
		);
	}
	if (state === "running") {
		return (
			<svg
				aria-label="Running"
				role="img"
				viewBox="0 0 16 16"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				className={cn(cls, "text-primary motion-safe:animate-spin")}
			>
				<path d="M8 1.5a6.5 6.5 0 1 1-6.5 6.5" />
			</svg>
		);
	}
	if (state === "error") {
		return (
			<svg
				aria-label="Error"
				role="img"
				viewBox="0 0 16 16"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn(cls, "text-destructive")}
			>
				<circle cx="8" cy="8" r="6" />
				<path d="M5 5l6 6M11 5l-6 6" />
			</svg>
		);
	}
	// pending
	return (
		<svg
			aria-label="Pending"
			role="img"
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={cn(cls, "text-muted-foreground")}
		>
			<circle cx="8" cy="8" r="6" strokeDasharray="2 2" />
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
			className="ml-auto shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
		>
			<path d="M4 6l4 4 4-4" />
		</svg>
	);
}

export { Task };
