"use client";

import * as React from "react";
import { Button } from "../../primitives/button/button.js";
import { cn } from "../../lib/utils.js";

/**
 * Pre-execution plan card. Shown BEFORE the agent starts executing —
 * the body lists the proposed steps; an optional `onApprove` /
 * `onCancel` footer renders an approval gate.
 *
 * Distinct from `<Task>`: Task is during/post-execution status (steps
 * carry a lifecycle state); Plan is pre-execution intent (steps are
 * just labels). Once approved, consumers typically swap the rendered
 * `<Plan>` for a `<Task>` driven by the running agent.
 *
 * @example
 * <Plan
 *   label="Refactor auth module"
 *   description="Three-step refactor with tests."
 *   steps={[
 *     { id: "read", label: "Read existing auth" },
 *     { id: "apply", label: "Apply changes" },
 *     { id: "test", label: "Run tests" },
 *   ]}
 *   onApprove={() => execute()}
 *   onCancel={() => discard()}
 * />
 */
export interface PlanProps {
	/** Optional title shown above the step list. */
	label?: string;
	/** Optional secondary description shown under the label. */
	description?: string;
	/** Ordered list of steps. Each carries an id, label, and optional detail. */
	steps: PlanStep[];
	/** When provided, an "Approve" button is rendered in the footer. */
	onApprove?: () => void;
	/** When provided, a "Cancel" button is rendered in the footer. */
	onCancel?: () => void;
	/** Override the approve button label. Defaults to "Approve". */
	approveLabel?: string;
	/** Override the cancel button label. Defaults to "Cancel". */
	cancelLabel?: string;
	className?: string;
}

/** A single proposed step in a Plan. */
export interface PlanStep {
	/** Stable identifier — used for the React key. */
	id: string;
	/** Human-readable step label. */
	label: string;
	/** Optional secondary detail shown beneath the label. */
	detail?: string;
}

/**
 * Render a pre-execution multi-step plan with an optional approval gate.
 * @param props - The plan label, steps, and optional approve/cancel handlers.
 * @returns A card wrapping a numbered step list and (optionally) an action footer.
 */
function Plan({
	label,
	description,
	steps,
	onApprove,
	onCancel,
	approveLabel = "Approve",
	cancelLabel = "Cancel",
	className,
}: PlanProps) {
	const showFooter = typeof onApprove === "function" || typeof onCancel === "function";

	return (
		<div
			className={cn(
				"overflow-hidden rounded-md border border-border bg-card",
				className,
			)}
		>
			{label || description ? (
				<div className="flex flex-col gap-0.5 border-b border-foreground/[0.06] px-3 py-2">
					{label ? (
						<span className="text-sm font-medium text-foreground">{label}</span>
					) : null}
					{description ? (
						<span className="text-xs text-muted-foreground">{description}</span>
					) : null}
				</div>
			) : null}
			<ol
				aria-label={label ? `${label} steps` : "Plan steps"}
				className="my-0 ml-0 flex list-none flex-col gap-2 py-3 pr-3 pl-3"
			>
				{steps.map((step, index) => (
					/*
					 * `before:content-none` defeats Tailwind Typography's
					 * default `<li>::before` markers when this card lands
					 * inside a `prose` block (assistant turn, MDX page).
					 * Don't strip — the indicator handles ordinal display.
					 */
					<li
						key={step.id}
						className="flex items-start gap-3 text-sm before:content-none"
					>
						<span
							aria-hidden
							className={cn(
								"mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
								"border border-input bg-background text-[0.65rem] font-medium tabular-nums text-muted-foreground",
							)}
						>
							{index + 1}
						</span>
						<div className="flex min-w-0 flex-col gap-0.5">
							<span className="leading-snug text-foreground">{step.label}</span>
							{step.detail ? (
								<span className="text-xs text-muted-foreground">{step.detail}</span>
							) : null}
						</div>
					</li>
				))}
			</ol>
			{showFooter ? (
				<div className="flex items-center justify-end gap-2 border-t border-foreground/[0.06] bg-muted/20 px-3 py-2">
					{typeof onCancel === "function" ? (
						<Button variant="ghost" size="sm" onClick={onCancel}>
							{cancelLabel}
						</Button>
					) : null}
					{typeof onApprove === "function" ? (
						<Button variant="default" size="sm" onClick={onApprove}>
							{approveLabel}
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
}

export { Plan };
