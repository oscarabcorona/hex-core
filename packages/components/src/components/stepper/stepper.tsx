import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

type StepStatus = "complete" | "current" | "upcoming" | "error";

interface StepperStep {
	/** Stable unique id used as the React key. */
	id: string;
	/** Step name shown next to the indicator. */
	label: string;
	/** Optional secondary text under the label. */
	description?: string;
	/** Disable the step (only applies when onStepClick is provided). */
	disabled?: boolean;
	/**
	 * Override the index-derived status. Use `"error"` to mark a failed step
	 * (e.g. validation failure in a form wizard); `"complete"` / `"current"` /
	 * `"upcoming"` are derived from `current` by default.
	 */
	status?: StepStatus;
}

const stepperRoot = cva(
	"flex w-full gap-[var(--gap-md,1rem)] list-none p-0 m-0",
	{
		variants: {
			orientation: {
				horizontal: "flex-row items-start",
				vertical: "flex-col items-stretch",
			},
		},
		defaultVariants: { orientation: "horizontal" },
	},
);

/*
 * Horizontal: each step sizes to its content; the connector (`flex-1`) fills
 * the gap between steps. Going `flex-1` on the step item itself would shrink
 * labels to the point of `text-overflow: ellipsis` ("Account" → "A...").
 * Vertical: items take the full width so multi-line descriptions wrap
 * naturally below the indicator.
 */
const stepItem = cva("flex gap-[var(--space-3,0.75rem)]", {
	variants: {
		orientation: {
			horizontal: "flex-row items-center",
			vertical: "flex-row items-start w-full",
		},
	},
	defaultVariants: { orientation: "horizontal" },
});

const stepIndicator = cva(
	"inline-flex shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors duration-[var(--duration-normal,200ms)] ease-out",
	{
		variants: {
			size: {
				sm: "h-7 w-7 text-xs",
				md: "h-[var(--control-height-sm,2.25rem)] w-[var(--control-height-sm,2.25rem)] text-sm",
			},
			status: {
				complete: "bg-primary border-primary text-primary-foreground",
				current: "bg-background border-primary text-primary",
				upcoming: "bg-background border-input text-muted-foreground",
				error:
					"bg-destructive border-destructive text-destructive-foreground",
			},
		},
		defaultVariants: { size: "md", status: "upcoming" },
	},
);

const stepConnector = cva("bg-input transition-colors", {
	variants: {
		orientation: {
			horizontal: "h-px flex-1 min-w-[var(--space-6,1.5rem)] mx-[var(--space-2,0.5rem)]",
			vertical: "w-px self-stretch ml-[1.0625rem] my-[var(--space-1,0.25rem)] min-h-[var(--space-6,1.5rem)]",
		},
		complete: {
			true: "bg-primary",
			false: "",
		},
	},
	defaultVariants: { orientation: "horizontal", complete: false },
});

interface StepperProps
	extends Omit<
		React.HTMLAttributes<HTMLOListElement>,
		"aria-label" | "onClick"
	> {
	/** Ordered list of steps. */
	steps: StepperStep[];
	/** Index of the current step (controlled). */
	current: number;
	/** Layout direction. */
	orientation?: "horizontal" | "vertical";
	/** Indicator size. */
	size?: "sm" | "md";
	/** When provided, each step is rendered as a clickable button. */
	onStepClick?: (index: number) => void;
	/** Required accessible name for the ordered list. */
	"aria-label": string;
}

function deriveStatus(index: number, current: number): StepStatus {
	if (index < current) return "complete";
	if (index === current) return "current";
	return "upcoming";
}

function StepCheck() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4"
			aria-hidden="true"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

function StepError() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4"
			aria-hidden="true"
		>
			<line x1="6" y1="6" x2="18" y2="18" />
			<line x1="18" y1="6" x2="6" y2="18" />
		</svg>
	);
}

interface StepIndicatorProps {
	index: number;
	status: StepStatus;
	size: "sm" | "md";
}

function StepIndicator({ index, status, size }: StepIndicatorProps) {
	return (
		<span
			className={stepIndicator({ size, status })}
			aria-invalid={status === "error" ? true : undefined}
		>
			{status === "complete" ? (
				<StepCheck />
			) : status === "error" ? (
				<StepError />
			) : (
				index + 1
			)}
		</span>
	);
}

/**
 * Linear progress indicator for multi-step flows (form wizards, onboarding,
 * checkout). Pure semantic HTML — `<ol>` of `<li>` with `aria-current="step"`
 * on the current item; per-step `status` overrides allow marking "error".
 *
 * Pass `onStepClick` to make completed/non-disabled steps interactive.
 * @returns An accessible ordered step list.
 */
function Stepper({
	steps,
	current,
	orientation = "horizontal",
	size = "md",
	onStepClick,
	"aria-label": ariaLabel,
	className,
	...rest
}: StepperProps) {
	const interactive = typeof onStepClick === "function";
	return (
		<ol
			aria-label={ariaLabel}
			className={cn(stepperRoot({ orientation }), className)}
			{...rest}
		>
			{steps.map((step, index) => {
				const status = step.status ?? deriveStatus(index, current);
				const isCurrent = status === "current";
				const isLast = index === steps.length - 1;
				const labelNode = (
					<span className="flex flex-col gap-[var(--space-1,0.25rem)]">
						<span
							className={cn(
								"text-sm font-medium whitespace-nowrap",
								isCurrent && "text-foreground",
								status === "complete" && "text-foreground",
								status === "upcoming" && "text-muted-foreground",
								status === "error" && "text-destructive",
							)}
						>
							{status === "complete" && (
								<span className="sr-only">Completed: </span>
							)}
							{status === "error" && (
								<span className="sr-only">Error: </span>
							)}
							{step.label}
						</span>
						{step.description ? (
							<span className="text-xs text-muted-foreground">
								{step.description}
							</span>
						) : null}
					</span>
				);

				const innerContent = (
					<>
						<StepIndicator index={index} status={status} size={size} />
						{labelNode}
					</>
				);

				return (
					/*
					 * `aria-current="step"` lives on the <li> itself so screen
					 * readers announce it as part of the listitem's intro
					 * (per WAI guidance for "step" lists), not buried on an
					 * interior span/button.
					 */
					<li
						key={step.id}
						aria-current={isCurrent ? "step" : undefined}
						className={cn(
							stepItem({ orientation }),
							/*
							 * Grow only when there's a connector after this step.
							 * The connector inside takes the extra space via
							 * `flex-1` so the line spans to the next step.
							 */
							!isLast && orientation === "horizontal" && "flex-1",
							!isLast && orientation === "vertical" && "flex-col",
						)}
					>
						{interactive ? (
							<button
								type="button"
								disabled={step.disabled}
								onClick={() => onStepClick?.(index)}
								className={cn(
									"flex items-center gap-[var(--space-3,0.75rem)] text-left rounded-md transition-colors duration-[var(--duration-normal,200ms)] ease-out",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									"disabled:opacity-50 disabled:pointer-events-none",
								)}
							>
								{innerContent}
							</button>
						) : (
							<span className="flex items-center gap-[var(--space-3,0.75rem)]">
								{innerContent}
							</span>
						)}
						{!isLast ? (
							/*
							 * Connector "complete" iff THIS step is finished. An
							 * explicit "error" status on the current step never
							 * fills the gap to the next step — the user hasn't
							 * cleared this milestone.
							 */
							<span
								aria-hidden="true"
								className={stepConnector({
									orientation,
									complete: index < current && step.status !== "error",
								})}
							/>
						) : null}
					</li>
				);
			})}
		</ol>
	);
}
Stepper.displayName = "Stepper";

export { Stepper };
export type { StepperProps, StepperStep, StepStatus };
