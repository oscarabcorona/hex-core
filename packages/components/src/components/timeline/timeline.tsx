import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

type TimelineStatus = "default" | "success" | "warning" | "error" | "info";

interface TimelineEvent {
	/** Stable unique id used as the React key. */
	id: string;
	/** Headline for the event. */
	title: string;
	/** Optional timestamp/metadata (e.g. "2 hours ago", "2026-04-27 14:30"). */
	timestamp?: React.ReactNode;
	/** Optional secondary text/body. */
	description?: React.ReactNode;
	/** Optional icon override for the indicator. Replaces the default dot. */
	icon?: React.ReactNode;
	/** Color variant for the indicator. */
	status?: TimelineStatus;
}

/*
 * `warning` uses a token-with-fallback so themes can override `--color-warning`
 * without touching component source. The OKLCH default lands at a desaturated
 * amber that holds AA contrast on both light and dark backgrounds.
 */
const indicator = cva(
	"relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[var(--duration-normal,200ms)] ease-out",
	{
		variants: {
			status: {
				default: "bg-background border-input text-muted-foreground",
				success: "bg-background border-primary text-primary",
				warning:
					"bg-background border-[var(--color-warning,oklch(0.78_0.16_82))] text-[var(--color-warning,oklch(0.78_0.16_82))]",
				error: "bg-destructive border-destructive text-destructive-foreground",
				info: "bg-background border-ring text-ring",
			},
			size: {
				sm: "h-5 w-5 text-[10px]",
				md: "h-7 w-7 text-xs",
			},
		},
		defaultVariants: { status: "default", size: "md" },
	},
);

interface TimelineProps
	extends Omit<React.HTMLAttributes<HTMLOListElement>, "aria-label"> {
	/** Ordered list of chronological events. */
	events: TimelineEvent[];
	/** Indicator size — `"md"` by default. */
	size?: "sm" | "md";
	/** Required accessible name for the ordered list. */
	"aria-label": string;
}

function DefaultDot() {
	return <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />;
}

/**
 * Vertical chronological event feed (activity log, audit trail, release notes).
 * Pure semantic HTML — `<ol>` of `<li>`. Events expose an optional icon, a
 * status color, a timestamp, and a description; status is purely visual, no
 * aria-current is set since events are historical, not navigational.
 *
 * For Gantt-style project timelines, build a custom layout — Timeline is for
 * event feeds, not scheduling.
 * @returns An accessible vertical event list.
 */
function Timeline({
	events,
	size = "md",
	"aria-label": ariaLabel,
	className,
	...rest
}: TimelineProps) {
	return (
		<ol
			aria-label={ariaLabel}
			className={cn("flex flex-col list-none p-0 m-0", className)}
			{...rest}
		>
			{events.map((event, index) => {
				const isLast = index === events.length - 1;
				const status = event.status ?? "default";
				return (
					<li key={event.id} className="relative flex gap-[var(--space-3,0.75rem)]">
						<div className="flex flex-col items-center">
							<span className={indicator({ status, size })}>
								{event.icon ?? <DefaultDot />}
							</span>
							{!isLast ? (
								<span
									aria-hidden="true"
									className="w-px flex-1 bg-input min-h-[var(--space-6,1.5rem)]"
								/>
							) : null}
						</div>
						<div
							className={cn(
								"flex flex-col gap-[var(--space-1,0.25rem)] min-w-0",
								!isLast && "pb-[var(--space-6,1.5rem)]",
							)}
						>
							<div className="flex flex-wrap items-baseline gap-[var(--space-2,0.5rem)]">
								<span className="text-sm font-medium text-foreground">
									{event.title}
								</span>
								{event.timestamp ? (
									<span className="text-xs text-muted-foreground">
										{event.timestamp}
									</span>
								) : null}
							</div>
							{event.description ? (
								<div className="text-sm text-muted-foreground">
									{event.description}
								</div>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
Timeline.displayName = "Timeline";

export { Timeline };
export type { TimelineEvent, TimelineProps, TimelineStatus };
