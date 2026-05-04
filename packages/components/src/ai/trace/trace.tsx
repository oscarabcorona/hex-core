"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Vertical agent-decision timeline. Each step represents one move the
 * agent made — a thought, a tool call, an observation, or an error. The
 * indicator + color encodes the step kind; an optional `durationMs` /
 * `timestamp` reads as metadata next to the title.
 *
 * Distinct from `<Task>` (in-flight task progress) and `<ChainOfThought>`
 * (structured ReAct trace): `<Trace>` is a chronological audit log,
 * meant for post-hoc inspection and evals.
 *
 * @example
 * <Trace
 *   ariaLabel="Agent decision trace"
 *   steps={[
 *     { id: "1", kind: "think", title: "Plan the migration", durationMs: 450 },
 *     { id: "2", kind: "tool-call", title: "read users.sql", durationMs: 120 },
 *     { id: "3", kind: "observation", title: "12 columns, 1.2M rows" },
 *     { id: "4", kind: "error", title: "ALTER failed: column already exists" },
 *   ]}
 * />
 */
export interface TraceProps {
	/** Ordered list of agent steps. */
	steps: TraceStep[];
	/** Required accessible name for the timeline. */
	ariaLabel: string;
	/** Indicator size — `"md"` by default. */
	size?: "sm" | "md";
	className?: string;
}

/** Lifecycle/kind of a trace step. */
export type TraceStepKind = "think" | "tool-call" | "observation" | "error";

/** A single entry in the agent decision trace. */
export interface TraceStep {
	/** Stable identifier — used for the React key. */
	id: string;
	/** Kind of step — drives the indicator icon + color. */
	kind: TraceStepKind;
	/** Headline for the step. */
	title: string;
	/** Optional secondary detail (e.g. tool args, observation body, error message). */
	detail?: React.ReactNode;
	/** Optional duration in milliseconds — renders as "120ms" / "1.2s". */
	durationMs?: number;
	/** Optional absolute timestamp (e.g. "14:30:01"). Displayed alongside duration when both are set. */
	timestamp?: React.ReactNode;
}

/**
 * Render the agent decision trace.
 * @param props - Steps + accessible label.
 * @returns A semantic `<ol>` of trace entries with kind-specific indicators.
 */
function Trace({ steps, ariaLabel, size = "md", className }: TraceProps) {
	return (
		<ol
			aria-label={ariaLabel}
			className={cn("my-0 ml-0 flex list-none flex-col pl-0", className)}
		>
			{steps.map((step, index) => {
				const isLast = index === steps.length - 1;
				return (
					<li
						key={step.id}
						/*
						 * `before:content-none` defeats Tailwind Typography's
						 * default `<li>::before` markers when this lands
						 * inside a `prose` block.
						 */
						className="relative flex gap-3 pb-4 text-sm before:content-none last:pb-0"
					>
						{!isLast ? (
							<span
								aria-hidden="true"
								className={cn(
									"absolute left-3 top-7 -bottom-1 w-px bg-foreground/[0.08]",
									size === "sm" && "left-[10px]",
								)}
							/>
						) : null}
						<StepIndicator kind={step.kind} size={size} />
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							<div className="flex items-baseline gap-2">
								<span
									className={cn(
										"truncate font-medium leading-snug",
										step.kind === "error"
											? "text-destructive"
											: "text-foreground",
									)}
								>
									{step.title}
								</span>
								<TraceMeta durationMs={step.durationMs} timestamp={step.timestamp} />
							</div>
							{step.detail ? (
								<div className="text-xs text-muted-foreground">{step.detail}</div>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

interface StepIndicatorProps {
	kind: TraceStepKind;
	size: "sm" | "md";
}

function StepIndicator({ kind, size }: StepIndicatorProps) {
	const baseSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
	const cls = cn(
		"relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border bg-background",
		baseSize,
	);
	if (kind === "think") {
		return (
			<span
				aria-label="Thought"
				role="img"
				className={cn(cls, "border-foreground/20 text-foreground")}
			>
				<SparkleIcon />
			</span>
		);
	}
	if (kind === "tool-call") {
		return (
			<span
				aria-label="Tool call"
				role="img"
				className={cn(cls, "border-primary/40 text-primary")}
			>
				<WrenchIcon />
			</span>
		);
	}
	if (kind === "observation") {
		return (
			<span
				aria-label="Observation"
				role="img"
				className={cn(cls, "border-foreground/30 text-muted-foreground")}
			>
				<EyeIcon />
			</span>
		);
	}
	// Compile-time exhaustiveness — adding a new kind to TraceStepKind without
	// extending this switch surfaces as a TS error here, not a runtime fall-through.
	const _exhaustive: "error" = kind;
	void _exhaustive;
	return (
		<span
			aria-label="Error"
			role="img"
			className={cn(cls, "border-destructive/60 bg-destructive/10 text-destructive")}
		>
			<XIcon />
		</span>
	);
}

interface TraceMetaProps {
	durationMs?: number;
	timestamp?: React.ReactNode;
}

function TraceMeta({ durationMs, timestamp }: TraceMetaProps) {
	if (typeof durationMs !== "number" && !timestamp) return null;
	return (
		<span className="ml-auto shrink-0 font-mono text-[0.7rem] tabular-nums text-muted-foreground">
			{timestamp ? <span>{timestamp}</span> : null}
			{timestamp && typeof durationMs === "number" ? <span> · </span> : null}
			{typeof durationMs === "number" ? <span>{formatDuration(durationMs)}</span> : null}
		</span>
	);
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const seconds = ms / 1000;
	const formatted = seconds >= 10 ? Math.round(seconds).toString() : seconds.toFixed(1);
	return `${formatted}s`;
}

function SparkleIcon() {
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
		>
			<path d="M8 1.5l1.5 4 4 1.5-4 1.5L8 12.5 6.5 8.5l-4-1.5 4-1.5L8 1.5z" />
		</svg>
	);
}

function WrenchIcon() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="11"
			height="11"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M11.5 2.5a3 3 0 0 0-3.86 3.65L2 11.79V14h2.21l5.65-5.65A3 3 0 0 0 13.5 4.5l-1.5 1.5-1.5-1.5L12 3a3 3 0 0 0-.5-.5z" />
		</svg>
	);
}

function EyeIcon() {
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
		>
			<path d="M1.5 8s2-4.5 6.5-4.5S14.5 8 14.5 8s-2 4.5-6.5 4.5S1.5 8 1.5 8z" />
			<circle cx="8" cy="8" r="2" />
		</svg>
	);
}

function XIcon() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="10"
			height="10"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M4 4l8 8M12 4l-8 8" />
		</svg>
	);
}

export { Trace };
