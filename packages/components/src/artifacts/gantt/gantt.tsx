"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Gantt chart — tasks as horizontal bars across a time axis, with
 * optional dependency arrows and progress fills. Pure SVG; no heavy
 * peer dependency.
 *
 * Distinct from TimeAxis (point events) and Sequence (actor messages):
 * Gantt encodes DURATION (start → end) per task and supports task-to-
 * task dependency arrows.
 *
 * @example
 * <Gantt
 *   tasks={[
 *     { id: "design", label: "Design", start: "2025-01-01", end: "2025-01-15", progress: 1 },
 *     { id: "build", label: "Build", start: "2025-01-10", end: "2025-02-20", progress: 0.6, dependencies: ["design"] },
 *     { id: "ship", label: "Ship", start: "2025-02-15", end: "2025-02-28", dependencies: ["build"] },
 *   ]}
 * />
 */
export type GanttTask = {
	id: string;
	label: string;
	start: Date | string | number;
	end: Date | string | number;
	/** Optional progress 0..1; renders as a filled portion of the bar. */
	progress?: number;
	/** Optional list of task ids this task depends on; arrow drawn from each. */
	dependencies?: string[];
};

export interface GanttProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Tasks in display order (rows top-to-bottom). */
	tasks: GanttTask[];
	/** Pixel width of the rendered SVG. Default 800. */
	width?: number;
	/** Pixel height of each task row. Default 32. */
	rowHeight?: number;
	/** Pixel reserved on the left for task labels. Default 140. */
	labelMargin?: number;
	/** Number of axis ticks to show. Default 6. */
	tickCount?: number;
	/** Fired when a task bar is clicked. */
	onTaskClick?: (task: GanttTask) => void;
}

interface LaidOutTask {
	task: GanttTask;
	rowIndex: number;
	x: number;
	y: number;
	w: number;
	h: number;
	progressW: number;
}

interface DepArrow {
	from: { x: number; y: number };
	to: { x: number; y: number };
	id: string;
}

interface AxisTick {
	x: number;
	label: string;
}

const HEADER_HEIGHT = 40;
const ROW_PADDING = 6;

function Gantt({
	tasks,
	width = 800,
	rowHeight = 32,
	labelMargin = 140,
	tickCount = 6,
	onTaskClick,
	className,
	...rest
}: GanttProps) {
	const laidOut = React.useMemo(
		() => layout(tasks, width, rowHeight, labelMargin, tickCount),
		[tasks, width, rowHeight, labelMargin, tickCount],
	);

	const totalHeight = HEADER_HEIGHT + tasks.length * rowHeight + ROW_PADDING;
	const desc = `Gantt with ${tasks.length} task${tasks.length === 1 ? "" : "s"}, range ${laidOut.startLabel} to ${laidOut.endLabel}`;
	// Per-instance arrowhead marker id keeps two <Gantt> on a page
	// from sharing a <defs> id.
	const arrowId = React.useId().replace(/:/g, "-");

	return (
		<svg
			{...rest}
			data-hex-gantt
			role="img"
			width={width}
			height={totalHeight}
			viewBox={`0 0 ${width} ${totalHeight}`}
			className={cn("block", className)}
		>
			<title>Gantt chart</title>
			<desc>{desc}</desc>
			<defs>
				<marker
					id={`hex-gantt-arrow-${arrowId}`}
					viewBox="0 0 10 10"
					refX="10"
					refY="5"
					markerWidth="5"
					markerHeight="5"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
				</marker>
			</defs>
			{/* Axis header */}
			<g data-hex-gantt-axis>
				<line
					x1={labelMargin}
					x2={width - 16}
					y1={HEADER_HEIGHT - 8}
					y2={HEADER_HEIGHT - 8}
					stroke="hsl(var(--muted-foreground))"
					strokeWidth={1}
				/>
				{laidOut.ticks.map((t, i) => (
					<g key={`tick-${i}`} data-hex-gantt-tick>
						<line
							x1={t.x}
							x2={t.x}
							y1={HEADER_HEIGHT - 8}
							y2={totalHeight - 4}
							stroke="hsl(var(--muted-foreground))"
							strokeOpacity={0.15}
							strokeWidth={1}
						/>
						<text
							x={t.x}
							y={HEADER_HEIGHT - 14}
							textAnchor="middle"
							fontSize={10}
							fill="hsl(var(--muted-foreground))"
						>
							{t.label}
						</text>
					</g>
				))}
			</g>
			{/* Row labels */}
			<g data-hex-gantt-labels>
				{laidOut.tasks.map((t) => (
					<text
						key={`label-${t.task.id}`}
						x={labelMargin - 8}
						y={t.y + t.h / 2}
						dy="0.35em"
						textAnchor="end"
						fontSize={11}
						fill="hsl(var(--foreground))"
					>
						{t.task.label}
					</text>
				))}
			</g>
			{/* Dependency arrows: elbow-and-jog routing — when the target
			    task starts before (or near) the source's right edge, route
			    out past the source first to avoid drawing through its bar. */}
			<g data-hex-gantt-deps fill="none">
				{laidOut.deps.map((d) => {
					const ELBOW = 8;
					const needsJog = d.to.x < d.from.x + ELBOW;
					const path = needsJog
						? `M${d.from.x},${d.from.y} L${d.from.x + ELBOW},${d.from.y} L${d.from.x + ELBOW},${d.to.y} L${d.to.x},${d.to.y}`
						: `M${d.from.x},${d.from.y} L${(d.from.x + d.to.x) / 2},${d.from.y} L${(d.from.x + d.to.x) / 2},${d.to.y} L${d.to.x},${d.to.y}`;
					return (
						<path
							key={d.id}
							data-hex-gantt-dep
							d={path}
							stroke="hsl(var(--muted-foreground))"
							strokeOpacity={0.55}
							strokeWidth={1}
							markerEnd={`url(#hex-gantt-arrow-${arrowId})`}
						/>
					);
				})}
			</g>
			{/* Task bars */}
			<g data-hex-gantt-tasks>
				{laidOut.tasks.map((t) => {
					const interactive = Boolean(onTaskClick);
					const handleActivate = () => onTaskClick?.(t.task);
					return (
						<g
							key={t.task.id}
							data-hex-gantt-task
							data-row={t.rowIndex}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={
								interactive
									? `${t.task.label}, ${formatDate(toDate(t.task.start))} to ${formatDate(toDate(t.task.end))}${t.task.progress != null ? `, ${Math.round((t.task.progress ?? 0) * 100)}% complete` : ""}`
									: undefined
							}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<rect
								x={t.x}
								y={t.y}
								width={Math.max(2, t.w)}
								height={t.h}
								rx={4}
								ry={4}
								fill="hsl(var(--primary))"
								fillOpacity={0.25}
								stroke="hsl(var(--primary))"
								strokeWidth={1}
							/>
							{t.progressW > 0 ? (
								<>
									<rect
										x={t.x}
										y={t.y}
										width={t.progressW}
										height={t.h}
										rx={4}
										ry={4}
										fill="hsl(var(--primary))"
										fillOpacity={0.7}
									/>
									{/* Hard right-edge line keeps the progress boundary visible for
									    color-blind viewers and on low-contrast themes. Skipped at
									    100% progress where it overlaps the bar's own border. */}
									{t.progressW < t.w - 0.5 ? (
										<line
											x1={t.x + t.progressW}
											x2={t.x + t.progressW}
											y1={t.y}
											y2={t.y + t.h}
											stroke="hsl(var(--primary))"
											strokeWidth={1}
										/>
									) : null}
								</>
							) : null}
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	tasks: GanttTask[],
	width: number,
	rowHeight: number,
	labelMargin: number,
	tickCount: number,
): {
	tasks: LaidOutTask[];
	deps: DepArrow[];
	ticks: AxisTick[];
	startLabel: string;
	endLabel: string;
} {
	if (tasks.length === 0) {
		return { tasks: [], deps: [], ticks: [], startLabel: "—", endLabel: "—" };
	}

	const axisLeft = labelMargin;
	const axisRight = width - 16;
	const usable = axisRight - axisLeft;

	// Drop NaN-bearing endpoints so the axis range stays finite. Tasks with
	// either bound un-parseable get rendered with their own zero-width
	// fallback below; we still want them in the row layout, just clipped to
	// the axis edges.
	const allTimes = tasks
		.flatMap((t) => [toDate(t.start).getTime(), toDate(t.end).getTime()])
		.filter((t) => Number.isFinite(t));
	if (allTimes.length === 0) {
		return { tasks: [], deps: [], ticks: [], startLabel: "—", endLabel: "—" };
	}
	const minTs = Math.min(...allTimes);
	const maxTs = Math.max(...allTimes);
	const span = Math.max(1, maxTs - minTs);

	const tToX = (t: number) => axisLeft + ((t - minTs) / span) * usable;

	const laidOutTasks: LaidOutTask[] = tasks.map((task, i) => {
		const startTs = toDate(task.start).getTime();
		const endTs = toDate(task.end).getTime();
		const x = tToX(startTs);
		const w = Math.max(0, tToX(endTs) - x);
		const y = HEADER_HEIGHT + i * rowHeight + ROW_PADDING / 2;
		const h = rowHeight - ROW_PADDING;
		const progress = clamp01(task.progress ?? 0);
		return {
			task,
			rowIndex: i,
			x,
			y,
			w,
			h,
			progressW: w * progress,
		};
	});

	const byId = new Map(laidOutTasks.map((t) => [t.task.id, t]));
	const deps: DepArrow[] = [];
	laidOutTasks.forEach((t) => {
		(t.task.dependencies ?? []).forEach((depId, k) => {
			const from = byId.get(depId);
			if (!from) return;
			deps.push({
				from: { x: from.x + from.w, y: from.y + from.h / 2 },
				to: { x: t.x, y: t.y + t.h / 2 },
				id: `${depId}-${t.task.id}-${k}`,
			});
		});
	});

	// Generate ticks, then dedupe consecutive identical labels — at year-scale
	// or month-scale spans the formatter often emits the same string twice
	// (e.g. two ticks both inside January render as "2025-01"). Blanking the
	// duplicate keeps the gridline but drops the noisy repeated text.
	const rawTicks: AxisTick[] = [];
	for (let i = 0; i < tickCount; i++) {
		const ts = minTs + (i / Math.max(1, tickCount - 1)) * span;
		rawTicks.push({ x: tToX(ts), label: formatTick(new Date(ts), span) });
	}
	const ticks: AxisTick[] = rawTicks.map((t, i) => ({
		x: t.x,
		label: i > 0 && rawTicks[i - 1]?.label === t.label ? "" : t.label,
	}));

	return {
		tasks: laidOutTasks,
		deps,
		ticks,
		startLabel: formatDate(new Date(minTs)),
		endLabel: formatDate(new Date(maxTs)),
	};
}

function toDate(v: Date | string | number): Date {
	if (v instanceof Date) return v;
	if (typeof v === "number") return new Date(v);
	return new Date(v);
}

function clamp01(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v;
}

function formatDate(d: Date): string {
	if (Number.isNaN(d.getTime())) return "—";
	return d.toISOString().slice(0, 10);
}

function formatTick(d: Date, spanMs: number): string {
	if (Number.isNaN(d.getTime())) return "—";
	const ONE_DAY = 24 * 60 * 60 * 1000;
	// Switch to MM-DD up to ~3 months — at 30 days the original threshold
	// produced "2025-01" / "2025-01" duplicates for ticks landing in the
	// same month. MM-DD scales to ~90 days before adjacent ticks merge.
	if (spanMs <= 90 * ONE_DAY) return d.toISOString().slice(5, 10); // MM-DD
	if (spanMs <= 730 * ONE_DAY) return d.toISOString().slice(0, 7); // YYYY-MM
	return String(d.getUTCFullYear());
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Gantt };
