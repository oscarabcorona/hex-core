"use client";

import * as React from "react";
import { pickChartHue } from "../../lib/chart-palette.js";
import { cn } from "../../lib/utils.js";

/**
 * Radial hierarchy by value. Each ring out from the center is a deeper level
 * of the tree; each segment's angular extent is proportional to its summed
 * value. Click any segment to drill into it (the clicked segment becomes the
 * new center); click the center to zoom back out.
 *
 * Heavy peers: requires `d3-hierarchy` and `d3-shape` (~3 KB + ~6 KB gzip).
 *
 * @example
 * <Sunburst
 *   root={{
 *     id: "root", label: "Total",
 *     children: [
 *       { id: "a", label: "A", value: 60, children: [
 *         { id: "a1", label: "A1", value: 40 },
 *         { id: "a2", label: "A2", value: 20 },
 *       ]},
 *       { id: "b", label: "B", value: 30 },
 *     ],
 *   }}
 * />
 */
export type SunburstNode = {
	id: string;
	label: string;
	value?: number;
	children?: SunburstNode[];
};

export interface SunburstProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Root of the hierarchy. Leaves require a positive `value`; internal nodes are summed. */
	root: SunburstNode;
	/** Allow a click on a segment to zoom into it as the new center. Default true. */
	drillable?: boolean;
	/** Optional content rendered at the SVG center (e.g. total). */
	centerLabel?: React.ReactNode;
	/** Pixel size of the rendered SVG (it's square). Default 400. */
	size?: number;
	/** Fired when a segment is clicked. Fires before any internal drill. */
	onSegmentClick?: (node: SunburstNode) => void;
}

interface LaidOutSegment {
	node: SunburstNode;
	depth: number;
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	/** Index of this segment's depth-1 ancestor among its siblings.
	 * Used to pick a hue from CHART_PALETTE so all descendants of the
	 * same top-level branch share a color family. */
	rootSiblingIdx: number;
}

type D3HierarchyMod = typeof import("d3-hierarchy");
type D3ShapeMod = typeof import("d3-shape");

/**
 * Sunburst opacity ramp: deeper rings render at lower opacity so they
 * read as subdivisions of their parent without obscuring the parent hue.
 * Hand-tuned: outermost ring lands ~0.45, innermost stays at 0.85.
 *
 * @param depth - Ring depth (1-indexed; 1 is the inner ring).
 * @param maxDepth - The maximum ring depth in the current focused tree.
 * @returns Opacity in [0.45, 0.85].
 */
function depthOpacity(depth: number, maxDepth: number): number {
	if (maxDepth <= 1) return 0.85;
	const t = (depth - 1) / Math.max(1, maxDepth - 1);
	return 0.85 - t * 0.4;
}

function Sunburst({
	root,
	drillable = true,
	centerLabel,
	size = 400,
	onSegmentClick,
	className,
	...rest
}: SunburstProps) {
	const [d3h, setD3h] = React.useState<D3HierarchyMod | null>(null);
	const [d3s, setD3s] = React.useState<D3ShapeMod | null>(null);
	const [focusId, setFocusId] = React.useState<string>(root.id);

	React.useEffect(() => {
		let cancelled = false;
		void Promise.all([import("d3-hierarchy"), import("d3-shape")]).then(([h, s]) => {
			if (cancelled) return;
			setD3h(h);
			setD3s(s);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Reset focus when root changes
	React.useEffect(() => {
		setFocusId(root.id);
	}, [root]);

	if (!d3h || !d3s) {
		return (
			<div
				data-hex-sunburst-loading
				aria-busy="true"
				className={cn("inline-block bg-muted/20", className)}
				style={{ width: size, height: size }}
			/>
		);
	}

	const focused = findNode(root, focusId) ?? root;
	const radius = size / 2;
	const segments = layout(d3h, focused, radius);
	const maxDepth = segments.reduce((m, s) => Math.max(m, s.depth), 1);
	const arc = d3s
		.arc<LaidOutSegment>()
		.startAngle((s) => s.x0)
		.endAngle((s) => s.x1)
		.innerRadius((s) => s.y0)
		.outerRadius((s) => s.y1)
		.padAngle(0.005)
		.padRadius(radius);

	const handleSegmentClick = (segment: LaidOutSegment) => {
		onSegmentClick?.(segment.node);
		if (!drillable) return;
		const hasChildren = segment.node.children && segment.node.children.length > 0;
		if (!hasChildren) return;
		setFocusId(segment.node.id);
	};

	const handleCenterClick = () => {
		if (!drillable || focusId === root.id) return;
		setFocusId(root.id);
	};

	const desc = `Sunburst with ${segments.length} segments, focused on "${focused.label}"`;

	return (
		<svg
			{...rest}
			data-hex-sunburst
			data-focus-id={focusId}
			role="img"
			width={size}
			height={size}
			viewBox={`${-radius} ${-radius} ${size} ${size}`}
			className={cn("block", className)}
		>
			<title>Sunburst</title>
			<desc>{desc}</desc>
			<g data-hex-sunburst-segments>
				{segments
					.filter((s) => s.depth > 0)
					.map((s) => (
						<path
							key={s.node.id}
							data-hex-sunburst-segment
							data-depth={s.depth}
							d={arc(s) ?? ""}
							fill={pickChartHue(s.rootSiblingIdx)}
							fillOpacity={depthOpacity(s.depth, maxDepth)}
							stroke="hsl(var(--background))"
							strokeWidth={1}
							style={drillable || onSegmentClick ? { cursor: "pointer" } : undefined}
							onClick={drillable || onSegmentClick ? () => handleSegmentClick(s) : undefined}
						/>
					))}
			</g>
			<g data-hex-sunburst-labels aria-hidden="true" pointerEvents="none">
				{segments
					.filter((s) => s.depth > 0 && s.x1 - s.x0 > 0.18)
					.map((s) => {
						const angle = (s.x0 + s.x1) / 2;
						const rMid = (s.y0 + s.y1) / 2;
						const cx = Math.sin(angle) * rMid;
						const cy = -Math.cos(angle) * rMid;
						return (
							<text
								key={`${s.node.id}-label`}
								x={cx}
								y={cy}
								textAnchor="middle"
								dy="0.35em"
								fontSize={11}
								fontWeight={500}
								fill="hsl(var(--background))"
								style={{ paintOrder: "stroke", stroke: "hsl(var(--foreground) / 0.25)", strokeWidth: 2 }}
							>
								{s.node.label}
							</text>
						);
					})}
			</g>
			<g
				data-hex-sunburst-center
				style={drillable && focusId !== root.id ? { cursor: "pointer" } : undefined}
				onClick={drillable ? handleCenterClick : undefined}
			>
				<circle r={radius / 4} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
				{centerLabel ? (
					<foreignObject x={-radius / 4} y={-radius / 4} width={radius / 2} height={radius / 2}>
						<div
							style={{
								width: "100%",
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
								fontSize: 12,
								padding: 4,
							}}
						>
							{centerLabel}
						</div>
					</foreignObject>
				) : (
					<text
						textAnchor="middle"
						dy="0.35em"
						fontSize={12}
						fontWeight={600}
						fill="hsl(var(--foreground))"
					>
						{focused.label}
					</text>
				)}
			</g>
		</svg>
	);
}

function layout(d3h: D3HierarchyMod, focused: SunburstNode, radius: number): LaidOutSegment[] {
	const hierarchy = d3h
		.hierarchy<SunburstNode>(focused)
		.sum((d) => (d.children && d.children.length > 0 ? 0 : d.value ?? 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
	// partition(hierarchy) returns HierarchyRectangularNode<T> with typed
	// x0/x1/y0/y1 (angle range × radius range for sunburst).
	const layoutRoot = d3h.partition<SunburstNode>().size([2 * Math.PI, radius])(hierarchy);
	const segments: LaidOutSegment[] = [];
	layoutRoot.each((d) => {
		// Walk up to the depth-1 ancestor so all descendants of "Equity"
		// share the Equity hue, distinct from "Fixed Income".
		let cursor: typeof d | null = d;
		while (cursor && cursor.depth > 1) cursor = cursor.parent;
		const ancestorIdx = cursor?.parent?.children?.indexOf(cursor) ?? 0;
		segments.push({
			node: d.data,
			depth: d.depth,
			x0: d.x0,
			x1: d.x1,
			y0: d.y0,
			y1: d.y1,
			rootSiblingIdx: Math.max(0, ancestorIdx),
		});
	});
	return segments;
}

function findNode(root: SunburstNode, id: string): SunburstNode | null {
	if (root.id === id) return root;
	if (!root.children) return null;
	for (const c of root.children) {
		const f = findNode(c, id);
		if (f) return f;
	}
	return null;
}

export { Sunburst };
