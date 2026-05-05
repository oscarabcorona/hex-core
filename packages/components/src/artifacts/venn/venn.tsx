"use client";

import * as React from "react";
import { pickChartHue } from "../../lib/chart-palette.js";
import { cn } from "../../lib/utils.js";

/**
 * Set-overlap (Venn) diagram for 2 or 3 sets. Pure SVG; no heavy peer
 * dependency. Set positions and radii are fixed at sensible defaults
 * — Venn is for showing CATEGORICAL overlap (Linux ∩ Mac, paid ∩ active),
 * not for showing the EXACT cardinality of intersections (that's
 * Euler-diagram territory and requires a real layout solver).
 *
 * @example
 * <Venn
 *   sets={[
 *     { id: "linux", label: "Linux" },
 *     { id: "mac", label: "Mac" },
 *     { id: "windows", label: "Windows" },
 *   ]}
 * />
 */
export type VennSet = {
	id: string;
	label: string;
	value?: number;
};

export interface VennProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** 2 or 3 sets. More than 3 isn't visually tractable in a strict Venn. */
	sets: VennSet[];
	/** Pixel size of the rendered SVG (it's square). Default 360. */
	size?: number;
	/** Fired when a set is clicked. */
	onSetClick?: (set: VennSet) => void;
}

interface LaidOutCircle {
	set: VennSet;
	cx: number;
	cy: number;
	r: number;
	labelX: number;
	labelY: number;
	depth: number;
}

// Venn supports 2 or 3 sets only — picks the first 2-3 categorical hues
// from the shared chart palette via `pickChartHue` (which falls back to
// `--primary` if a consumer's theme is missing the chart family).

function Venn({
	sets,
	size = 360,
	onSetClick,
	className,
	...rest
}: VennProps) {
	const circles = React.useMemo(() => layout(sets, size), [sets, size]);
	const desc = `Venn diagram with ${sets.length} set${sets.length === 1 ? "" : "s"}: ${sets.map((s) => s.label).join(", ") || "(empty)"}`;

	// Surface unsupported set counts in dev so an LLM-generated artifact with
	// the wrong shape isn't silently degraded to the fallback message. The
	// ref guard fires once per mount, not per render. Reads NODE_ENV via
	// globalThis to avoid pulling `@types/node` into the components package.
	const warnedRef = React.useRef(false);
	const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
	if (
		nodeEnv !== "production" &&
		!warnedRef.current &&
		(sets.length === 0 || sets.length > 3)
	) {
		warnedRef.current = true;
		// eslint-disable-next-line no-console
		console.warn(
			`[hex-core/Venn] Got ${sets.length} sets — Venn supports 2 or 3. Use TreeMap or Matrix for higher-arity overlaps.`,
		);
	}

	if (sets.length === 0 || sets.length > 3) {
		return (
			<svg
				{...rest}
				data-hex-venn
				data-set-count={sets.length}
				role="img"
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className={cn("block", className)}
			>
				<title>Venn diagram</title>
				<desc>{desc}</desc>
				<text
					x={size / 2}
					y={size / 2}
					textAnchor="middle"
					dy="0.35em"
					fontSize={12}
					fill="hsl(var(--muted-foreground))"
				>
					{sets.length === 0 ? "No sets" : `Venn supports 2–3 sets (got ${sets.length})`}
				</text>
			</svg>
		);
	}

	return (
		<svg
			{...rest}
			data-hex-venn
			data-set-count={sets.length}
			role="img"
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={cn("block", className)}
		>
			<title>Venn diagram</title>
			<desc>{desc}</desc>
			<g data-hex-venn-sets>
				{circles.map((c) => {
					const interactive = Boolean(onSetClick);
					const handleActivate = () => onSetClick?.(c.set);
					return (
						<g
							key={c.set.id}
							data-hex-venn-set
							data-depth={c.depth}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? c.set.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<circle
								cx={c.cx}
								cy={c.cy}
								r={c.r}
								fill={pickChartHue(c.depth)}
								fillOpacity={0.45}
								stroke="hsl(var(--background))"
								strokeWidth={1.5}
							/>
						</g>
					);
				})}
			</g>
			<g data-hex-venn-labels>
				{circles.map((c) => (
					<text
						key={`label-${c.set.id}`}
						data-hex-venn-label
						x={c.labelX}
						y={c.labelY}
						textAnchor="middle"
						dy="0.35em"
						fontSize={12}
						fontWeight={600}
						fill="hsl(var(--foreground))"
						style={{ paintOrder: "stroke", pointerEvents: "none" }}
						stroke="hsl(var(--background))"
						strokeWidth={3}
						strokeLinejoin="round"
					>
						{`${c.set.label}${c.set.value != null ? ` (${c.set.value})` : ""}`}
					</text>
				))}
			</g>
		</svg>
	);
}

function layout(sets: VennSet[], size: number): LaidOutCircle[] {
	if (sets.length === 0 || sets.length > 3) return [];
	const cx = size / 2;
	const cy = size / 2;
	const r = size * 0.22; // circle radius
	const sep = size * 0.12; // half-distance between centers

	if (sets.length === 1) {
		return [{ set: sets[0], cx, cy, r, labelX: cx, labelY: cy - r - 8, depth: 0 }];
	}

	if (sets.length === 2) {
		return sets.map((s, i) => {
			const dx = i === 0 ? -sep : sep;
			return {
				set: s,
				cx: cx + dx,
				cy,
				r,
				labelX: cx + dx + (i === 0 ? -r * 0.6 : r * 0.6),
				labelY: cy - r - 8,
				depth: i,
			};
		});
	}

	// 3 sets — equilateral triangle of centers (60° apart). Bottom-left,
	// bottom-right, top. Label position pushes outward along the radial
	// direction from the centroid so labels don't overlap the circles.
	const verticalOffset = sep * 0.866; // sin(60°)
	const triangle: Array<{ dx: number; dy: number }> = [
		{ dx: -sep, dy: verticalOffset }, // bottom-left
		{ dx: sep, dy: verticalOffset }, // bottom-right
		{ dx: 0, dy: -verticalOffset }, // top
	];
	const LABEL_PUSH = 1.7;
	const TOP_LABEL_NUDGE = -8; // top label sits above its circle; pull up
	const BOTTOM_LABEL_NUDGE = 16; // bottom labels sit below; push down
	return sets.map((s, i) => {
		const { dx, dy } = triangle[i] ?? triangle[0];
		const isTop = i === 2;
		return {
			set: s,
			cx: cx + dx,
			cy: cy + dy,
			r,
			labelX: cx + dx * LABEL_PUSH,
			labelY: cy + dy * LABEL_PUSH + (isTop ? TOP_LABEL_NUDGE : BOTTOM_LABEL_NUDGE),
			depth: i,
		};
	});
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Venn };
