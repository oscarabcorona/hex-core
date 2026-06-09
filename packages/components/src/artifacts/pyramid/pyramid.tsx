"use client";

import * as React from "react";
import { pickChartHue } from "../../lib/chart-palette.js";
import { cn } from "../../lib/utils.js";

/**
 * Ranked-tier pyramid. Tiers stack top-to-bottom; each tier's width can
 * either grow toward the base ("widening" — Maslow's hierarchy, fewer
 * elites at the top) or shrink ("narrowing" — population pyramid by age).
 * Pure SVG; no heavy peer dependency.
 *
 * Distinct from Funnel: Pyramid encodes RANK (each tier is a distinct
 * categorical level), Funnel encodes FLOW (each stage is a subset of the
 * previous, with a conversion ratio).
 *
 * @example
 * <Pyramid
 *   tiers={[
 *     { id: "self-actualization", label: "Self-actualization" },
 *     { id: "esteem", label: "Esteem" },
 *     { id: "love", label: "Love & belonging" },
 *     { id: "safety", label: "Safety" },
 *     { id: "physiological", label: "Physiological" },
 *   ]}
 *   shape="widening"
 * />
 */
export type PyramidTier = {
	id: string;
	label: string;
	value?: number;
};

export interface PyramidProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Ordered top-to-bottom tiers. The first entry is the apex. */
	tiers: PyramidTier[];
	/** Tier-width direction. "widening" grows toward the base; "narrowing" shrinks toward it. Default "widening". */
	shape?: "widening" | "narrowing";
	/** Pixel width of the rendered SVG. Default 480. */
	width?: number;
	/** Pixel height of the rendered SVG. Default 360. */
	height?: number;
	/** Pixel gap between tiers. Default 4. */
	gap?: number;
	/** Show each tier's `value` next to its label when present. Default true. */
	showValues?: boolean;
	/** Fired when a tier is clicked. */
	onTierClick?: (tier: PyramidTier) => void;
}

interface LaidOutTier {
	tier: PyramidTier;
	depth: number;
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
	yTop: number;
	yBottom: number;
}

function Pyramid({
	tiers,
	shape = "widening",
	width = 480,
	height = 360,
	gap = 4,
	showValues = true,
	onTierClick,
	className,
	...rest
}: PyramidProps) {
	const laidOut = layout(tiers, shape, width, height, gap);
	const desc = `Pyramid with ${tiers.length} tier${tiers.length === 1 ? "" : "s"} (${shape})`;

	// Pyramid's `whenNotToUse` warns about >7 tiers — surface a dev-only
	// console warning so consumers feel the friction in development without
	// punishing prod runtime. Uses a ref so the warning fires once per mount,
	// not on every render. Read NODE_ENV via globalThis to avoid pulling
	// `@types/node` into the components package — bundlers inline the value
	// in browser builds; in tests vitest/Node provides `process` at runtime.
	const warnedRef = React.useRef(false);
	const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
	if (nodeEnv !== "production" && !warnedRef.current && tiers.length > 7) {
		warnedRef.current = true;
		// eslint-disable-next-line no-console
		console.warn(
			`[hex-core/Pyramid] ${tiers.length} tiers — labels become unreadable past ~7. Group adjacent tiers or switch to TreeMap / OrgChart.`,
		);
	}

	return (
		<svg
			{...rest}
			data-hex-pyramid
			data-shape={shape}
			role="img"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("block", className)}
		>
			<title>Pyramid chart</title>
			<desc>{desc}</desc>
			<g data-hex-pyramid-tiers>
				{laidOut.map((t) => {
					const valueText =
						showValues && t.tier.value != null ? ` · ${t.tier.value.toLocaleString()}` : "";
					const interactive = Boolean(onTierClick);
					const handleActivate = () => onTierClick?.(t.tier);
					return (
						<g
							key={t.tier.id}
							data-hex-pyramid-tier
							data-depth={t.depth}
							className={interactive ? "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring" : undefined}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? `${t.tier.label}${valueText}` : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<polygon
								points={`${t.topLeft},${t.yTop} ${t.topRight},${t.yTop} ${t.bottomRight},${t.yBottom} ${t.bottomLeft},${t.yBottom}`}
								fill={pickChartHue(t.depth)}
								fillOpacity={0.85}
								stroke="hsl(var(--background))"
								strokeWidth={1}
							/>
							<text
								// Page-bg fill + foreground-tinted stroke gives
								// a readable "outline label" on any chart-1..6
								// fill — same technique as Funnel.
								x={width / 2}
								y={(t.yTop + t.yBottom) / 2}
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
								{`${t.tier.label}${valueText}`}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	tiers: PyramidTier[],
	shape: "widening" | "narrowing",
	width: number,
	height: number,
	gap: number,
): LaidOutTier[] {
	if (tiers.length === 0) return [];
	const usableHeight = height - gap * Math.max(0, tiers.length - 1);
	const tierHeight = usableHeight / tiers.length;
	const cx = width / 2;
	const total = tiers.length;

	// Linear ramp: top tier ratio 0.2, bottom tier ratio 1.0 (or reverse).
	const ratioAt = (i: number): number => {
		const t = total === 1 ? 0 : i / (total - 1);
		return shape === "widening" ? 0.2 + 0.8 * t : 1.0 - 0.8 * t;
	};

	return tiers.map((tier, i) => {
		const yTop = i * (tierHeight + gap);
		const yBottom = yTop + tierHeight;
		const topRatio = ratioAt(i);
		const bottomRatio = i + 1 < total ? ratioAt(i + 1) : topRatio;
		// For widening, the visual base of each tier should match the top of
		// the next tier — using the next tier's ratio at the bottom edge.
		// For narrowing, same logic. The penultimate-to-last bottom matches
		// `topRatio` of the last tier we don't have, so we hold steady.
		const topHalfWidth = (width / 2) * topRatio;
		const bottomHalfWidth = (width / 2) * bottomRatio;
		return {
			tier,
			depth: i,
			topLeft: cx - topHalfWidth,
			topRight: cx + topHalfWidth,
			bottomLeft: cx - bottomHalfWidth,
			bottomRight: cx + bottomHalfWidth,
			yTop,
			yBottom,
		};
	});
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Pyramid };
