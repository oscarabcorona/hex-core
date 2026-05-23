import * as React from "react";
import { cn } from "../../lib/utils.js";

/** A single metric in {@link AppStats}. */
export interface AppStat {
	/** Metric name, e.g. "Active users". */
	label: React.ReactNode;
	/** The headline value, e.g. "12,480". */
	value: React.ReactNode;
	/** Optional delta text, e.g. "+12%". */
	change?: React.ReactNode;
	/** Direction of the delta — drives its color and arrow. Defaults to `neutral`. */
	changeType?: "increase" | "decrease" | "neutral";
	/** Optional leading icon (a `ReactNode` — no icon set is bundled). */
	icon?: React.ReactNode;
}

/** Props for {@link AppStats}. */
export interface AppStatsProps {
	/** The metrics to render as cards. */
	stats: ReadonlyArray<AppStat>;
	/** Card count per row on ≥lg: `two`, `three`, or `four` (default). */
	columns?: "two" | "three" | "four";
	/** Additional classes applied to the root grid. */
	className?: string;
}

const COLUMN_CLASS: Record<NonNullable<AppStatsProps["columns"]>, string> = {
	two: "sm:grid-cols-2",
	three: "sm:grid-cols-2 lg:grid-cols-3",
	four: "sm:grid-cols-2 lg:grid-cols-4",
};

const CHANGE_CLASS: Record<NonNullable<AppStat["changeType"]>, string> = {
	increase: "text-primary",
	decrease: "text-destructive",
	neutral: "text-muted-foreground",
};

/** Directional caret for a stat delta. `aria-hidden` — the change text carries meaning. */
function Caret({ type }: { type: NonNullable<AppStat["changeType"]> }) {
	if (type === "neutral") return null;
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="size-3.5">
			{type === "increase" ? (
				<path d="M8 4l4 5H4l4-5z" />
			) : (
				<path d="M8 12L4 7h8l-4 5z" />
			)}
		</svg>
	);
}

/**
 * A row of KPI stat cards: label, value, and an optional colored delta with a
 * directional caret. Presentational and theme-driven — drop it at the top of a
 * dashboard body.
 */
export function AppStats({ stats, columns = "four", className }: AppStatsProps) {
	return (
		<div className={cn("grid grid-cols-1 gap-4", COLUMN_CLASS[columns], className)}>
			{stats.map((stat, index) => {
				const changeType = stat.changeType ?? "neutral";
				return (
					<div
						key={index}
						className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
							{stat.icon ? (
								<span className="text-muted-foreground [&_svg]:size-4" aria-hidden="true">
									{stat.icon}
								</span>
							) : null}
						</div>
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-semibold tracking-tight text-foreground">
								{stat.value}
							</span>
							{stat.change ? (
								<span className={cn("flex items-center gap-0.5 text-sm font-medium", CHANGE_CLASS[changeType])}>
									<Caret type={changeType} />
									{stat.change}
								</span>
							) : null}
						</div>
					</div>
				);
			})}
		</div>
	);
}
