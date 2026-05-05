"use client";

import * as React from "react";
import { pickChartHue } from "../../lib/chart-palette.js";
import { cn } from "../../lib/utils.js";

/**
 * Conversion funnel — a vertical stack of trapezoidal stages whose width
 * is proportional to each stage's value. Pure SVG; no heavy peer
 * dependency. Pair with `<Sankey>` when stage-to-stage flow detail
 * matters; use Funnel when the conversion drop-off itself is the
 * message.
 *
 * @example
 * <Funnel
 *   stages={[
 *     { id: "visit", label: "Visited", value: 10000 },
 *     { id: "signup", label: "Signed up", value: 1200 },
 *     { id: "active", label: "Active", value: 480 },
 *     { id: "paid", label: "Paid", value: 95 },
 *   ]}
 * />
 */
export type FunnelStage = {
	id: string;
	label: string;
	value: number;
};

export interface FunnelProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Ordered top-to-bottom stages. Values must be non-negative. */
	stages: FunnelStage[];
	/** Pixel width of the rendered SVG. Default 480. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 360. */
	height?: number;
	/** Pixel gap between stages. Default 4. */
	gap?: number;
	/** Show conversion-rate annotations between stages. Default true. */
	showConversion?: boolean;
	/** Fired when a stage is clicked. */
	onStageClick?: (stage: FunnelStage) => void;
}

interface LaidOutStage {
	stage: FunnelStage;
	depth: number;
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
	yTop: number;
	yBottom: number;
	conversionFromPrev: number | null;
}

function Funnel({
	stages,
	width = 480,
	height = 360,
	gap = 4,
	showConversion = true,
	onStageClick,
	className,
	...rest
}: FunnelProps) {
	const laidOut = layout(stages, width, height, gap);
	const desc = `Funnel with ${stages.length} stage${stages.length === 1 ? "" : "s"}, peak value ${stages[0]?.value ?? 0}`;

	return (
		<svg
			{...rest}
			data-hex-funnel
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Funnel chart</title>
			<desc>{desc}</desc>
			<g data-hex-funnel-stages>
				{laidOut.map((s) => {
					const interactive = Boolean(onStageClick);
					const handleActivate = () => onStageClick?.(s.stage);
					return (
					<g
						key={s.stage.id}
						data-hex-funnel-stage
						data-depth={s.depth}
						role={interactive ? "button" : undefined}
						tabIndex={interactive ? 0 : undefined}
						aria-label={interactive ? `${s.stage.label}: ${s.stage.value}` : undefined}
						style={interactive ? { cursor: "pointer" } : undefined}
						onClick={interactive ? handleActivate : undefined}
						onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
					>
						<polygon
							points={`${s.topLeft},${s.yTop} ${s.topRight},${s.yTop} ${s.bottomRight},${s.yBottom} ${s.bottomLeft},${s.yBottom}`}
							fill={pickChartHue(s.depth)}
							fillOpacity={0.85}
							stroke="hsl(var(--background))"
							strokeWidth={1}
						/>
						<text
							// Page-bg fill + foreground-tinted stroke is the
							// classic "outline label" technique: text reads on
							// any chart-1..6 fill regardless of hue, and stays
							// readable when the trapezoid narrows below the
							// label's width (the label spans outside the
							// polygon onto the page bg).
							x={width / 2}
							y={(s.yTop + s.yBottom) / 2}
							dy="0.35em"
							textAnchor="middle"
							fontSize={12}
							fontWeight={600}
							fill="hsl(var(--background))"
							style={{
								pointerEvents: "none",
								paintOrder: "stroke",
								stroke: "hsl(var(--foreground) / 0.45)",
								strokeWidth: 2,
							}}
						>
							{`${s.stage.label} · ${s.stage.value.toLocaleString()}`}
						</text>
					</g>
					);
				})}
			</g>
			{showConversion ? (
				<g data-hex-funnel-conversions>
					{laidOut.map((s) =>
						s.conversionFromPrev != null ? (
							<text
								key={`conv-${s.stage.id}`}
								data-hex-funnel-conversion
								x={width - 4}
								y={s.yTop - 2}
								textAnchor="end"
								fontSize={10}
								fill="hsl(var(--muted-foreground))"
							>
								{formatPct(s.conversionFromPrev)}
							</text>
						) : null,
					)}
				</g>
			) : null}
		</svg>
	);
}

function layout(stages: FunnelStage[], width: number, height: number, gap: number): LaidOutStage[] {
	if (stages.length === 0) return [];
	const peak = Math.max(...stages.map((s) => s.value), 0) || 1;
	const usableHeight = height - gap * Math.max(0, stages.length - 1);
	const stageHeight = usableHeight / stages.length;
	const cx = width / 2;

	return stages.map((stage, i) => {
		const yTop = i * (stageHeight + gap);
		const yBottom = yTop + stageHeight;
		const topRatio = stage.value / peak;
		const next = stages[i + 1];
		const bottomRatio = next ? next.value / peak : topRatio;
		const topHalfWidth = (width / 2) * Math.max(0, Math.min(1, topRatio));
		const bottomHalfWidth = (width / 2) * Math.max(0, Math.min(1, bottomRatio));
		const prev = stages[i - 1];
		const conversionFromPrev = prev && prev.value > 0 ? stage.value / prev.value : null;
		return {
			stage,
			depth: i,
			topLeft: cx - topHalfWidth,
			topRight: cx + topHalfWidth,
			bottomLeft: cx - bottomHalfWidth,
			bottomRight: cx + bottomHalfWidth,
			yTop,
			yBottom,
			conversionFromPrev,
		};
	});
}

function formatPct(ratio: number): string {
	if (!Number.isFinite(ratio)) return "—";
	return `${(ratio * 100).toFixed(ratio < 0.1 ? 1 : 0)}%`;
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Funnel };
