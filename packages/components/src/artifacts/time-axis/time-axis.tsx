"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Events plotted along a horizontal time axis. Pure SVG; no heavy peer
 * dependency. Distinct from the existing `<Timeline>` component in
 * `components/timeline` — that one is an event-list with vertical
 * status markers; this one is a CHART with a real time axis where
 * spacing reflects elapsed time.
 *
 * Use TimeAxis when the *gap between events* is the message (release
 * cadence, incident frequency, sparse-then-dense patterns). Use
 * Timeline when the order of events is the message but the absolute
 * dates are secondary.
 *
 * @example
 * <TimeAxis
 *   events={[
 *     { id: "v1", label: "v1.0", date: "2025-01-15" },
 *     { id: "v2", label: "v2.0", date: "2025-04-20" },
 *     { id: "v3", label: "v3.0", date: "2025-09-10" },
 *   ]}
 * />
 */
export type TimeAxisEvent = {
	id: string;
	label: string;
	/** Accepts Date, ISO string, or epoch ms. */
	date: Date | string | number;
	/** Optional category — events with the same `category` share a row band. */
	category?: string;
};

// `start` and `end` collide with SVG's `<animate start=...>` / `<set end=...>`
// animation attributes (their value type is string|number, not Date). Omit
// both from the inherited SVG attributes so consumers can pass Date values
// freely without a type collision.
export interface TimeAxisProps
	extends Omit<React.SVGAttributes<SVGSVGElement>, "children" | "start" | "end"> {
	/** Events to plot. Order doesn't matter — positions come from `date`. */
	events: TimeAxisEvent[];
	/** Optional explicit axis start. Auto-derived from `events` if omitted. */
	start?: Date | string | number;
	/** Optional explicit axis end. Auto-derived from `events` if omitted. */
	end?: Date | string | number;
	/** Pixel width of the rendered SVG. Default 720. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 200. */
	height?: number;
	/** Number of axis ticks to show. Default 6. */
	tickCount?: number;
	/** Fired when an event is clicked. */
	onEventClick?: (event: TimeAxisEvent) => void;
}

interface LaidOutEvent {
	event: TimeAxisEvent;
	x: number;
	y: number;
	rowIndex: number;
}

interface AxisTick {
	x: number;
	label: string;
}

function TimeAxis({
	events,
	start,
	end,
	width = 720,
	height = 200,
	tickCount = 6,
	onEventClick,
	className,
	...rest
}: TimeAxisProps) {
	const laidOut = React.useMemo(
		() => layout(events, start, end, width, height, tickCount),
		[events, start, end, width, height, tickCount],
	);

	const desc =
		events.length === 0
			? "Empty time axis"
			: `Time axis with ${events.length} event${events.length === 1 ? "" : "s"}, range ${laidOut.startLabel} to ${laidOut.endLabel}`;

	return (
		<svg
			{...rest}
			data-hex-time-axis
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Time axis</title>
			<desc>{desc}</desc>
			{/* Baseline + ticks */}
			<g data-hex-time-axis-axis>
				<line
					x1={laidOut.axisLeft}
					x2={laidOut.axisRight}
					y1={laidOut.axisY}
					y2={laidOut.axisY}
					stroke="hsl(var(--muted-foreground))"
					strokeWidth={1}
				/>
				{laidOut.ticks.map((tick, i) => (
					<g key={`tick-${i}`} data-hex-time-axis-tick>
						<line
							x1={tick.x}
							x2={tick.x}
							y1={laidOut.axisY - 4}
							y2={laidOut.axisY + 4}
							stroke="hsl(var(--muted-foreground))"
							strokeWidth={1}
						/>
						<text
							x={tick.x}
							y={laidOut.axisY + 18}
							textAnchor="middle"
							fontSize={10}
							fill="hsl(var(--muted-foreground))"
						>
							{tick.label}
						</text>
					</g>
				))}
			</g>
			<g data-hex-time-axis-events>
				{laidOut.events.map((e) => {
					const interactive = Boolean(onEventClick);
					const handleActivate = () => onEventClick?.(e.event);
					return (
						<g
							key={e.event.id}
							data-hex-time-axis-event
							data-row={e.rowIndex}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? `${e.event.label} on ${formatDate(toDate(e.event.date))}` : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (k) => activateOnKey(k, handleActivate) : undefined}
						>
							{/* Connector from event marker to baseline */}
							<line
								x1={e.x}
								x2={e.x}
								y1={e.y}
								y2={laidOut.axisY}
								stroke="hsl(var(--muted-foreground))"
								strokeOpacity={0.65}
								strokeWidth={1}
							/>
							<circle
								cx={e.x}
								cy={e.y}
								r={5}
								fill="hsl(var(--primary))"
								stroke="hsl(var(--background))"
								strokeWidth={2}
							/>
							<text
								x={e.x + 8}
								y={e.y + 4}
								fontSize={11}
								fill="hsl(var(--foreground))"
								style={{ paintOrder: "stroke", pointerEvents: "none" }}
								stroke="hsl(var(--background))"
								strokeWidth={3}
								strokeLinejoin="round"
							>
								{e.event.label}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	events: TimeAxisEvent[],
	start: Date | string | number | undefined,
	end: Date | string | number | undefined,
	width: number,
	height: number,
	tickCount: number,
): {
	events: LaidOutEvent[];
	ticks: AxisTick[];
	axisY: number;
	axisLeft: number;
	axisRight: number;
	startLabel: string;
	endLabel: string;
} {
	const margin = 32;
	const axisLeft = margin;
	const axisRight = width - margin;
	const axisY = height - 40;
	const usableWidth = axisRight - axisLeft;

	// Drop events whose date doesn't parse — `new Date("garbage")` returns
	// NaN, which would propagate through `Math.min/max` and produce NaN
	// x-coordinates that crash some SVG renderers and noise up dev
	// consoles. Skip silently; downstream components can still inspect
	// the unrendered ids if they want to surface validation errors.
	const validEvents = events.filter((e) => Number.isFinite(toDate(e.date).getTime()));

	if (validEvents.length === 0) {
		return {
			events: [],
			ticks: [],
			axisY,
			axisLeft,
			axisRight,
			startLabel: "—",
			endLabel: "—",
		};
	}

	const dates = validEvents.map((e) => toDate(e.date).getTime());
	const explicitMin = start != null ? toDate(start).getTime() : NaN;
	const explicitMax = end != null ? toDate(end).getTime() : NaN;
	const minTs = Number.isFinite(explicitMin) ? explicitMin : Math.min(...dates);
	const maxTs = Number.isFinite(explicitMax) ? explicitMax : Math.max(...dates);
	const span = Math.max(1, maxTs - minTs);

	const tToX = (t: number) => axisLeft + ((t - minTs) / span) * usableWidth;

	// Distribute events across stacked rows so labels don't overlap when
	// events cluster. A new event takes the topmost row whose previously-
	// placed event is at least MIN_GAP px to the left.
	//
	// Tiebreaker on id: Array.prototype.sort isn't stable across all
	// engines for events with identical timestamps. Sorting by id second
	// produces deterministic rows on every engine, so visual diffing
	// across builds stays meaningful.
	const MIN_GAP_PX = 48;
	const ROW_HEIGHT_PX = 22;
	// Cap rows so events never spill below the baseline. The first row
	// sits at y=24; remaining rows go in 22-px steps; clamp at axisY-10.
	const maxRows = Math.max(1, Math.floor((axisY - 10 - 24) / ROW_HEIGHT_PX) + 1);
	const rowsLastX: number[] = [];
	const positioned = validEvents
		.map((event) => ({ event, t: toDate(event.date).getTime() }))
		.sort((a, b) => (a.t - b.t) || a.event.id.localeCompare(b.event.id))
		.map(({ event, t }) => {
			const x = tToX(t);
			let rowIndex = rowsLastX.findIndex((lastX) => x - lastX >= MIN_GAP_PX);
			if (rowIndex === -1) {
				if (rowsLastX.length < maxRows) {
					rowIndex = rowsLastX.length;
					rowsLastX.push(x);
				} else {
					// Degraded fallback — recycle the last row instead of
					// pushing the event below the baseline.
					rowIndex = maxRows - 1;
					rowsLastX[rowIndex] = x;
				}
			} else {
				rowsLastX[rowIndex] = x;
			}
			return { event, x, y: 24 + rowIndex * ROW_HEIGHT_PX, rowIndex };
		});

	// Generate ticks then dedupe consecutive identical labels — at year-scale
	// or month-scale spans the formatter often emits the same string twice
	// (e.g. five ticks all in 2025 render as "2025" / "2025" / ...). Blanking
	// the duplicate keeps the gridline tick but drops the noisy repeat.
	const rawTicks: AxisTick[] = [];
	for (let i = 0; i < tickCount; i++) {
		const t = minTs + (i / Math.max(1, tickCount - 1)) * span;
		rawTicks.push({ x: tToX(t), label: formatTick(new Date(t), span) });
	}
	const ticks: AxisTick[] = rawTicks.map((t, i) => ({
		x: t.x,
		label: i > 0 && rawTicks[i - 1]?.label === t.label ? "" : t.label,
	}));

	return {
		events: positioned,
		ticks,
		axisY,
		axisLeft,
		axisRight,
		startLabel: formatDate(new Date(minTs)),
		endLabel: formatDate(new Date(maxTs)),
	};
}

function toDate(v: Date | string | number): Date {
	if (v instanceof Date) return v;
	if (typeof v === "number") return new Date(v);
	return new Date(v);
}

function formatDate(d: Date): string {
	if (Number.isNaN(d.getTime())) return "—";
	return d.toISOString().slice(0, 10);
}

function formatTick(d: Date, spanMs: number): string {
	if (Number.isNaN(d.getTime())) return "—";
	const ONE_DAY = 24 * 60 * 60 * 1000;
	if (spanMs <= 7 * ONE_DAY) {
		// short range — show day
		return d.toISOString().slice(0, 10);
	}
	if (spanMs <= 90 * ONE_DAY) {
		// up to ~3 months — show month-day so adjacent ticks stay distinct
		return d.toISOString().slice(5, 10);
	}
	if (spanMs <= 730 * ONE_DAY) {
		// up to ~2 years — show year-month
		return d.toISOString().slice(0, 7);
	}
	// long range — year only
	return String(d.getUTCFullYear());
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { TimeAxis };
