"use client";

import { Progress } from "../../primitives/progress/progress.js";
import { cn } from "../../lib/utils.js";

/**
 * Context-window utilization meter. Renders "47k of 200k tokens (24%)"
 * with a horizontal progress bar — the at-a-glance signal for how
 * much of the model's context has been consumed.
 *
 * Severity colors gate at 75% (warning) and 90% (danger) so users get
 * pre-overflow notice. Composes the `Progress` primitive for the bar
 * itself; the surface around it is presentation-only.
 *
 * @example
 * <Context used={47_000} max={200_000} />
 *
 * @example
 * <Context
 *   used={consumedTokens}
 *   max={modelContextWindow}
 *   label="Context used"
 *   warningAt={0.7}
 *   dangerAt={0.9}
 * />
 */
export interface ContextProps {
	/** Tokens consumed so far. Clamped to [0, max] for display. */
	used: number;
	/** Total context window in tokens. */
	max: number;
	/** Override the leading label. Defaults to "Context window". */
	label?: string;
	/** Threshold (0–1) to flip the bar to the warning color. Defaults to 0.75. */
	warningAt?: number;
	/** Threshold (0–1) to flip the bar to the danger color. Defaults to 0.9. */
	dangerAt?: number;
	className?: string;
}

/**
 * Render a context-window meter with token counts and a progress bar.
 * @param props - used + max plus optional label and severity thresholds.
 * @returns A flex column with header text and a `<Progress>` bar.
 */
function Context({
	used,
	max,
	label = "Context window",
	warningAt = 0.75,
	dangerAt = 0.9,
	className,
}: ContextProps) {
	const safeMax = Math.max(1, max);
	const safeUsed = Math.max(0, Math.min(used, safeMax));
	const ratio = safeUsed / safeMax;
	const pct = Math.round(ratio * 100);
	const severity: Severity =
		ratio >= dangerAt ? "danger" : ratio >= warningAt ? "warning" : "ok";

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex items-baseline justify-between gap-2 text-xs">
				<span className="font-medium text-foreground">{label}</span>
				<span className="font-mono tabular-nums text-muted-foreground">
					<span className={severityTextClass(severity)}>{formatTokens(safeUsed)}</span>
					{" of "}
					{formatTokens(safeMax)} tokens · {pct}%
				</span>
			</div>
			<Progress
				value={safeUsed}
				max={safeMax}
				aria-label={`${label}: ${pct}% used`}
				className={cn(severityIndicatorClass(severity))}
			/>
		</div>
	);
}

type Severity = "ok" | "warning" | "danger";

function severityTextClass(severity: Severity): string {
	if (severity === "danger") return "text-destructive";
	if (severity === "warning") return "text-[var(--color-warning,oklch(0.78_0.16_82))]";
	return "text-foreground";
}

function severityIndicatorClass(severity: Severity): string {
	// `Progress`'s indicator is `bg-primary` by default. Override the indicator's
	// background via the descendant selector so the bar reflects severity without
	// needing Progress to expose a variant prop.
	if (severity === "danger") {
		return "[&>*]:bg-destructive";
	}
	if (severity === "warning") {
		return "[&>*]:bg-[var(--color-warning,oklch(0.78_0.16_82))]";
	}
	return "";
}

function formatTokens(value: number): string {
	if (value < 1000) return `${value}`;
	if (value < 1_000_000) {
		const k = value / 1000;
		return `${k >= 100 ? Math.round(k) : k.toFixed(k >= 10 ? 0 : 1)}k`;
	}
	const m = value / 1_000_000;
	return `${m >= 10 ? Math.round(m) : m.toFixed(1)}M`;
}

export { Context };
