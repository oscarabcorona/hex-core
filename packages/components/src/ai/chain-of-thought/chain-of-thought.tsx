"use client";

import * as React from "react";
import { Reasoning } from "../reasoning/reasoning.js";
import { cn } from "../../lib/utils.js";

/**
 * Structured reasoning trace following the canonical ReAct shape — each
 * step has a `thought`, an optional `action`, and an optional
 * `observation`. The final answer renders below the trace.
 *
 * Distinct from `<Reasoning>`: Reasoning is unstructured prose;
 * `<ChainOfThought>` enforces the per-step structure agents emit when
 * doing tool-augmented reasoning. Internally composes `<Reasoning>` for
 * the collapsible shell so the visual rhythm matches.
 *
 * @example
 * <ChainOfThought
 *   steps={[
 *     {
 *       thought: "Need to look up the auth module",
 *       action: "read auth.ts",
 *       observation: "200 lines, uses bcrypt + jwt",
 *     },
 *     { thought: "The bug is on line 42 — missing salt rounds." },
 *   ]}
 *   finalAnswer={<Markdown>{summary}</Markdown>}
 * />
 */
export interface ChainOfThoughtProps {
	/** Ordered ReAct steps. */
	steps: ChainOfThoughtStep[];
	/** Optional final answer rendered beneath the trace. */
	finalAnswer?: React.ReactNode;
	/** Header label for the collapsible. Defaults to "Chain of thought". */
	label?: string;
	/** Whether the trace is expanded by default. */
	defaultOpen?: boolean;
	className?: string;
}

/** A single ReAct step. */
export interface ChainOfThoughtStep {
	/** What the model is thinking right now. Required — every step has a thought. */
	thought: React.ReactNode;
	/** Optional action the model is about to take (e.g. "read auth.ts"). */
	action?: React.ReactNode;
	/** Optional observation returned by the action. */
	observation?: React.ReactNode;
}

/**
 * Render a structured reasoning trace + optional final answer.
 * @param props - The ordered steps and optional final answer.
 * @returns A Reasoning collapsible wrapping per-step rows, then the final answer.
 */
function ChainOfThought({
	steps,
	finalAnswer,
	label = "Chain of thought",
	defaultOpen = false,
	className,
}: ChainOfThoughtProps) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Reasoning label={label} defaultOpen={defaultOpen}>
				<ol className="my-0 ml-0 flex list-none flex-col gap-3 pl-0">
					{steps.map((step, index) => (
						<li
							/*
							 * Index keys are correct here: ReAct steps are
							 * append-only during a turn, never reordered or
							 * spliced out, so the index uniquely identifies
							 * each step for the lifetime of the render.
							 *
							 * `before:content-none` defeats Tailwind
							 * Typography's default `<li>::before` markers
							 * when this card lands inside a `prose` block.
							 */
							key={index}
							className="flex flex-col gap-1 text-sm before:content-none"
						>
							<Row term="Thought" value={step.thought} />
							{step.action ? <Row term="Action" value={step.action} /> : null}
							{step.observation ? (
								<Row term="Observation" value={step.observation} />
							) : null}
						</li>
					))}
				</ol>
			</Reasoning>
			{finalAnswer ? <div>{finalAnswer}</div> : null}
		</div>
	);
}

interface RowProps {
	term: string;
	value: React.ReactNode;
}

function Row({ term, value }: RowProps) {
	return (
		<div className="flex gap-2">
			<span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
				{term}
			</span>
			<span className="min-w-0 flex-1 text-foreground">{value}</span>
		</div>
	);
}

export { ChainOfThought };
